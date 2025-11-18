# Tasks: Event Management

**Input**: Design documents from `/specs/001-event-management/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md

**Tests**: Following TDD principle (Constitution Principle IV), tests are included before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `apps/frontend/`, `apps/backend/`, `packages/shared/`
- **Database migrations**: `drizzle/migrations/`
- Root workspace: Repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [ ] T001 Initialize pnpm workspace at repository root with pnpm-workspace.yaml
- [ ] T002 Create root package.json with workspace configuration and shared dev dependencies
- [ ] T003 [P] Create shared TypeScript config at tsconfig.json
- [ ] T004 [P] Create .gitignore with node_modules, dist, .env*, database.sqlite
- [ ] T005 [P] Create .eslintrc.json with TypeScript and React rules
- [ ] T006 [P] Create .prettierrc with formatting rules
- [ ] T007 Create apps/frontend directory structure per plan.md
- [ ] T008 Create apps/backend directory structure per plan.md
- [ ] T009 Create packages/shared directory for Zod schemas and types
- [ ] T010 Install frontend dependencies in apps/frontend/package.json (React, Spectrum, React Query, React Hook Form, Zod, Vitest)
- [ ] T011 Install backend dependencies in apps/backend/package.json (Fastify, Drizzle ORM, better-sqlite3, Lucia, Vitest)
- [ ] T012 Install shared package dependencies in packages/shared/package.json (Zod only)
- [ ] T013 Configure Vite for frontend in apps/frontend/vite.config.ts
- [ ] T014 [P] Configure Vitest for frontend in apps/frontend/vitest.config.ts
- [ ] T015 [P] Configure Vitest for backend in apps/backend/vitest.config.ts
- [ ] T016 Configure Drizzle Kit in drizzle.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema & Migrations

- [ ] T017 Define Drizzle schema for users table in apps/backend/src/db/schema.ts
- [ ] T018 [P] Define Drizzle schema for sessions table in apps/backend/src/db/schema.ts
- [ ] T019 [P] Define Drizzle schema for teams table in apps/backend/src/db/schema.ts
- [ ] T020 [P] Define Drizzle schema for team_members table in apps/backend/src/db/schema.ts
- [ ] T021 [P] Define Drizzle schema for events table in apps/backend/src/db/schema.ts
- [ ] T022 Define Drizzle relations (teamsRelations, teamMembersRelations, eventsRelations) in apps/backend/src/db/schema.ts
- [ ] T023 Create database client in apps/backend/src/db/client.ts with better-sqlite3
- [ ] T024 Generate initial migration with drizzle-kit generate:sqlite
- [ ] T025 Create seed data script in apps/backend/src/db/seed.ts (test users, teams, team_members)
- [ ] T026 Run migration and seed data to create database.sqlite

### Shared Validation Schemas

- [ ] T027 [P] Create event Zod schema in packages/shared/src/schemas/event.schema.ts (title, description, location, dates, timezone)
- [ ] T028 [P] Create team Zod schema in packages/shared/src/schemas/team.schema.ts
- [ ] T029 [P] Create shared TypeScript types in packages/shared/src/types/index.ts (Event, Team, User interfaces)
- [ ] T030 Export all schemas and types from packages/shared/src/index.ts

### Authentication Foundation

- [ ] T031 Initialize Lucia Auth in apps/backend/src/services/authService.ts with SQLite adapter
- [ ] T032 Create auth middleware in apps/backend/src/middleware/auth.ts for session validation
- [ ] T033 Create auth routes in apps/backend/src/routes/auth.ts (login, logout, register)
- [ ] T034 Add Lucia session types to TypeScript declarations in apps/backend/src/types/lucia.d.ts

### Multi-Tenancy Middleware

- [ ] T035 Create team context middleware in apps/backend/src/middleware/teamContext.ts (extracts user's teamIds from team_members)
- [ ] T036 Add FastifyRequest type extension for teamIds and userId in apps/backend/src/types/fastify.d.ts

### Fastify Application Setup

- [ ] T037 Create Fastify app instance in apps/backend/src/app.ts with CORS, logging (pino), helmet
- [ ] T038 [P] Register Swagger plugin in apps/backend/src/plugins/swagger.ts for OpenAPI generation
- [ ] T039 [P] Register CORS plugin in apps/backend/src/plugins/cors.ts
- [ ] T040 Create server entry point in apps/backend/src/server.ts
- [ ] T041 Add auth and teamContext middleware as global hooks to Fastify app
- [ ] T042 Create test helper for in-memory SQLite in apps/backend/tests/helpers/testDb.ts

### Frontend Foundation

- [ ] T043 Create API client wrapper in apps/frontend/src/services/api.ts (fetch with base URL, error handling)
- [ ] T044 Create auth helpers in apps/frontend/src/services/auth.ts (login, logout, getSession)
- [ ] T045 Create useAuth hook in apps/frontend/src/hooks/useAuth.ts (Zustand store for session state)
- [ ] T046 Setup React Query provider in apps/frontend/src/App.tsx
- [ ] T047 Create main entry point in apps/frontend/src/main.tsx with React Query and Adobe Spectrum Provider
- [ ] T048 Create test setup file in apps/frontend/tests/setup.ts with React Testing Library config

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create New Event (Priority: P1) 🎯 MVP

**Goal**: Allow team coordinators to create events with title, date/time, location, and description

**Independent Test**: Create an event with all required fields, save it, verify it appears in the team's event list

### Backend Tests for US1

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T049 [P] [US1] Contract test for POST /api/v1/events endpoint in apps/backend/tests/routes/events.test.ts (validates schema, team isolation)
- [ ] T050 [P] [US1] Integration test for event creation flow in apps/backend/tests/routes/events.test.ts (full create → query cycle)
- [ ] T051 [P] [US1] Unit test for EventService.createEvent in apps/backend/tests/services/eventService.test.ts (business logic, validation)

### Backend Implementation for US1

- [ ] T052 [P] [US1] Create EventService class in apps/backend/src/services/eventService.ts with createEvent method
- [ ] T053 [US1] Implement POST /api/v1/events route in apps/backend/src/routes/events.ts (calls EventService, enforces team membership)
- [ ] T054 [US1] Implement GET /api/v1/events route in apps/backend/src/routes/events.ts (lists events with team filtering)
- [ ] T055 [US1] Register events routes in apps/backend/src/app.ts
- [ ] T056 [US1] Add Fastify JSON Schema for event creation validation in apps/backend/src/routes/events.ts
- [ ] T057 [US1] Add error handling and RFC 7807 Problem Details responses in apps/backend/src/routes/events.ts

### Frontend Tests for US1

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T058 [P] [US1] Component test for EventForm validation in apps/frontend/src/components/events/EventForm.test.tsx (required fields, date validation)
- [ ] T059 [P] [US1] Component test for EventForm submission in apps/frontend/src/components/events/EventForm.test.tsx (calls API, shows success)
- [ ] T060 [P] [US1] Integration test for create event flow in apps/frontend/tests/integration/event-flow.test.ts (navigate, fill form, submit, verify list)

### Frontend Implementation for US1

- [ ] T061 [P] [US1] Create useEvents React Query hook in apps/frontend/src/hooks/useEvents.ts (useCreateEvent mutation, useEventsQuery)
- [ ] T062 [P] [US1] Create EventForm component in apps/frontend/src/components/events/EventForm.tsx (React Hook Form + Zod, Adobe Spectrum fields)
- [ ] T063 [US1] Implement form fields in EventForm: TextField for title, TextArea for description, DatePicker for start/end dates, TextField for location
- [ ] T064 [US1] Add real-time validation to EventForm using React Hook Form + Zod resolver
- [ ] T065 [US1] Add form submission handler in EventForm that calls useCreateEvent mutation
- [ ] T066 [US1] Create EventList component in apps/frontend/src/components/events/EventList.tsx (displays events in TableView from Spectrum)
- [ ] T067 [US1] Create EventsPage in apps/frontend/src/pages/EventsPage.tsx (combines EventList + "Create Event" button)
- [ ] T068 [US1] Create CreateEventPage in apps/frontend/src/pages/CreateEventPage.tsx (renders EventForm)
- [ ] T069 [US1] Add routing for /events and /events/create in apps/frontend/src/App.tsx
- [ ] T070 [US1] Add success toast notification after event creation using Adobe Spectrum Toast
- [ ] T071 [US1] Add error handling and display validation errors in EventForm

**Checkpoint**: User Story 1 complete - users can create and view events independently

---

## Phase 4: User Story 2 - Edit Existing Event (Priority: P2)

**Goal**: Allow coordinators to update event details (title, date, location, description) with audit trail

**Independent Test**: Create an event (US1), modify its details, verify changes are saved and reflected in event list

### Backend Tests for US2

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T072 [P] [US2] Contract test for PATCH /api/v1/events/:id endpoint in apps/backend/tests/routes/events.test.ts (validates partial update, team isolation)
- [ ] T073 [P] [US2] Integration test for event update flow in apps/backend/tests/routes/events.test.ts (create → update → query)
- [ ] T074 [P] [US2] Unit test for EventService.updateEvent in apps/backend/tests/services/eventService.test.ts (audit trail, optimistic locking)

### Backend Implementation for US2

- [ ] T075 [P] [US2] Add updateEvent method to EventService in apps/backend/src/services/eventService.ts (updates updated_by, updated_at)
- [ ] T076 [P] [US2] Add getEventById method to EventService in apps/backend/src/services/eventService.ts (team filtering)
- [ ] T077 [US2] Implement GET /api/v1/events/:id route in apps/backend/src/routes/events.ts (single event with team check)
- [ ] T078 [US2] Implement PATCH /api/v1/events/:id route in apps/backend/src/routes/events.ts (partial update, calls EventService)
- [ ] T079 [US2] Add Fastify JSON Schema for event update validation in apps/backend/src/routes/events.ts
- [ ] T080 [US2] Add optimistic locking check using updated_at timestamp in EventService.updateEvent

### Frontend Tests for US2

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T081 [P] [US2] Component test for EventForm in edit mode in apps/frontend/src/components/events/EventForm.test.tsx (pre-populates fields)
- [ ] T082 [P] [US2] Component test for unsaved changes warning in apps/frontend/src/components/events/EventForm.test.tsx (beforeunload event)
- [ ] T083 [P] [US2] Integration test for edit event flow in apps/frontend/tests/integration/event-flow.test.ts (create, navigate to edit, modify, save)

### Frontend Implementation for US2

- [ ] T084 [P] [US2] Add useUpdateEvent mutation to useEvents hook in apps/frontend/src/hooks/useEvents.ts
- [ ] T085 [P] [US2] Add useEvent query (single event) to useEvents hook in apps/frontend/src/hooks/useEvents.ts
- [ ] T086 [US2] Update EventForm component to support edit mode in apps/frontend/src/components/events/EventForm.tsx (accepts eventId prop, pre-populates)
- [ ] T087 [US2] Add form dirty state tracking in EventForm using React Hook Form's formState.isDirty
- [ ] T088 [US2] Implement unsaved changes warning in EventForm using beforeunload event listener (FR-010)
- [ ] T089 [US2] Create EditEventPage in apps/frontend/src/pages/EditEventPage.tsx (loads event, renders EventForm in edit mode)
- [ ] T090 [US2] Add routing for /events/:id/edit in apps/frontend/src/App.tsx
- [ ] T091 [US2] Add "Edit" button to EventList rows that navigates to /events/:id/edit
- [ ] T092 [US2] Add optimistic update to useUpdateEvent mutation for instant UI feedback
- [ ] T093 [US2] Handle concurrent edit conflict (show warning if updated_at changed)

**Checkpoint**: User Stories 1 AND 2 complete - create and edit both work independently

---

## Phase 5: User Story 3 - View Event Details (Priority: P3)

**Goal**: Display comprehensive event information with modification history and RSVP status

**Independent Test**: Create an event (US1), access detail view, verify all fields displayed including audit info

### Backend Tests for US3

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T094 [P] [US3] Contract test for GET /api/v1/events/:id with full details in apps/backend/tests/routes/events.test.ts (includes creator, updater info)
- [ ] T095 [P] [US3] Integration test for event detail query in apps/backend/tests/routes/events.test.ts (joins with users table for creator/updater)

### Backend Implementation for US3

- [ ] T096 [P] [US3] Enhance getEventById in EventService to include related data (creator, updater, team) using Drizzle relations
- [ ] T097 [US3] Update GET /api/v1/events/:id route to return full event details with creator/updater info

### Frontend Tests for US3

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T098 [P] [US3] Component test for EventDetail component in apps/frontend/src/components/events/EventDetail.test.tsx (displays all fields)
- [ ] T099 [P] [US3] Component test for EventDetail showing modification history in apps/frontend/src/components/events/EventDetail.test.tsx (created_at, updated_at, updated_by)
- [ ] T100 [P] [US3] Integration test for view event flow in apps/frontend/tests/integration/event-flow.test.ts (navigate from list to detail)

### Frontend Implementation for US3

- [ ] T101 [P] [US3] Create EventDetail component in apps/frontend/src/components/events/EventDetail.tsx (displays event fields with Adobe Spectrum)
- [ ] T102 [US3] Add event metadata section to EventDetail (creator, created_at, last updated_by, updated_at)
- [ ] T103 [US3] Add visual indicator for recent updates in EventDetail (highlight changed fields if updated in last 24h)
- [ ] T104 [US3] Add "approaching event" reminder badge to EventDetail if start_date within 24 hours (FR from spec acceptance scenario 4)
- [ ] T105 [US3] Add conditional "Edit" button to EventDetail if user has edit permissions
- [ ] T106 [US3] Create EventDetailPage in apps/frontend/src/pages/EventDetailPage.tsx (loads event via useEvent, renders EventDetail)
- [ ] T107 [US3] Add routing for /events/:id in apps/frontend/src/App.tsx
- [ ] T108 [US3] Make EventList rows clickable to navigate to /events/:id
- [ ] T109 [US3] Format dates in EventDetail using date-fns and user's timezone (Intl.DateTimeFormat)
- [ ] T110 [US3] Add loading state to EventDetailPage while fetching event data

**Checkpoint**: All user stories (US1, US2, US3) complete and independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T111 [P] Add loading skeleton to EventList using Adobe Spectrum ProgressCircle
- [ ] T112 [P] Add empty state to EventList when no events exist
- [ ] T113 [P] Add pagination to EventList if more than 50 events (use React Query pagination)
- [ ] T114 [P] Add search/filter to EventsPage (filter by title, date range)
- [ ] T115 [P] Add sorting to EventList (sort by start_date, title, created_at)
- [ ] T116 [P] Add timezone selector to EventForm (dropdown of common IANA timezones)
- [ ] T117 [P] Add past event warning in EventForm when start_date < now (FR from spec acceptance scenario 3)
- [ ] T118 [P] Add character count indicators to EventForm (show "45/200" for title, "500/10000" for description)
- [ ] T119 [P] Add end date validation (must be >= start date) in event Zod schema and EventForm
- [ ] T120 [P] Implement multi-day event support in EventDetail (display date range if start != end)
- [ ] T121 [P] Add request ID tracking to Fastify for distributed tracing (pino logger)
- [ ] T122 [P] Add structured logging for all event mutations in EventService
- [ ] T123 [P] Add health check endpoint GET /api/v1/health in apps/backend/src/routes/health.ts
- [ ] T124 [P] Create Dockerfile for backend in apps/backend/Dockerfile
- [ ] T125 [P] Create docker-compose.yml for local development (backend + volume for SQLite)
- [ ] T126 [P] Add error boundary to frontend in apps/frontend/src/App.tsx
- [ ] T127 [P] Add 404 page for unknown routes in apps/frontend/src/pages/NotFoundPage.tsx
- [ ] T128 [P] Add accessibility tests using axe-core in apps/frontend/tests/accessibility.test.ts
- [ ] T129 [P] Add E2E tests with Playwright (optional, if time permits)
- [ ] T130 Update README.md with project overview, tech stack, setup instructions
- [ ] T131 Create CONTRIBUTING.md with development workflow, commit conventions
- [ ] T132 Run ESLint and fix all warnings across frontend and backend
- [ ] T133 Run TypeScript type checker and fix all errors
- [ ] T134 Verify all tests pass (frontend + backend)
- [ ] T135 Generate OpenAPI spec using Fastify swagger plugin at /docs
- [ ] T136 Validate quickstart.md instructions work from fresh clone

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational → **MVP READY**
  - User Story 2 (P2): Can start after Foundational (parallel with US1 if staffed)
  - User Story 3 (P3): Can start after Foundational (parallel with US1/US2 if staffed)
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - creates foundation for event CRUD
- **User Story 2 (P2)**: Conceptually depends on US1 (editing requires creation first), but can be developed in parallel
- **User Story 3 (P3)**: Conceptually depends on US1 (viewing requires creation first), but can be developed in parallel

### Within Each User Story

1. Tests MUST be written and approved FIRST (TDD red-green-refactor)
2. Backend tests → Backend implementation (API ready before frontend)
3. Frontend tests → Frontend implementation
4. Verify tests pass before marking story complete

### Parallel Opportunities

**Setup Phase (T001-T016)**:
- T003, T004, T005, T006 can run in parallel (config files)
- T014, T015 can run in parallel (Vitest configs)

**Foundational Phase (T017-T048)**:
- Database schemas (T018-T021) can run in parallel
- Shared schemas (T027-T029) can run in parallel
- Plugins (T038, T039) can run in parallel
- Backend tests (T049-T051) for US1 can run in parallel
- Frontend tests (T058-T060) for US1 can run in parallel

**User Story 1**:
- Backend tests (T049, T050, T051) in parallel
- Backend implementation: T052 parallel with T056
- Frontend tests (T058, T059, T060) in parallel
- Frontend: T061, T062 in parallel

**User Story 2**:
- Backend tests (T072, T073, T074) in parallel
- Backend: T075, T076 in parallel
- Frontend tests (T081, T082, T083) in parallel
- Frontend: T084, T085 in parallel

**User Story 3**:
- Backend tests (T094, T095) in parallel
- Frontend tests (T098, T099, T100) in parallel
- Frontend: T101 parallel with T102-T110

**Polish Phase**: Most tasks (T111-T129) are independent and can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T016)
2. Complete Phase 2: Foundational (T017-T048) - **CRITICAL BLOCKER**
3. Complete Phase 3: User Story 1 (T049-T071)
4. **STOP and VALIDATE**: Test US1 independently
5. Demo/deploy minimal viable product

**MVP Delivery**: Users can create events and view event lists

### Incremental Delivery

1. Setup + Foundational → Foundation ready (no user value yet)
2. Add User Story 1 → Test → **Deploy MVP** (create + list events)
3. Add User Story 2 → Test → Deploy (create + edit + list)
4. Add User Story 3 → Test → Deploy (create + edit + view details + list)
5. Add Polish → Test → Deploy (refined UX)

Each increment adds value without breaking previous features.

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

**Option A - Story Parallelism**:
- Developer A: User Story 1 (T049-T071)
- Developer B: User Story 2 (T072-T093)
- Developer C: User Story 3 (T094-T110)
- Integrate once all complete

**Option B - Layer Parallelism within Story**:
- Developer A: Backend (tests + implementation)
- Developer B: Frontend (tests + implementation)
- Work on same user story, integrate frequently

**Recommendation**: Option A for 3+ developers, Option B for 2 developers

---

## Notes

- All tasks follow strict checkbox format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] tasks can run in parallel (different files, no dependencies)
- [Story] label maps task to specific user story for traceability
- TDD enforced: Tests written before implementation, must fail first
- Each user story is independently completable and testable
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independence
- Total tasks: 136 tasks across 6 phases
- MVP: 68 tasks (Setup + Foundational + US1)
- Full feature: All 136 tasks

**Task Count Summary**:
- Phase 1 (Setup): 16 tasks
- Phase 2 (Foundational): 32 tasks
- Phase 3 (US1 - Create Event): 23 tasks (3 backend tests + 7 backend impl + 3 frontend tests + 10 frontend impl)
- Phase 4 (US2 - Edit Event): 22 tasks (3 backend tests + 6 backend impl + 3 frontend tests + 10 frontend impl)
- Phase 5 (US3 - View Details): 17 tasks (2 backend tests + 2 backend impl + 3 frontend tests + 10 frontend impl)
- Phase 6 (Polish): 26 tasks

**Parallel Opportunities**: ~40 tasks can run in parallel (marked with [P])

**Independent Test Criteria**:
- US1: Create event → appears in list ✅
- US2: Create → Edit → changes saved ✅
- US3: Create → View details → all info displayed ✅
