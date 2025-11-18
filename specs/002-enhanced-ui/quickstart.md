# Quickstart Guide: Enhanced UI with Modern Dashboard

**Feature Branch**: `002-enhanced-ui`
**Date**: 2025-11-18
**Phase**: 1 (Design & Contracts)

## Prerequisites

Before starting development on this feature, ensure you have:

- ✅ Node.js 20+ installed (`node --version`)
- ✅ pnpm 8+ installed (`pnpm --version`)
- ✅ Git configured with your name and email
- ✅ Repository cloned locally
- ✅ Dependencies installed (`pnpm install`)

## Setup Instructions

### 1. Switch to Feature Branch

```bash
# Ensure you're on the correct branch
git checkout 002-enhanced-ui

# Verify branch
git branch --show-current
# Expected output: 002-enhanced-ui

# Pull latest changes
git pull origin 002-enhanced-ui
```

### 2. Install Dependencies

```bash
# From repository root
pnpm install

# This will install dependencies for all workspaces:
# - Root (Playwright, ESLint, etc.)
# - apps/backend (Fastify, SQLite, etc.)
# - apps/frontend (React, Spectrum, etc.)
```

### 3. Start Development Servers

```bash
# Terminal 1: Start backend server (Fastify)
cd apps/backend
pnpm dev
# Backend runs on http://localhost:3000

# Terminal 2: Start frontend dev server (Vite)
cd apps/frontend
pnpm dev
# Frontend runs on http://localhost:5173
```

### 4. Verify Setup

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1/events (should return 401 Unauthorized if not logged in)

**Expected behavior**:
1. Frontend loads without errors
2. Login page appears at `/login`
3. You can log in with a test email (e.g., `alice@example.com`)
4. After login, you're redirected to `/events` (current events list page)

## Project Structure Overview

```
test-3/
├── apps/
│   ├── backend/          # Fastify API (NO CHANGES for this feature)
│   │   └── src/
│   │       ├── routes/   # API endpoints
│   │       ├── services/ # Business logic
│   │       └── db/       # SQLite database
│   │
│   └── frontend/         # React UI (PRIMARY WORK AREA)
│       ├── src/
│       │   ├── components/  # Reusable UI components
│       │   │   └── [NEW]    # Dashboard, Events, Modals, Navigation components
│       │   ├── pages/       # Route-level pages
│       │   │   └── [NEW]    # DashboardPage.tsx
│       │   ├── hooks/       # Custom React hooks
│       │   │   └── [NEW]    # useDashboardMetrics, useModalState
│       │   └── services/    # API client (NO CHANGES)
│       │
│       └── tests/
│           ├── components/  # Component tests (Vitest + RTL)
│           └── integration/ # Integration tests
│
├── e2e/                  # Playwright E2E tests
│   ├── tests/
│   │   └── [NEW]         # dashboard.spec.ts, event-modal-crud.spec.ts
│   └── fixtures/         # Test fixtures (existing)
│
└── specs/
    └── 002-enhanced-ui/  # This feature's documentation
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── contracts/
        └── quickstart.md  # This file
```

## Development Workflow

### Creating New Components

**Step 1: Write Tests First (TDD Required)**

```bash
# Example: Create dashboard metrics card component

# 1. Create test file
touch apps/frontend/src/components/Dashboard/__tests__/MetricsCard.test.tsx

# 2. Write failing test
# apps/frontend/src/components/Dashboard/__tests__/MetricsCard.test.tsx
import { render, screen } from '@testing-library/react'
import { MetricsCard } from '../MetricsCard'

describe('MetricsCard', () => {
  it('should render metric value and title', () => {
    render(
      <MetricsCard
        title="Total Events"
        value={42}
        percentageChange={15}
        trend="up"
      />
    )

    expect(screen.getByText('Total Events')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('+15%')).toBeInTheDocument()
  })
})

# 3. Run test (should fail)
pnpm test MetricsCard

# 4. Implement component
touch apps/frontend/src/components/Dashboard/MetricsCard.tsx

# 5. Run test again (should pass)
pnpm test MetricsCard
```

**Step 2: Implement Component**

```typescript
// apps/frontend/src/components/Dashboard/MetricsCard.tsx
import { View, Heading, Text, Flex } from '@adobe/react-spectrum'

export interface MetricsCardProps {
  title: string
  value: number
  percentageChange: number | null
  trend: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  isLoading?: boolean
}

export function MetricsCard({
  title,
  value,
  percentageChange,
  trend,
  icon,
  isLoading,
}: MetricsCardProps) {
  return (
    <View
      borderWidth="thin"
      borderColor="gray-300"
      borderRadius="medium"
      padding="size-300"
    >
      <Flex direction="column" gap="size-100">
        <Text>{title}</Text>
        <Heading level={2}>{isLoading ? '...' : value}</Heading>
        {percentageChange !== null && (
          <Text UNSAFE_className={`trend-${trend}`}>
            {percentageChange > 0 ? '+' : ''}
            {percentageChange}%
          </Text>
        )}
      </Flex>
    </View>
  )
}
```

### Running Tests

```bash
# Run all frontend tests (Vitest)
cd apps/frontend
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test MetricsCard

# Run E2E tests (Playwright)
cd ../..  # back to root
pnpm test:e2e

# Run E2E tests in UI mode (interactive)
pnpm test:e2e:ui

# Run E2E tests in headed mode (see browser)
pnpm test:e2e:headed

# Run specific E2E test
pnpm test:e2e -- dashboard.spec.ts
```

### Linting and Type Checking

```bash
# Lint all code
pnpm lint

# Fix linting issues automatically
pnpm lint -- --fix

# Type check
pnpm type-check
```

## Key Technologies & Patterns

### Adobe React Spectrum

