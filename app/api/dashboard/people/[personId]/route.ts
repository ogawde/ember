import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '@/db'
import {
  getOrCreateDemoOrg,
  getFlaggedEventsBySender,
  getPersonBreakdown,
  getPersonSignals,
  mapPersonRow,
} from '@/lib/worker/process-events'
import { mapChannelType } from '@/lib/slack/utils'
import type { Relationship, MessageEvent } from '@/lib/types'

const { persons, relationships } = schema

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const { personId } = await params
    const org = await getOrCreateDemoOrg()

    const person = await db.query.persons.findFirst({
      where: and(eq(persons.id, personId), eq(persons.orgId, org.id)),
    })

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    const signals = await getPersonSignals(person.id)
    const breakdown = await getPersonBreakdown(person.slackUserId)

    const relRows = await db.query.relationships.findMany({
      where: eq(relationships.actorId, person.id),
    })

    const targetIds = relRows.map((r) => r.targetId)
    const targets =
      targetIds.length > 0
        ? await db.query.persons.findMany({
            where: (p, { inArray }) => inArray(p.id, targetIds),
          })
        : []
    const targetMap = new Map(targets.map((t) => [t.id, t]))

    const relationshipsData: (Relationship & { partnerName: string })[] = relRows.map((rel) => ({
      actorId: rel.actorId,
      targetId: rel.targetId,
      interactionCount: rel.interactionCount ?? 0,
      avgSentiment: parseFloat(rel.avgSentiment ?? '0'),
      sentimentTrend: (rel.sentimentTrend ?? 'stable') as Relationship['sentimentTrend'],
      riskLevel: rel.riskLevel ?? 'normal',
      powerDelta: rel.powerDelta ?? 0,
      partnerName: targetMap.get(rel.targetId)?.name ?? 'Unknown',
    }))

    const flaggedEvents = await getFlaggedEventsBySender(person.slackUserId)
    const messages: MessageEvent[] = flaggedEvents.map((e) => ({
      eventId: e.event_id,
      orgId: e.org_id,
      senderId: person.id,
      senderName: person.name,
      recipientIds: e.recipient_ids ?? [],
      channel: e.channel,
      channelType: mapChannelType(e.channel_type),
      text: e.text,
      sentimentScore: e.sentiment_score ?? 0,
      signals: (e.signals ?? []) as MessageEvent['signals'],
      timestamp: e.created_at ?? new Date(Number(e.ts) * 1000).toISOString(),
    }))

    return NextResponse.json({
      person: mapPersonRow(person, signals),
      breakdown,
      relationships: relationshipsData,
      messages,
    })
  } catch (err) {
    console.error('Person detail API error:', err)
    return NextResponse.json({ error: 'Failed to fetch person' }, { status: 500 })
  }
}
