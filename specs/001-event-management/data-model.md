# Data Model: Event Management

**Feature**: 001-event-management
**Date**: 2025-11-18
**Database**: SQLite 3.x with Drizzle ORM

## Overview

This document defines the database schema, relationships, validation rules, and multi-tenancy patterns for the event management feature. Team-level data isolation is enforced via Fastify middleware + Drizzle ORM query filters.

## Entity-Relationship Diagram

```
┌─────────────────┐
│      users      │ (Lucia Auth managed)
│                 │
│ - id (TEXT)     │
│ - email (TEXT)  │
│ - password_hash │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐         ┌─────────────────┐
│  team_members   │  N:1    │     teams       │
│                 ├─────────►                 │
│ - user_id (FK)  │         │ - id (TEXT)     │
│ - team_id (FK)  │         │ - name (TEXT)   │
│ - role (TEXT)   │         │ - created_at    │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │                           │ 1:N
         │                           │
         │                  ┌────────▼────────┐
         │                  │     events      │
         │                  │                 │
         │                  │ - id (TEXT)     │
         └──────────────────┤ - team_id (FK)  │
           N:1 (created_by) │ - title (TEXT)  │
                            │ - description   │
                            │ - start_date    │
                            │ - end_date      │
                            │ - location      │
                            │ - created_by(FK)│
                            │ - updated_by(FK)│
                            │ - created_at    │
                            │ - updated_at    │
                            └─────────────────┘
```

## Drizzle ORM Schema Definition

### 1. `users` Table

Managed by Lucia Auth. Stores user credentials and profile.

```typescript
// apps/backend/src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID or nanoid
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
})

// Lucia Auth session table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
})
```

**Validation**:
- Email must be unique
- Email format validated at application layer (Zod schema)

### 2. `teams` Table

```typescript
export const teams = sqliteTable('teams', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name', { length: 100 }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
}, (table) => ({
  nameIdx: index('teams_name_idx').on(table.name)
}))
```

**Validation**:
- `name`: 1-100 characters (enforced by Zod + CHECK constraint)
- Trimmed non-empty string

**SQLite Migration**:
```sql
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(trim(name)) >= 1 AND length(name) <= 100),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX teams_name_idx ON teams(name);

-- Trigger to auto-update updated_at
CREATE TRIGGER teams_updated_at
  AFTER UPDATE ON teams
  FOR EACH ROW
BEGIN
  UPDATE teams SET updated_at = unixepoch() WHERE id = NEW.id;
END;
```

### 3. `team_members` Table

Junction table linking users to teams with RBAC roles.

```typescript
export const teamMembers = sqliteTable('team_members', {
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'admin', 'member', 'viewer'] })
    .notNull()
    .default('member'),
  joinedAt: integer('joined_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.teamId] }),
  userIdx: index('team_members_user_idx').on(table.userId),
  teamIdx: index('team_members_team_idx').on(table.teamId),
  roleIdx: index('team_members_role_idx').on(table.teamId, table.role)
}))
```

**Roles**:
- `owner`: Full permissions, can manage team members, delete team
- `admin`: Can create/edit/delete events, manage members (except owners)
- `member`: Can create/edit own events, view all team events
- `viewer`: Read-only access to team events

**SQLite Migration**:
```sql
CREATE TABLE team_members (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  joined_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (user_id, team_id)
);

CREATE INDEX team_members_user_idx ON team_members(user_id);
CREATE INDEX team_members_team_idx ON team_members(team_id);
CREATE INDEX team_members_role_idx ON team_members(team_id, role);
```

### 4. `events` Table

Core entity representing team events.

```typescript
export const events = sqliteTable('events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),

  // Event details (FR-001, FR-011, FR-012)
  title: text('title', { length: 200 }).notNull(),
  description: text('description', { length: 10000 }),
  location: text('location', { length: 500 }).notNull(),

  // Date/time (FR-009, FR-011)
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  timezone: text('timezone').default('UTC'),

  // Audit fields (FR-008)
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  updatedBy: text('updated_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
}, (table) => ({
  teamIdx: index('events_team_idx').on(table.teamId),
  startDateIdx: index('events_start_date_idx').on(table.startDate),
  createdByIdx: index('events_created_by_idx').on(table.createdBy),
  teamStartIdx: index('events_team_start_idx').on(table.teamId, table.startDate)
}))
```

**Field Details**:

