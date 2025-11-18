import { useParams, useNavigate } from 'react-router-dom'
import {
  View,
  Flex,
  Heading,
  Text,
  Button,
  ProgressCircle,
  ActionButton,
} from '@adobe/react-spectrum'
import { useEvent } from '../hooks/useEvents'
import Edit from '@spectrum-icons/workflow/Edit'
import ArrowLeft from '@spectrum-icons/workflow/ArrowLeft'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(date))
}

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: event, isLoading, isError, error } = useEvent(id!)

  if (isLoading) {
    return (
      <Flex direction="column" alignItems="center" gap="size-200" marginTop="size-400">
        <ProgressCircle isIndeterminate />
        <Text>Loading event...</Text>
      </Flex>
    )
  }

  if (isError) {
    return (
      <View padding="size-400">
        <View backgroundColor="negative" padding="size-200" borderRadius="medium">
          <Text>Error loading event: {error instanceof Error ? error.message : 'Unknown error'}</Text>
        </View>
        <Button variant="secondary" onPress={() => navigate('/events')} marginTop="size-200">
          <ArrowLeft />
          <Text>Back to Events</Text>
        </Button>
      </View>
    )
  }

  if (!event) {
    return (
      <View padding="size-400">
        <Text>Event not found</Text>
        <Button variant="secondary" onPress={() => navigate('/events')} marginTop="size-200">
          <ArrowLeft />
          <Text>Back to Events</Text>
        </Button>
      </View>
    )
  }

  return (
    <View padding="size-400">
      <Flex direction="column" gap="size-400" maxWidth="800px">
        {/* Header with navigation and actions */}
        <Flex direction="row" justifyContent="space-between" alignItems="center">
          <Button variant="secondary" onPress={() => navigate('/events')}>
            <ArrowLeft />
            <Text>Back to Events</Text>
          </Button>
          <ActionButton onPress={() => navigate(`/events/${id}/edit`)}>
            <Edit />
            <Text>Edit Event</Text>
          </ActionButton>
        </Flex>

        {/* Event title */}
        <Heading level={1}>{event.title}</Heading>

        {/* Event description */}
        {event.description && (
          <View>
            <Heading level={3} marginBottom="size-100">Description</Heading>
            <Text>{event.description}</Text>
          </View>
        )}

        {/* Event details grid */}
        <Flex direction="column" gap="size-300">
          <View>
            <Heading level={3} marginBottom="size-100">Details</Heading>
            <Flex direction="column" gap="size-200">
              <Flex direction="row" gap="size-100">
                <Text><strong>Location:</strong></Text>
                <Text>{event.location}</Text>
              </Flex>
              <Flex direction="row" gap="size-100">
                <Text><strong>Timezone:</strong></Text>
                <Text>{event.timezone}</Text>
              </Flex>
            </Flex>
          </View>

          <View>
            <Heading level={3} marginBottom="size-100">Schedule</Heading>
            <Flex direction="column" gap="size-200">
              <View>
                <Text><strong>Starts:</strong></Text>
                <Text>{formatDate(event.startDate)}</Text>
              </View>
              <View>
                <Text><strong>Ends:</strong></Text>
                <Text>{formatDate(event.endDate)}</Text>
              </View>
            </Flex>
          </View>
        </Flex>

        {/* Metadata */}
        <View borderTopWidth="thin" borderTopColor="gray-300" paddingTop="size-300">
          <Heading level={4} marginBottom="size-100">Event Information</Heading>
          <Flex direction="column" gap="size-100">
            <Text UNSAFE_style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)' }}>
              Created: {formatDate(event.createdAt)}
            </Text>
            <Text UNSAFE_style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)' }}>
              Last updated: {formatDate(event.updatedAt)}
            </Text>
          </Flex>
        </View>
      </Flex>
    </View>
  )
}
