import { View, Flex, Heading, Button, Divider, ActionButton, Text } from '@adobe/react-spectrum'
import { EventList } from '../components/EventList'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Add from '@spectrum-icons/workflow/Add'
import LogOut from '@spectrum-icons/workflow/LogOut'

export function EventsPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <View padding="size-400" width="100%">
      <Flex direction="column" gap="size-300" width="100%">
        <Flex direction="row" justifyContent="space-between" alignItems="center">
          <Heading level={1}>Events</Heading>
          <Flex direction="row" gap="size-200" alignItems="center">
            {user && (
              <Text UNSAFE_style={{ marginRight: '1rem' }}>
                {user.email}
              </Text>
            )}
            <Button
              variant="cta"
              onPress={() => navigate('/events/new')}
            >
              <Add />
              <span>Create Event</span>
            </Button>
            <ActionButton onPress={handleLogout} aria-label="Logout">
              <LogOut />
              <Text>Logout</Text>
            </ActionButton>
          </Flex>
        </Flex>

        <Divider />

        <EventList />
      </Flex>
    </View>
  )
}
