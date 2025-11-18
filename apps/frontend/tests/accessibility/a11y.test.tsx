// T128: Accessibility tests using axe-core
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'
import { BrowserRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'vitest-axe'
import { LoginPage } from '../../src/pages/LoginPage'
import { NotFoundPage } from '../../src/pages/NotFoundPage'
import { EventsPage } from '../../src/pages/EventsPage'

expect.extend(toHaveNoViolations)

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <SpectrumProvider theme={defaultTheme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </QueryClientProvider>
    </SpectrumProvider>
  )
}

describe('Accessibility Tests (T128)', () => {
  it('LoginPage should have no accessibility violations', async () => {
    const { container } = renderWithProviders(<LoginPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('NotFoundPage should have no accessibility violations', async () => {
    const { container } = renderWithProviders(<NotFoundPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('EventsPage should have no accessibility violations', async () => {
    // Mock useEvents hook
    const mockUseEvents = () => ({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })

    const mockUseAuth = () => ({
      user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
      logout: () => {},
    })

    // Mock the hooks before rendering
    const useEventsModule = await import('../../src/hooks/useEvents')
    const useAuthModule = await import('../../src/hooks/useAuth')

    vi.spyOn(useEventsModule, 'useEvents').mockImplementation(mockUseEvents as any)
    vi.spyOn(useAuthModule, 'useAuth').mockImplementation(mockUseAuth as any)

    const { container } = renderWithProviders(<EventsPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
