import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { EventsPage } from './pages/EventsPage'
import { CreateEventPage } from './pages/CreateEventPage'
import { EditEventPage } from './pages/EditEventPage'
import { EventDetailsPage } from './pages/EventDetailsPage'
import { LoginPage } from './pages/LoginPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function AppContent() {
  const { checkSession, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Events Tracker</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/events" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/events"
        element={isAuthenticated ? <EventsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/events/new"
        element={isAuthenticated ? <CreateEventPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/events/:id"
        element={isAuthenticated ? <EventDetailsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/events/:id/edit"
        element={isAuthenticated ? <EditEventPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default function App() {
  return (
    <SpectrumProvider theme={defaultTheme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </SpectrumProvider>
  )
}
