import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../../src/db/schema.js'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type BetterSqlite3 from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function createTestDb(): { db: BetterSQLite3Database<typeof schema>; sqlite: BetterSqlite3.Database } {
  // Create in-memory database
  const sqlite: BetterSqlite3.Database = new Database(':memory:')

  // Enable foreign keys
  sqlite.pragma('foreign_keys = ON')

  // Load and execute migration SQL
  const migrationFile = path.join(__dirname, '../../../../drizzle/migrations/0000_initial_schema.sql')
  const sql = readFileSync(migrationFile, 'utf-8')
  sqlite.exec(sql)

  // Create Drizzle instance
  const db = drizzle(sqlite, { schema })

  return { db, sqlite }
}

export function cleanupTestDb(sqlite: BetterSqlite3.Database) {
  sqlite.close()
}
