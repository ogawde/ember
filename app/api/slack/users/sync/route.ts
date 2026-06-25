import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/db'
import { getOrCreateDemoOrg, getOrCreatePerson } from '@/lib/worker/process-events'

const { orgs, persons } = schema

interface SlackMember {
  id: string
  name?: string
  real_name?: string
  profile?: { email?: string; display_name?: string }
  deleted?: boolean
  is_bot?: boolean
}

export async function GET() {
  try {
    const token = process.env.SLACK_BOT_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'SLACK_BOT_TOKEN not configured' }, { status: 500 })
    }

    const org = await getOrCreateDemoOrg()

    const [usersRes, authRes] = await Promise.all([
      fetch('https://slack.com/api/users.list', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch('https://slack.com/api/auth.test', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])

    const usersData = await usersRes.json()
    if (!usersData.ok) {
      return NextResponse.json({ error: usersData.error ?? 'Slack users API error' }, { status: 502 })
    }

    const authData = await authRes.json()
    let workspaceName = org.workspaceName
    if (authData.ok && authData.team) {
      workspaceName = authData.team
      await db
        .update(orgs)
        .set({ workspaceName })
        .where(eq(orgs.id, org.id))
    }

    let synced = 0
    for (const member of usersData.members as SlackMember[]) {
      if (member.deleted || member.is_bot) continue

      const name =
        member.profile?.display_name ||
        member.real_name ||
        member.name ||
        `User ${member.id.slice(-4)}`

      const existing = await db.query.persons.findFirst({
        where: (p, { and, eq }) =>
          and(eq(p.orgId, org.id), eq(p.slackUserId, member.id)),
      })

      if (existing) {
        await db
          .update(persons)
          .set({
            name,
            email: member.profile?.email ?? existing.email,
          })
          .where(eq(persons.id, existing.id))
      } else {
        await getOrCreatePerson(org.id, member.id, name)
      }
      synced++
    }

    return NextResponse.json({ synced, workspace: workspaceName })
  } catch (err) {
    console.error('Slack users sync error:', err)
    return NextResponse.json({ error: 'Failed to sync Slack users' }, { status: 502 })
  }
}
