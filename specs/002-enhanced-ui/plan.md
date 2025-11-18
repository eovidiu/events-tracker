# Implementation Plan: Enhanced UI with Modern Dashboard

**Branch**: `002-enhanced-ui` | **Date**: 2025-11-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-enhanced-ui/spec.md`

## Summary

Enhance the existing Events Tracker application with a modern, professional UI featuring a dashboard landing page, card-based event listings, modal forms, and improved navigation. This is primarily a frontend refactor that improves user experience while maintaining existing backend functionality and API contracts.

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18.2+
**Primary Dependencies**: Adobe React Spectrum 3.34+, React Query 5.x, Zustand 4.x, React Hook Form 7.x
**Storage**: N/A (uses existing SQLite backend via REST API)
**Testing**: Vitest (component tests), Playwright (E2E tests)
**Target Platform**: Web (browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web application (existing monorepo with apps/frontend)
**Performance Goals**:
  - Dashboard render: <3s with 1000 events
  - Modal open/close: <300ms
  - Form validation feedback: <200ms
  - Navigation transitions: <1s
**Constraints**:
  - Responsive design: 320px - 2560px width
  - Accessible (WCAG 2.1 Level AA compliance via Spectrum)
  - No breaking changes to existing API contracts
  - Backward compatible with existing event data
**Scale/Scope**:
  - 4 new/modified pages (Dashboard, Events List, Create/Edit Modals, Navigation Shell)
  - ~15-20 new/refactored components
  - Existing features remain functional during rollout

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: User-Centric Design ✅ PASS

**Assessment**: This feature directly embodies the User-Centric Design principle by enhancing UI/UX through:
- Dashboard with at-a-glance metrics (reduces cognitive load)
- Card-based event listings (improves scanability)
- Modal forms with organized sections (progressive disclosure)
- Real-time validation feedback (clear, actionable error messages)
- Color-coded status badges (visual hierarchy for quick comprehension)

**Alignment**: Strong alignment. The entire feature is focused on reducing friction in event management workflows and improving task efficiency through better visual design and interaction patterns.

### Principle II: Multi-Tenancy & Data Isolation ✅ PASS

**Assessment**: No changes to data isolation or tenant boundaries. This is a frontend-only refactor that:
- Uses existing authentication and team context
- Maintains current API contracts with tenant scoping
- Does not introduce new data access patterns
- Preserves existing Row-Level Security (RLS) enforcement

**Alignment**: Neutral impact. No constitutional compliance risks.

### Principle III: API-First Architecture ✅ PASS

**Assessment**: No new backend features requiring API changes. This feature:
- Consumes existing REST APIs for events, teams, and authentication
- Does not require new endpoints or API versions
- Maintains backward compatibility with existing API contracts
- Focuses exclusively on presentation layer improvements

**Alignment**: Neutral impact. API-first principle already satisfied by existing implementation.

### Principle IV: Test-Driven Development (NON-NEGOTIABLE) ✅ PASS WITH REQUIREMENTS

**Assessment**: This feature MUST follow TDD for all new/refactored components:
- Dashboard components (metrics cards, activity feed)
- Event card components (with status badges, hover states)
- Modal form components (with validation and error handling)
- Navigation components (sidebar with active states)
- Responsive layout behavior (320px - 2560px width)

**Requirements**:
1. Write component tests BEFORE implementing each component
2. Write integration tests for form submission and validation flows
3. Write E2E tests for critical user journeys (create event via modal, navigate dashboard)
4. Maintain minimum 80% code coverage for new frontend code
5. User MUST approve test specifications before implementation begins

**Alignment**: Conditional pass. TDD workflow MUST be strictly enforced during implementation phase.

### Principle V: Observability & Audit Trails ✅ PASS

**Assessment**: No changes to audit logging or observability infrastructure. This feature:
- Does not modify state-changing operations (uses existing create/update/delete APIs)
- Does not alter audit log generation (backend responsibility)
- May add client-side performance instrumentation (dashboard load time, modal open time)
- Could benefit from user interaction analytics (optional, non-constitutional)

**Alignment**: Neutral impact. Existing observability standards remain in effect.

### Security & Compliance ✅ PASS

**Assessment**: No security concerns introduced:
- Uses existing OAuth/OIDC authentication (no auth changes)
- Maintains existing session management (no token handling changes)
- Input validation performed by existing backend APIs
- No new file uploads or PII handling
- XSS protection via React's default escaping + Adobe Spectrum components

**Alignment**: Neutral impact. Inherits existing security posture.

### Development Workflow ✅ PASS

**Assessment**: Standard workflow applies:
- Code review required before merge
- Tests must pass (see TDD requirements above)
- Documentation updates required (user-facing UI changes)
- No breaking changes (backward compatible with existing features)

**Alignment**: Standard compliance. No special workflow deviations.

### Summary: ALL GATES PASSED ✅

This feature poses no constitutional compliance risks. Primary requirement is strict TDD adherence for all new/refactored components. Proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
├── backend/                    # Fastify + SQLite API (NO CHANGES FOR THIS FEATURE)
│   ├── src/
│   │   ├── db/                # Database schema and migrations
│   │   ├── middleware/        # Auth, CORS, error handling
│   │   ├── plugins/           # Fastify plugins (JWT, SQLite)
│   │   ├── routes/            # REST API endpoints (v1/events, v1/auth, v1/teams)
│   │   ├── services/          # Business logic (events, auth, teams)
│   │   ├── types/             # TypeScript type definitions
│   │   └── server.ts          # Server entry point
│   └── tests/
│       ├── integration/       # API integration tests
│       └── unit/              # Service unit tests
│
└── frontend/                  # React + Adobe Spectrum UI (PRIMARY WORK AREA)
    ├── src/
    │   ├── components/        # Reusable UI components
    │   │   ├── EventForm.tsx  # REFACTOR → Modal-based form
    │   │   ├── EventList.tsx  # REFACTOR → Card-based grid
    │   │   └── [NEW]
    │   │       ├── Dashboard/
    │   │       │   ├── MetricsCard.tsx
    │   │       │   ├── ActivityFeed.tsx
    │   │       │   └── StatsOverview.tsx
    │   │       ├── Events/
    │   │       │   ├── EventCard.tsx
    │   │       │   ├── StatusBadge.tsx
    │   │       │   └── EventGrid.tsx
    │   │       ├── Modals/
    │   │       │   ├── CreateEventModal.tsx
    │   │       │   └── EditEventModal.tsx
    │   │       └── Navigation/
    │   │           ├── Sidebar.tsx
    │   │           └── AppShell.tsx
    │   │
    │   ├── pages/             # Route-level page components
    │   │   ├── LoginPage.tsx  # NO CHANGES (existing auth flow)
    │   │   ├── EventsPage.tsx # REFACTOR → Card grid + modals
    │   │   ├── CreateEventPage.tsx  # REMOVE → Replaced by modal
    │   │   ├── EditEventPage.tsx    # REMOVE → Replaced by modal
    │   │   ├── EventDetailsPage.tsx # MINOR UPDATE → Navigation consistency
    │   │   └── [NEW]
    │   │       └── DashboardPage.tsx
    │   │
    │   ├── hooks/             # Custom React hooks
    │   │   ├── useEvents.ts   # NO CHANGES (existing data fetching)
    │   │   ├── useAuth.ts     # NO CHANGES (existing auth)
    │   │   └── [NEW]
    │   │       ├── useDashboardMetrics.ts
    │   │       └── useModalState.ts
    │   │
    │   ├── services/          # API client services
    │   │   ├── api.ts         # NO CHANGES (existing REST client)
    │   │   └── auth.ts        # NO CHANGES (existing auth service)
    │   │
    │   └── App.tsx            # REFACTOR → Add dashboard route, remove create/edit routes
    │
    └── tests/
        ├── components/        # Component unit tests (Vitest + RTL)
        │   └── [NEW] Dashboard/, Events/, Modals/, Navigation/
        └── integration/       # Integration tests for form flows

e2e/                           # End-to-end tests (Playwright)
├── tests/
│   └── [NEW]
│       ├── dashboard.spec.ts
│       ├── event-modal-crud.spec.ts
│       └── navigation.spec.ts
└── fixtures/                  # E2E test fixtures (NO CHANGES)

specs/                         # Feature specifications
└── 002-enhanced-ui/           # This feature
    ├── spec.md
    ├── plan.md               # This file
    ├── checklists/
    └── [Phase 1 artifacts will go here]
```

**Structure Decision**: Monorepo with pnpm workspaces. Frontend work isolated to `apps/frontend/src/`. Backend remains unchanged. E2E tests added to root-level `e2e/` directory. This is a frontend refactor with no new API endpoints or backend changes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: N/A - No constitutional violations identified. All gates passed with standard compliance.
