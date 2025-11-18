# Tasks: Enhanced UI with Modern Dashboard

**Input**: Design documents from `/specs/002-enhanced-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are REQUIRED per constitution (TDD is NON-NEGOTIABLE). All tests must be written and verified to FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app monorepo**: `apps/frontend/src/`, `apps/backend/src/` (no backend changes for this feature)
- **E2E tests**: `e2e/tests/`
- **Component tests**: `apps/frontend/src/components/**/__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and ensuring development environment is ready

- [ ] T001 Verify dependencies installed (pnpm install at root)
- [ ] T002 [P] Verify frontend dev server runs (apps/frontend: pnpm dev)
- [ ] T003 [P] Verify backend dev server runs (apps/backend: pnpm dev)
- [ ] T004 [P] Verify existing tests pass (pnpm test)
- [ ] T005 Create component directory structure in apps/frontend/src/components/Dashboard/
- [ ] T006 [P] Create component directory structure in apps/frontend/src/components/Events/
- [ ] T007 [P] Create component directory structure in apps/frontend/src/components/Modals/
- [ ] T008 [P] Create component directory structure in apps/frontend/src/components/Navigation/
- [ ] T009 [P] Create hooks directory structure in apps/frontend/src/hooks/
- [ ] T010 [P] Create types file in apps/frontend/src/types/dashboard.ts
- [ ] T011 [P] Create types file in apps/frontend/src/types/components.ts
- [ ] T012 [P] Create stores directory in apps/frontend/src/stores/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T013 Create Zustand modal store in apps/frontend/src/stores/modalStore.ts
- [ ] T014 [P] Create Zustand sidebar store in apps/frontend/src/stores/sidebarStore.ts
- [ ] T015 Create TypeScript types for dashboard metrics in apps/frontend/src/types/dashboard.ts
- [ ] T016 [P] Create TypeScript types for component props in apps/frontend/src/types/components.ts
- [ ] T017 Create AppShell layout component scaffold in apps/frontend/src/components/Navigation/AppShell.tsx
- [ ] T018 Update App.tsx routing to include AppShell wrapper

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Events Dashboard (Priority: P1) 🎯 MVP

**Goal**: Dashboard landing page with metrics cards, percentage changes, and recent activity feed

**Independent Test**: Log in, navigate to /dashboard, verify metrics display correctly (total events, upcoming, completed) with trends and recent activity list

### Tests for User Story 1 (TDD Required)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T019 [P] [US1] Component test for MetricsCard in apps/frontend/src/components/Dashboard/__tests__/MetricsCard.test.tsx
- [ ] T020 [P] [US1] Component test for StatsOverview in apps/frontend/src/components/Dashboard/__tests__/StatsOverview.test.tsx
- [ ] T021 [P] [US1] Component test for ActivityFeed in apps/frontend/src/components/Dashboard/__tests__/ActivityFeed.test.tsx
- [ ] T022 [P] [US1] Integration test for useDashboardMetrics hook in apps/frontend/src/hooks/__tests__/useDashboardMetrics.test.ts
- [ ] T023 [P] [US1] E2E test for dashboard page in e2e/tests/dashboard.spec.ts
- [ ] T024 [US1] Verify all User Story 1 tests FAIL (run pnpm test)

### Implementation for User Story 1

- [ ] T025 [P] [US1] Create MetricsCard component in apps/frontend/src/components/Dashboard/MetricsCard.tsx
- [ ] T026 [P] [US1] Create ActivityItem component in apps/frontend/src/components/Dashboard/ActivityItem.tsx
- [ ] T027 [US1] Create ActivityFeed component in apps/frontend/src/components/Dashboard/ActivityFeed.tsx (depends on T026)
- [ ] T028 [US1] Create StatsOverview component in apps/frontend/src/components/Dashboard/StatsOverview.tsx (depends on T025)
- [ ] T029 [US1] Create useDashboardMetrics hook in apps/frontend/src/hooks/useDashboardMetrics.ts
- [ ] T030 [US1] Create DashboardPage in apps/frontend/src/pages/DashboardPage.tsx (depends on T028, T027, T029)
- [ ] T031 [US1] Add /dashboard route to App.tsx and set as default landing page
- [ ] T032 [US1] Add dashboard loading skeleton components
- [ ] T033 [US1] Add dashboard empty state (no events)
- [ ] T034 [US1] Verify all User Story 1 tests PASS (run pnpm test)

