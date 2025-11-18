import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'
import path from 'path'
import { fileURLToPath } from 'url'
import type BetterSqlite3 from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../database.sqlite')

// Create SQLite database instance
const sqlite: BetterSqlite3.Database = new Database(dbPath)

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('synchronous = NORMAL')
sqlite.pragma('cache_size = -64000') // 64MB cache
sqlite.pragma('foreign_keys = ON')

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema })

export { sqlite }
