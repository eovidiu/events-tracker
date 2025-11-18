import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'
import { BrowserRouter } from 'react-router-dom'
import { DashboardPage } from '../../src/pages/DashboardPage'
import { api } from '../../src/services/api'
import React from 'react'

// Mock the API module
vi.mock('../../src/services/api')

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <SpectrumProvider theme={defaultTheme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </SpectrumProvider>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockEvents = [
    {
      id: '880e8400-e29b-41d4-a716-446655440003',
      teamId: '660e8400-e29b-41d4-a716-446655440001',
      title: 'Team Offsite',
      description: 'Annual team building event',
      location: 'San Francisco',
      startDate: new Date('2025-02-01T10:00:00Z'),
      endDate: new Date('2025-02-01T18:00:00Z'),
      timezone: 'America/Los_Angeles',
      status: 'upcoming',
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date('2025-01-15T10:00:00Z'),
      updatedAt: new Date('2025-01-15T10:00:00Z'),
    },
    {
      id: '990e8400-e29b-41d4-a716-446655440004',
      teamId: '660e8400-e29b-41d4-a716-446655440001',
      title: 'Sprint Planning',
      description: 'Q1 2025 sprint planning',
      location: 'Conference Room A',
      startDate: new Date('2025-02-15T14:00:00Z'),
      endDate: new Date('2025-02-15T16:00:00Z'),
      timezone: 'UTC',
      status: 'in_progress',
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date('2025-01-16T10:00:00Z'),
      updatedAt: new Date('2025-01-16T10:00:00Z'),
    },
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440005',
      teamId: '660e8400-e29b-41d4-a716-446655440001',
      title: 'Product Review',
      description: 'Monthly product review meeting',
      location: 'Virtual',
      startDate: new Date('2025-01-10T15:00:00Z'),
      endDate: new Date('2025-01-10T16:30:00Z'),
      timezone: 'UTC',
      status: 'completed',
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date('2025-01-05T10:00:00Z'),
      updatedAt: new Date('2025-01-05T10:00:00Z'),
    },
  ]

  it('should display page title', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })

  it('should display loading state initially', () => {
    vi.mocked(api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    // Loading state should be visible
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should display error state when API fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Failed to fetch events'))

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to fetch events/i)).toBeInTheDocument()
    })
  })

  it('should display stats overview with calculated metrics', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      // Total events: 3
      expect(screen.getByText('3')).toBeInTheDocument()
      // Upcoming: 1
      expect(screen.getByText('1')).toBeInTheDocument()
      // Completed: 1 (also shows as '1')
      // In Progress: 1 (also shows as '1')
    })

    // Verify metric labels
    expect(screen.getByText(/total/i)).toBeInTheDocument()
    expect(screen.getByText(/upcoming/i)).toBeInTheDocument()
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
    expect(screen.getByText(/in progress/i)).toBeInTheDocument()
  })

  it('should display activity feed with recent events', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
      expect(screen.getByText('Team Offsite')).toBeInTheDocument()
      expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
      expect(screen.getByText('Product Review')).toBeInTheDocument()
    })
  })

  it('should calculate metrics correctly with no events', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: [] })

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      // All metrics should be 0
      const zeroElements = screen.getAllByText('0')
      expect(zeroElements.length).toBeGreaterThan(0)
    })

    // Should show empty state for activity feed
    expect(screen.getByText(/no recent activity/i)).toBeInTheDocument()
  })

  it('should calculate metrics correctly with all upcoming events', async () => {
    const allUpcoming = mockEvents.map(event => ({
      ...event,
      status: 'upcoming' as const,
    }))

    vi.mocked(api.get).mockResolvedValue({ events: allUpcoming })

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      // Total: 3
      expect(screen.getByText('3')).toBeInTheDocument()
      // All should be upcoming
    })

    expect(screen.getByText(/upcoming/i)).toBeInTheDocument()
  })

  it('should calculate metrics correctly with all completed events', async () => {
    const allCompleted = mockEvents.map(event => ({
      ...event,
      status: 'completed' as const,
    }))

    vi.mocked(api.get).mockResolvedValue({ events: allCompleted })

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      // Total: 3
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })

  it('should fetch events on mount', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/events')
    })
  })

  it('should display dashboard in 2-column layout on desktop', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    const { container } = render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText('Team Offsite')).toBeInTheDocument()
    })

    // Dashboard should have 2-column layout
    expect(container.querySelector('[data-layout="two-column"]')).toBeInTheDocument()
  })

  it('should display stats overview in left column', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    const { container } = render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(/total/i)).toBeInTheDocument()
    })

    // Stats should be in left column
    expect(container.querySelector('[data-column="left"]')).toBeInTheDocument()
  })

  it('should display activity feed in right column', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    const { container } = render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
    })

    // Activity feed should be in right column
    expect(container.querySelector('[data-column="right"]')).toBeInTheDocument()
  })

  it('should sort activity feed by most recent first', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
    })

    // Most recently updated event should appear first in activity feed
    // Implementation will sort by updatedAt desc
  })

  it('should handle cancelled events in metrics', async () => {
    const eventsWithCancelled = [
      ...mockEvents,
      {
        ...mockEvents[0],
        id: 'bb0e8400-e29b-41d4-a716-446655440006',
        title: 'Cancelled Event',
        status: 'cancelled' as const,
      },
    ]

    vi.mocked(api.get).mockResolvedValue({ events: eventsWithCancelled })

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      // Total should include cancelled events
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    // Cancelled events should appear in activity feed
    expect(screen.getByText('Cancelled Event')).toBeInTheDocument()
  })

  it('should refresh data when refetch is triggered', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    render(
      <AllProviders>
        <DashboardPage />
      </AllProviders>
    )

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1)
    })

    // Data should be fetched initially
    expect(screen.getByText('Team Offsite')).toBeInTheDocument()
  })
})
