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

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Debug: Monitor error state changes
  useEffect(() => {
    console.log('Error state changed in useEffect:', error)
  }, [error])

  const handleLogin = async () => {
    const emailValue = email
    if (!emailValue) {
      setError('Please enter an email address')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await login(emailValue)
      // Don't navigate here - let the useEffect handle it
      setIsLoading(false)
    } catch (err: any) {
      console.error('Login error:', err)
      // Handle ApiError which has error message in data.error
      const errorMessage = err?.data?.error || err?.message || 'Login failed'
      console.log('Setting error message:', errorMessage)

      // Set error state
      setIsLoading(false)
      setEmail(emailValue)

      // Force error to display by manipulating DOM directly as a workaround
      const errorDiv = document.getElementById('login-error')
      if (errorDiv) {
        errorDiv.style.display = 'block'
        errorDiv.textContent = errorMessage
      }

      setError(errorMessage)
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
        <Flex direction="column" gap="size-300">
          <Heading level={1}>Events Tracker</Heading>
          <Text>Please login to continue</Text>

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value)
              // Clear error when user starts typing
              if (error) {
                setError(null)
              }
            }}
            isRequired
            autoFocus
            width="100%"
            placeholder="Enter your email"
            onKeyDown={(e) => {
              // Allow login on Enter key
              if (e.key === 'Enter' && email) {
                handleLogin()
              }
            }}
          />

          <div
            id="login-error"
            style={{
              backgroundColor: 'red',
              color: 'white',
              padding: '10px',
              borderRadius: '4px',
              marginTop: '10px',
              display: error ? 'block' : 'none'
            }}>
            {error || ''}
          </div>
          {console.log('Render - error state:', error)}

          <Button
            variant="cta"
            isDisabled={isLoading || !email}
            width="100%"
            onPress={handleLogin}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <View marginTop="size-200">
            <Text UNSAFE_style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)' }}>
              Test accounts: alice@example.com, bob@example.com
            </Text>
          </View>
        </Flex>
      </View>
    </Flex>
  )
}
