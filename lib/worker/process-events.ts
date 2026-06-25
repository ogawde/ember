import { eq, and, sql, or } from 'drizzle-orm'
import { db, schema } from '@/db'
import {
  dynamo,
  ScanCommand,
  UpdateCommand,
  TABLE_NAME,
} from '@/lib/aws/dynamodb'
import { DEMO_ORG_ID } from '@/lib/constants'
import { scoreSentiment } from '@/lib/scoring/sentiment'
import {
  detectSentimentDrift,
  detectAfterHours,
  detectChannelExclusion,
  detectResponseDrop,
  detectReceivedHostility,
  hasInsufficientHistory,
  activeSignalsFromScores,
  type ScoringMessageEvent,
} from '@/lib/scoring/signals'
import { computeCompositeRisk } from '@/lib/scoring/composite'
import { isAfterHours } from '@/lib/utils/time'
import type { SignalType } from '@/lib/types'

const { orgs, persons, relationships, alerts } = schema

export interface DynamoEvent {
  org_id: string
  event_id: string
  sender_id: string
  channel: string
  channel_type?: string
  text: string
  ts: string
  created_at: string
  processed: boolean
  sentiment_score?: number | null
  signals?: string[]
  recipient_ids?: string[]
}

export async function getOrCreateDemoOrg() {
  const existing = await db.query.orgs.findFirst({
    where: eq(orgs.slackWorkspaceId, DEMO_ORG_ID),
  })
  if (existing) return existing

  const [created] = await db
    .insert(orgs)
    .values({
      slackWorkspaceId: DEMO_ORG_ID,
      workspaceName: 'Workspace',
    })
    .returning()

  return created
}

export async function getOrCreatePerson(orgId: string, slackUserId: string, name?: string) {
  const existing = await db.query.persons.findFirst({
    where: and(eq(persons.orgId, orgId), eq(persons.slackUserId, slackUserId)),
  })
  if (existing) return existing

  const [created] = await db
    .insert(persons)
    .values({
      orgId,
      slackUserId,
      name: name ?? `User ${slackUserId.slice(-4)}`,
      department: 'Unknown',
    })
    .returning()

  return created
}

export async function getUnprocessedEvents(limit = 50): Promise<DynamoEvent[]> {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'org_id = :orgId AND #processed = :isProcessed',
      ExpressionAttributeNames: { '#processed': 'processed' },
      ExpressionAttributeValues: {
        ':orgId': DEMO_ORG_ID,
        ':isProcessed': false,
      },
    })
  )

  return ((result.Items as DynamoEvent[]) ?? []).slice(0, limit)
}

export async function getProcessedEventsBySender(senderId: string): Promise<DynamoEvent[]> {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression:
        'org_id = :orgId AND sender_id = :senderId AND #processed = :isProcessed',
      ExpressionAttributeNames: { '#processed': 'processed' },
      ExpressionAttributeValues: {
        ':orgId': DEMO_ORG_ID,
        ':senderId': senderId,
        ':isProcessed': true,
      },
    })
  )

  return (result.Items as DynamoEvent[]) ?? []
}

export async function getAllProcessedEvents(): Promise<DynamoEvent[]> {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'org_id = :orgId AND #processed = :isProcessed',
      ExpressionAttributeNames: { '#processed': 'processed' },
      ExpressionAttributeValues: {
        ':orgId': DEMO_ORG_ID,
        ':isProcessed': true,
      },
    })
  )

  return (result.Items as DynamoEvent[]) ?? []
}

export async function getFlaggedEventsBySender(senderId: string): Promise<DynamoEvent[]> {
  const events = await getProcessedEventsBySender(senderId)
  return events.filter((e) => (e.signals?.length ?? 0) > 0)
}

function toScoringEvents(events: DynamoEvent[]): ScoringMessageEvent[] {
  return events
    .filter((e) => e.sentiment_score != null)
    .map((e) => ({
      text: e.text,
      sentimentScore: e.sentiment_score as number,
      timestamp: e.created_at ?? new Date(Number(e.ts) * 1000).toISOString(),
      channel: e.channel,
      senderId: e.sender_id,
      recipientIds: e.recipient_ids ?? [],
    }))
}

