import { Lucia } from 'lucia'
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite'
import { sqlite as defaultSqlite } from '../db/client.js'
import type BetterSqlite3 from 'better-sqlite3'

// Factory function to create Lucia instance with custom sqlite database
export function createLucia(sqlite: BetterSqlite3.Database = defaultSqlite) {
  // Create Lucia adapter for SQLite
  const adapter = new BetterSqlite3Adapter(sqlite, {
    user: 'users',
    session: 'sessions',
  })

  // Initialize Lucia
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    },
    getUserAttributes: (attributes) => {
      return {
        email: attributes.email,
        name: attributes.name,
      }
    },
  })
}

// Default lucia instance for non-test usage
export const lucia = createLucia()

// Type declarations for Lucia
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

interface DatabaseUserAttributes {
  email: string
  name: string
}
