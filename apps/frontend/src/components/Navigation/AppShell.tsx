// AppShell Layout Component
import type { ReactNode } from 'react'
import { View, Flex, Button, Heading, ActionButton } from '@adobe/react-spectrum'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LogOut from '@spectrum-icons/workflow/LogOut'
import Home from '@spectrum-icons/workflow/Home'
import Calendar from '@spectrum-icons/workflow/Calendar'

export interface AppShellProps {
  children: ReactNode
}

/**
 * AppShell - Layout wrapper component for all pages
 * Provides consistent navigation and page structure
 */
export function AppShell({ children }: AppShellProps) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <Flex direction="column" minHeight="100vh">
      {/* Header */}
      <View
        backgroundColor="gray-100"
        padding="size-200"
        borderBottomWidth="thin"
        borderBottomColor="gray-400"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Flex gap="size-400" alignItems="center">
            <Heading level={3} margin="0">Events Tracker</Heading>

            {/* Navigation Links */}
            <Flex gap="size-200">
              <ActionButton
                isQuiet
                onPress={() => navigate('/dashboard')}
                isEmphasized={isActive('/dashboard')}
              >
                <Home />
                <span>Dashboard</span>
              </ActionButton>

              <ActionButton
                isQuiet
                onPress={() => navigate('/events')}
                isEmphasized={isActive('/events')}
              >
                <Calendar />
                <span>Events</span>
              </ActionButton>
            </Flex>
          </Flex>

          {/* User Info and Logout */}
          <Flex gap="size-200" alignItems="center">
            {user && (
              <span style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)' }}>
                {user.email}
              </span>
            )}
            <ActionButton
              isQuiet
              onPress={handleLogout}
              aria-label="Logout"
            >
              <LogOut />
              <span>Logout</span>
            </ActionButton>
          </Flex>
        </Flex>
      </View>

      {/* Main Content */}
      <View flex="1" padding="size-200">
        {children}
      </View>
    </Flex>
  )
}
