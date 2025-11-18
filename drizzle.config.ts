import type { Config } from 'drizzle-kit'

export default {
  schema: './apps/backend/src/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './apps/backend/database.sqlite',
  },
} satisfies Config
