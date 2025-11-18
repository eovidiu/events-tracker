// Component-specific TypeScript type definitions
import type { ReactNode } from 'react'
import type { Event, EventStatus } from '../../../backend/src/types/events'
import type { DashboardMetrics } from './dashboard'

// Dashboard Components
export interface MetricsCardProps {
  title: string
  value: number
  percentageChange: number | null
  trend: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  isLoading?: boolean
}

export interface StatsOverviewProps {
  metrics: DashboardMetrics | null
  isLoading?: boolean
}

export interface ActivityFeedProps {
  events: Event[]
  maxItems?: number // default: 10
  isLoading?: boolean
}

export interface ActivityItemProps {
  event: Event
}

// Event Components
export interface EventGridProps {
  events: Event[]
  onEditEvent: (eventId: string) => void
  isLoading?: boolean
}

export interface EventCardProps {
  event: Event
  onEdit: (eventId: string) => void
}

export interface StatusBadgeProps {
  status: EventStatus
  size?: 'small' | 'medium' | 'large'
}

// Modal Components
export interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface EditEventModalProps {
  isOpen: boolean
  eventId: string | null
  onClose: () => void
}

// Navigation Components
export interface AppShellProps {
  children: ReactNode
}

export interface SidebarProps {
  currentPath: string
  isCollapsed?: boolean
}

export interface NavItemProps {
  label: string
  icon: ReactNode
  to: string
  isActive?: boolean
}
