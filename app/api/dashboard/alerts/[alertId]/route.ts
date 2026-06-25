import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/db'

const { alerts } = schema

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  try {
    const { alertId } = await params
    const body = await req.json()
    const status = body.status as 'acknowledged' | 'dismissed' | undefined

    if (!status || !['acknowledged', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const existing = await db.query.alerts.findFirst({
      where: eq(alerts.id, alertId),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const now = new Date()
    await db
      .update(alerts)
      .set({
        status,
        acknowledgedAt: status === 'acknowledged' ? now : existing.acknowledgedAt,
        resolvedAt: status === 'dismissed' ? now : existing.resolvedAt,
      })
      .where(eq(alerts.id, alertId))

    return NextResponse.json({ success: true, status })
  } catch (err) {
    console.error('Alert update error:', err)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}
