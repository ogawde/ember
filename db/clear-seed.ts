import dotenv from 'dotenv'
import { inArray, or } from 'drizzle-orm'
import { dynamo, ScanCommand, DeleteCommand, TABLE_NAME } from '@/lib/aws/dynamodb'
import { DEMO_ORG_ID } from '@/lib/constants'

dotenv.config({ path: '.env.local' })
dotenv.config()

const SEED_SLACK_IDS = [
  'U001',
  'U002',
  'U003',
  'U004',
  'U005',
  'U006',
  'U007',
  'U008',
  'U009',
  'U010',
]

async function clearSeed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing. Check that .env.local exists and has a value set.')
    process.exit(1)
  }
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('AWS credentials missing from .env.local')
    process.exit(1)
  }

  const { db, schema } = await import('@/db')
  const { persons, relationships, alerts } = schema

  console.log('Removing seed demo data...')
  console.log('→ Querying Aurora for seed people (first connect can take 15–30s if DB was idle)...')

  const seedPeople = await db.query.persons.findMany({
    where: (p, { inArray: inArrayFn }) => inArrayFn(p.slackUserId, SEED_SLACK_IDS),
  })

  const seedPersonIds = seedPeople.map((p) => p.id)

  if (seedPersonIds.length > 0) {
    console.log(`→ Deleting ${seedPersonIds.length} seed people and related records...`)
    await db.delete(alerts).where(inArray(alerts.personId, seedPersonIds))
    await db
      .delete(relationships)
      .where(
        or(
          inArray(relationships.actorId, seedPersonIds),
          inArray(relationships.targetId, seedPersonIds)
        )
      )
    await db.delete(persons).where(inArray(persons.id, seedPersonIds))
    console.log(`✓ Removed ${seedPersonIds.length} seed people and related alerts/relationships`)
  } else {
    console.log('✓ No seed people found in database (already cleared)')
  }

  console.log('→ Scanning DynamoDB for seed events...')
  const scanResult = await dynamo.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'org_id = :orgId',
      ExpressionAttributeValues: { ':orgId': DEMO_ORG_ID },
    })
  )

  const items = scanResult.Items ?? []
  let deletedEvents = 0
  for (const item of items) {
    const senderId = item.sender_id as string
    if (SEED_SLACK_IDS.includes(senderId)) {
      await dynamo.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { org_id: item.org_id, event_id: item.event_id },
        })
      )
      deletedEvents++
    }
  }

  console.log(`✓ Removed ${deletedEvents} seed DynamoDB events`)
  console.log('Done. Run: curl http://localhost:3000/api/slack/users/sync')
  process.exit(0)
}

clearSeed().catch((err) => {
  console.error('Clear seed failed:', err)
  process.exit(1)
})