| Field | SQLite Type | Constraints | Purpose |
|-------|-------------|-------------|---------|
| `id` | TEXT | PK, UUID | Unique event identifier |
| `team_id` | TEXT | FK, NOT NULL | Team ownership (isolation key) |
| `title` | TEXT | 1-200 chars | Event name (FR-012) |
| `description` | TEXT | Max 10,000 chars | Event details (FR-012) |
| `location` | TEXT | 1-500 chars | Physical or virtual location |
| `start_date` | INTEGER | Unix timestamp | Event start (milliseconds) |
| `end_date` | INTEGER | Unix timestamp | Event end (FR-011: multi-day) |
| `timezone` | TEXT | IANA identifier | Display timezone (FR-009) |
| `created_by` | TEXT | FK to users | Event creator (FR-008) |
| `updated_by` | TEXT | FK to users, nullable | Last modifier (FR-008) |
| `created_at` | INTEGER | Auto-managed | Creation timestamp |
| `updated_at` | INTEGER | Auto-managed | Last modification |

**SQLite Migration**:
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  title TEXT NOT NULL CHECK(length(trim(title)) >= 1 AND length(title) <= 200),
  description TEXT CHECK(length(description) <= 10000),
  location TEXT NOT NULL CHECK(length(trim(location)) >= 1 AND length(location) <= 500),

  start_date INTEGER NOT NULL,
  end_date INTEGER NOT NULL CHECK(end_date >= start_date),
  timezone TEXT DEFAULT 'UTC',

  created_by TEXT NOT NULL REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX events_team_idx ON events(team_id);
CREATE INDEX events_start_date_idx ON events(start_date);
CREATE INDEX events_created_by_idx ON events(created_by);
CREATE INDEX events_team_start_idx ON events(team_id, start_date DESC);

-- Auto-update updated_at trigger
CREATE TRIGGER events_updated_at
  AFTER UPDATE ON events
  FOR EACH ROW
BEGIN
  UPDATE events SET updated_at = unixepoch() WHERE id = NEW.id;
END;
```

**Validation Rules**:
- Title: 1-200 characters, trimmed non-empty
- Description: 0-10,000 characters (nullable)
- Location: 1-500 characters, trimmed non-empty
- End date >= start date (no instant events, multi-day supported)
- Timezone: IANA identifier (validated at application layer)

## Multi-Tenancy Implementation

### Middleware Pattern (Replaces PostgreSQL RLS)

Since SQLite doesn't have Row-Level Security, team isolation is enforced via Fastify middleware:

```typescript
// apps/backend/src/middleware/teamContext.ts
import { FastifyRequest } from 'fastify'
import { db } from '../db/client'
import { teamMembers } from '../db/schema'
import { eq } from 'drizzle-orm'

declare module 'fastify' {
  interface FastifyRequest {
    teamIds: string[]
    userId: string
  }
}

export async function teamContextMiddleware(request: FastifyRequest) {
  // Extract user ID from session (set by auth middleware)
  const userId = request.userId

  // Query user's team memberships
  const teams = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))

  // Attach team IDs to request for use in route handlers
  request.teamIds = teams.map(t => t.teamId)

  if (request.teamIds.length === 0) {
    throw new Error('User not a member of any team')
  }
}
```

### Query Pattern (Team Filtering)

All queries automatically filter by team:

```typescript
// apps/backend/src/routes/events.ts
import { inArray, eq, desc } from 'drizzle-orm'
import { events } from '../db/schema'

fastify.get('/api/v1/events', async (request) => {
  // request.teamIds populated by middleware
  const userEvents = await db
    .select()
    .from(events)
    .where(inArray(events.teamId, request.teamIds)) // Team isolation
    .orderBy(desc(events.startDate))

  return userEvents
})

// Create event - enforce team membership
fastify.post('/api/v1/events', async (request) => {
  const { teamId, title, description, location, startDate, endDate } = request.body

  // Verify user belongs to team
  if (!request.teamIds.includes(teamId)) {
    return reply.code(403).send({ error: 'Not a member of this team' })
  }

  const newEvent = await db.insert(events).values({
    teamId,
    title,
    description,
    location,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    createdBy: request.userId
  }).returning()

  return newEvent[0]
})
```

### Type-Safe Team Filtering Helper

```typescript
// apps/backend/src/services/eventService.ts
import { and, inArray, eq } from 'drizzle-orm'

export class EventService {
  // Helper: Always includes team filter
  private teamFilter(teamIds: string[]) {
    return inArray(events.teamId, teamIds)
  }

  async getEvents(userId: string, teamIds: string[]) {
    return db
      .select()
      .from(events)
      .where(this.teamFilter(teamIds))
      .orderBy(desc(events.startDate))
  }

  async getEventById(id: string, teamIds: string[]) {
    const [event] = await db
      .select()
      .from(events)
      .where(and(
        eq(events.id, id),
        this.teamFilter(teamIds) // Always filter by team
      ))

    return event
  }
}
```

## Database Relationships

```typescript
// Drizzle ORM relations
import { relations } from 'drizzle-orm'

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
  events: many(events)
}))

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id]
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id]
  })
}))