function getChannelsByPeriod(events: DynamoEvent[], daysAgo: number, spanDays: number) {
  const now = Date.now()
  const minMs = daysAgo * 86400000
  const maxMs = (daysAgo + spanDays) * 86400000

  const channels = new Set<string>()
  for (const e of events) {
    const ts = new Date(e.created_at ?? new Date(Number(e.ts) * 1000).toISOString()).getTime()
    const age = now - ts
    if (age >= minMs && age < maxMs) channels.add(e.channel)
  }
  return [...channels]
}

async function upsertRelationship(
  orgId: string,
  actorId: string,
  targetId: string,
  sentiment: number,
  afterHours: boolean
) {
  const existing = await db.query.relationships.findFirst({
    where: and(
      eq(relationships.orgId, orgId),
      eq(relationships.actorId, actorId),
      eq(relationships.targetId, targetId)
    ),
  })

  if (existing) {
    const count = (existing.interactionCount ?? 0) + 1
    const prevAvg = parseFloat(existing.avgSentiment ?? '0')
    const newAvg = (prevAvg * (count - 1) + sentiment) / count

    await db
      .update(relationships)
      .set({
        interactionCount: count,
        avgSentiment: newAvg.toFixed(3),
        afterHoursCount: afterHours
          ? (existing.afterHoursCount ?? 0) + 1
          : existing.afterHoursCount,
        lastInteractionAt: new Date(),
        updatedAt: new Date(),
        sentimentTrend:
          newAvg < prevAvg - 0.1 ? 'falling' : newAvg > prevAvg + 0.1 ? 'rising' : 'stable',
      })
      .where(eq(relationships.id, existing.id))

    return existing.id
  }

  const [created] = await db
    .insert(relationships)
    .values({
      orgId,
      actorId,
      targetId,
      interactionCount: 1,
      avgSentiment: sentiment.toFixed(3),
      afterHoursCount: afterHours ? 1 : 0,
      lastInteractionAt: new Date(),
    })
    .returning()

  return created.id
}

async function computePersonSignals(
  slackUserId: string,
  allEvents: DynamoEvent[],
  workspaceEvents: DynamoEvent[]
) {
  const scoringEvents = toScoringEvents(allEvents)
  const workspaceScoringEvents = toScoringEvents(workspaceEvents)
  const isEarlyData = hasInsufficientHistory(scoringEvents)
  const currentChannels = getChannelsByPeriod(allEvents, 0, 30)
  const previousChannels = getChannelsByPeriod(allEvents, 30, 30)

  const outgoingDrift = detectSentimentDrift(scoringEvents)
  const receivedHostility = detectReceivedHostility(workspaceScoringEvents, slackUserId)
  const sentimentDrift = Math.max(outgoingDrift, receivedHostility)
  const afterHours = detectAfterHours(scoringEvents)
  const channelExclusion = detectChannelExclusion(currentChannels, previousChannels)

  const recentEvents = scoringEvents.filter(
    (e) => Date.now() - new Date(e.timestamp).getTime() < 14 * 86400000
  )
  const baselineEvents = scoringEvents.filter((e) => {
    const age = Date.now() - new Date(e.timestamp).getTime()
    return age >= 14 * 86400000 && age < 44 * 86400000
  })
  const recentRate = recentEvents.length / 14
  const baselineRate = baselineEvents.length / 30
  const responseDrop = detectResponseDrop(recentRate, baselineRate || 0.01)

  const signalList = activeSignalsFromScores({
    sentimentDrift,
    afterHours,
    channelExclusion,
    responseDrop,
  }) as SignalType[]

  return {
    sentimentDrift,
    afterHours,
    channelExclusion,
    responseDrop,
    signalList,
    isEarlyData,
    receivedHostility,
  }
}

async function maybeCreateAlert(
  orgId: string,
  personId: string,
  level: 'normal' | 'watch' | 'warning' | 'critical',
  signalList: SignalType[],
  evidenceCount: number,
  previousLevel: string
) {
  if (level !== 'warning' && level !== 'critical') return
  if (previousLevel === level) return

  const openAlert = await db.query.alerts.findFirst({
    where: and(
      eq(alerts.orgId, orgId),
      eq(alerts.personId, personId),
      eq(alerts.status, 'open'),
      eq(alerts.severity, level)
    ),
  })

  if (openAlert) return

  await db.insert(alerts).values({
    orgId,
    personId,
    severity: level,
    signals: signalList,
    evidenceCount,
    status: 'open',
  })
}

