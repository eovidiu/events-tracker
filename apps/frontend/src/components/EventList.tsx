import {
  View,
  Flex,
  Heading,
  Text,
  ProgressCircle,
  ListView,
  Item,
  Content,
  IllustratedMessage,
  ActionButton,
} from '@adobe/react-spectrum'
import { useNavigate } from 'react-router-dom'
import { useEvents, type Event } from '../hooks/useEvents'
import NotFound from '@spectrum-icons/illustrations/NotFound'
import Edit from '@spectrum-icons/workflow/Edit'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function EventItem({ event, onEdit, onView }: { event: Event; onEdit: (id: string) => void; onView: (id: string) => void }) {
  return (
    <View padding="size-200">
      <Flex direction="row" justifyContent="space-between" alignItems="start">
        <Flex direction="column" gap="size-100" flex={1}>
          <button
            onClick={() => onView(event.id)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
          >
            <Heading level={3} marginBottom="size-50">
              {event.title}
            </Heading>

            {event.description && (
              <Text marginBottom="size-50">{event.description}</Text>
            )}

            <Flex direction="row" gap="size-400">
              <Flex direction="column" gap="size-50">
                <Text>
                  <strong>Location:</strong> {event.location}
                </Text>
                <Text>
                  <strong>Timezone:</strong> {event.timezone}
                </Text>
              </Flex>

              <Flex direction="column" gap="size-50">
                <Text>
                  <strong>Starts:</strong> {formatDate(event.startDate)}
                </Text>
                <Text>
                  <strong>Ends:</strong> {formatDate(event.endDate)}
                </Text>
              </Flex>
            </Flex>
          </button>
        </Flex>

        <ActionButton onPress={() => onEdit(event.id)} aria-label="Edit event">
          <Edit />
          <Text>Edit</Text>
        </ActionButton>
      </Flex>
    </View>
  )
}

export function EventList() {
  const { data: events, isLoading, isError, error } = useEvents()
  const navigate = useNavigate()

  const handleEdit = (eventId: string) => {
    navigate(`/events/${eventId}/edit`)
  }

  const handleView = (eventId: string) => {
    navigate(`/events/${eventId}`)
  }

  if (isLoading) {
    return (
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        height="size-3000"
      >
        <ProgressCircle aria-label="Loading events" isIndeterminate />
        <Text marginTop="size-200">Loading events...</Text>
      </Flex>
    )
  }

  if (isError) {
    return (
      <View
        backgroundColor="negative"
        padding="size-400"
        borderRadius="medium"
        maxWidth="600px"
      >
        <Heading level={3}>Error loading events</Heading>
        <Text>
          {error instanceof Error ? error.message : 'Failed to fetch events'}
        </Text>
      </View>
    )
  }

  if (!events || events.length === 0) {
    return (
      <IllustratedMessage>
        <NotFound />
        <Heading>No events found</Heading>
        <Content>
          Create your first event to get started with tracking your team's schedule.
        </Content>
      </IllustratedMessage>
    )
  }

  return (
    <View width="100%">
      <ListView
        aria-label="Events list"
        items={events}
        selectionMode="none"
        width="100%"
      >
        {(event) => (
          <Item key={event.id} textValue={event.title}>
            <EventItem event={event} onEdit={handleEdit} onView={handleView} />
          </Item>
        )}
      </ListView>
    </View>
  )
}
