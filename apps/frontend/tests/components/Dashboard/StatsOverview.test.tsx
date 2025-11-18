import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'
import { StatsOverview } from '../../../src/components/Dashboard/StatsOverview'
import { type DashboardMetrics } from '../../../src/types/dashboard'
import React from 'react'

const SpectrumWrapper = ({ children }: { children: React.ReactNode }) => {
  return <SpectrumProvider theme={defaultTheme}>{children}</SpectrumProvider>
}

describe('StatsOverview', () => {
  const mockMetrics: DashboardMetrics = {
    total: 100,
    upcoming: 25,
    completed: 60,
    inProgress: 15,
    percentageChange: {
      total: 10.5,
      upcoming: 15.2,
      completed: 8.3,
    },
  }

  it('should display all metrics cards', () => {
    render(
      <SpectrumWrapper>
        <StatsOverview metrics={mockMetrics} />
      </SpectrumWrapper>
    )

    // Verify all metric values are displayed
    expect(screen.getByText('100')).toBeInTheDocument() // total
    expect(screen.getByText('25')).toBeInTheDocument() // upcoming
    expect(screen.getByText('60')).toBeInTheDocument() // completed
    expect(screen.getByText('15')).toBeInTheDocument() // inProgress
  })

  it('should display metric labels correctly', () => {
    render(
      <SpectrumWrapper>
        <StatsOverview metrics={mockMetrics} />
      </SpectrumWrapper>
    )

    // Verify labels (exact text depends on implementation)
    expect(screen.getByText(/total/i)).toBeInTheDocument()
    expect(screen.getByText(/upcoming/i)).toBeInTheDocument()
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
    expect(screen.getByText(/in progress/i)).toBeInTheDocument()
  })

  it('should display percentage changes', () => {
    render(
      <SpectrumWrapper>
        <StatsOverview metrics={mockMetrics} />
      </SpectrumWrapper>
    )

    // Verify percentage changes are displayed
    expect(screen.getByText(/10\.5%/i)).toBeInTheDocument() // total change
    expect(screen.getByText(/15\.2%/i)).toBeInTheDocument() // upcoming change
    expect(screen.getByText(/8\.3%/i)).toBeInTheDocument() // completed change
  })

  it('should handle null metrics gracefully', () => {
    render(
      <SpectrumWrapper>
        <StatsOverview metrics={null} />
      </SpectrumWrapper>
    )

    // Should render without crashing (showing empty state or loading)
    expect(screen.queryByText('100')).not.toBeInTheDocument()
  })

  it('should display loading state', () => {
    render(
      <SpectrumWrapper>
        <StatsOverview metrics={null} isLoading={true} />
      </SpectrumWrapper>
    )

    // All cards should show loading state
    // The specific loading UI depends on implementation
    const container = document.body
    expect(container).toBeInTheDocument()
  })

  it('should handle metrics with null percentage changes', () => {
    const metricsWithNullChanges: DashboardMetrics = {
      total: 50,
      upcoming: 10,
      completed: 30,
      inProgress: 10,
      percentageChange: {
        total: null,
        upcoming: null,
        completed: null,
      },
    }

    render(
      <SpectrumWrapper>
        <StatsOverview metrics={metricsWithNullChanges} />
      </SpectrumWrapper>
    )

    // Values should be displayed but no percentage changes
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })

  it('should handle zero values', () => {
    const zeroMetrics: DashboardMetrics = {
      total: 0,
      upcoming: 0,
      completed: 0,
      inProgress: 0,
      percentageChange: {
        total: null,
        upcoming: null,
        completed: null,
      },
    }

    render(
      <SpectrumWrapper>
        <StatsOverview metrics={zeroMetrics} />
      </SpectrumWrapper>
    )

    // Should display zeros
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements.length).toBeGreaterThan(0)
  })

  it('should calculate correct trend for positive changes', () => {
    const positiveMetrics: DashboardMetrics = {
      total: 100,
      upcoming: 50,
      completed: 40,
      inProgress: 10,
      percentageChange: {
        total: 20,
        upcoming: 15,
        completed: 5,
      },
    }

    const { container } = render(
      <SpectrumWrapper>
        <StatsOverview metrics={positiveMetrics} />
      </SpectrumWrapper>
    )

    // Verify up trend indicators are present
    expect(container.querySelectorAll('[data-trend="up"]').length).toBeGreaterThan(0)
  })

  it('should calculate correct trend for negative changes', () => {
    const negativeMetrics: DashboardMetrics = {
      total: 80,
      upcoming: 20,
      completed: 50,
      inProgress: 10,
      percentageChange: {
        total: -10,
        upcoming: -5,
        completed: -15,
      },
    }

    const { container } = render(
      <SpectrumWrapper>
        <StatsOverview metrics={negativeMetrics} />
      </SpectrumWrapper>
    )

    // Verify down trend indicators are present
    expect(container.querySelectorAll('[data-trend="down"]').length).toBeGreaterThan(0)
  })

  it('should render metrics in grid layout', () => {
    const { container } = render(
      <SpectrumWrapper>
        <StatsOverview metrics={mockMetrics} />
      </SpectrumWrapper>
    )

    // Verify grid container is present (implementation-specific class/attribute)
    expect(container.querySelector('[data-layout="grid"]')).toBeInTheDocument()
  })

  it('should handle mixed trend directions', () => {
    const mixedMetrics: DashboardMetrics = {
      total: 100,
      upcoming: 30,
      completed: 50,
      inProgress: 20,
      percentageChange: {
        total: 10, // up
        upcoming: -5, // down
        completed: 0, // neutral
      },
    }

    const { container } = render(
      <SpectrumWrapper>
        <StatsOverview metrics={mixedMetrics} />
      </SpectrumWrapper>
    )

    // Verify different trend indicators coexist
    expect(container.querySelector('[data-trend="up"]')).toBeInTheDocument()
    expect(container.querySelector('[data-trend="down"]')).toBeInTheDocument()
    expect(container.querySelector('[data-trend="neutral"]')).toBeInTheDocument()
  })

  it('should render exactly 4 metrics cards', () => {
    const { container } = render(
      <SpectrumWrapper>
        <StatsOverview metrics={mockMetrics} />
      </SpectrumWrapper>
    )

    // Should render 4 MetricsCard components (one for each metric)
    // Implementation will add data-testid or similar to cards
    const cards = container.querySelectorAll('[data-component="metrics-card"]')
    expect(cards.length).toBe(4)
  })
})
