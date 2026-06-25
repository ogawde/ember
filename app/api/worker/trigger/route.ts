import { NextRequest, NextResponse } from 'next/server'
import { processEventsBatch } from '@/lib/worker/process-events'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  const querySecret = req.nextUrl.searchParams.get('secret')

  if (!secret || (auth !== `Bearer ${secret}` && querySecret !== secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processEventsBatch(50)
    return NextResponse.json({ ...result, triggered: 'manual' })
  } catch (err) {
    console.error('Manual trigger error:', err)
    return NextResponse.json({ error: 'Failed to process events' }, { status: 500 })
  }
}
