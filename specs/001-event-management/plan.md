# Implementation Plan: Event Management

**Branch**: `001-event-management` | **Date**: 2025-11-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-event-management/spec.md`

## Summary

Implement event CRUD operations (create, read, update) for team-based event management. Users can create events with title, date/time, location, and description, edit existing events, and view comprehensive event details. The system enforces team-level data isolation via middleware. Built with SQLite + Drizzle ORM + Fastify (backend) and React + Adobe Spectrum (frontend).

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18.2+, Node.js 20 LTS
**Primary Dependencies**:
- **Backend**: Fastify 4.x, Drizzle ORM 0.29+, better-sqlite3 9.x, Lucia Auth 3.x
- **Frontend**: React 18, Adobe React Spectrum, React Query 5.x, React Hook Form 7.x, Zod 3.x
- **Shared**: Zod schemas (validation), TypeScript types

**Storage**: SQLite 3.x (single-file database, ACID compliant)
**Testing**: Vitest (unit/integration), React Testing Library, SQLite in-memory for backend tests
**Target Platform**: Web browsers (desktop + mobile responsive)
**Project Type**: Monorepo - Frontend SPA + Backend API (pnpm workspaces)
**Performance Goals**:
- Event creation < 90 seconds total (FR from spec)
- API response time < 100ms (p95)
- UI interactions < 200ms response time
- Real-time validation feedback
- Initial page load < 2 seconds

**Constraints**:
- Adobe React Spectrum design system (user requirement)
- Team-level data isolation enforced via middleware + Drizzle ORM
- Real-time form validation required
- Character limits: title 200 chars, description 10,000 chars
- Single SQLite file (read-optimized, acceptable for event management workload)

**Scale/Scope**:
- Initial: 10-100 teams, 1,000-10,000 events total
- Target: Support up to 1,000 teams, 100,000+ events
- Concurrent users: 100-500 initially
- SQLite performs excellently for this scale (single-writer acceptable for event creation rate)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. User-Centric Design
**Status**: ✅ PASS

- Adobe React Spectrum provides accessible, consistent UI components
- React Hook Form + real-time validation ensures immediate feedback
- Progressive disclosure: event list → detail view → edit form
- Success criterion SC-003: 95% first-time success rate targets ease of use

### II. Multi-Tenancy & Data Isolation
**Status**: ✅ PASS

- Middleware extracts user's team memberships from session
- Drizzle ORM enforces `WHERE team_id IN (...)` on every query
- Type-safe query builder prevents forgotten WHERE clauses
- FR-006 explicitly requires team-level isolation
- Middleware pattern is testable, auditable, visible in codebase

**Implementation**:
```typescript
// Middleware adds team context to request
fastify.addHook('preHandler', async (request) => {
  const session = await validateSession(request)
  request.teamIds = await getUserTeams(db, session.userId)
})

// All queries automatically filtered
const events = await db
  .select()
  .from(events)
  .where(inArray(events.teamId, request.teamIds))
