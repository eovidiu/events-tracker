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
 * Hook to update an existing event - T092: With optimistic updates
 */
export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: UpdateEventInput): Promise<Event> => {
      return await api.patch<Event>(`/events/${eventId}`, eventData)
    },
    // T092: Optimistic update - update UI immediately before server responds
    onMutate: async (newEventData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['events', eventId] })
      await queryClient.cancelQueries({ queryKey: ['events'] })

      // Snapshot the previous values
      const previousEvent = queryClient.getQueryData<Event>(['events', eventId])
      const previousEvents = queryClient.getQueryData<Event[]>(['events'])

      // Optimistically update the single event
      if (previousEvent) {
        queryClient.setQueryData<Event>(['events', eventId], {
          ...previousEvent,
          ...newEventData,
        })
      }

      // Optimistically update the events list
      if (previousEvents) {
        queryClient.setQueryData<Event[]>(
          ['events'],
          previousEvents.map((event) =>
            event.id === eventId ? { ...event, ...newEventData } : event
          )
        )
      }

      // Return context with snapshot for rollback
      return { previousEvent, previousEvents }
    },
    onError: (err, newEventData, context) => {
      // Rollback to previous values on error
      if (context?.previousEvent) {
        queryClient.setQueryData(['events', eventId], context.previousEvent)
      }
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents)
      }
    },
    onSuccess: () => {
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
