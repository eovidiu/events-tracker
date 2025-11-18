// Dashboard-specific TypeScript type definitions
import type { EventStatus } from '../../../backend/src/types/events'

export interface DashboardMetrics {
  total: number
  upcoming: number
  completed: number
  inProgress: number
  percentageChange: {
    total: number | null // null if no historical data
    upcoming: number | null
    completed: number | null
  }
}

export interface ActivityItem {
  eventId: string
  eventName: string
  timestamp: string // ISO 8601
  status: EventStatus
  actionType: 'created' | 'updated' | 'status_changed'
}
