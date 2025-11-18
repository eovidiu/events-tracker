import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardMetrics } from '../../src/hooks/useDashboardMetrics'
import { api } from '../../src/services/api'
import { type ReactNode } from 'react'

// Mock the API module
vi.mock('../../src/services/api')

describe('useDashboardMetrics', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const mockEvents = [
    {
      id: '1',
      teamId: 'team-1',
      title: 'Event 1',
      description: 'Description 1',
      location: 'Location 1',
      startDate: new Date('2025-02-01T10:00:00Z'),
      endDate: new Date('2025-02-01T12:00:00Z'),
      timezone: 'UTC',
      status: 'upcoming' as const,
      createdBy: 'user-1',
      createdAt: new Date('2025-01-15T10:00:00Z'),
      updatedAt: new Date('2025-01-15T10:00:00Z'),
    },
    {
      id: '2',
      teamId: 'team-1',
      title: 'Event 2',
      description: 'Description 2',
      location: 'Location 2',
      startDate: new Date('2025-02-15T10:00:00Z'),
      endDate: new Date('2025-02-15T12:00:00Z'),
      timezone: 'UTC',
      status: 'in_progress' as const,
      createdBy: 'user-1',
      createdAt: new Date('2025-01-16T10:00:00Z'),
      updatedAt: new Date('2025-01-16T10:00:00Z'),
    },
    {
      id: '3',
      teamId: 'team-1',
      title: 'Event 3',
      description: 'Description 3',
      location: 'Location 3',
      startDate: new Date('2025-01-10T10:00:00Z'),
      endDate: new Date('2025-01-10T12:00:00Z'),
      timezone: 'UTC',
      status: 'completed' as const,
      createdBy: 'user-1',
      createdAt: new Date('2025-01-05T10:00:00Z'),
      updatedAt: new Date('2025-01-05T10:00:00Z'),
    },
  ]

  it('should calculate total events correctly', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.total).toBe(3)
  })

  it('should calculate upcoming events correctly', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.upcoming).toBe(1)
  })

  it('should calculate completed events correctly', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.completed).toBe(1)
  })

  it('should calculate in-progress events correctly', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.inProgress).toBe(1)
  })

  it('should handle empty events array', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: [] })

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      total: 0,
      upcoming: 0,
      completed: 0,
      inProgress: 0,
      percentageChange: {
        total: null,
        upcoming: null,
        completed: null,
      },
    })
  })

  it('should handle API errors', async () => {
    const mockError = new Error('Failed to fetch events')
    vi.mocked(api.get).mockRejectedValue(mockError)

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(mockError)
  })

  it('should calculate percentage changes when available', async () => {
    // Mock implementation would need historical data
    // For now, test that percentageChange is null when no historical data
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.percentageChange).toEqual({
      total: null,
      upcoming: null,
      completed: null,
    })
  })

  it('should handle cancelled events', async () => {
    const eventsWithCancelled = [
      ...mockEvents,
      {
        id: '4',
        teamId: 'team-1',
        title: 'Event 4',
        description: 'Description 4',
        location: 'Location 4',
        startDate: new Date('2025-03-01T10:00:00Z'),
        endDate: new Date('2025-03-01T12:00:00Z'),
        timezone: 'UTC',
        status: 'cancelled' as const,
        createdBy: 'user-1',
        createdAt: new Date('2025-01-20T10:00:00Z'),
        updatedAt: new Date('2025-01-20T10:00:00Z'),
      },
    ]

    vi.mocked(api.get).mockResolvedValue({ events: eventsWithCancelled })

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Total should include cancelled events
    expect(result.current.data?.total).toBe(4)
    // Cancelled events don't count in status-specific metrics
    expect(result.current.data?.upcoming).toBe(1)
    expect(result.current.data?.completed).toBe(1)
    expect(result.current.data?.inProgress).toBe(1)
  })

  it('should handle all events with same status', async () => {
    const allUpcoming = mockEvents.map(event => ({
      ...event,
      status: 'upcoming' as const,
    }))

    vi.mocked(api.get).mockResolvedValue({ events: allUpcoming })

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.total).toBe(3)
    expect(result.current.data?.upcoming).toBe(3)
    expect(result.current.data?.completed).toBe(0)
    expect(result.current.data?.inProgress).toBe(0)
  })

  it('should use events query key', async () => {
    vi.mocked(api.get).mockResolvedValue({ events: mockEvents })

    renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/events')
    })
  })

  it('should return loading state initially', () => {
    vi.mocked(api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should handle large numbers of events', async () => {
    const manyEvents = Array.from({ length: 1000 }, (_, i) => ({
      ...mockEvents[0],
      id: `event-${i}`,
      status: (i % 3 === 0 ? 'upcoming' : i % 3 === 1 ? 'in_progress' : 'completed') as const,
    }))

    vi.mocked(api.get).mockResolvedValue({ events: manyEvents })

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.total).toBe(1000)
    // Approximately 333-334 each due to modulo distribution
    expect(result.current.data?.upcoming).toBeGreaterThan(300)
    expect(result.current.data?.completed).toBeGreaterThan(300)
    expect(result.current.data?.inProgress).toBeGreaterThan(300)
  })
})
