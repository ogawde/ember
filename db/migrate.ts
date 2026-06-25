import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { createPgPool } from '@/lib/db/pool'

dotenv.config({ path: '.env.local' })
dotenv.config()

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env.local')
  }

  const pool = createPgPool()
  const db = drizzle(pool)

  try {
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('Migration complete')
  } finally {
    await pool.end()
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
