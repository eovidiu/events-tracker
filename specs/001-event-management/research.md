# Research: Event Management Technology Stack

**Feature**: 001-event-management
**Date**: 2025-11-18
**Status**: Complete (Revised for SQLite)

## Overview

This document captures research findings and technology decisions for the event management feature implementation using **SQLite + Fastify + React + Adobe React Spectrum**.

## Technology Decisions

### 1. Database: SQLite with Better-SQLite3

**Decision**: Use SQLite as the embedded database with better-sqlite3 driver

**Rationale**:
- **Zero Configuration**: No separate database server to manage, runs in-process
- **ACID Compliance**: Full transactional support, data integrity guarantees
- **Performance**: Extremely fast for read-heavy workloads (event queries)
- **Portability**: Single file database, easy backup/restore, version control friendly
- **Development Experience**: Same database in dev/test/prod, no environment parity issues
- **Row-Level Security Alternative**: Implement via middleware + query builders (Drizzle ORM)
- **Simplicity**: Aligns with constitution's simplicity principle

**Alternatives Considered**:
- **Supabase**: Rejected per user requirement (dislike for Supabase)
- **PostgreSQL**: Rejected due to operational overhead (separate server, connection pooling, deployment complexity)
- **MySQL**: Rejected for same reasons as PostgreSQL
- **In-memory DB**: Rejected due to lack of persistence

**Trade-offs Accepted**:
- No built-in Row-Level Security (implement in application layer with Drizzle ORM)
- Single-writer limitation (acceptable for event management workload, read-heavy)
- No native replication (acceptable for initial scale, can migrate to PostgreSQL later if needed)

**Migration Path**: SQLite schema can be exported to PostgreSQL if scale demands distributed database.

### 2. Backend Framework: Fastify

**Decision**: Fastify 4.x with TypeScript

**Rationale**:
- **Performance**: 2x faster than Express, handles 30,000+ req/sec
- **TypeScript-First**: Built-in TypeScript support, no extra configuration
- **Schema Validation**: JSON Schema validation built-in (perfect for API contracts)
- **Plugin Architecture**: Modular design for auth, CORS, compression, etc.
- **OpenAPI Support**: Fastify-swagger generates OpenAPI 3.0 docs automatically
- **Constitution Compliance**: Satisfies API-First Architecture principle

**Alternatives Considered**:
- **Express**: Rejected due to slower performance, poor TypeScript support
- **NestJS**: Rejected due to complexity overhead (decorators, dependency injection adds learning curve)
- **Hono**: Considered but less mature ecosystem than Fastify

**Integration Pattern**:
```typescript
// Schema-first API design
const eventSchema = {
  type: 'object',
  required: ['team_id', 'title', 'location', 'start_date', 'end_date'],
  properties: {
    team_id: { type: 'string', format: 'uuid' },
    title: { type: 'string', minLength: 1, maxLength: 200 }
  }
}

fastify.post('/api/v1/events', {
  schema: {
    body: eventSchema,
    response: { 201: eventSchema }
  }
}, async (request, reply) => { /* handler */ })
```

### 3. ORM: Drizzle ORM

**Decision**: Drizzle ORM for SQLite with TypeScript

**Rationale**:
- **TypeScript-Native**: Schema defined in TypeScript, full type inference
- **SQL-Like Syntax**: Drizzle query builder feels like SQL, not magic abstraction
- **Lightweight**: ~35KB, minimal runtime overhead
- **SQLite Support**: First-class SQLite support with better-sqlite3
- **Migrations**: Built-in migration system (drizzle-kit)
- **Multi-Tenancy**: Easy to add `WHERE team_id = ?` clauses programmatically

**Alternatives Considered**:
- **Prisma**: Rejected due to bloated size (~50MB), slower query performance, schema in separate DSL
- **TypeORM**: Rejected due to decorator-heavy syntax, poor TypeScript inference
- **Kysely**: Considered but Drizzle has better DX and migrations

