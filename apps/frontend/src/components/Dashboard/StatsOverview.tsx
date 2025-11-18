import { Grid, View } from '@adobe/react-spectrum'
import { MetricsCard } from './MetricsCard'
import type { StatsOverviewProps } from '../../types/components'

export function StatsOverview({ metrics, isLoading }: StatsOverviewProps) {
  if (!metrics && !isLoading) {
    return null
  }

  const calculateTrend = (change: number | null): 'up' | 'down' | 'neutral' => {
    if (change === null) return 'neutral'
    if (change > 0) return 'up'
    if (change < 0) return 'down'
    return 'neutral'
  }

  return (
    <View data-layout="grid">
      <Grid
        columns={{ base: 1, M: 2, L: 4 }}
        gap="size-200"
        marginBottom="size-300"
      >
        <MetricsCard
          title="Total Events"
          value={metrics?.total ?? 0}
          percentageChange={metrics?.percentageChange.total ?? null}
          trend={calculateTrend(metrics?.percentageChange.total ?? null)}
          isLoading={isLoading}
          data-component="metrics-card"
        />
        <MetricsCard
          title="Upcoming Events"
          value={metrics?.upcoming ?? 0}
          percentageChange={metrics?.percentageChange.upcoming ?? null}
          trend={calculateTrend(metrics?.percentageChange.upcoming ?? null)}
          isLoading={isLoading}
          data-component="metrics-card"
        />
        <MetricsCard
          title="Completed Events"
          value={metrics?.completed ?? 0}
          percentageChange={metrics?.percentageChange.completed ?? null}
          trend={calculateTrend(metrics?.percentageChange.completed ?? null)}
          isLoading={isLoading}
          data-component="metrics-card"
        />
        <MetricsCard
          title="In Progress"
          value={metrics?.inProgress ?? 0}
          percentageChange={null}
          trend="neutral"
          isLoading={isLoading}
          data-component="metrics-card"
        />
      </Grid>
    </View>
  )
}