export const eventsRelations = relations(events, ({ one }) => ({
  team: one(teams, {
    fields: [events.teamId],
    references: [teams.id]
  }),
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id]
  }),
  updater: one(users, {
    fields: [events.updatedBy],
    references: [users.id]
  })
}))
```

## Seed Data (Development/Testing)

```typescript
// apps/backend/src/db/seed.ts
import { db } from './client'
import { users, teams, teamMembers, events } from './schema'

export async function seed() {
  // Insert test users
  const [user1] = await db.insert(users).values({
    id: crypto.randomUUID(),
    email: 'alice@example.com',
    emailVerified: true
  }).returning()

  const [user2] = await db.insert(users).values({
    id: crypto.randomUUID(),
    email: 'bob@example.com',
    emailVerified: true
  }).returning()

  // Insert test teams
  const [engTeam] = await db.insert(teams).values({
    id: crypto.randomUUID(),
    name: 'Engineering Team'
  }).returning()

  const [mktTeam] = await db.insert(teams).values({
    id: crypto.randomUUID(),
    name: 'Marketing Team'
  }).returning()

  // Insert team memberships
  await db.insert(teamMembers).values([
    { userId: user1.id, teamId: engTeam.id, role: 'admin' },
    { userId: user2.id, teamId: mktTeam.id, role: 'admin' }
  ])

  // Insert test events
  await db.insert(events).values({
    teamId: engTeam.id,
    title: 'Q1 Planning Offsite',
    description: 'Quarterly planning session',
    location: 'Conference Room A',
    startDate: new Date('2025-01-15T09:00:00Z'),
    endDate: new Date('2025-01-15T17:00:00Z'),
    timezone: 'America/Los_Angeles',
    createdBy: user1.id
  })

  console.log('Seed data inserted')
}
```

## Migration Strategy

Migrations managed by Drizzle Kit:

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate:sqlite

# Apply migrations
pnpm drizzle-kit push:sqlite

# View migration SQL
cat drizzle/migrations/0000_initial_schema.sql
```

**Migration Example** (`drizzle/migrations/0000_initial_schema.sql`):
```sql
-- Full schema from above CREATE TABLE statements
-- Run in order: users → sessions → teams → team_members → events
```

## Data Integrity

**Referential Integrity**:
- Foreign keys with `ON DELETE CASCADE`
- Team deletion cascades to events and memberships
- User deletion cascades to sessions and memberships

**Audit Trail** (Constitution Principle V):
- `created_by`, `created_at`: Event creator and timestamp
- `updated_by`, `updated_at`: Last modifier (auto-updated via trigger)
- Future: `event_audit_log` table for full history

**Transaction Support**:
```typescript
// Atomic multi-table operations
await db.transaction(async (tx) => {
  const [team] = await tx.insert(teams).values({ name: 'New Team' }).returning()
  await tx.insert(teamMembers).values({
    userId: user.id,
    teamId: team.id,
    role: 'owner'
  })
})
```

## Performance Considerations

**Indexes**:
- `events_team_start_idx`: Optimizes team event list queries (most common)
- `team_members_user_idx`: Optimizes middleware team lookup
- Composite indexes for common filter combinations

**Query Optimization**:
- Use prepared statements (Drizzle default)
- Indexes on foreign keys and common WHERE clauses
- Estimated query time: <10ms for team event list (1,000 events per team)

**Scalability**:
- SQLite handles 100,000+ events easily (read-optimized)
- Write throughput: ~1,000 inserts/sec (acceptable for event creation)
- If write contention becomes issue, migrate to PostgreSQL (Drizzle supports both)

## Edge Cases Handled

1. **Concurrent Edits**: `updated_at` timestamp for optimistic locking detection
2. **Timezone Handling**: Store Unix timestamp (UTC), display in user's timezone
3. **Multi-day Events**: `end_date >= start_date` constraint allows same-day or multi-day
4. **Empty Strings**: CHECK constraints prevent whitespace-only titles/locations
5. **Orphaned Events**: CASCADE deletes events when team deleted
6. **Invalid Roles**: CHECK constraint rejects invalid team member roles
7. **Team Access**: Middleware ensures users can only query their teams

## Testing Strategy

### In-Memory Database for Tests

```typescript
// apps/backend/tests/helpers/testDb.ts
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

export function createTestDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite)

  // Run migrations
  migrate(db, { migrationsFolder: './drizzle/migrations' })

  return { db, sqlite }
}

// Usage in tests
describe('Event CRUD', () => {
  let testDb

  beforeEach(() => {
    testDb = createTestDb()
  })

  afterEach(() => {
    testDb.sqlite.close()
  })

  it('enforces team isolation', async () => {
    // Test team filtering logic
  })
})
```

## Next Steps

1. Implement Drizzle schema in `apps/backend/src/db/schema.ts`
2. Create initial migration with `drizzle-kit generate`
3. Implement team context middleware
4. Create event service with team filtering helpers
5. Write integration tests with in-memory SQLite
