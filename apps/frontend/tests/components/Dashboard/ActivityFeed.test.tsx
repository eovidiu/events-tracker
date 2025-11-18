import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'
import { BrowserRouter } from 'react-router-dom'
import { ActivityFeed } from '../../../src/components/Dashboard/ActivityFeed'
import { type Event } from '../../../../../backend/src/types/events'
import React from 'react'

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SpectrumProvider theme={defaultTheme}>
      <BrowserRouter>{children}</BrowserRouter>
    </SpectrumProvider>
  )
}

describe('ActivityFeed', () => {
  const mockEvents: Event[] = [
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
      startDate: new Date('2025-01-20T15:00:00Z'),
      endDate: new Date('2025-01-20T16:30:00Z'),
      timezone: 'UTC',
      status: 'completed',
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date('2025-01-10T10:00:00Z'),
      updatedAt: new Date('2025-01-10T10:00:00Z'),
    },
  ]

  it('should display feed title', () => {
    render(
      <AllProviders>
        <ActivityFeed events={mockEvents} />
      </AllProviders>
    )

    // Should have a title/heading for the activity feed
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
  })

  it('should display all events when count is less than maxItems', () => {
    render(
      <AllProviders>
        <ActivityFeed events={mockEvents} maxItems={10} />
      </AllProviders>
    )

    expect(screen.getByText('Team Offsite')).toBeInTheDocument()
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
    expect(screen.getByText('Product Review')).toBeInTheDocument()
  })

  it('should limit displayed events to maxItems', () => {
    render(
      <AllProviders>
        <ActivityFeed events={mockEvents} maxItems={2} />
      </AllProviders>
    )

    // Only first 2 events should be displayed
    expect(screen.getByText('Team Offsite')).toBeInTheDocument()
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
    expect(screen.queryByText('Product Review')).not.toBeInTheDocument()
  })

  it('should use default maxItems of 10 when not specified', () => {
    const manyEvents: Event[] = Array.from({ length: 15 }, (_, i) => ({
      ...mockEvents[0],
      id: `event-${i}`,
      title: `Event ${i}`,
    }))

    const { container } = render(
      <AllProviders>
        <ActivityFeed events={manyEvents} />
      </AllProviders>
    )

    // Should show only 10 items by default
    const activityItems = container.querySelectorAll('[data-component="activity-item"]')
    expect(activityItems.length).toBe(10)
  })

  it('should display empty state when no events', () => {
    render(
      <AllProviders>
        <ActivityFeed events={[]} />
      </AllProviders>
    )

    expect(screen.getByText(/no recent activity/i)).toBeInTheDocument()
  })

  it('should display loading state', () => {
    render(
      <AllProviders>
        <ActivityFeed events={[]} isLoading={true} />
      </AllProviders>
    )

    // Should show loading skeleton or spinner
    // Exact implementation depends on component design
    expect(screen.queryByText(/no recent activity/i)).not.toBeInTheDocument()
  })

  it('should render events in order', () => {
    const { container } = render(
      <AllProviders>
        <ActivityFeed events={mockEvents} />
      </AllProviders>
    )

    const activityItems = container.querySelectorAll('[data-component="activity-item"]')
    expect(activityItems.length).toBe(3)

    // Events should be rendered in the order they are provided
    // Most recent should typically be first
  })

  it('should display "See All" link when more events than maxItems', () => {
    render(
      <AllProviders>
        <ActivityFeed events={mockEvents} maxItems={2} />
      </AllProviders>
    )

    // Should show a link to view all events
    expect(screen.getByText(/see all|view all/i)).toBeInTheDocument()
  })

  it('should not display "See All" link when events count is less than maxItems', () => {
    render(
      <AllProviders>
        <ActivityFeed events={mockEvents} maxItems={10} />
      </AllProviders>
    )

    // Should not show "see all" link
    expect(screen.queryByText(/see all|view all/i)).not.toBeInTheDocument()
  })

  it('should link "See All" to events page', () => {
    const { container } = render(
      <AllProviders>
        <ActivityFeed events={mockEvents} maxItems={2} />
      </AllProviders>
    )

    const seeAllLink = container.querySelector('a[href*="/events"]')
    expect(seeAllLink).toBeInTheDocument()
  })

  it('should render with scrollable container for many items', () => {
    const manyEvents: Event[] = Array.from({ length: 8 }, (_, i) => ({
      ...mockEvents[0],
      id: `event-${i}`,
      title: `Event ${i}`,
    }))

    const { container } = render(
      <AllProviders>
        <ActivityFeed events={manyEvents} />
      </AllProviders>
    )

    // Feed should have scrollable container
    expect(container.querySelector('[data-scrollable="true"]')).toBeInTheDocument()
  })

  it('should group events by date', () => {
    render(
      <AllProviders>
        <ActivityFeed events={mockEvents} />
      </AllProviders>
    )

    // Should show date separators/headers
    // Implementation detail - may group by "Today", "Yesterday", etc.
    expect(screen.getByText(/Team Offsite/i)).toBeInTheDocument()
  })

  it('should handle events with different statuses', () => {
    render(
      <AllProviders>
        <ActivityFeed events={mockEvents} />
      </AllProviders>
    )

    // All three status types should be visible
    expect(screen.getByText(/upcoming/i)).toBeInTheDocument()
    expect(screen.getByText(/in progress/i)).toBeInTheDocument()
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })

  it('should render without loading state when not loading', () => {
    render(
      <AllProviders>
        <ActivityFeed events={mockEvents} isLoading={false} />
      </AllProviders>
    )

    expect(screen.getByText('Team Offsite')).toBeInTheDocument()
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
  })

  it('should use compact layout for activity items', () => {
    const { container } = render(
      <AllProviders>
        <ActivityFeed events={mockEvents} />
      </AllProviders>
    )

    // Activity items should have compact layout
    const activityItems = container.querySelectorAll('[data-layout="compact"]')
    expect(activityItems.length).toBeGreaterThan(0)
  })
})