**Schema Example**:
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const events = sqliteTable('events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: text('team_id').notNull(),
  title: text('title', { length: 200 }).notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  createdBy: text('created_by').notNull()
})
```

### 4. Authentication: Lucia Auth

**Decision**: Lucia v3 for session-based authentication

**Rationale**:
- **Lightweight**: No external dependencies, works with any database
- **Session-Based**: More suitable for web apps than stateless JWT
- **SQLite Integration**: Native adapter for better-sqlite3
- **Type-Safe**: Full TypeScript support
- **OAuth Support**: Supports OAuth 2.0 providers (Google, GitHub, etc.) for enterprise SSO
- **Constitution Compliance**: OAuth 2.0 / OIDC requirement satisfied

**Alternatives Considered**:
- **Passport.js**: Rejected due to callback hell, poor TypeScript support
- **Auth.js (NextAuth)**: Rejected due to Next.js coupling
- **Custom JWT**: Rejected due to session management complexity, token refresh handling

**Integration**:
```typescript
import { Lucia } from 'lucia'
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite'

const adapter = new BetterSqlite3Adapter(db, {
  user: 'users',
  session: 'sessions'
})

export const lucia = new Lucia(adapter, {
  sessionCookie: { attributes: { secure: process.env.NODE_ENV === 'production' } }
})
```

### 5. Frontend Framework: React 18 + TypeScript

**Decision**: React 18.2+ with TypeScript 5.3+ in strict mode

**Rationale**:
- **Adobe React Spectrum requirement**: User explicitly requested Adobe Spectrum, which is React-based
- **TypeScript**: Type safety for complex event data structures, reduces runtime errors
- **Ecosystem**: Mature testing tools (Vitest, React Testing Library), state management (React Query), form libraries
- **Team Familiarity**: Industry-standard for web applications

**Alternatives Considered**:
- **Vue/Angular**: Rejected due to Adobe Spectrum being React-specific
- **JavaScript**: Rejected due to loss of type safety for complex domain models

### 6. UI Component Library: Adobe React Spectrum

**Decision**: Adobe React Spectrum v3

**Rationale**:
- **User Requirement**: Explicitly specified in feature requirements
- **Accessibility**: WCAG 2.1 AA compliant out-of-box, reducing accessibility implementation overhead
- **Enterprise Design**: Professional, consistent design system aligned with Adobe products
- **Components**: Rich set of form components (date pickers, text fields, validation) needed for event creation

**Alternatives Considered**:
- None - this was a hard requirement

### 7. State Management: React Query + Zustand

**Decision**:
- **Server State**: React Query (TanStack Query) v5
- **Client State**: Zustand v4

**Rationale**:
- **React Query**: Purpose-built for server state (API calls, caching, optimistic updates)
- **Zustand**: Minimal boilerplate for client-only state (current user, UI preferences)
- **Simplicity**: Avoid Redux complexity, aligns with constitution's simplicity principle

**Alternatives Considered**:
- **Redux Toolkit**: Rejected due to boilerplate overhead for simple use cases
- **Context API**: Rejected for server state (no caching, refetching logic)

### 8. Form Management: React Hook Form + Zod

**Decision**: React Hook Form v7 with Zod v3 for validation schemas

**Rationale**:
- **Performance**: Uncontrolled components reduce re-renders compared to Formik
- **Validation**: Zod provides runtime validation + TypeScript type inference
- **Schema Sharing**: Same Zod schemas validate on client and server (Fastify)
- **Real-time Validation**: Supports FR-007 (real-time validation feedback)

**Validation Strategy**:
```typescript
// Shared schema (shared/schemas/event.schema.ts)
export const eventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000),
  start_date: z.date(),
  end_date: z.date(),
  location: z.string().min(1),
  team_id: z.string().uuid()
})

// React Hook Form integration
const form = useForm({
  resolver: zodResolver(eventSchema)
})

// Fastify integration
fastify.post('/api/v1/events', {
  schema: { body: zodToJsonSchema(eventSchema) }
})
```

### 9. Testing Strategy: Vitest + React Testing Library

**Decision**:
- **Unit/Component**: Vitest + React Testing Library
- **Integration**: Vitest with SQLite in-memory database
- **E2E** (future): Playwright

**Rationale**:
- **Vitest**: Fast, Vite-native, compatible with Jest API, better ES modules support
- **React Testing Library**: User-centric testing (query by role, not implementation details), aligns with User-Centric Design principle
- **SQLite In-Memory**: Perfect for testing, no cleanup needed, fast
- **TDD-friendly**: Can write tests before implementation per constitution Principle IV

**Test Structure**:
```typescript
// Backend integration test
describe('Event CRUD', () => {
  let testDb: Database

  beforeEach(() => {
    testDb = new Database(':memory:')
    runMigrations(testDb)
  })

  it('creates event with team isolation', async () => {
    const event = await createEvent(testDb, { teamId: 'team-1', ... })
    expect(event).toBeDefined()

    // User from different team cannot access
    const result = await getEventsByTeam(testDb, 'team-2')
    expect(result).not.toContainEqual(expect.objectContaining({ id: event.id }))
  })
})