**Checkpoint**: At this point, User Story 1 should be fully functional - dashboard displays metrics, trends, and activity

---

## Phase 4: User Story 2 - Browse Events with Enhanced Cards (Priority: P2)

**Goal**: Card-based event grid with visual status badges, hover effects, and responsive layout

**Independent Test**: Navigate to /events, verify events display as cards (not table), each card shows title/date/location/status badge, hover effects work

### Tests for User Story 2 (TDD Required)

- [ ] T035 [P] [US2] Component test for StatusBadge in apps/frontend/src/components/Events/__tests__/StatusBadge.test.tsx
- [ ] T036 [P] [US2] Component test for EventCard in apps/frontend/src/components/Events/__tests__/EventCard.test.tsx
- [ ] T037 [P] [US2] Component test for EventGrid in apps/frontend/src/components/Events/__tests__/EventGrid.test.tsx
- [ ] T038 [P] [US2] E2E test for event card interactions in e2e/tests/event-cards.spec.ts
- [ ] T039 [US2] Verify all User Story 2 tests FAIL (run pnpm test)

### Implementation for User Story 2

- [ ] T040 [P] [US2] Create StatusBadge component in apps/frontend/src/components/Events/StatusBadge.tsx
- [ ] T041 [US2] Create EventCard component in apps/frontend/src/components/Events/EventCard.tsx (depends on T040)
- [ ] T042 [US2] Create EventGrid component in apps/frontend/src/components/Events/EventGrid.tsx (depends on T041)
- [ ] T043 [US2] Refactor EventsPage to use EventGrid in apps/frontend/src/pages/EventsPage.tsx (replace table with grid)
- [ ] T044 [US2] Add hover effects and transitions to EventCard
- [ ] T045 [US2] Add responsive grid layout (1 col mobile, 2 col tablet, 3-4 col desktop)
- [ ] T046 [US2] Add event card loading skeletons
- [ ] T047 [US2] Add event grid empty state (no events)
- [ ] T048 [US2] Verify all User Story 2 tests PASS (run pnpm test)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - dashboard works, events show as cards

---

## Phase 5: User Story 3 - Create/Edit Events with Modal Forms (Priority: P3)

**Goal**: Modal dialogs for create/edit events, replacing full-page forms

**Independent Test**: Click "Create Event" button, modal opens, fill form, submit, modal closes and event appears in list without page navigation

### Tests for User Story 3 (TDD Required)

- [ ] T049 [P] [US3] Component test for EventForm in modal context in apps/frontend/src/components/__tests__/EventForm.test.tsx
- [ ] T050 [P] [US3] Component test for CreateEventModal in apps/frontend/src/components/Modals/__tests__/CreateEventModal.test.tsx
- [ ] T051 [P] [US3] Component test for EditEventModal in apps/frontend/src/components/Modals/__tests__/EditEventModal.test.tsx
- [ ] T052 [P] [US3] Integration test for modal state management in apps/frontend/src/stores/__tests__/modalStore.test.ts
- [ ] T053 [P] [US3] E2E test for create/edit event via modals in e2e/tests/event-modal-crud.spec.ts
- [ ] T054 [US3] Verify all User Story 3 tests FAIL (run pnpm test)

### Implementation for User Story 3

