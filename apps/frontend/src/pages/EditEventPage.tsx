import { useParams, useNavigate } from 'react-router-dom'
import {
  View,
  Flex,
  Text,
  ProgressCircle,
  Button,
} from '@adobe/react-spectrum'
import { useEvent } from '../hooks/useEvents'
import { EventForm } from '../components/EventForm'

export function EditEventPage() {
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
          Back to Events
        </Button>
      </View>
    )
  }

  if (!event) {
    return (
      <View padding="size-400">
        <Text>Event not found</Text>
        <Button variant="secondary" onPress={() => navigate('/events')} marginTop="size-200">
          Back to Events
        </Button>
      </View>
    )
  }

  // T086: Use shared EventForm component with edit mode
  return (
    <View padding="size-400">
      <EventForm
        eventId={id}
        initialData={event}
        onSuccess={() => navigate(`/events/${id}`)}
      />
      <Flex direction="row" gap="size-200" marginTop="size-200">
        <Button
          variant="secondary"
          onPress={() => navigate('/events')}
        >
          Cancel
        </Button>
      </Flex>
    </View>
  )
}