```

### III. API-First Architecture
**Status**: ✅ PASS

- Fastify schema-first design with JSON Schema validation
- OpenAPI 3.0 spec auto-generated via @fastify/swagger
- API versioning via URL (/api/v1/events)
- RFC 7807 Problem Details for errors
- APIs implemented before UI per TDD workflow

### IV. Test-Driven Development
**Status**: ✅ PASS

- Vitest for backend unit/integration tests
- React Testing Library for component tests
- SQLite :memory: database for fast, isolated backend tests
- Tests written before implementation (red-green-refactor)
- FR-007 (real-time validation) is highly testable

### V. Observability & Audit Trails
**Status**: ✅ PASS

- `created_by`, `created_at`, `updated_by`, `updated_at` on events table
- Fastify logging via pino (structured JSON logs)
- Request ID tracking for distributed tracing
- Future: Application-level audit_log table for full event history

### Security & Compliance

**Authentication & Authorization**: ✅ PASS
- Lucia Auth supports OAuth 2.0 / OIDC providers (Google, GitHub)
- Session-based auth with httpOnly cookies
- Team membership validation via middleware
- RBAC: owner, admin, member, viewer roles

**Data Protection**: ✅ PASS
- HTTPS in production (enforced via Fastify)
- SQLite encryption available via SQLCipher if needed
- GDPR: Data export via API endpoint, deletion via CASCADE constraints
- Password hashing via Argon2 (Lucia default)

**Input Validation**: ✅ PASS
- Zod schemas validate on client (React Hook Form)
- Fastify JSON Schema validates on server (defense-in-depth)
- SQLite CHECK constraints as final layer
- XSS protection via React automatic escaping + DOMPurify

### Development Workflow

**Code Review**: ✅ PASS
- GitHub PRs with test requirements
- Vitest coverage reports
- ESLint + TypeScript strict mode
- Dependabot for dependency scanning

**Deployment**: ✅ PASS
- Frontend: Vercel/Netlify (static build)
- Backend: Railway/Render/Fly.io (Node.js + persistent SQLite volume)
- Staging environment with separate SQLite file
- Database migrations via Drizzle Kit
- Zero-downtime: Frontend deploys independently, backend with health checks

**Documentation**: ✅ PASS
- OpenAPI 3.0 spec auto-generated from Fastify schemas
- Quickstart.md for developers (this plan generates it)
- ADR for SQLite vs PostgreSQL/Supabase decision
- Code comments for complex business logic

## Project Structure

### Documentation (this feature)

```text
specs/001-event-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (SQLite stack decisions)
├── data-model.md        # Phase 1 output (SQLite schema + middleware)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output
│   ├── rest-api.yaml    # Fastify REST API spec
│   └── types.ts         # Shared TypeScript types
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
event-hub/                        # Monorepo root
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml           # pnpm workspaces
├── .gitignore
├── tsconfig.json                 # Shared TypeScript config
│
├── apps/
│   ├── frontend/                 # React SPA
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── events/
│   │   │   │   │   ├── EventForm.tsx         # Create/Edit form (Spectrum)
│   │   │   │   │   ├── EventList.tsx         # Events table/grid
│   │   │   │   │   ├── EventDetail.tsx       # Detail view
│   │   │   │   │   └── EventForm.test.tsx    # Component tests
│   │   │   │   └── shared/
│   │   │   │       └── FormField.tsx         # Reusable form components
│   │   │   ├── pages/
│   │   │   │   ├── EventsPage.tsx            # Main events page
│   │   │   │   ├── EventDetailPage.tsx       # Detail page
│   │   │   │   └── CreateEventPage.tsx       # Create page
│   │   │   ├── hooks/
│   │   │   │   ├── useEvents.ts              # React Query hooks
│   │   │   │   ├── useAuth.ts                # Auth state hook
│   │   │   │   └── useFormValidation.ts      # Form validation
│   │   │   ├── services/
│   │   │   │   ├── api.ts                    # API client (fetch wrapper)
│   │   │   │   └── auth.ts                   # Auth helpers
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── tests/
│   │   │   ├── integration/
│   │   │   │   └── event-flow.test.ts        # E2E user flows
│   │   │   └── setup.ts                       # Test configuration
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── backend/                  # Fastify API
│       ├── src/
│       │   ├── routes/
│       │   │   ├── events.ts                 # Event CRUD endpoints
│       │   │   ├── auth.ts                   # Auth endpoints (login, logout)
│       │   │   └── teams.ts                  # Team management
│       │   ├── middleware/
│       │   │   ├── auth.ts                   # Session validation
│       │   │   └── teamContext.ts            # Team membership filter
│       │   ├── services/
│       │   │   ├── eventService.ts           # Event business logic
│       │   │   └── authService.ts            # Auth logic (Lucia)
│       │   ├── db/
│       │   │   ├── schema.ts                 # Drizzle schema definition
│       │   │   ├── client.ts                 # Database connection
│       │   │   └── seed.ts                   # Seed data for dev/test
│       │   ├── plugins/
│       │   │   ├── swagger.ts                # OpenAPI generation
│       │   │   └── cors.ts                   # CORS configuration
│       │   ├── app.ts                        # Fastify app setup
│       │   └── server.ts                     # Entry point
│       ├── tests/
│       │   ├── routes/
│       │   │   └── events.test.ts            # API integration tests
│       │   └── helpers/
│       │       └── testDb.ts                 # In-memory SQLite for tests
│       ├── database.sqlite                   # Development database
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                   # Shared code between frontend/backend
│       ├── src/
│       │   ├── schemas/
│       │   │   └── event.schema.ts           # Zod validation schemas
│       │   └── types/
│       │       └── index.ts                  # Shared TypeScript types
│       ├── package.json
│       └── tsconfig.json
│
└── drizzle/                      # Database migrations
    ├── migrations/
    │   └── 0000_initial_schema.sql           # Initial tables + indexes
    └── drizzle.config.ts                     # Drizzle Kit configuration
```

**Structure Decision**: Monorepo with pnpm workspaces. Frontend and backend are separate apps, with shared validation schemas and types in `packages/shared`. This allows atomic versioning, code sharing, and independent deployment while maintaining type safety across the stack.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | All principles satisfied | SQLite + middleware pattern provides simplicity while meeting all constitutional requirements. No violations to justify. |

**Note**: The shift from Supabase to SQLite + Fastify **reduces** complexity by:
- Eliminating vendor lock-in
- Using standard Node.js ecosystem tools (Fastify, Drizzle)
- Single-file database (no separate server)
- Full control over API layer and middleware
- Better testability (SQLite in-memory for tests)
