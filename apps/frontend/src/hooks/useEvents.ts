import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import type { CreateEventInput, UpdateEventInput } from '@events-tracker/shared'

export interface Event {
  id: string
  teamId: string
  title: string
  description?: string
  location: string
  startDate: Date
  endDate: Date
  timezone: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Hook to fetch all events for the authenticated user's teams
 */
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      const response = await api.get<{ events: Event[] }>('/events')
      return response.events
    },
  })
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: CreateEventInput): Promise<Event> => {
      return await api.post<Event>('/events', eventData)
    },
    onSuccess: () => {
      // Invalidate events query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

/**
 * Hook to fetch a single event by ID
 */
export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: async (): Promise<Event> => {
      return await api.get<Event>(`/events/${eventId}`)
    },
    enabled: !!eventId,
  })
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: UpdateEventInput): Promise<Event> => {
      return await api.patch<Event>(`/events/${eventId}`, eventData)
    },
    onSuccess: () => {
      // Invalidate both the specific event and the events list
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