- [ ] T055 [US3] Refactor EventForm component to support modal context in apps/frontend/src/components/EventForm.tsx
- [ ] T056 [US3] Create useModalState hook in apps/frontend/src/hooks/useModalState.ts
- [ ] T057 [US3] Create CreateEventModal component in apps/frontend/src/components/Modals/CreateEventModal.tsx (depends on T055, T056)
- [ ] T058 [US3] Create EditEventModal component in apps/frontend/src/components/Modals/EditEventModal.tsx (depends on T055, T056)
- [ ] T059 [US3] Add "Create Event" button to DashboardPage that opens CreateEventModal
- [ ] T060 [US3] Add "Create Event" button to EventsPage that opens CreateEventModal
- [ ] T061 [US3] Add "Edit" button to EventCard that opens EditEventModal
- [ ] T062 [US3] Update routing to remove /events/create and /events/:id/edit routes from App.tsx
- [ ] T063 [US3] Delete CreateEventPage.tsx (replaced by modal)
- [ ] T064 [US3] Delete EditEventPage.tsx (replaced by modal)
- [ ] T065 [US3] Add modal form validation error handling
- [ ] T066 [US3] Add modal form success/error toast notifications
- [ ] T067 [US3] Verify all User Story 3 tests PASS (run pnpm test)

**Checkpoint**: All user stories 1-3 should now work independently - dashboard, cards, and modal forms functional

---

## Phase 6: User Story 4 - Navigate with Improved Sidebar (Priority: P3)

**Goal**: Sidebar navigation with icons, active states, and responsive drawer behavior

**Independent Test**: View sidebar, verify menu items (Dashboard, Events, Settings) with icons, active state highlights current page, sidebar collapses on mobile

### Tests for User Story 4 (TDD Required)

- [ ] T068 [P] [US4] Component test for NavItem in apps/frontend/src/components/Navigation/__tests__/NavItem.test.tsx
- [ ] T069 [P] [US4] Component test for Sidebar in apps/frontend/src/components/Navigation/__tests__/Sidebar.test.tsx
- [ ] T070 [P] [US4] Component test for AppShell in apps/frontend/src/components/Navigation/__tests__/AppShell.test.tsx
- [ ] T071 [P] [US4] Integration test for sidebar state management in apps/frontend/src/stores/__tests__/sidebarStore.test.ts
- [ ] T072 [P] [US4] E2E test for navigation and active states in e2e/tests/navigation.spec.ts
- [ ] T073 [US4] Verify all User Story 4 tests FAIL (run pnpm test)

### Implementation for User Story 4

- [ ] T074 [P] [US4] Create NavItem component in apps/frontend/src/components/Navigation/NavItem.tsx
- [ ] T075 [US4] Create Sidebar component in apps/frontend/src/components/Navigation/Sidebar.tsx (depends on T074)
- [ ] T076 [US4] Complete AppShell implementation in apps/frontend/src/components/Navigation/AppShell.tsx (depends on T075)
- [ ] T077 [US4] Add sidebar icons (using Spectrum icons or custom)
- [ ] T078 [US4] Add sidebar active state highlighting based on current route
- [ ] T079 [US4] Add sidebar collapse/expand toggle button
- [ ] T080 [US4] Add responsive sidebar behavior (drawer on mobile, fixed on desktop)
- [ ] T081 [US4] Wrap all page components with AppShell in App.tsx
- [ ] T082 [US4] Add sidebar navigation to Settings page (if exists)
- [ ] T083 [US4] Verify all User Story 4 tests PASS (run pnpm test)

**Checkpoint**: All user stories should now be independently functional - complete UI overhaul with dashboard, cards, modals, and navigation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T084 [P] Add accessibility labels to all interactive elements (aria-label, aria-describedby)
- [ ] T085 [P] Test keyboard navigation across all pages (Tab, Enter, Esc)
- [ ] T086 [P] Test screen reader compatibility with VoiceOver/NVDA
- [ ] T087 [P] Add responsive breakpoint tests for 375px, 768px, 1024px, 1920px
- [ ] T088 [P] Optimize dashboard performance (memoization, lazy loading)
- [ ] T089 [P] Optimize modal animations (ensure <300ms open/close)
- [ ] T090 [P] Add loading state transitions and skeletons across all pages
- [ ] T091 [P] Add error boundary components for graceful failure handling
- [ ] T092 [P] Update E2E fixtures if needed in e2e/tests/fixtures/
- [ ] T093 Code cleanup and remove unused components (old EventForm if refactored)
- [ ] T094 Update documentation in specs/002-enhanced-ui/quickstart.md if needed
- [ ] T095 Run full test suite and verify 80%+ code coverage (pnpm test:coverage)
- [ ] T096 Run E2E test suite and verify all scenarios pass (pnpm test:e2e)
- [ ] T097 Verify quickstart.md setup instructions work from fresh clone
- [ ] T098 Performance audit: Dashboard loads <3s with 1000 events
- [ ] T099 Performance audit: Modal opens/closes <300ms
- [ ] T100 Performance audit: Form validation feedback <200ms

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1 (dashboard) and US2 (event cards) but independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Wraps all pages but independently testable

