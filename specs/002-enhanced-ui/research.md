# Research: Enhanced UI with Modern Dashboard

**Feature Branch**: `002-enhanced-ui`
**Date**: 2025-11-18
**Phase**: 0 (Research)

## Technology Stack Validation

### Frontend Framework: React 18.2+ with TypeScript 5.3+
**Status**: ✅ Already in use, no changes needed

**Rationale**:
- Current codebase uses React 18.2 with TypeScript 5.3
- Adobe React Spectrum 3.34+ is built for React 18
- No migration required

**References**:
- `apps/frontend/package.json` confirms React 18.2.0
- `tsconfig.json` confirms TypeScript 5.3.3

### UI Component Library: Adobe React Spectrum 3.34+
**Status**: ✅ Already in use, validated for dashboard patterns

**Component Coverage Analysis**:
- **Dashboard Metrics**: `View`, `Flex`, `Heading`, `Text` for layout
- **Stat Cards**: Custom components wrapping Spectrum primitives
- **Status Badges**: `StatusLight` component with color variants
- **Modals**: `Dialog`, `DialogTrigger`, `Modal` for form overlays
- **Forms**: `Form`, `TextField`, `TextArea`, `DatePicker`, `Picker`
- **Navigation**: `ActionButton`, `Breadcrumbs` for sidebar
- **Grid Layouts**: `Grid` component for card-based event listings
- **Loading States**: `ProgressCircle`, `ProgressBar`
- **Empty States**: `IllustratedMessage` with illustrations

**Spectrum Strengths**:
- Built-in accessibility (WCAG 2.1 AA compliant)
- Responsive design patterns out of the box
- Consistent theming system
- Adobe design language alignment

