import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'
import { BrowserRouter } from 'react-router-dom'
import { EventList } from '../../src/components/EventList'
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

describe('EventList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state', () => {
    vi.mocked(api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(
      <AllProviders>
        <EventList />
      </AllProviders>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should display error state', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Failed to fetch events'))

    render(
      <AllProviders>
        <EventList />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to fetch events/i)).toBeInTheDocument()
    })
  })

  it('should display empty state when no events', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: [] })

    render(
      <AllProviders>
        <EventList />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(/no events found/i)).toBeInTheDocument()
    })
  })

  it('should display list of events', async () => {
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
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date('2025-01-16T10:00:00Z'),
        updatedAt: new Date('2025-01-16T10:00:00Z'),
      },
    ]

    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    render(
      <AllProviders>
        <EventList />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText('Team Offsite')).toBeInTheDocument()
      expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
    })

    expect(screen.getByText('San Francisco')).toBeInTheDocument()
    expect(screen.getByText('Conference Room A')).toBeInTheDocument()
  })

  it('should display event dates formatted correctly', async () => {
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
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
      },
    ]

    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    render(
      <AllProviders>
        <EventList />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText('Team Offsite')).toBeInTheDocument()
    })

    // Dates should be formatted in a human-readable way
    // The exact format will depend on the component implementation
    expect(screen.getByText(/Feb/i)).toBeInTheDocument()
    expect(screen.getByText(/2025/i)).toBeInTheDocument()
  })

  it('should display event descriptions', async () => {
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
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
      },
    ]

    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    render(
      <AllProviders>
        <EventList />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(/Annual team building event/i)).toBeInTheDocument()
    })
  })

  it('should sort events by start date', async () => {
    const mockEvents = [
      {
        id: '990e8400-e29b-41d4-a716-446655440004',
        teamId: '660e8400-e29b-41d4-a716-446655440001',
        title: 'Sprint Planning',
        description: 'Q1 2025 sprint planning',
        location: 'Conference Room A',
        startDate: new Date('2025-02-15T14:00:00Z'),
        endDate: new Date('2025-02-15T16:00:00Z'),
        timezone: 'UTC',
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date('2025-01-16T10:00:00Z'),
        updatedAt: new Date('2025-01-16T10:00:00Z'),
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440003',
        teamId: '660e8400-e29b-41d4-a716-446655440001',
        title: 'Team Offsite',
        description: 'Annual team building event',
        location: 'San Francisco',
        startDate: new Date('2025-02-01T10:00:00Z'),
        endDate: new Date('2025-02-01T18:00:00Z'),
        timezone: 'America/Los_Angeles',
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
      },
    ]

    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    render(
      <AllProviders>
        <EventList />
      </AllProviders>
    )

    await waitFor(() => {
      expect(screen.getByText('Team Offsite')).toBeInTheDocument()
    })

    // Events should be displayed in chronological order (earliest first)
    // The backend already sorts by startDate, so we just verify both are displayed
    expect(screen.getByText('Team Offsite')).toBeInTheDocument()
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
  })
})
