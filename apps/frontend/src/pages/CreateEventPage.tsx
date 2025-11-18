import { View, Flex, Heading, Button, Divider } from '@adobe/react-spectrum'
import { EventForm } from '../components/EventForm'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ArrowLeft from '@spectrum-icons/workflow/ArrowLeft'

export function CreateEventPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // For MVP, we'll use a default team ID
  // In a real app, this would come from a team selector
  const defaultTeamId = '660e8400-e29b-41d4-a716-446655440001'

  const handleSuccess = () => {
    // Navigate back to events list on success
    navigate('/events')
  }

  return (
    <View padding="size-400" width="100%">
      <Flex direction="column" gap="size-300" width="100%" maxWidth="800px">
        <Flex direction="row" gap="size-200" alignItems="center">
          <Button variant="secondary" onPress={() => navigate('/events')}>
            <ArrowLeft />
            <span>Back</span>
          </Button>
          <Heading level={1}>Create New Event</Heading>
        </Flex>

        <Divider />

        {user ? (
          <EventForm teamId={defaultTeamId} onSuccess={handleSuccess} />
        ) : (
          <View>Please log in to create events</View>
        )}
      </Flex>
    </View>
  )
}
