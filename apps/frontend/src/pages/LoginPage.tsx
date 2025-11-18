import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  View,
  Flex,
  Heading,
  TextField,
  Button,
  Text,
} from '@adobe/react-spectrum'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect to events if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/events', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email)
      // Don't navigate here - let the useEffect handle it
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setIsLoading(false)
    }
  }

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap="size-200"
    >
      <View
        backgroundColor="gray-100"
        padding="size-600"
        borderRadius="medium"
        width="size-4600"
        maxWidth="90%"
      >
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="size-300">
            <Heading level={1}>Events Tracker</Heading>
            <Text>Please login to continue</Text>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              isRequired
              autoFocus
              width="100%"
              placeholder="Enter your email"
            />

            {error && (
              <View backgroundColor="negative" padding="size-200" borderRadius="medium">
                <Text>{error}</Text>
              </View>
            )}

            <Button
              type="submit"
              variant="cta"
              isDisabled={isLoading || !email}
              width="100%"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <View marginTop="size-200">
              <Text UNSAFE_style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)' }}>
                Test accounts: alice@example.com, bob@example.com
              </Text>
            </View>
          </Flex>
        </form>
      </View>
    </Flex>
  )
}