export async function processEventsBatch(limit = 50): Promise<{ processed: number; errors: number }> {
  const org = await getOrCreateDemoOrg()
  const unprocessed = await getUnprocessedEvents(limit)
  let processed = 0
  let errors = 0
  const touchedSlackUsers = new Set<string>()

  for (const event of unprocessed) {
    try {
      if (!event.text?.trim()) {
        await markEventProcessed(event, 0, [])
        processed++
        continue
      }

      const { score: sentimentScore } = await scoreSentiment(event.text)
      const eventSignals: string[] = []
      const eventTime = event.created_at ?? new Date(Number(event.ts) * 1000).toISOString()
      if (isAfterHours(eventTime)) eventSignals.push('after_hours')
      if (sentimentScore < -0.3) eventSignals.push('sentiment_drift')

      const actor = await getOrCreatePerson(org.id, event.sender_id)
      touchedSlackUsers.add(event.sender_id)

      for (const recipientSlackId of event.recipient_ids ?? []) {
        if (recipientSlackId === event.sender_id) continue
        const target = await getOrCreatePerson(org.id, recipientSlackId)
        await upsertRelationship(
          org.id,
          actor.id,
          target.id,
          sentimentScore,
          eventSignals.includes('after_hours')
        )
      }

      await markEventProcessed(event, sentimentScore, eventSignals)
      processed++
    } catch (err) {
      errors++
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to process event:', event.event_id, err)
      }
    }
  }

  const usersToRecalculate = new Set(touchedSlackUsers)
  const allPersons = await db.query.persons.findMany({ where: eq(persons.orgId, org.id) })
  for (const person of allPersons) {
    if (person.slackUserId && person.slackUserId !== 'USLACKBOT') {
      usersToRecalculate.add(person.slackUserId)
    }
  }

  const workspaceEvents = await getAllProcessedEvents()

  for (const slackUserId of usersToRecalculate) {
    try {
      await recalculatePersonRisk(org.id, slackUserId, workspaceEvents)
    } catch (err) {
      errors++
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to recalculate risk for:', slackUserId, err)
      }
    }
  }

  return { processed, errors }
}

async function markEventProcessed(
  event: DynamoEvent,
  sentimentScore: number,
  signals: string[]
) {
  await dynamo.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { org_id: event.org_id, event_id: event.event_id },
      UpdateExpression:
        'SET #processed = :isProcessed, sentiment_score = :score, signals = :signals',
      ExpressionAttributeNames: { '#processed': 'processed' },
      ExpressionAttributeValues: {
        ':isProcessed': true,
        ':score': sentimentScore,
        ':signals': signals,
      },
    })
  )
}

async function recalculatePersonRisk(
  orgId: string,
  slackUserId: string,
  workspaceEvents: DynamoEvent[]
) {
  const person = await db.query.persons.findFirst({
    where: and(eq(persons.orgId, orgId), eq(persons.slackUserId, slackUserId)),
  })
  if (!person) return

  const allEvents = await getProcessedEventsBySender(slackUserId)
  const signalScores = await computePersonSignals(slackUserId, allEvents, workspaceEvents)
  const { score, level } = computeCompositeRisk(
    {
      sentimentDrift: signalScores.sentimentDrift,
      afterHours: signalScores.afterHours,
      channelExclusion: signalScores.channelExclusion,
      responseDrop: signalScores.responseDrop,
    },
    { earlyData: signalScores.isEarlyData }
  )
  const previousLevel = person.riskLevel ?? 'normal'

  await db
    .update(persons)
    .set({
      riskScore: score.toFixed(2),
      riskLevel: level,
      lastScoredAt: new Date(),
    })
    .where(eq(persons.id, person.id))

  const flaggedCount = allEvents.filter((e) => (e.signals?.length ?? 0) > 0).length
  await maybeCreateAlert(
    orgId,
    person.id,
    level,
    signalScores.signalList,
    flaggedCount,
    previousLevel
  )

  const personRels = await db.query.relationships.findMany({
    where: eq(relationships.actorId, person.id),
  })

  const relScoring = toScoringEvents(allEvents)
  const relComposite = computeCompositeRisk(
    {
      sentimentDrift: signalScores.sentimentDrift,
      afterHours: detectAfterHours(relScoring),
      channelExclusion: detectChannelExclusion(
        getChannelsByPeriod(allEvents, 0, 30),
        getChannelsByPeriod(allEvents, 30, 30)
      ),
      responseDrop: signalScores.responseDrop,
    },
    { earlyData: signalScores.isEarlyData }
  )

  for (const rel of personRels) {
    await db
      .update(relationships)
      .set({
        riskScore: relComposite.score.toFixed(2),
        riskLevel: relComposite.level,
        updatedAt: new Date(),
      })
      .where(eq(relationships.id, rel.id))
  }
}

