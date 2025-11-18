// T127: 404 Not Found page
import { View, Flex, Heading, Text, Button } from '@adobe/react-spectrum'
import { useNavigate } from 'react-router-dom'
import AlertIcon from '@spectrum-icons/workflow/Alert'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <View padding="size-400" height="100vh">
      <Flex
        direction="column"
        gap="size-300"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <AlertIcon size="XXL" />
        <Heading level={1}>404 - Page Not Found</Heading>
        <Text>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Text>

        <Flex direction="row" gap="size-200" marginTop="size-200">
          <Button variant="cta" onPress={() => navigate('/events')}>
            Go to Events
          </Button>
          <Button variant="secondary" onPress={() => navigate(-1)}>
            Go Back
          </Button>
        </Flex>
      </Flex>
    </View>
  )
}
