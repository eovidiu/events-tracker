import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { type Event } from '../../../backend/src/types/events'
import { type DashboardMetrics } from '../types/dashboard'

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events')
      const events = response.events as Event[]

      // Calculate metrics from events
      const metrics: DashboardMetrics = {
        total: events.length,
        upcoming: events.filter(e => e.status === 'upcoming').length,
        completed: events.filter(e => e.status === 'completed').length,
        inProgress: events.filter(e => e.status === 'in_progress').length,
        percentageChange: {
          // For now, percentage changes are null
          // In a real app, we'd compare with historical data
          total: null,
          upcoming: null,
          completed: null,
        },
      }

      return metrics
    },
  })
}
