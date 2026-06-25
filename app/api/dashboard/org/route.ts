import { NextResponse } from 'next/server'
import { getOrCreateDemoOrg } from '@/lib/worker/process-events'

export async function GET() {
  try {
    const org = await getOrCreateDemoOrg()
    return NextResponse.json({
      workspaceName: org.workspaceName,
      slackWorkspaceId: org.slackWorkspaceId,
      slackConnected: Boolean(process.env.SLACK_BOT_TOKEN),
    })
  } catch (err) {
    console.error('Org API error:', err)
    return NextResponse.json({ error: 'Failed to fetch org' }, { status: 500 })
  }
}
