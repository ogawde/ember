import { NextRequest, NextResponse } from 'next/server'
import { eq, and, desc } from 'drizzle-orm'
import { db, schema } from '@/db'
import { resolveOrgId } from '@/lib/worker/process-events'
import type { Alert } from '@/lib/types'

const { alerts, persons } = schema

export async function GET(req: NextRequest) {
  try {
    const orgIdParam = req.nextUrl.searchParams.get('orgId')
    const status = req.nextUrl.searchParams.get('status')
    const severity = req.nextUrl.searchParams.get('severity')

    const org = await resolveOrgId(orgIdParam)

    const conditions = [eq(alerts.orgId, org.id)]
    if (status && status !== 'all') {
      conditions.push(eq(alerts.status, status as 'open' | 'acknowledged' | 'dismissed'))
    }
    if (severity && severity !== 'all') {
      conditions.push(
        eq(alerts.severity, severity as 'normal' | 'watch' | 'warning' | 'critical')
      )
    }

    const rows = await db.query.alerts.findMany({
      where: and(...conditions),
      orderBy: [desc(alerts.firedAt)],
    })

    const personIds = [...new Set(rows.map((r) => r.personId))]
    const people =
      personIds.length > 0
        ? await db.query.persons.findMany({
            where: (p, { inArray }) => inArray(p.id, personIds),
          })
        : []
    const personMap = new Map(people.map((p) => [p.id, p]))

    const result: Alert[] = rows.map((row) => ({
      id: row.id,
      personId: row.personId,
      personName: personMap.get(row.personId)?.name ?? 'Unknown',
      severity: row.severity ?? 'watch',
      signals: (row.signals ?? []) as Alert['signals'],
      firedAt: row.firedAt?.toISOString() ?? new Date().toISOString(),
      status: row.status ?? 'open',
      evidenceCount: row.evidenceCount ?? 0,
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error('Alerts API error:', err)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}
