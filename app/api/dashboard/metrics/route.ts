import { NextRequest, NextResponse } from 'next/server'
import {
  getDashboardMetrics,
  resolveOrgId,
} from '@/lib/worker/process-events'

export async function GET(req: NextRequest) {
  try {
    const orgIdParam = req.nextUrl.searchParams.get('orgId')
    const org = await resolveOrgId(orgIdParam)
    const metrics = await getDashboardMetrics(org.id)
    return NextResponse.json(metrics)
  } catch (err) {
    console.error('Metrics API error:', err)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
