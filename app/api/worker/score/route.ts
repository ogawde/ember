import { NextResponse } from 'next/server'
import { processEventsBatch } from '@/lib/worker/process-events'

export async function GET() {
  try {
    const result = await processEventsBatch(50)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Scoring worker error:', err)
    return NextResponse.json({ error: 'Failed to process events' }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
