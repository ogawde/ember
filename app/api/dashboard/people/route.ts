import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/db'
import {
  resolveOrgId,
  mapPersonRow,
  getPersonSignals,
} from '@/lib/worker/process-events'

const { persons } = schema

export async function GET(req: NextRequest) {
  try {
    const orgIdParam = req.nextUrl.searchParams.get('orgId')
    const org = await resolveOrgId(orgIdParam)

    const rows = await db.query.persons.findMany({
      where: eq(persons.orgId, org.id),
      orderBy: (p, { desc }) => [desc(p.riskScore)],
    })

    const people = await Promise.all(
      rows.map(async (row) => {
        const signals = await getPersonSignals(row.id)
        return mapPersonRow(row, signals)
      })
    )

    return NextResponse.json(people)
  } catch (err) {
    console.error('People API error:', err)
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 })
  }
}
