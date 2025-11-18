import { View, Heading, Text, ProgressCircle } from '@adobe/react-spectrum'
import { useEvents } from '../hooks/useEvents'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { StatsOverview } from '../components/Dashboard/StatsOverview'
import { ActivityFeed } from '../components/Dashboard/ActivityFeed'

export function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading, isError: metricsError, error: metricsErrorDetails } = useDashboardMetrics()
  const { data: events = [], isLoading: eventsLoading } = useEvents()

  if (metricsLoading || eventsLoading) {
    return (
      <View padding="size-400">
        <Heading level={1}>Dashboard</Heading>
        <View marginTop="size-400">
          <Text>Loading...</Text>
          <ProgressCircle aria-label="Loading" isIndeterminate marginTop="size-200" />
        </View>
      </View>
    )
  }

  if (metricsError) {
    return (
      <View padding="size-400">
        <Heading level={1}>Dashboard</Heading>
        <View marginTop="size-400">
          <Text>Error loading dashboard data</Text>
          {metricsErrorDetails && (
            <Text marginTop="size-100">{(metricsErrorDetails as Error).message}</Text>
          )}
        </View>
      </View>
    )
  }

  // Sort events by most recent first (by updatedAt)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <View padding="size-400">
      <Heading level={1}>Dashboard</Heading>

      <View
        marginTop="size-400"
        data-layout="two-column"
        UNSAFE_style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}
      >
        {/* Left Column - Stats Overview */}
        <View data-column="left">
          <StatsOverview metrics={metrics ?? null} isLoading={metricsLoading} />
        </View>

        {/* Right Column - Activity Feed */}
        <View data-column="right">
          <ActivityFeed events={sortedEvents} maxItems={10} isLoading={eventsLoading} />
        </View>
      </View>
    </View>
  )
}