// Component test
describe('EventForm', () => {
  it('validates required fields on submit', async () => {
    render(<EventForm />)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
  })
})
```

### 10. Multi-Tenancy Pattern: Middleware-Based Filtering

**Decision**: Implement team isolation via Fastify middleware + Drizzle query filters

**Rationale**:
- **No Built-in RLS**: SQLite doesn't have PostgreSQL's Row-Level Security
- **Middleware Pattern**: Extract team_id from user session, inject into all queries
- **Type-Safe**: Drizzle ORM ensures WHERE clauses are always added
- **Auditable**: Middleware logic is testable, visible in codebase

**Implementation Pattern**:
```typescript
// Middleware to extract team context
fastify.decorateRequest('teamId', null)

fastify.addHook('preHandler', async (request) => {
  const session = await validateSession(request)
  // Get user's teams from team_members table
  const teams = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, session.userId))

  request.teamIds = teams.map(t => t.teamId)
})

// Query with automatic filtering
fastify.get('/api/v1/events', async (request) => {
  const events = await db
    .select()
    .from(events)
    .where(inArray(events.teamId, request.teamIds)) // Team isolation
    .orderBy(desc(events.startDate))

  return events
})
```

### 11. Date/Time Handling: date-fns

**Decision**: Use date-fns for date manipulation

**Rationale**:
- **Lightweight**: Tree-shakeable, functional, ~15KB per function
- **SQLite Compatibility**: Store as Unix timestamp (integer) or ISO string
- **Timezone**: Use `date-fns-tz` for timezone conversions
- **Immutable**: All functions return new dates, no mutations

**Alternatives Considered**:
- **Moment.js**: Rejected due to size (200KB+), mutable API, deprecated
- **Day.js**: Considered, but date-fns has better TypeScript support
- **Temporal API**: Not stable yet (Stage 3), will migrate when available

**Storage Strategy**:
```sql
-- Store as Unix timestamp (milliseconds since epoch)
CREATE TABLE events (
  start_date INTEGER NOT NULL,  -- Unix timestamp
  end_date INTEGER NOT NULL,
  timezone TEXT DEFAULT 'UTC'
);

-- Or ISO 8601 string
CREATE TABLE events (
  start_date TEXT NOT NULL,  -- ISO 8601: '2025-01-15T09:00:00Z'
  end_date TEXT NOT NULL
);
```

Recommendation: Unix timestamp for performance, ISO string for readability.

### 12. Build Tool: Vite

**Decision**: Vite 5+ for development and build

**Rationale**:
- **Performance**: Instant HMR, fast cold starts, optimized production builds
- **Native ESM**: Better tree-shaking, smaller bundles
- **TypeScript**: First-class TypeScript support without extra config
- **Ecosystem**: Official React plugin, Vitest integration

**Alternatives Considered**:
- **Create React App**: Rejected due to slow dev server, webpack overhead, deprecated
- **Next.js**: Rejected due to unnecessary SSR complexity for SPA use case

### 13. Monorepo Structure: pnpm Workspaces

**Decision**: pnpm workspaces for frontend + backend monorepo

**Rationale**:
- **Shared Code**: Validation schemas (Zod), TypeScript types shared between frontend/backend
- **Atomic Deployments**: Version frontend + backend together
- **DX**: Single `pnpm install`, run frontend + backend concurrently
- **Performance**: pnpm faster than npm/yarn, efficient disk usage

**Structure**:
```
event-hub/
├── package.json              # Root workspace
├── pnpm-workspace.yaml
├── packages/
│   └── shared/               # Shared Zod schemas, types
│       ├── src/
│       │   └── schemas/
│       └── package.json
├── apps/
│   ├── frontend/             # React + Spectrum
│   │   ├── src/
│   │   └── package.json
│   └── backend/              # Fastify + SQLite
│       ├── src/
│       ├── database.sqlite   # Dev database
│       └── package.json
└── drizzle/
    └── migrations/           # Database migrations
