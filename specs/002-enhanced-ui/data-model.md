# Data Model: Enhanced UI with Modern Dashboard

**Feature Branch**: `002-enhanced-ui`
**Date**: 2025-11-18
**Phase**: 1 (Design & Contracts)

## Component Hierarchy

### Dashboard Page Component Tree

```
DashboardPage
├── AppShell (layout wrapper)
│   ├── Sidebar (navigation)
│   │   ├── Logo
│   │   ├── NavItem (Dashboard) [active]
│   │   ├── NavItem (Events)
│   │   └── NavItem (Settings)
│   │
│   └── DashboardContent (main area)
│       ├── PageHeader
│       │   ├── Heading "Dashboard"
│       │   └── ActionButton "Create Event" → CreateEventModal
│       │
│       ├── StatsOverview (metrics grid)
│       │   ├── MetricsCard (Total Events)
│       │   ├── MetricsCard (Upcoming Events)
│       │   └── MetricsCard (Completed Events)
│       │
│       └── ActivityFeed (recent events)
│           └── ActivityItem[] (event name, date, status)
```

### Events Page Component Tree

```
EventsPage
├── AppShell (layout wrapper)
│   ├── Sidebar (navigation)
│   │   ├── Logo
│   │   ├── NavItem (Dashboard)
│   │   ├── NavItem (Events) [active]
│   │   └── NavItem (Settings)
│   │
│   └── EventsContent (main area)
│       ├── PageHeader
│       │   ├── Heading "Events"
│       │   ├── SearchField (filter events)
│       │   └── ActionButton "Create Event" → CreateEventModal
│       │
│       ├── EventFilters (status filter pills)
│       │   ├── FilterPill "All"
│       │   ├── FilterPill "Upcoming"
│       │   ├── FilterPill "In Progress"
│       │   └── FilterPill "Completed"
│       │
│       └── EventGrid (responsive grid)
│           └── EventCard[] (event details, status, actions)
│               ├── EventCardHeader (title, status badge)
│               ├── EventCardBody (date, location, description)
│               └── EventCardFooter (Edit button → EditEventModal)
```

### Modal Components

```
CreateEventModal
├── Dialog (Spectrum wrapper)
│   ├── Heading "Create Event"
│   ├── Divider
│   └── Content
│       └── EventForm (existing component, refactored for modal)
│           ├── FormSection "Event Details"
│           │   ├── TextField (name)
│           │   ├── TextArea (description)
│           │   └── DatePicker (date)
│           │
│           ├── FormSection "Location"
│           │   └── TextField (location)
│           │
│           ├── FormSection "Status"
│           │   └── Picker (status options)
│           │
│           └── ButtonGroup
│               ├── Button "Cancel" (close)
│               └── Button "Create Event" (submit)

EditEventModal (same structure, pre-populated fields)
```

## State Management Architecture

### React Query State (Server State)

```typescript
// Query Keys
const queryKeys = {
  events: {
    all: ['events'] as const,
    byTeam: (teamId: string) => ['events', 'team', teamId] as const,
    byId: (id: string) => ['events', 'detail', id] as const,
  },
  dashboard: {
    metrics: (teamId: string) => ['dashboard', 'metrics', teamId] as const,
  },
  auth: {
    user: ['auth', 'user'] as const,
  },
}

// Hooks
function useEvents(teamId: string) {
  return useQuery({
    queryKey: queryKeys.events.byTeam(teamId),
    queryFn: () => api.getEvents(teamId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

function useDashboardMetrics(teamId: string) {
  const { data: events } = useEvents(teamId)

  return useMemo(() => {
    if (!events) return null

    return {
      total: events.length,
      upcoming: events.filter(e => e.status === 'upcoming').length,
      completed: events.filter(e => e.status === 'completed').length,
      inProgress: events.filter(e => e.status === 'in_progress').length,
      // Calculate percentage changes (compare to last 30 days vs. previous 30 days)
      percentageChange: {
        total: calculatePercentageChange(events, 'total'),
        upcoming: calculatePercentageChange(events, 'upcoming'),
        completed: calculatePercentageChange(events, 'completed'),
      },
    }
  }, [events])
}

function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventInput) => api.createEvent(data),
    onSuccess: (newEvent) => {
      // Invalidate events list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
      // Invalidate dashboard metrics
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
    },
  })
}

function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventInput }) =>
      api.updateEvent(id, data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
    },
  })
}
```

### Zustand State (UI State)

