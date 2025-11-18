// T126: Error Boundary component for catching React errors
import { Component, ReactNode } from 'react'
import { View, Flex, Heading, Text, Button } from '@adobe/react-spectrum'
import AlertIcon from '@spectrum-icons/workflow/Alert'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo)

    // In production, you would send this to your error tracking service
    // e.g., Sentry, LogRocket, etc.
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <View padding="size-400" height="100vh">
          <Flex
            direction="column"
            gap="size-300"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <AlertIcon size="XXL" UNSAFE_style={{ color: 'var(--spectrum-global-color-red-600)' }} />
            <Heading level={1}>Something went wrong</Heading>
            <Text>
              We&apos;re sorry, but something unexpected happened. The error has been logged and we&apos;ll look into it.
            </Text>

            {this.state.error && (
              <View
                backgroundColor="gray-100"
                padding="size-200"
                borderRadius="medium"
                width="size-6000"
                UNSAFE_style={{
                  border: '1px solid var(--spectrum-global-color-gray-400)',
                  overflow: 'auto',
                }}
              >
                <Text UNSAFE_style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                  <strong>Error:</strong> {this.state.error.message}
                </Text>
                {this.state.errorInfo && (
                  <Text UNSAFE_style={{ fontFamily: 'monospace', fontSize: '10px', marginTop: '8px' }}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <Flex direction="row" gap="size-200" marginTop="size-200">
              <Button variant="cta" onPress={this.handleReload}>
                Reload Page
              </Button>
              <Button variant="secondary" onPress={this.handleReset}>
                Try Again
              </Button>
            </Flex>
          </Flex>
        </View>
      )
    }

    return this.props.children
  }
}
