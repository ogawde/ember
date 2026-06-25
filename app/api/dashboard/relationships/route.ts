import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/db'
import { resolveOrgId } from '@/lib/worker/process-events'

const { relationships } = schema

export async function GET(req: NextRequest) {
  try {
    const orgIdParam = req.nextUrl.searchParams.get('orgId')
    const org = await resolveOrgId(orgIdParam)

    const rows = await db.query.relationships.findMany({
      where: eq(relationships.orgId, org.id),
    })

    return NextResponse.json(
      rows.map((rel) => ({
        actorId: rel.actorId,
        targetId: rel.targetId,
        interactionCount: rel.interactionCount ?? 0,
        avgSentiment: parseFloat(rel.avgSentiment ?? '0'),
        sentimentTrend: rel.sentimentTrend ?? 'stable',
        riskLevel: rel.riskLevel ?? 'normal',
        powerDelta: rel.powerDelta ?? 0,
        riskScore: parseFloat(rel.riskScore ?? '0'),
      }))
    )
  } catch (err) {
    console.error('Relationships API error:', err)
    return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 })
  }
}
