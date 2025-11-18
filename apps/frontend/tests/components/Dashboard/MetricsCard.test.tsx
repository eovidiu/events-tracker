import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'
import { MetricsCard } from '../../../src/components/Dashboard/MetricsCard'
import React from 'react'

const SpectrumWrapper = ({ children }: { children: React.ReactNode }) => {
  return <SpectrumProvider theme={defaultTheme}>{children}</SpectrumProvider>
}

describe('MetricsCard', () => {
  it('should display title and value', () => {
    render(
      <SpectrumWrapper>
        <MetricsCard title="Total Events" value={42} percentageChange={null} trend="neutral" />
      </SpectrumWrapper>
    )

    expect(screen.getByText('Total Events')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should display positive percentage change with up trend', () => {
    render(
      <SpectrumWrapper>
        <MetricsCard title="Upcoming Events" value={12} percentageChange={15.5} trend="up" />
      </SpectrumWrapper>
    )

    expect(screen.getByText('Upcoming Events')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText(/15\.5%/i)).toBeInTheDocument()
  })

  it('should display negative percentage change with down trend', () => {
    render(
      <SpectrumWrapper>
        <MetricsCard title="In Progress" value={5} percentageChange={-8.2} trend="down" />
      </SpectrumWrapper>
    )

    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText(/-8\.2%/i)).toBeInTheDocument()
  })

  it('should not display percentage change when null', () => {
    render(
      <SpectrumWrapper>
        <MetricsCard title="Completed Events" value={28} percentageChange={null} trend="neutral" />
      </SpectrumWrapper>
    )

    expect(screen.getByText('Completed Events')).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
    expect(screen.queryByText(/%/i)).not.toBeInTheDocument()
  })

  it('should display loading state', () => {
    render(
      <SpectrumWrapper>
        <MetricsCard
          title="Total Events"
          value={0}
          percentageChange={null}
          trend="neutral"
          isLoading={true}
        />
      </SpectrumWrapper>
    )

    expect(screen.getByText('Total Events')).toBeInTheDocument()
    // Loading skeleton should be present instead of value
    const valueElement = screen.queryByText('0')
    expect(valueElement).not.toBeInTheDocument()
  })

  it('should display custom icon when provided', () => {
    const CustomIcon = () => <span data-testid="custom-icon">📊</span>

    render(
      <SpectrumWrapper>
        <MetricsCard
          title="Analytics"
          value={100}
          percentageChange={null}
          trend="neutral"
          icon={<CustomIcon />}
        />
      </SpectrumWrapper>
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('should render with up trend styling', () => {
    const { container } = render(
      <SpectrumWrapper>
        <MetricsCard
          title="Growing Metric"
          value={75}
          percentageChange={20}
          trend="up"
        />
      </SpectrumWrapper>
    )

    // Verify trend indicator is rendered (specific styling will be in implementation)
    expect(container.querySelector('[data-trend="up"]')).toBeInTheDocument()
  })

  it('should render with down trend styling', () => {
    const { container } = render(
      <SpectrumWrapper>
        <MetricsCard
          title="Declining Metric"
          value={30}
          percentageChange={-10}
          trend="down"
        />
      </SpectrumWrapper>
    )

    // Verify trend indicator is rendered (specific styling will be in implementation)
    expect(container.querySelector('[data-trend="down"]')).toBeInTheDocument()
  })

  it('should render with neutral trend styling', () => {
    const { container } = render(
      <SpectrumWrapper>
        <MetricsCard
          title="Stable Metric"
          value={50}
          percentageChange={0}
          trend="neutral"
        />
      </SpectrumWrapper>
    )

    // Verify neutral trend (no trend indicator or neutral styling)
    expect(container.querySelector('[data-trend="neutral"]')).toBeInTheDocument()
  })

  it('should format large numbers correctly', () => {
    render(
      <SpectrumWrapper>
        <MetricsCard
          title="Total Events"
          value={1234}
          percentageChange={null}
          trend="neutral"
        />
      </SpectrumWrapper>
    )

    // Should display the full number (formatting is implementation detail)
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('should handle zero value', () => {
    render(
      <SpectrumWrapper>
        <MetricsCard
          title="No Events"
          value={0}
          percentageChange={null}
          trend="neutral"
        />
      </SpectrumWrapper>
    )

    expect(screen.getByText('No Events')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should handle zero percentage change', () => {
    render(
      <SpectrumWrapper>
        <MetricsCard
          title="Unchanged"
          value={50}
          percentageChange={0}
          trend="neutral"
        />
      </SpectrumWrapper>
    )

    expect(screen.getByText('Unchanged')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText(/0%/i)).toBeInTheDocument()
  })
})
