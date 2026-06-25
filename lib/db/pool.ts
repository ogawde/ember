import { Pool, type PoolConfig } from 'pg'

export function createPgPool(overrides: Partial<PoolConfig> = {}): Pool {
  let connectionString = process.env.DATABASE_URL ?? ''

  connectionString = connectionString
    .replace(/([?&])sslmode=[^&]*&?/g, '$1')
    .replace(/[?&]$/, '')

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    connectionTimeoutMillis: 15_000,
    ...overrides,
  })
}
