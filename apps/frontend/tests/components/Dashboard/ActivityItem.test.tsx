import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'
import { BrowserRouter } from 'react-router-dom'
import { ActivityItem } from '../../../src/components/Dashboard/ActivityItem'
import { type Event } from '../../../../../backend/src/types/events'
import React from 'react'

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SpectrumProvider theme={defaultTheme}>
      <BrowserRouter>{children}</BrowserRouter>
    </SpectrumProvider>
  )
}

describe('ActivityItem', () => {
  const mockEvent: Event = {
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
  }

  it('should display event title', () => {
    render(
      <AllProviders>
        <ActivityItem event={mockEvent} />
      </AllProviders>
    )

    expect(screen.getByText('Team Offsite')).toBeInTheDocument()
  })

  it('should display event status', () => {
    render(
      <AllProviders>
        <ActivityItem event={mockEvent} />
      </AllProviders>
    )

    // Status badge should be present
    expect(screen.getByText(/upcoming/i)).toBeInTheDocument()
  })

  it('should display event start date', () => {
    render(
      <AllProviders>
        <ActivityItem event={mockEvent} />
      </AllProviders>
    )

    // Should show formatted date
    expect(screen.getByText(/Feb/i)).toBeInTheDocument()
    expect(screen.getByText(/2025/i)).toBeInTheDocument()
  })

  it('should display relative time for recent events', () => {
    const recentEvent: Event = {
      ...mockEvent,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    }

    render(
      <AllProviders>
        <ActivityItem event={recentEvent} />
      </AllProviders>
    )

    // Should show relative time like "2 hours ago"
    expect(screen.getByText(/ago/i)).toBeInTheDocument()
  })

  it('should link to event details page', () => {
    const { container } = render(
      <AllProviders>
        <ActivityItem event={mockEvent} />
      </AllProviders>
    )

    // Should have a link to the event details
    const link = container.querySelector(`a[href*="${mockEvent.id}"]`)
    expect(link).toBeInTheDocument()
  })

  it('should display event with completed status', () => {
    const completedEvent: Event = {
      ...mockEvent,
      status: 'completed',
    }

    render(
      <AllProviders>
        <ActivityItem event={completedEvent} />
      </AllProviders>
    )

    expect(screen.getByText('Team Offsite')).toBeInTheDocument()
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })

  it('should display event with in_progress status', () => {
    const inProgressEvent: Event = {
      ...mockEvent,
      status: 'in_progress',
    }

    render(
      <AllProviders>
        <ActivityItem event={inProgressEvent} />
      </AllProviders>
    )

    expect(screen.getByText('Team Offsite')).toBeInTheDocument()
    expect(screen.getByText(/in progress/i)).toBeInTheDocument()
  })

  it('should display event with cancelled status', () => {
    const cancelledEvent: Event = {
      ...mockEvent,
      status: 'cancelled',
    }

    render(
      <AllProviders>
        <ActivityItem event={cancelledEvent} />
      </AllProviders>
    )

    expect(screen.getByText('Team Offsite')).toBeInTheDocument()
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument()
  })

  it('should display event location if available', () => {
    render(
      <AllProviders>
        <ActivityItem event={mockEvent} />
      </AllProviders>
    )

    expect(screen.getByText(/San Francisco/i)).toBeInTheDocument()
  })

  it('should handle events with long titles gracefully', () => {
    const longTitleEvent: Event = {
      ...mockEvent,
      title: 'This is a very long event title that should be truncated or wrapped properly to maintain UI consistency',
    }

    render(
      <AllProviders>
        <ActivityItem event={longTitleEvent} />
      </AllProviders>
    )

    expect(screen.getByText(/This is a very long event title/i)).toBeInTheDocument()
  })

  it('should display compact layout', () => {
    const { container } = render(
      <AllProviders>
        <ActivityItem event={mockEvent} />
      </AllProviders>
    )

    // Activity item should have compact styling
    expect(container.querySelector('[data-layout="compact"]')).toBeInTheDocument()
  })

  it('should show hover effect', () => {
    const { container } = render(
      <AllProviders>
        <ActivityItem event={mockEvent} />
      </AllProviders>
    )

    // Should have interactive hover state
    const activityItem = container.querySelector('[data-component="activity-item"]')
    expect(activityItem).toBeInTheDocument()
  })

  it('should render status badge with correct variant', () => {
    const { container } = render(
      <AllProviders>
        <ActivityItem event={mockEvent} />
      </AllProviders>
    )

    // Status badge should be rendered with appropriate variant
    const statusBadge = container.querySelector('[data-status="upcoming"]')
    expect(statusBadge).toBeInTheDocument()
  })
})
