// T081: Component test for EventForm in edit mode
// T082: Component test for unsaved changes warning
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventForm } from '../../src/components/EventForm'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'

// Mock the useEvents hooks
vi.mock('../../src/hooks/useEvents', () => ({
  useCreateEvent: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    isError: false,
    error: null,
  })),
  useUpdateEvent: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    isError: false,
    error: null,
  })),
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <SpectrumProvider theme={defaultTheme}>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </SpectrumProvider>
  )
}

describe('EventForm - T081: Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render in edit mode when eventId is provided', () => {
    const initialData = {
      id: 'event-123',
      teamId: 'team-456',
      title: 'Existing Event',
      description: 'This is an existing event',
      location: 'Office',
      startDate: new Date('2025-03-01T10:00:00Z'),
      endDate: new Date('2025-03-01T12:00:00Z'),
      timezone: 'UTC',
      createdBy: 'user-789',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }

    renderWithProviders(
      <EventForm
        eventId="event-123"
        initialData={initialData}
      />
    )

    // Verify heading shows "Edit Event"
    expect(screen.getByRole('heading', { name: 'Edit Event' })).toBeInTheDocument()

    // Verify form is pre-populated with existing data
    expect(screen.getByLabelText('Title')).toHaveValue('Existing Event')
    expect(screen.getByLabelText('Description')).toHaveValue('This is an existing event')
    expect(screen.getByLabelText('Location')).toHaveValue('Office')

    // Verify button shows "Save Changes" instead of "Create Event"
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('should render in create mode when eventId is not provided', () => {
    renderWithProviders(
      <EventForm teamId="team-456" />
    )

    // Verify heading shows "Create New Event"
    expect(screen.getByRole('heading', { name: 'Create New Event' })).toBeInTheDocument()

    // Verify button shows "Create Event"
    expect(screen.getByRole('button', { name: 'Create Event' })).toBeInTheDocument()
  })

  it('should use updateEvent mutation when in edit mode', async () => {
    const mockUpdateEvent = vi.fn().mockResolvedValue({})
    const useUpdateEvent = await import('../../src/hooks/useEvents').then(m => m.useUpdateEvent)
    vi.mocked(useUpdateEvent).mockReturnValue({
      mutateAsync: mockUpdateEvent,
      isPending: false,
      isError: false,
      error: null,
    } as any)

    const initialData = {
      id: 'event-123',
      teamId: 'team-456',
      title: 'Original Title',
      description: 'Original description',
      location: 'Office',
      startDate: new Date('2025-03-01T10:00:00Z'),
      endDate: new Date('2025-03-01T12:00:00Z'),
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    renderWithProviders(
      <EventForm
        eventId="event-123"
        initialData={initialData}
      />
    )

    const user = userEvent.setup()
    const titleInput = screen.getByLabelText('Title')

    // Modify the title
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')

    // Submit the form
    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    await user.click(saveButton)

    // Verify updateEvent was called (not createEvent)
    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalled()
    })
  })
})

describe('EventForm - T082: Unsaved Changes Warning', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add beforeunload listener when form is dirty', async () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    renderWithProviders(
      <EventForm teamId="team-456" />
    )

    // Verify beforeunload listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    addEventListenerSpy.mockRestore()
  })

  it('should remove beforeunload listener on unmount', async () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderWithProviders(
      <EventForm teamId="team-456" />
    )

    unmount()

    // Verify beforeunload listener was removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    removeEventListenerSpy.mockRestore()
  })

  it('should show character count indicators', () => {
    renderWithProviders(
      <EventForm teamId="team-456" />
    )

    // T118: Verify character count indicators are present
    expect(screen.getByText('0/200 characters')).toBeInTheDocument()
    expect(screen.getByText('0/10000 characters')).toBeInTheDocument()
  })

  it('should update character count as user types', async () => {
    renderWithProviders(
      <EventForm teamId="team-456" />
    )

    const user = userEvent.setup()
    const titleInput = screen.getByLabelText('Title')

    await user.type(titleInput, 'Test')

    // Wait for character count to update
    await waitFor(() => {
      expect(screen.getByText('4/200 characters')).toBeInTheDocument()
    })
  })
})