```

### 14. Deployment Strategy

**Decision**:
- **Frontend**: Vercel or Netlify (static SPA)
- **Backend**: Railway, Render, or Fly.io (Node.js + SQLite)
- **Database**: SQLite file stored on persistent volume

**Rationale**:
- **Simplicity**: Single SQLite file, no separate database service
- **Cost**: Railway/Render free tiers support SQLite
- **Backup**: Copy SQLite file, commit to git (small databases), or use Litestream for streaming backups

**Backup Strategy** (Litestream):
```bash
# Stream SQLite changes to S3
litestream replicate database.sqlite s3://my-bucket/db
```

**Scalability Plan**:
- Initial: Single SQLite file handles 10k-100k events easily
- Growth: Add read replicas via Litestream
- Scale-out: Migrate to PostgreSQL if needed (Drizzle supports both)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React 18 + TypeScript + Adobe Spectrum + React Query       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ EventForm    │  │ EventList    │  │ EventDetail  │     │
│  │ (Spectrum)   │  │ (Spectrum)   │  │ (Spectrum)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                         │                                    │
│                    React Query                               │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP (fetch)
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                      Backend API                             │
│              Fastify + TypeScript + Lucia Auth               │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Auth Middleware│  │ Team Middleware│  │ Event Routes │  │
│  │ (Lucia)        │  │ (Team Filter)  │  │ (CRUD)       │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│                         │                                    │
│                    Drizzle ORM                               │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────┐            │
│  │          SQLite Database                    │            │
│  │  ┌────────┐  ┌────────┐  ┌────────┐        │            │
│  │  │ users  │  │ teams  │  │ events │        │            │
│  │  └────────┘  └────────┘  └────────┘        │            │
│  │         database.sqlite (single file)       │            │
│  └─────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────┘

           Shared: Zod schemas, TypeScript types
```

## Summary of Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Database | SQLite | 3.x | Data storage, ACID transactions |
| DB Driver | better-sqlite3 | 9.x | Synchronous SQLite driver |
| ORM | Drizzle ORM | 0.29+ | Type-safe queries, migrations |
| Backend Framework | Fastify | 4.x | REST API, schema validation |
| Authentication | Lucia | 3.x | Session-based auth, OAuth 2.0 |
| Frontend Framework | React | 18.2+ | UI rendering, component model |
| Language | TypeScript | 5.3+ | Type safety, better DX |
| UI Components | Adobe React Spectrum | 3.x | Design system, accessibility |
| State (Server) | React Query | 5.x | API state, caching, optimistic updates |
| State (Client) | Zustand | 4.x | UI state, user preferences |
| Forms | React Hook Form | 7.x | Form state, validation |
| Validation | Zod | 3.x | Runtime validation, type inference |
| Testing (Unit) | Vitest | 1.x | Fast test runner |
| Testing (Component) | React Testing Library | 14.x | User-centric component tests |
| Testing (E2E) | Playwright | 1.x | End-to-end flows (future) |
| Date/Time | date-fns | 3.x | Date manipulation, formatting |
| Build Tool | Vite | 5.x | Dev server, production builds |
| Monorepo | pnpm workspaces | 8+ | Shared code, monorepo management |
| Deployment (FE) | Vercel/Netlify | - | Static hosting, CDN, previews |
| Deployment (BE) | Railway/Render/Fly | - | Node.js + SQLite hosting |

## Constitution Compliance

| Principle | Status | Implementation |
|-----------|--------|----------------|
| **I. User-Centric Design** | ✅ PASS | Adobe React Spectrum + real-time validation |
| **II. Multi-Tenancy & Data Isolation** | ✅ PASS | Middleware + Drizzle ORM team filtering |
| **III. API-First Architecture** | ✅ PASS | Fastify schema-first + OpenAPI generation |
| **IV. Test-Driven Development** | ✅ PASS | Vitest + SQLite in-memory for tests |
| **V. Observability & Audit Trails** | ✅ PASS | Audit fields + structured logging |

**Security & Compliance**:
- **Authentication**: Lucia supports OAuth 2.0 / OIDC ✅
- **Authorization**: Team membership enforced via middleware ✅
- **Data Protection**: SQLite encryption via SQLCipher (if needed) ✅
- **Input Validation**: Zod on client + Fastify schema validation ✅

## Next Steps

Proceed to Phase 1:
1. Update `plan.md` with SQLite architecture details
2. Update `data-model.md` with SQLite schema (no RLS, middleware-based isolation)
3. Update API contracts for Fastify endpoints
4. Update `quickstart.md` with SQLite + Fastify setup
5. Update agent context file with new stack
