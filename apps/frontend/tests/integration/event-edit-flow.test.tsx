// T083: Integration test for edit event flow
// Tests the complete flow: view event → edit → save → verify changes
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { EditEventPage } from '../../src/pages/EditEventPage'
import * as useEventsModule from '../../src/hooks/useEvents'

const mockEvent = {
  id: 'event-123',
  teamId: 'team-456',
  title: 'Original Event Title',
  description: 'Original description',
  location: 'Original Location',
  startDate: new Date('2025-03-01T10:00:00Z'),
  endDate: new Date('2025-03-01T12:00:00Z'),
  timezone: 'UTC',
  createdBy: 'user-789',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

const updatedEvent = {
  ...mockEvent,
  title: 'Updated Event Title',
  description: 'Updated description',
  location: 'Updated Location',
  updatedAt: new Date('2025-01-02'),
}

function renderWithProviders(ui: React.ReactElement, { initialEntries = ['/'] } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <SpectrumProvider theme={defaultTheme}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    </SpectrumProvider>
  )
}

describe('EventForm - T083: Edit Event Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full edit flow: load event → edit → save → verify', async () => {
    const user = userEvent.setup()
    let eventData = { ...mockEvent }

    // Mock useEvent hook to return the current event data
    const useEventSpy = vi.spyOn(useEventsModule, 'useEvent')
    useEventSpy.mockImplementation((_eventId: string) => ({
      data: eventData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any))

    // Mock useUpdateEvent hook
    const mockUpdateEvent = vi.fn().mockImplementation(async (data) => {
      // Simulate successful update
      eventData = { ...eventData, ...data, updatedAt: new Date() }
      return eventData
    })

    const useUpdateEventSpy = vi.spyOn(useEventsModule, 'useUpdateEvent')
    useUpdateEventSpy.mockReturnValue({
      mutateAsync: mockUpdateEvent,
      isPending: false,
      isError: false,
      error: null,
    } as any)

    // Render EditEventPage
    renderWithProviders(
      <Routes>
        <Route path="/events/:id/edit" element={<EditEventPage />} />
      </Routes>,
      { initialEntries: ['/events/event-123/edit'] }
    )

    // Verify form is pre-populated with existing data
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue('Original Event Title')
    })
    expect(screen.getByLabelText('Description')).toHaveValue('Original description')
    expect(screen.getByLabelText('Location')).toHaveValue('Original Location')

    // Edit the event fields
    const titleInput = screen.getByLabelText('Title')
    const descriptionInput = screen.getByLabelText('Description')
    const locationInput = screen.getByLabelText('Location')

    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Event Title')

    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')

    await user.clear(locationInput)
    await user.type(locationInput, 'Updated Location')

    // Submit the form
    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    await user.click(saveButton)

    // Verify updateEvent was called with correct data
    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Event Title',
          description: 'Updated description',
          location: 'Updated Location',
          updatedAt: mockEvent.updatedAt,
        })
      )
    })
  })

  it('should show optimistic update before server response', async () => {
    const user = userEvent.setup()
    let resolveUpdate: any

    // Mock useEvent to return initial data
    const useEventSpy = vi.spyOn(useEventsModule, 'useEvent')
    useEventSpy.mockReturnValue({
      data: mockEvent,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    // Mock useUpdateEvent with delayed response
    const mockUpdateEvent = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        resolveUpdate = resolve
      })
    })

    const useUpdateEventSpy = vi.spyOn(useEventsModule, 'useUpdateEvent')
    useUpdateEventSpy.mockReturnValue({
      mutateAsync: mockUpdateEvent,
      isPending: false,
      isError: false,
      error: null,
    } as any)

    renderWithProviders(
      <Routes>
        <Route path="/events/:id/edit" element={<EditEventPage />} />
      </Routes>,
      { initialEntries: ['/events/event-123/edit'] }
    )

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue('Original Event Title')
    })

    // Edit and submit
    const titleInput = screen.getByLabelText('Title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')

    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    await user.click(saveButton)

    // Verify button shows loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument()
    })

    // Resolve the update
    resolveUpdate(updatedEvent)

    // Verify button returns to normal state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    })
  })

  it('should handle concurrent edit conflict (T093)', async () => {
    const user = userEvent.setup()

    // Mock useEvent
    const useEventSpy = vi.spyOn(useEventsModule, 'useEvent')
    useEventSpy.mockReturnValue({
      data: mockEvent,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    // Mock useUpdateEvent to simulate conflict error
    const conflictError = new Error('Conflict: Event was updated by another user')
    const mockUpdateEvent = vi.fn().mockRejectedValue(conflictError)

    const useUpdateEventSpy = vi.spyOn(useEventsModule, 'useUpdateEvent')
    useUpdateEventSpy.mockReturnValue({
      mutateAsync: mockUpdateEvent,
      isPending: false,
      isError: true,
      error: conflictError,
    } as any)

    renderWithProviders(
      <Routes>
        <Route path="/events/:id/edit" element={<EditEventPage />} />
      </Routes>,
      { initialEntries: ['/events/event-123/edit'] }
    )

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue('Original Event Title')
    })

    // Edit and submit
    const titleInput = screen.getByLabelText('Title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')

    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    await user.click(saveButton)

    // Verify conflict error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Conflict:/)).toBeInTheDocument()
      expect(screen.getByText(/This event was updated by another user/)).toBeInTheDocument()
    })
  })

  it('should warn about unsaved changes (T082)', async () => {
    const user = userEvent.setup()
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    // Mock useEvent
    const useEventSpy = vi.spyOn(useEventsModule, 'useEvent')
    useEventSpy.mockReturnValue({
      data: mockEvent,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    // Mock useUpdateEvent
    const useUpdateEventSpy = vi.spyOn(useEventsModule, 'useUpdateEvent')
    useUpdateEventSpy.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as any)

    const { unmount } = renderWithProviders(
      <Routes>
        <Route path="/events/:id/edit" element={<EditEventPage />} />
      </Routes>,
      { initialEntries: ['/events/event-123/edit'] }
    )

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue('Original Event Title')
    })

    // Verify beforeunload listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    // Make a change to dirty the form
    const titleInput = screen.getByLabelText('Title')
    await user.type(titleInput, ' - Modified')

    // Unmount and verify cleanup
    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('should include optimistic locking timestamp (T080)', async () => {
    const user = userEvent.setup()

    // Mock useEvent
    const useEventSpy = vi.spyOn(useEventsModule, 'useEvent')
    useEventSpy.mockReturnValue({
      data: mockEvent,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    // Mock useUpdateEvent
    const mockUpdateEvent = vi.fn().mockResolvedValue(updatedEvent)
    const useUpdateEventSpy = vi.spyOn(useEventsModule, 'useUpdateEvent')
    useUpdateEventSpy.mockReturnValue({
      mutateAsync: mockUpdateEvent,
      isPending: false,
      isError: false,
      error: null,
    } as any)

    renderWithProviders(
      <Routes>
        <Route path="/events/:id/edit" element={<EditEventPage />} />
      </Routes>,
      { initialEntries: ['/events/event-123/edit'] }
    )

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue('Original Event Title')
    })

    // Edit and submit
    const titleInput = screen.getByLabelText('Title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')

    const saveButton = screen.getByRole('button', { name: 'Save Changes' })
    await user.click(saveButton)

    // Verify updateEvent was called with updatedAt timestamp
    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: mockEvent.updatedAt,
        })
      )
    })
  })
})
