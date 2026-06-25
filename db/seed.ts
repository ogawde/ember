import dotenv from 'dotenv'
import { DEMO_ORG_ID } from '@/lib/constants'

dotenv.config({ path: '.env.local' })
dotenv.config()

const SEED_PEOPLE = [
  { slackUserId: 'U001', name: 'Alex M.', department: 'Engineering', riskScore: '8.10', riskLevel: 'critical' as const },
  { slackUserId: 'U002', name: 'Jordan Chen', department: 'Product', riskScore: '5.20', riskLevel: 'warning' as const },
  { slackUserId: 'U003', name: 'Morgan Lee', department: 'Design', riskScore: '3.10', riskLevel: 'watch' as const },
  { slackUserId: 'U004', name: 'Sam Taylor', department: 'Engineering', riskScore: '2.00', riskLevel: 'normal' as const },
  { slackUserId: 'U005', name: 'Casey Martinez', department: 'Product', riskScore: '1.50', riskLevel: 'normal' as const },
  { slackUserId: 'U006', name: 'Riley Park', department: 'Design', riskScore: '4.30', riskLevel: 'watch' as const },
  { slackUserId: 'U007', name: 'Devon Wright', department: 'Marketing', riskScore: '2.70', riskLevel: 'normal' as const },
  { slackUserId: 'U008', name: 'Quinn Foster', department: 'Engineering', riskScore: '6.20', riskLevel: 'warning' as const },
  { slackUserId: 'U009', name: 'Avery Brooks', department: 'Product', riskScore: '3.80', riskLevel: 'watch' as const },
  { slackUserId: 'U010', name: 'Jordan Blake', department: 'Marketing', riskScore: '1.20', riskLevel: 'normal' as const },
]

const TOXIC_MESSAGES = [
  "I don't know why we even bother with these meetings. Nothing ever changes anyway.",
  'Can we talk about the project review? I have some concerns about how things are being handled.',
  "Anyway, I've been thinking about my career here. The direction doesn't feel right anymore.",
  'The way this was communicated to us was pretty disappointing. No heads up beforehand.',
  'You getting the same vibe from leadership that I am? Things feel off lately.',
  "Not sure how we're supposed to hit the deadline with the current scope. This seems unrealistic.",
  'I appreciate the opportunity, but I think I need to move on. I have other options.',
]

