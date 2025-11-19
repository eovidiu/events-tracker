import { View, Heading, Text, ProgressCircle } from '@adobe/react-spectrum'
import { useEvents } from '../hooks/useEvents'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { StatsOverview } from '../components/Dashboard/StatsOverview'
import { ActivityFeed } from '../components/Dashboard/ActivityFeed'

export function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading, isError: metricsError, error: metricsErrorDetails } = useDashboardMetrics()
  const { data: events = [], isLoading: eventsLoading, isError: eventsError, error: eventsErrorDetails } = useEvents()

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

  if (metricsError || eventsError) {
    return (
      <View padding="size-400">
        <Heading level={1}>Dashboard</Heading>
        <View marginTop="size-400">
          <Text>Error loading dashboard data</Text>
          {(metricsErrorDetails || eventsErrorDetails) && (
            <Text marginTop="size-100">{((metricsErrorDetails || eventsErrorDetails) as Error).message}</Text>
          )}
        </View>
      </View>
    )
  }

  // Sort events by most recent first (by updatedAt)
  // Debug: Check what events actually is
  console.log('Events data:', events, 'Type:', typeof events, 'IsArray:', Array.isArray(events))

  const eventsArray = Array.isArray(events) ? events : []
  const sortedEvents = [...eventsArray].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <View padding="size-400">
      <Heading level={1}>Dashboard</Heading>

      {/* Stats Overview - Full Width */}
      <View marginTop="size-400">
        <StatsOverview metrics={metrics ?? null} isLoading={metricsLoading} />
      </View>

      {/* Activity Feed - Below Stats */}
      <View marginTop="size-400">
        <ActivityFeed events={sortedEvents} maxItems={10} isLoading={eventsLoading} />
      </View>
    </View>
  )
}