**Import Components**:
```typescript
import {
  View,
  Flex,
  Grid,
  Heading,
  Text,
  Button,
  ActionButton,
  Dialog,
  DialogTrigger,
  Form,
  TextField,
  TextArea,
  DatePicker,
  StatusLight,
  IllustratedMessage,
} from '@adobe/react-spectrum'
```

**Documentation**: https://react-spectrum.adobe.com/react-spectrum/

**Key Patterns**:
- Use `View` for layout containers
- Use `Flex` for flexbox layouts
- Use `Grid` for responsive grids
- Use `Dialog` + `DialogTrigger` for modals
- Use `StatusLight` for status badges

### React Query (TanStack Query)

**Basic Hook Pattern**:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query (read data)
function useEvents(teamId: string) {
  return useQuery({
    queryKey: ['events', 'team', teamId],
    queryFn: () => api.getEvents(teamId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation (write data)
function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventInput) => api.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// Usage in component
function EventsPage() {
  const { data: events, isLoading, error } = useEvents(teamId)
  const createMutation = useCreateEvent()

  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data)
  }

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorMessage error={error} />

  return <EventGrid events={events} onCreate={handleCreate} />
}
```

### Zustand (State Management)

**Store Pattern**:
```typescript
import { create } from 'zustand'

interface ModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))

// Usage in component
function CreateEventButton() {
  const { openModal } = useModalStore()
  return <ActionButton onPress={openModal}>Create Event</ActionButton>
}

function CreateEventModal() {
  const { isOpen, closeModal } = useModalStore()
  return (
    <Dialog isOpen={isOpen} onDismiss={closeModal}>
      <EventForm onSuccess={closeModal} />
    </Dialog>
  )
}
```

### React Hook Form + Zod

**Form Pattern**:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventSchema, CreateEventFormData } from '../schemas/eventSchema'

function EventForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    mode: 'onBlur', // Validate on blur, not on every keystroke
  })

  const createMutation = useCreateEvent()

  const onSubmit = async (data: CreateEventFormData) => {
    await createMutation.mutateAsync(data)
    onSuccess()
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Event Name"
        {...register('name')}
        validationState={errors.name ? 'invalid' : 'valid'}
        errorMessage={errors.name?.message}
      />
      {/* More fields... */}
      <Button type="submit" isDisabled={createMutation.isPending}>
        Create Event
      </Button>
    </Form>
  )
}
```

## Testing Patterns

### Component Tests (Vitest + React Testing Library)

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EventForm } from '../EventForm'

// Test helper: wrap component with providers
function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('EventForm', () => {
  it('should validate required fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventForm onSuccess={vi.fn()} />)

    // Try to submit without filling fields
    const submitButton = screen.getByRole('button', { name: /create event/i })
    await user.click(submitButton)

    // Expect validation errors
    await waitFor(() => {
      expect(screen.getByText(/event name must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('should call onSuccess after successful submission', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    renderWithProviders(<EventForm onSuccess={onSuccess} />)

    // Fill form fields
    await user.type(screen.getByLabelText(/event name/i), 'Team Offsite')
    await user.type(screen.getByLabelText(/description/i), 'Annual team building')
    // ... fill other fields

    // Submit form
    await user.click(screen.getByRole('button', { name: /create event/i }))

    // Expect onSuccess callback
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/tests/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('should display metrics cards', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'alice@example.com')
    await page.click('button:has-text("Login")')

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Expect metrics cards
    await expect(page.locator('text=Total Events')).toBeVisible()
    await expect(page.locator('text=Upcoming Events')).toBeVisible()
    await expect(page.locator('text=Completed Events')).toBeVisible()
  })

  test('should load dashboard in under 3 seconds', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'alice@example.com')
    await page.click('button:has-text("Login")')

    const startTime = Date.now()
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000) // 3 seconds max
  })
})
```

## Common Issues & Solutions

### Issue 1: Module Not Found
**Problem**: Import errors after creating new components

**Solution**:
```bash
# Restart TypeScript server in VSCode
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or restart Vite dev server
# Ctrl+C in terminal, then `pnpm dev` again
```

### Issue 2: Spectrum Components Not Styled
**Problem**: Components render but have no styling

**Solution**:
```typescript
// Ensure Provider is wrapping your app
// apps/frontend/src/App.tsx
import { Provider, defaultTheme } from '@adobe/react-spectrum'

function App() {
  return (
    <Provider theme={defaultTheme}>
      {/* Your app */}
    </Provider>
  )
}
```

### Issue 3: React Query Not Refetching
**Problem**: Data doesn't update after mutation

**Solution**:
```typescript
// Ensure invalidateQueries is called in mutation
const createMutation = useMutation({
  mutationFn: api.createEvent,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['events'] })
    // This triggers refetch of all queries with 'events' key
  },
})
```

### Issue 4: Form Validation Not Working
**Problem**: Zod validation errors not showing

**Solution**:
```typescript
// Ensure zodResolver is used
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(createEventSchema), // <-- This is required
  mode: 'onBlur',
})

// Check for errors in component
{errors.name && <Text>{errors.name.message}</Text>}
```

## Next Steps

1. ✅ Complete Phase 0 (research.md) and Phase 1 (data-model.md, contracts, quickstart.md)
2. 📝 Run `.specify/scripts/bash/update-agent-context.sh claude` to update agent context
3. 📝 Generate tasks.md using `/speckit.tasks` command
4. 📝 Begin implementation following TDD workflow

## Resources

- [Adobe React Spectrum Docs](https://react-spectrum.adobe.com/react-spectrum/)
- [React Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Hook Form Docs](https://react-hook-form.com/get-started)
- [Zod Docs](https://zod.dev/)
- [Vitest Docs](https://vitest.dev/guide/)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)

---

**Quickstart Complete**: Ready for development!
