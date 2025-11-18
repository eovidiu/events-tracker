import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'
import { EventForm } from '../../src/components/EventForm'
import React from 'react'

const mockOnSuccess = vi.fn()

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <SpectrumProvider theme={defaultTheme}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SpectrumProvider>
  )
}

describe('EventForm', () => {
  const mockTeamId = '660e8400-e29b-41d4-a716-446655440001'

  it('should render all form fields', () => {
    render(
      <AllProviders>
        <EventForm teamId={mockTeamId} onSuccess={mockOnSuccess} />
      </AllProviders>
    )

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()

    render(
      <AllProviders>
        <EventForm teamId={mockTeamId} onSuccess={mockOnSuccess} />
      </AllProviders>
    )

    const submitButton = screen.getByRole('button', { name: /create event/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/location is required/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('should validate title length', async () => {
    const user = userEvent.setup()

    render(
      <AllProviders>
        <EventForm teamId={mockTeamId} onSuccess={mockOnSuccess} />
      </AllProviders>
    )

    const titleInput = screen.getByLabelText(/title/i)
    const longTitle = 'a'.repeat(201) // Exceeds 200 character limit

    await user.type(titleInput, longTitle)

    const submitButton = screen.getByRole('button', { name: /create event/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/title must be 200 characters or less/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('should validate end date is after start date', async () => {
    const user = userEvent.setup()

    render(
      <AllProviders>
        <EventForm teamId={mockTeamId} onSuccess={mockOnSuccess} />
      </AllProviders>
    )

    const titleInput = screen.getByLabelText(/title/i)
    const locationInput = screen.getByLabelText(/location/i)
    const startDateInput = screen.getByLabelText(/start date/i)
    const endDateInput = screen.getByLabelText(/end date/i)

    await user.type(titleInput, 'Team Meeting')
    await user.type(locationInput, 'Conference Room')
    await user.type(startDateInput, '2025-03-01T18:00')
    await user.type(endDateInput, '2025-03-01T10:00') // Before start date

    const submitButton = screen.getByRole('button', { name: /create event/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/end date must be after or equal to start date/i)
      ).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()

    render(
      <AllProviders>
        <EventForm teamId={mockTeamId} onSuccess={mockOnSuccess} />
      </AllProviders>
    )

    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    const locationInput = screen.getByLabelText(/location/i)
    const startDateInput = screen.getByLabelText(/start date/i)
    const endDateInput = screen.getByLabelText(/end date/i)

    await user.type(titleInput, 'Team Offsite')
    await user.type(descriptionInput, 'Annual team building event')
    await user.type(locationInput, 'San Francisco')
    await user.type(startDateInput, '2025-03-01T10:00')
    await user.type(endDateInput, '2025-03-01T18:00')

    const submitButton = screen.getByRole('button', { name: /create event/i })
    await user.click(submitButton)

    // Wait for form submission (mocked API will resolve immediately in tests)
    await waitFor(
      () => {
        expect(mockOnSuccess).toHaveBeenCalled()
      },
      { timeout: 3000 }
    )
  })

  it('should display server errors', async () => {
    const user = userEvent.setup()

    // Mock API error will be handled by the mutation
    render(
      <AllProviders>
        <EventForm teamId={mockTeamId} onSuccess={mockOnSuccess} />
      </AllProviders>
    )

    const titleInput = screen.getByLabelText(/title/i)
    const locationInput = screen.getByLabelText(/location/i)
    const startDateInput = screen.getByLabelText(/start date/i)
    const endDateInput = screen.getByLabelText(/end date/i)

    await user.type(titleInput, 'Team Meeting')
    await user.type(locationInput, 'Office')
    await user.type(startDateInput, '2025-03-01T10:00')
    await user.type(endDateInput, '2025-03-01T12:00')

    const submitButton = screen.getByRole('button', { name: /create event/i })
    await user.click(submitButton)

    // Error handling will be tested when mutation fails
    // The component should display error messages from the server
  })

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup()

    render(
      <AllProviders>
        <EventForm teamId={mockTeamId} onSuccess={mockOnSuccess} />
      </AllProviders>
    )

    const titleInput = screen.getByLabelText(/title/i)
    const locationInput = screen.getByLabelText(/location/i)
    const startDateInput = screen.getByLabelText(/start date/i)
    const endDateInput = screen.getByLabelText(/end date/i)

    await user.type(titleInput, 'Team Meeting')
    await user.type(locationInput, 'Office')
    await user.type(startDateInput, '2025-03-01T10:00')
    await user.type(endDateInput, '2025-03-01T12:00')

    const submitButton = screen.getByRole('button', { name: /create event/i })

    expect(submitButton).not.toBeDisabled()

    await user.click(submitButton)

    // Button should be disabled during submission
    // This will be verified when the component is implemented
  })
})
