import { sqlite } from './client.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const migrationFile = path.join(__dirname, '../../../../drizzle/migrations/0000_initial_schema.sql')

console.log('Running migration from:', migrationFile)

try {
  const sql = readFileSync(migrationFile, 'utf-8')

  // Remove comments and execute entire SQL file
  // better-sqlite3 exec() can handle multiple statements
  sqlite.exec(sql)

  console.log('✅ Migration completed successfully')
} catch (error) {
  console.error('❌ Migration failed:', error)
  process.exit(1)
} finally {
  sqlite.close()
}