**References**:
- [Adobe Spectrum - Dialog](https://react-spectrum.adobe.com/react-spectrum/Dialog.html)
- [Adobe Spectrum - StatusLight](https://react-spectrum.adobe.com/react-spectrum/StatusLight.html)
- [Adobe Spectrum - Grid](https://react-spectrum.adobe.com/react-spectrum/Grid.html)

### State Management: React Query 5.x + Zustand 4.x
**Status**: ✅ Existing pattern, extends to dashboard metrics

**React Query Usage**:
- Existing: `useEvents()` hook for events list
- New: `useDashboardMetrics()` hook for aggregated stats
- Caching strategy: `staleTime: 5 * 60 * 1000` (5 minutes)
- Refetch on window focus for real-time updates

**Zustand Usage**:
- Existing: Auth state, team context
- New: Modal open/close state, sidebar collapse state
- No persistence required (ephemeral UI state)

**References**:
- `apps/frontend/src/hooks/useEvents.ts` (existing pattern)
- [React Query - Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries)

### Form Management: React Hook Form 7.x + Zod
**Status**: ✅ Existing pattern, adapts to modal forms

**Current Implementation**:
- `apps/frontend/src/components/EventForm.tsx` uses React Hook Form
- Zod schema validation already defined
- Integration with Spectrum components via `Controller`

**Modal Adaptation**:
- Same form logic, different layout (modal vs. full page)
- Validation rules remain unchanged
- Error handling adapts to Spectrum `Dialog` patterns

**References**:
- [React Hook Form - Controller](https://react-hook-form.com/docs/usecontroller/controller)
- [Zod - Schema Validation](https://zod.dev/)

### Testing Stack: Vitest + React Testing Library + Playwright
**Status**: ✅ Existing setup, extends to new components

**Component Tests (Vitest + RTL)**:
- Test dashboard metrics rendering
- Test modal open/close behavior
- Test form validation in modal context
- Test status badge color mapping
- Test responsive grid layouts

**E2E Tests (Playwright)**:
- Test dashboard load performance (<3s goal)
- Test modal CRUD workflows
- Test navigation between sections
- Test responsive breakpoints

**Coverage Goals**:
- Minimum 80% line coverage (constitutional requirement)
- 100% coverage for critical paths (event creation, dashboard metrics)

**References**:
- `e2e/playwright.config.ts` (existing config)
- `apps/frontend/vitest.config.ts` (existing config)

## Design Patterns & Architecture

### Pattern 1: Dashboard Metrics Aggregation
**Problem**: Need to display real-time event statistics (total, upcoming, completed counts) with percentage changes.

**Solution**: Server-side aggregation via existing REST API
```typescript
// New hook: apps/frontend/src/hooks/useDashboardMetrics.ts
function useDashboardMetrics(teamId: string) {
  return useQuery({
    queryKey: ['dashboard', 'metrics', teamId],
    queryFn: async () => {
      const events = await api.getEvents(teamId)
      return {
        total: events.length,
        upcoming: events.filter(e => e.status === 'upcoming').length,
        completed: events.filter(e => e.status === 'completed').length,
        // Calculate percentage changes vs. previous period
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

**Trade-offs**:
- ✅ No backend changes required
- ✅ Leverages existing React Query caching
- ⚠️ Client-side aggregation (acceptable for MVP, <1000 events per spec)
- 🔮 Future: Move aggregation to backend if performance degrades

**References**:
- Existing pattern: `apps/frontend/src/hooks/useEvents.ts`

### Pattern 2: Modal-Based Forms
**Problem**: Replace full-page create/edit forms with modal overlays for better UX.

**Solution**: Spectrum `Dialog` + `DialogTrigger` pattern
```typescript
// New component: apps/frontend/src/components/Modals/CreateEventModal.tsx
function CreateEventModal() {
  return (
    <DialogTrigger>
      <ActionButton>Create Event</ActionButton>
      {(close) => (
        <Dialog>
          <Heading>Create Event</Heading>
          <Divider />
          <Content>
            <EventForm onSuccess={close} />
          </Content>
        </Dialog>
      )}
    </DialogTrigger>
  )
}
```

**Trade-offs**:
- ✅ Better UX (no context switch to new page)
- ✅ Reuses existing `EventForm` component logic
- ⚠️ Requires modal state management (close on success, persist on error)
- ✅ Spectrum handles accessibility (focus trapping, ESC key, backdrop)

**References**:
- [Spectrum Dialog Docs](https://react-spectrum.adobe.com/react-spectrum/Dialog.html)

### Pattern 3: Card-Based Event Grid
**Problem**: Replace table/list view with scannable card grid.

**Solution**: Spectrum `Grid` + custom `EventCard` component
```typescript
// New component: apps/frontend/src/components/Events/EventGrid.tsx
function EventGrid({ events }: { events: Event[] }) {
  return (
    <Grid
      columns={repeat('auto-fit', minmax('300px', '1fr'))}
      gap="size-200"
    >
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </Grid>
  )
}
```

**Trade-offs**:
- ✅ Responsive out of the box (auto-fit grid)
- ✅ Better visual hierarchy with status badges
- ⚠️ Requires hover states for interactivity
- ✅ Accessibility maintained via Spectrum primitives

**References**:
- [Spectrum Grid Docs](https://react-spectrum.adobe.com/react-spectrum/Grid.html)

### Pattern 4: Sidebar Navigation with App Shell
**Problem**: Consistent navigation across all pages with active state indicators.

**Solution**: Layout component wrapping page content
```typescript
// New component: apps/frontend/src/components/Navigation/AppShell.tsx
function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <Flex height="100vh">
      <Sidebar currentPath={location.pathname} />
      <View flex={1} padding="size-400">
        {children}
      </View>
    </Flex>
  )
}
```

**Trade-offs**:
- ✅ Single source of truth for navigation state
- ✅ Easy to add new nav items
- ⚠️ Requires route refactor in `App.tsx`
- ✅ Mobile responsive via collapsible drawer

**References**:
- Adobe Spectrum layout patterns

## Performance Considerations

### Goal 1: Dashboard Render <3s with 1000 events
**Strategy**:
- Use React Query caching to avoid redundant API calls
- Memoize expensive calculations (percentage changes)
- Virtual scrolling if activity feed exceeds 50 items (via `react-window`)
- Lazy load dashboard components below the fold

**Measurement**:
- React DevTools Profiler during development
- Playwright performance tests in E2E suite
- Web Vitals (LCP, FID, CLS) monitoring

### Goal 2: Modal Open/Close <300ms
**Strategy**:
- Leverage Spectrum's optimized `Dialog` animations
- Avoid heavy computations during modal mount
- Pre-load form validation schema
- Use `react-hook-form`'s `mode: 'onBlur'` to defer validation

**Measurement**:
- Chrome DevTools Performance tab
- Playwright timing assertions

### Goal 3: Form Validation Feedback <200ms
**Strategy**:
- Zod schema validation is synchronous and fast
- Debounce async validations (e.g., unique event name checks)
- Show inline errors immediately on blur
- Throttle onChange validation to 200ms

**Measurement**:
- Unit tests with timing assertions
- Manual testing with slow 3G throttling

## Responsive Design Strategy

### Breakpoints (Spectrum default)
- **Mobile**: 320px - 768px (1 column grid, drawer sidebar)
- **Tablet**: 768px - 1024px (2 column grid, collapsible sidebar)
- **Desktop**: 1024px+ (3-4 column grid, persistent sidebar)

### Component Adaptations
- **Dashboard**: Stack metrics cards on mobile, grid on desktop
- **Event Grid**: 1 column → 2 columns → 3 columns as width increases
- **Modal Forms**: Full-screen on mobile, centered overlay on desktop
- **Sidebar**: Drawer with hamburger menu on mobile, fixed on desktop

### Testing Strategy
- Playwright viewport tests at 375px, 768px, 1024px, 1920px
- Chrome DevTools device emulation during development
- Manual testing on real devices (iOS Safari, Android Chrome)

## Accessibility Compliance

### WCAG 2.1 Level AA Requirements
**Status**: ✅ Handled by Adobe React Spectrum

**Spectrum Guarantees**:
- Keyboard navigation (Tab, Arrow keys, Enter, ESC)
- Screen reader support (ARIA labels, roles, live regions)
- Focus management (modal focus trapping, focus restoration)
- Color contrast (minimum 4.5:1 for text)
- Touch target sizes (minimum 44x44px)

**Custom Component Requirements**:
- Event cards: Add `aria-label` describing full event details
- Status badges: Include `aria-label` for color-blind users
- Dashboard metrics: Use `aria-live="polite"` for stat updates
- Modals: Ensure `aria-labelledby` and `aria-describedby` are set

**Testing**:
- axe-core integration in Vitest tests
- Manual screen reader testing (VoiceOver, NVDA)
- Keyboard-only navigation tests in Playwright

## Migration Strategy

### Phase 1: New Components (Non-Breaking)
- Create new dashboard components
- Add new modal components
- Build event card components
- Implement sidebar navigation

**Goal**: No changes to existing functionality

### Phase 2: Refactor Existing Pages (Breaking Routes)
- Replace `CreateEventPage` with modal-triggered flow
- Replace `EditEventPage` with modal-triggered flow
- Update `EventsPage` to use card grid
- Add dashboard as new default route

**Goal**: Remove old page components, update routing

### Phase 3: E2E Test Updates
- Update existing tests to use modals instead of pages
- Add new dashboard tests
- Add new navigation tests

**Goal**: Maintain 100% E2E coverage

### Rollback Plan
- Feature flag dashboard route (default to `/events` if disabled)
- Keep old create/edit pages in codebase until E2E tests pass
- Gradual rollout via feature flag (10% → 50% → 100%)

## Open Questions & Risks

### Risk 1: Modal Forms on Mobile
**Concern**: Full-screen modals on mobile may feel jarring

**Mitigation**:
- Test with real users on mobile devices
- Consider progressive enhancement (modal on desktop, new page on mobile)
- Monitor analytics for modal abandonment rates

### Risk 2: Dashboard Performance with Large Datasets
**Concern**: Client-side aggregation may slow down with 1000+ events

**Mitigation**:
- Load test with 1000+ events in dev environment
- Profile with React DevTools
- Prepare backend aggregation API if needed (Phase 2)

### Risk 3: Color-Coded Status Badges (Accessibility)
**Concern**: Color alone is not sufficient for status indication

**Mitigation**:
- Add text labels to status badges ("Upcoming", "Completed", etc.)
- Include icons alongside colors
- Test with color blindness simulators

## Next Steps (Phase 1)

1. ✅ Complete research.md (this file)
2. 📝 Create data-model.md (component hierarchy, state shape)
3. 📝 Create contracts/ directory (API contracts if needed)
4. 📝 Create quickstart.md (setup instructions for new components)
5. 📝 Run `.specify/scripts/bash/update-agent-context.sh claude`
6. 📝 User reviews and approves design artifacts
7. 📝 Proceed to Phase 2: Task generation (`/speckit.tasks`)

---

**Research Complete**: Ready for Phase 1 design artifacts.