### Within Each User Story

- Tests (TDD REQUIRED) MUST be written and FAIL before implementation
- Components before pages
- Hooks/stores before components that use them
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T012)
- All Foundational tasks marked [P] can run in parallel (T014, T016)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel (e.g., T019-T023 for US1)
- Components within a story marked [P] can run in parallel (e.g., T025-T026 for US1)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1 (Dashboard)

```bash
# Phase 1: Write all tests in parallel (TDD)
Task T019: "Component test for MetricsCard"
Task T020: "Component test for StatsOverview"
Task T021: "Component test for ActivityFeed"
Task T022: "Integration test for useDashboardMetrics"
Task T023: "E2E test for dashboard page"

# Phase 2: Verify tests FAIL
Task T024: "Verify all User Story 1 tests FAIL"

# Phase 3: Implement components in parallel
Task T025: "Create MetricsCard component"
Task T026: "Create ActivityItem component"

# Phase 4: Implement dependent components
Task T027: "Create ActivityFeed component" (needs T026)
Task T028: "Create StatsOverview component" (needs T025)
Task T029: "Create useDashboardMetrics hook"

# Phase 5: Final integration
Task T030: "Create DashboardPage" (needs T028, T027, T029)
Task T031-T033: "Add routing, loading, empty states"

# Phase 6: Verify tests PASS
Task T034: "Verify all User Story 1 tests PASS"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T012)
2. Complete Phase 2: Foundational (T013-T018) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T019-T034) - Dashboard with metrics
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - users get dashboard functionality

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Dashboard) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Event Cards) → Test independently → Deploy/Demo
4. Add User Story 3 (Modal Forms) → Test independently → Deploy/Demo
5. Add User Story 4 (Sidebar Nav) → Test independently → Deploy/Demo
6. Polish (Phase 7) → Test full integration → Final Deploy
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T018)
2. Once Foundational is done:
   - Developer A: User Story 1 (Dashboard) - T019-T034
   - Developer B: User Story 2 (Event Cards) - T035-T048
   - Developer C: User Story 3 (Modal Forms) - T049-T067
   - Developer D: User Story 4 (Sidebar) - T068-T083
3. Stories complete and integrate independently
4. Team completes Polish together (T084-T100)

---

## TDD Workflow Reminders

**CRITICAL**: Per the project constitution, TDD is NON-NEGOTIABLE.

### For Each User Story:

1. **RED**: Write all component tests first (marked with test task IDs)
2. **RED**: Run tests and verify they FAIL (task ID ends with "Verify tests FAIL")
3. **GREEN**: Implement components to make tests pass
4. **GREEN**: Run tests and verify they PASS (task ID ends with "Verify tests PASS")
5. **REFACTOR**: Clean up code while keeping tests green

### Test Coverage Requirements:

- Minimum 80% line coverage for new frontend code
- Component tests for all new components (Vitest + RTL)
- Integration tests for hooks and stores
- E2E tests for critical user journeys (Playwright)

### User Approval:

- User MUST approve test specifications before implementation begins
- If tests are incomplete or incorrect, STOP and revise before implementing

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD cycle MUST be followed: Write test → Verify fail → Implement → Verify pass
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend API remains unchanged (no backend tasks required)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