```typescript
// Modal State Store
interface ModalState {
  createEventOpen: boolean
  editEventOpen: boolean
  editEventId: string | null
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (eventId: string) => void
  closeEditModal: () => void
}

const useModalStore = create<ModalState>((set) => ({
  createEventOpen: false,
  editEventOpen: false,
  editEventId: null,
  openCreateModal: () => set({ createEventOpen: true }),
  closeCreateModal: () => set({ createEventOpen: false }),
  openEditModal: (eventId) => set({ editEventOpen: true, editEventId: eventId }),
  closeEditModal: () => set({ editEventOpen: false, editEventId: null }),
}))

// Sidebar State Store
interface SidebarState {
  isCollapsed: boolean
  toggleSidebar: () => void
  collapseSidebar: () => void
  expandSidebar: () => void
}

const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  collapseSidebar: () => set({ isCollapsed: true }),
  expandSidebar: () => set({ isCollapsed: false }),
}))

// Event Filters State (optional, could be local component state)
interface EventFiltersState {
  statusFilter: EventStatus | 'all'
  searchQuery: string
  setStatusFilter: (status: EventStatus | 'all') => void
  setSearchQuery: (query: string) => void
}

const useEventFiltersStore = create<EventFiltersState>((set) => ({
  statusFilter: 'all',
  searchQuery: '',
  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
```

## TypeScript Type Definitions

### Domain Types (Existing, No Changes)

```typescript
// apps/backend/src/types/events.ts (existing)
export type EventStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled'

export interface Event {
  id: string
  name: string
  description: string
  date: string // ISO 8601 format
  location: string
  status: EventStatus
  teamId: string
  createdAt: string
  updatedAt: string
}

export interface CreateEventInput {
  name: string
  description: string
  date: string
  location: string
  status: EventStatus
  teamId: string
}

export interface UpdateEventInput {
  name?: string
  description?: string
  date?: string
  location?: string
  status?: EventStatus
}
```

### UI-Specific Types (New)

```typescript
// apps/frontend/src/types/dashboard.ts
export interface DashboardMetrics {
  total: number
  upcoming: number
  completed: number
  inProgress: number
  percentageChange: {
    total: number | null // null if no historical data
    upcoming: number | null
    completed: number | null
  }
}

export interface ActivityItem {
  eventId: string
  eventName: string
  timestamp: string // ISO 8601
  status: EventStatus
  actionType: 'created' | 'updated' | 'status_changed'
}

// apps/frontend/src/types/components.ts
export interface EventCardProps {
  event: Event
  onEdit: (eventId: string) => void
  onDelete?: (eventId: string) => void // optional, future feature
}

export interface MetricsCardProps {
  title: string
  value: number
  percentageChange: number | null
  trend: 'up' | 'down' | 'neutral'
  icon?: ReactNode
}

export interface StatusBadgeProps {
  status: EventStatus
  size?: 'small' | 'medium' | 'large'
}

export interface NavItemProps {
  label: string
  icon: ReactNode
  to: string
  isActive?: boolean
}
```

## Component Props Interfaces

### Dashboard Components

```typescript
// apps/frontend/src/components/Dashboard/StatsOverview.tsx
interface StatsOverviewProps {
  metrics: DashboardMetrics
  isLoading?: boolean
}

// apps/frontend/src/components/Dashboard/MetricsCard.tsx
interface MetricsCardProps {
  title: string
  value: number
  percentageChange: number | null
  trend: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  isLoading?: boolean
}

// apps/frontend/src/components/Dashboard/ActivityFeed.tsx
interface ActivityFeedProps {
  events: Event[]
  maxItems?: number // default: 10
  isLoading?: boolean
}

interface ActivityItemProps {
  event: Event
}
```

### Event Components

```typescript
// apps/frontend/src/components/Events/EventGrid.tsx
interface EventGridProps {
  events: Event[]
  onEditEvent: (eventId: string) => void
  isLoading?: boolean
}

// apps/frontend/src/components/Events/EventCard.tsx
interface EventCardProps {
  event: Event
  onEdit: (eventId: string) => void
}

// apps/frontend/src/components/Events/StatusBadge.tsx
interface StatusBadgeProps {
  status: EventStatus
  size?: 'small' | 'medium' | 'large'
}
```

### Modal Components

```typescript
// apps/frontend/src/components/Modals/CreateEventModal.tsx
interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
}

// apps/frontend/src/components/Modals/EditEventModal.tsx
interface EditEventModalProps {
  isOpen: boolean
  eventId: string | null
  onClose: () => void
}

// apps/frontend/src/components/EventForm.tsx (existing, refactored)
interface EventFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<CreateEventInput>
  onSuccess: () => void // callback to close modal
  onCancel: () => void
}
```

### Navigation Components

```typescript
// apps/frontend/src/components/Navigation/AppShell.tsx
interface AppShellProps {
  children: ReactNode
}

// apps/frontend/src/components/Navigation/Sidebar.tsx
interface SidebarProps {
  currentPath: string
  isCollapsed?: boolean
}

// apps/frontend/src/components/Navigation/NavItem.tsx
interface NavItemProps {
  label: string
  icon: ReactNode
  to: string
  isActive?: boolean
}
```