export async function getDashboardMetrics(orgId: string) {
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const [employeeCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(persons)
    .where(eq(persons.orgId, orgId))

  const [activeAlertCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(alerts)
    .where(and(eq(alerts.orgId, orgId), eq(alerts.status, 'open')))

  const [highRiskCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(relationships)
    .where(
      and(
        eq(relationships.orgId, orgId),
        or(eq(relationships.riskLevel, 'warning'), eq(relationships.riskLevel, 'critical'))
      )
    )

  const scanResult = await dynamo.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression:
        'org_id = :orgId AND #processed = :isProcessed AND created_at >= :today',
      ExpressionAttributeNames: { '#processed': 'processed' },
      ExpressionAttributeValues: {
        ':orgId': DEMO_ORG_ID,
        ':isProcessed': true,
        ':today': todayStart.toISOString(),
      },
      Select: 'COUNT',
    })
  )

  return {
    totalEmployees: employeeCount?.count ?? 0,
    activeAlerts: activeAlertCount?.count ?? 0,
    highRiskRelationships: highRiskCount?.count ?? 0,
    messagesAnalyzedToday: scanResult.Count ?? 0,
  }
}

export async function resolveOrgId(queryOrgId?: string | null) {
  if (queryOrgId) {
    const org = await db.query.orgs.findFirst({
      where: eq(orgs.slackWorkspaceId, queryOrgId),
    })
    if (org) return org
  }
  return getOrCreateDemoOrg()
}

export function mapPersonRow(
  row: typeof persons.$inferSelect,
  signals: SignalType[] = []
) {
  return {
    id: row.id,
    name: row.name,
    department: row.department ?? 'Unknown',
    managerId: row.managerId,
    slackUserId: row.slackUserId,
    riskScore: parseFloat(row.riskScore ?? '0'),
    riskLevel: row.riskLevel ?? 'normal',
    signals,
    lastActivity:
      row.lastScoredAt?.toISOString() ?? row.createdAt?.toISOString() ?? new Date().toISOString(),
  }
}

export async function getPersonSignals(personId: string): Promise<SignalType[]> {
  const openAlerts = await db.query.alerts.findMany({
    where: and(eq(alerts.personId, personId), eq(alerts.status, 'open')),
  })

  const signalSet = new Set<SignalType>()
  for (const alert of openAlerts) {
    for (const s of alert.signals ?? []) {
      signalSet.add(s as SignalType)
    }
  }
  return [...signalSet]
}

export async function getPersonBreakdown(slackUserId: string) {
  const [allEvents, workspaceEvents] = await Promise.all([
    getProcessedEventsBySender(slackUserId),
    getAllProcessedEvents(),
  ])
  const signals = await computePersonSignals(slackUserId, allEvents, workspaceEvents)
  const composite = computeCompositeRisk(
    {
      sentimentDrift: signals.sentimentDrift,
      afterHours: signals.afterHours,
      channelExclusion: signals.channelExclusion,
      responseDrop: signals.responseDrop,
    },
    { earlyData: signals.isEarlyData }
  )
  return {
    sentimentDrift: signals.sentimentDrift,
    afterHours: signals.afterHours,
    channelExclusion: signals.channelExclusion,
    responseDrop: signals.responseDrop,
    composite: composite.score,
  }
}
