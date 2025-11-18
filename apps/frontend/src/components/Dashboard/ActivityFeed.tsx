import { View, Heading, Text, Link as SpectrumLink, ProgressCircle } from '@adobe/react-spectrum'
import { Link as RouterLink } from 'react-router-dom'
import { ActivityItem } from './ActivityItem'
import type { ActivityFeedProps } from '../../types/components'

export function ActivityFeed({ events, maxItems = 10, isLoading }: ActivityFeedProps) {
  const displayedEvents = events.slice(0, maxItems)
  const hasMore = events.length > maxItems

  if (isLoading) {
    return (
      <View
        padding="size-200"
        borderWidth="thin"
        borderColor="default"
        borderRadius="medium"
        backgroundColor="gray-50"
      >
        <Heading level={3}>Recent Activity</Heading>
        <View marginTop="size-200">
          <ProgressCircle aria-label="Loading" isIndeterminate />
        </View>
      </View>
    )
  }

  if (events.length === 0) {
    return (
      <View
        padding="size-200"
        borderWidth="thin"
        borderColor="default"
        borderRadius="medium"
        backgroundColor="gray-50"
      >
        <Heading level={3}>Recent Activity</Heading>
        <View marginTop="size-200">
          <Text>No recent activity</Text>
        </View>
      </View>
    )
  }

  return (
    <View
      padding="size-200"
      borderWidth="thin"
      borderColor="default"
      borderRadius="medium"
      backgroundColor="gray-50"
    >
      <Heading level={3}>Recent Activity</Heading>
      <View
        marginTop="size-200"
        UNSAFE_style={{ maxHeight: '600px', overflowY: 'auto' }}
        data-scrollable="true"
      >
        {displayedEvents.map(event => (
          <ActivityItem key={event.id} event={event} />
        ))}
      </View>
      {hasMore && (
        <View marginTop="size-200" UNSAFE_style={{ textAlign: 'center' }}>
          <RouterLink to="/events" style={{ textDecoration: 'none' }}>
            <SpectrumLink>View All Events</SpectrumLink>
          </RouterLink>
        </View>
      )}
    </View>
  )
}