## Form Validation Schema (Zod)

```typescript
// apps/frontend/src/schemas/eventSchema.ts (existing, no changes)
import { z } from 'zod'

export const createEventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().refine((date) => {
    const d = new Date(date)
    return !isNaN(d.getTime()) && d > new Date()
  }, 'Event date must be in the future'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  status: z.enum(['upcoming', 'in_progress', 'completed', 'cancelled']),
  teamId: z.string().uuid('Invalid team ID'),
})

export const updateEventSchema = createEventSchema.partial()

export type CreateEventFormData = z.infer<typeof createEventSchema>
export type UpdateEventFormData = z.infer<typeof updateEventSchema>
```

## Responsive Breakpoints

```typescript
// apps/frontend/src/theme/breakpoints.ts (new)
export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
} as const

export type Breakpoint = keyof typeof breakpoints

// Usage in components
const gridColumns = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
}
```

## API Response Shapes (No Changes)

All API responses remain unchanged. This is a frontend-only refactor.

**Existing Endpoints**:
- `GET /api/v1/events` → `Event[]`
- `GET /api/v1/events/:id` → `Event`
- `POST /api/v1/events` → `Event`
- `PUT /api/v1/events/:id` → `Event`
- `DELETE /api/v1/events/:id` → `{ success: boolean }`

## Error Handling Patterns

```typescript
// apps/frontend/src/components/ErrorBoundary.tsx (existing, reused)
// Modal-specific error handling
function CreateEventModal() {
  const createMutation = useCreateEvent()

  const handleSubmit = async (data: CreateEventFormData) => {
    try {
      await createMutation.mutateAsync(data)
      closeModal()
      toast.success('Event created successfully')
    } catch (error) {
      // Spectrum Toast for user feedback
      toast.error(error.message || 'Failed to create event')
    }
  }

  return (
    <Dialog>
      {createMutation.isError && (
        <InlineAlert variant="negative">
          {createMutation.error.message}
        </InlineAlert>
      )}
      <EventForm onSubmit={handleSubmit} />
    </Dialog>
  )
}
```

## Loading States

```typescript
// Dashboard loading skeleton
function DashboardPage() {
  const { data: metrics, isLoading } = useDashboardMetrics(teamId)

  if (isLoading) {
    return (
      <DashboardSkeleton>
        <Skeleton variant="rect" width="100%" height="120px" /> {/* Metrics cards */}
        <Skeleton variant="rect" width="100%" height="400px" /> {/* Activity feed */}
      </DashboardSkeleton>
    )
  }

  return <StatsOverview metrics={metrics} />
}

// Event grid loading
function EventsPage() {
  const { data: events, isLoading } = useEvents(teamId)

  if (isLoading) {
    return (
      <EventGridSkeleton>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rect" width="100%" height="200px" />
        ))}
      </EventGridSkeleton>
    )
  }

  return <EventGrid events={events} />
}
```

## Empty States

```typescript
// Dashboard empty state
function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <IllustratedMessage>
        <EmptyStateIcon />
        <Heading>No recent activity</Heading>
        <Content>Create your first event to get started.</Content>
        <ActionButton onPress={openCreateModal}>Create Event</ActionButton>
      </IllustratedMessage>
    )
  }

  return <ActivityList events={events} />
}

// Events list empty state
function EventGrid({ events }: EventGridProps) {
  if (events.length === 0) {
    return (
      <IllustratedMessage>
        <EmptyStateIcon />
        <Heading>No events yet</Heading>
        <Content>Get started by creating your first event.</Content>
        <ActionButton onPress={openCreateModal}>Create Event</ActionButton>
      </IllustratedMessage>
    )
  }

  return <Grid>{events.map(e => <EventCard event={e} />)}</Grid>
}
```

## Accessibility Annotations

```typescript
// Status badge with aria-label
function StatusBadge({ status }: StatusBadgeProps) {
  const statusLabel = {
    upcoming: 'Upcoming event',
    in_progress: 'Event in progress',
    completed: 'Completed event',
    cancelled: 'Cancelled event',
  }[status]

  return (
    <StatusLight variant={getVariant(status)} aria-label={statusLabel}>
      {status.replace('_', ' ')}
    </StatusLight>
  )
}

// Event card with descriptive aria-label
function EventCard({ event }: EventCardProps) {
  const ariaLabel = `${event.name}, ${formatDate(event.date)}, ${event.location}, ${event.status}`

  return (
    <View
      borderWidth="thin"
      borderRadius="medium"
      padding="size-200"
      aria-label={ariaLabel}
      role="article"
    >
      {/* Card content */}
    </View>
  )
}
```

---

**Data Model Complete**: Component hierarchy, state management, and type definitions documented. Ready for contracts and quickstart guide.