async function seed() {
  const { db, schema } = await import('@/db')
  const { dynamo, PutCommand, TABLE_NAME } = await import('@/lib/aws/dynamodb')
  const { orgs, persons, relationships, alerts } = schema

  console.log('Seeding Ember demo data...')

  let existingOrg = await db.query.orgs.findFirst({
    where: (o, { eq }) => eq(o.slackWorkspaceId, DEMO_ORG_ID),
  })

  if (!existingOrg) {
    const [created] = await db
      .insert(orgs)
      .values({ slackWorkspaceId: DEMO_ORG_ID, workspaceName: 'Demo Corp' })
      .returning()
    existingOrg = created
  }

  if (!existingOrg) throw new Error('Failed to create org')

  const insertedPeople = []
  for (const p of SEED_PEOPLE) {
    const existing = await db.query.persons.findFirst({
      where: (row, { and, eq }) =>
        and(eq(row.orgId, existingOrg.id), eq(row.slackUserId, p.slackUserId)),
    })
    if (existing) {
      insertedPeople.push(existing)
      continue
    }

    const [person] = await db
      .insert(persons)
      .values({
        orgId: existingOrg.id,
        slackUserId: p.slackUserId,
        name: p.name,
        department: p.department,
        riskScore: p.riskScore,
        riskLevel: p.riskLevel,
        lastScoredAt: new Date(),
      })
      .returning()

    insertedPeople.push(person)
  }

  const allPeople =
    insertedPeople.length > 0
      ? insertedPeople
      : await db.query.persons.findMany({ where: (p, { eq }) => eq(p.orgId, existingOrg.id) })

  const alex = allPeople.find((p) => p.slackUserId === 'U001')
  const sam = allPeople.find((p) => p.slackUserId === 'U004')
  const casey = allPeople.find((p) => p.slackUserId === 'U005')
  const quinn = allPeople.find((p) => p.slackUserId === 'U008')

  if (alex && sam) {
    const rel = await db.query.relationships.findFirst({
      where: (r, { and, eq }) =>
        and(eq(r.actorId, alex.id), eq(r.targetId, sam.id)),
    })
    if (!rel) {
      await db.insert(relationships).values({
        orgId: existingOrg.id,
        actorId: alex.id,
        targetId: sam.id,
        interactionCount: 47,
        avgSentiment: '-0.620',
        sentimentTrend: 'falling',
        riskScore: '8.10',
        riskLevel: 'critical',
        powerDelta: -1,
        afterHoursCount: 5,
        lastInteractionAt: new Date(),
      })
    }
  }

  if (alex && casey) {
    const rel = await db.query.relationships.findFirst({
      where: (r, { and, eq }) =>
        and(eq(r.actorId, alex.id), eq(r.targetId, casey.id)),
    })
    if (!rel) {
      await db.insert(relationships).values({
        orgId: existingOrg.id,
        actorId: alex.id,
        targetId: casey.id,
        interactionCount: 23,
        avgSentiment: '-0.410',
        sentimentTrend: 'falling',
        riskScore: '5.50',
        riskLevel: 'warning',
        powerDelta: 0,
        lastInteractionAt: new Date(),
      })
    }
  }

  if (alex && quinn) {
    const rel = await db.query.relationships.findFirst({
      where: (r, { and, eq }) =>
        and(eq(r.actorId, alex.id), eq(r.targetId, quinn.id)),
    })
    if (!rel) {
      await db.insert(relationships).values({
        orgId: existingOrg.id,
        actorId: alex.id,
        targetId: quinn.id,
        interactionCount: 15,
        avgSentiment: '-0.350',
        sentimentTrend: 'stable',
        riskScore: '5.00',
        riskLevel: 'warning',
        powerDelta: 1,
        lastInteractionAt: new Date(),
      })
    }
  }

  if (alex) {
    const existingAlert = await db.query.alerts.findFirst({
      where: (a, { and, eq }) =>
        and(eq(a.personId, alex.id), eq(a.severity, 'critical')),
    })
    if (!existingAlert) {
      await db.insert(alerts).values({
        orgId: existingOrg.id,
        personId: alex.id,
        severity: 'critical',
        signals: ['sentiment_drift', 'after_hours', 'channel_exclusion'],
        status: 'open',
        evidenceCount: 7,
        firedAt: new Date(),
      })
    }

    for (let i = 0; i < TOXIC_MESSAGES.length; i++) {
      const ts = (Date.now() / 1000 - i * 86400).toFixed(6)
      const eventId = `${ts}_C00${i}`
      await dynamo.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            org_id: DEMO_ORG_ID,
            event_id: eventId,
            sender_id: 'U001',
            channel: i % 2 === 0 ? 'C001' : 'D001',
            channel_type: i % 2 === 0 ? 'channel' : 'im',
            text: TOXIC_MESSAGES[i],
            ts,
            created_at: new Date(Number(ts) * 1000).toISOString(),
            processed: true,
            sentiment_score: -0.4 - i * 0.05,
            signals: ['sentiment_drift', 'after_hours'].slice(0, (i % 2) + 1),
            recipient_ids: ['U004'],
          },
        })
      )
    }
  }

  if (quinn) {
    const existingAlert = await db.query.alerts.findFirst({
      where: (a, { and, eq }) =>
        and(eq(a.personId, quinn.id), eq(a.severity, 'warning')),
    })
    if (!existingAlert) {
      await db.insert(alerts).values({
        orgId: existingOrg.id,
        personId: quinn.id,
        severity: 'warning',
        signals: ['sentiment_drift', 'after_hours'],
        status: 'open',
        evidenceCount: 3,
        firedAt: new Date(Date.now() - 86400000),
      })
    }
  }

  console.log(`Seeded org, ${allPeople.length} people, relationships, alerts, and DynamoDB events.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
