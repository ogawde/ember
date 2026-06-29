import { NextRequest, NextResponse } from 'next/server'
import { processEventsBatch } from '@/lib/worker/process-events'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  const querySecret = req.nextUrl.searchParams.get('secret')
  return Boolean(secret && (auth === `Bearer ${secret}` || querySecret === secret))
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processEventsBatch(50)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Scoring worker error:', err)
    return NextResponse.json({ error: 'Failed to process events' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
