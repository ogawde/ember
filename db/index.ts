import { drizzle } from 'drizzle-orm/node-postgres'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { Pool } from 'pg'
import * as schema from './schema'
import { createPgPool } from '@/lib/db/pool'

type Db = NodePgDatabase<typeof schema>

let pool: Pool | undefined
let database: Db | undefined

export function getDb(): Db {
  if (!database) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set. Add it to .env.local')
    }
    pool = createPgPool()
    database = drizzle(pool, { schema })
  }
  return database
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const instance = getDb() as unknown as Record<string | symbol, unknown>
    const value = instance[prop]
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(instance) : value
  },
})

export { schema }
