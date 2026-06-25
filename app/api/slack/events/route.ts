import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { dynamo, PutCommand, TABLE_NAME } from '@/lib/aws/dynamodb'
import { DEMO_ORG_ID } from '@/lib/constants'
import { extractMentionedUserIds } from '@/lib/slack/utils'

function verifySlackSignature(req: NextRequest, body: string): boolean {
  const timestamp = req.headers.get('x-slack-request-timestamp')
  const slackSignature = req.headers.get('x-slack-signature')
  if (!timestamp || !slackSignature) return false

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300
  if (parseInt(timestamp, 10) < fiveMinutesAgo) return false

  const sigBaseString = `v0:${timestamp}:${body}`
  const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET!)
  hmac.update(sigBaseString)
  const computedSig = `v0=${hmac.digest('hex')}`

  const a = Buffer.from(computedSig)
  const b = Buffer.from(slackSignature)
  if (a.length !== b.length) return false

  return crypto.timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    if (process.env.NODE_ENV === 'production') {
      if (!verifySlackSignature(req, body)) {
        return new Response('Unauthorized', { status: 401 })
      }
    }

    const payload = JSON.parse(body)

    if (payload.type === 'url_verification') {
      return Response.json({ challenge: payload.challenge })
    }

    if (payload.event?.type === 'message' && !payload.event.subtype) {
      const event = payload.event
      const eventId = `${event.ts}_${event.channel}`
      const text = event.text ?? ''
      const mentions = extractMentionedUserIds(text)

      try {
        await dynamo.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              org_id: DEMO_ORG_ID,
              event_id: eventId,
              sender_id: event.user,
              channel: event.channel,
              channel_type: event.channel_type ?? 'channel',
              text,
              ts: event.ts,
              created_at: new Date(Number(event.ts) * 1000).toISOString(),
              processed: false,
              sentiment_score: null,
              signals: [],
              recipient_ids: mentions,
            },
            ConditionExpression: 'attribute_not_exists(event_id)',
          })
        )
      } catch {}
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Slack webhook error:', err)
    }
    return new Response('ok', { status: 200 })
  }
}
