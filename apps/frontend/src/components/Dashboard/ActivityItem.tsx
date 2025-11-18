import { View, Text, Link } from '@adobe/react-spectrum'
import { Link as RouterLink } from 'react-router-dom'
import { StatusBadge } from '../Events/StatusBadge'
import type { ActivityItemProps } from '../../types/components'
import { formatDistanceToNow, format } from 'date-fns'

export function ActivityItem({ event }: ActivityItemProps) {
  const relativeTime = formatDistanceToNow(new Date(event.updatedAt), { addSuffix: true })
  const formattedDate = format(new Date(event.startDate), 'MMM d, yyyy')

  return (
    <View
      padding="size-150"
      borderBottomWidth="thin"
      borderBottomColor="gray-300"
      data-component="activity-item"
      data-layout="compact"
      UNSAFE_style={{ cursor: 'pointer' }}
    >
      <RouterLink to={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <View>
          <View UNSAFE_style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <Text>
              <strong>{event.title}</strong>
            </Text>
            <StatusBadge status={event.status} />
          </View>
          <View UNSAFE_style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', color: '#666' }}>
            <Text>{formattedDate}</Text>
            {event.location && (
              <>
                <Text>•</Text>
                <Text>{event.location}</Text>
              </>
            )}
          </View>
          <Text UNSAFE_style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
            {relativeTime}
          </Text>
        </View>
      </RouterLink>
    </View>
  )
}
