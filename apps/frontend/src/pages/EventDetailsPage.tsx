import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  View,
  Flex,
  Heading,
  Text,
  Button,
  ProgressCircle,
  ActionButton,
  DialogTrigger,
  AlertDialog,
} from '@adobe/react-spectrum'
import { useEvent, useDeleteEvent } from '../hooks/useEvents'
import Edit from '@spectrum-icons/workflow/Edit'
import Delete from '@spectrum-icons/workflow/Delete'
import ArrowLeft from '@spectrum-icons/workflow/ArrowLeft'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(date))
}

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: event, isLoading, isError, error } = useEvent(id!)
  const deleteEvent = useDeleteEvent()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await deleteEvent.mutateAsync(id)
      navigate('/events')
    } catch (error) {
      console.error('Failed to delete event:', error)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <Flex direction="column" alignItems="center" gap="size-200" marginTop="size-400">
        <ProgressCircle isIndeterminate />
        <Text>Loading event...</Text>
      </Flex>
    )
  }

  if (isError) {
    return (
      <View padding="size-400">
        <View backgroundColor="negative" padding="size-200" borderRadius="medium">
          <Text>Error loading event: {error instanceof Error ? error.message : 'Unknown error'}</Text>
        </View>
        <Button variant="secondary" onPress={() => navigate('/events')} marginTop="size-200">
          <ArrowLeft />
          <Text>Back to Events</Text>
        </Button>
      </View>
    )
  }

  if (!event) {
    return (
      <View padding="size-400">
        <Text>Event not found</Text>
        <Button variant="secondary" onPress={() => navigate('/events')} marginTop="size-200">
          <ArrowLeft />
          <Text>Back to Events</Text>
        </Button>
      </View>
    )
  }

  return (
    <View padding="size-400">
      <Flex direction="column" gap="size-400" maxWidth="800px">
        {/* Header with navigation and actions */}
        <Flex direction="row" justifyContent="space-between" alignItems="center">
          <Button variant="secondary" onPress={() => navigate('/events')}>
            <ArrowLeft />
            <Text>Back to Events</Text>
          </Button>
          <Flex direction="row" gap="size-200">
            <ActionButton onPress={() => navigate(`/events/${id}/edit`)}>
              <Edit />
              <Text>Edit Event</Text>
            </ActionButton>
            <DialogTrigger>
              <ActionButton isDisabled={isDeleting}>
                <Delete />
                <Text>Delete</Text>
              </ActionButton>
              <AlertDialog
                variant="destructive"
                title="Delete Event"
                primaryActionLabel="Delete"
                cancelLabel="Cancel"
                onPrimaryAction={handleDelete}
              >
                Are you sure you want to delete "{event.title}"? This action cannot be undone.
              </AlertDialog>
            </DialogTrigger>
          </Flex>
        </Flex>

        {/* Event title */}
        <Heading level={1}>{event.title}</Heading>

        {/* Event description */}
        {event.description && (
          <View>
            <Heading level={3} marginBottom="size-100">Description</Heading>
            <Text>{event.description}</Text>
          </View>
        )}

        {/* Event details grid */}
        <Flex direction="column" gap="size-300">
          <View>
            <Heading level={3} marginBottom="size-100">Details</Heading>
            <Flex direction="column" gap="size-200">
              <Flex direction="row" gap="size-100">
                <Text><strong>Location:</strong></Text>
                <Text>{event.location}</Text>
              </Flex>
              <Flex direction="row" gap="size-100">
                <Text><strong>Timezone:</strong></Text>
                <Text>{event.timezone}</Text>
              </Flex>
            </Flex>
          </View>

          <View>
            <Heading level={3} marginBottom="size-100">Schedule</Heading>
            <Flex direction="column" gap="size-200">
              {/* T120: Multi-day event support - show date range or single date/time */}
              {(() => {
                const startDate = new Date(event.startDate)
                const endDate = new Date(event.endDate)
                const startDay = startDate.toLocaleDateString()
                const endDay = endDate.toLocaleDateString()
                const isMultiDay = startDay !== endDay

                if (isMultiDay) {
                  return (
                    <>
                      <View>
                        <Text><strong>Event Dates:</strong></Text>
                        <Text>{formatDate(startDate)} to {formatDate(endDate)}</Text>
                        <Text UNSAFE_style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)', marginTop: '0.5rem' }}>
                          Multi-day event ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days)
                        </Text>
                      </View>
                    </>
                  )
                } else {
                  return (
                    <>
                      <View>
                        <Text><strong>Starts:</strong></Text>
                        <Text>{formatDate(startDate)}</Text>
                      </View>
                      <View>
                        <Text><strong>Ends:</strong></Text>
                        <Text>{formatDate(endDate)}</Text>
                      </View>
                    </>
                  )
                }
              })()}
            </Flex>
          </View>
        </Flex>

        {/* Metadata - T102: Event metadata section with creator/updater info */}
        <View borderTopWidth="thin" borderTopColor="gray-300" paddingTop="size-300">
          <Heading level={4} marginBottom="size-100">Event Information</Heading>
          <Flex direction="column" gap="size-100">
            <Text UNSAFE_style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)' }}>
              Created: {formatDate(event.createdAt)}
              {event.creator && ` by ${event.creator.name}`}
            </Text>
            <Text UNSAFE_style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)' }}>
              Last updated: {formatDate(event.updatedAt)}
              {event.updater && ` by ${event.updater.name}`}
            </Text>
            {event.team && (
              <Text UNSAFE_style={{ fontSize: '0.875rem', color: 'var(--spectrum-global-color-gray-700)' }}>
                Team: {event.team.name}
              </Text>
            )}
          </Flex>
        </View>
      </Flex>
    </View>
  )
}
