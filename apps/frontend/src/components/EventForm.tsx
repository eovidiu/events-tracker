import { useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventSchema, updateEventSchema, type CreateEventInput, type UpdateEventInput } from '@events-tracker/shared'
import {
  TextField,
  TextArea,
  Button,
  Form,
  View,
  Flex,
  Heading,
  Text,
  Picker,
  Item as PickerItem,
} from '@adobe/react-spectrum'
import { useCreateEvent, useUpdateEvent } from '../hooks/useEvents'
import AlertIcon from '@spectrum-icons/workflow/Alert'

// T116: Common IANA timezones
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Bucharest',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
]

interface EventFormProps {
  teamId?: string
  eventId?: string // T086: Support edit mode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any // T086: Pre-populate form for editing (type comes from backend)
  onSuccess?: () => void
}

export function EventForm({ teamId, eventId, initialData, onSuccess }: EventFormProps) {
  const isEditMode = Boolean(eventId) // T086: Track if we're in edit mode
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent(eventId || '') // T086: Use update hook in edit mode (pass empty string if not editing)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty }, // T087: Track dirty state
    reset,
  } = useForm<CreateEventInput | UpdateEventInput>({
    resolver: zodResolver(isEditMode ? updateEventSchema : createEventSchema),
    defaultValues: initialData || {
      teamId,
      title: '',
      description: '',
      location: '',
      timezone: 'UTC',
    },
    values: initialData, // T086: Pre-populate in edit mode
  })

  // T117: Watch startDate for past event warning
  const startDate = useWatch({ control, name: 'startDate' })
  const isPastEvent = startDate && new Date(startDate) < new Date()

  // T088: Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const onSubmit = async (data: CreateEventInput | UpdateEventInput) => {
    try {
      if (isEditMode) {
        // T086: Use update mutation in edit mode
        // T080: Include updatedAt for optimistic locking
        await updateEvent.mutateAsync({
          ...data,
          updatedAt: initialData?.updatedAt
        } as UpdateEventInput)
      } else {
        await createEvent.mutateAsync(data as CreateEventInput)
      }
      // Call onSuccess first before resetting form
      onSuccess?.()
      // Reset form after navigation is triggered
      setTimeout(() => reset(), 100)
    } catch (error) {
      // Error is handled by mutation error state
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} event:`, error)
    }
  }

  const mutation = isEditMode ? updateEvent : createEvent

  return (
    <Form onSubmit={handleSubmit(onSubmit)} width="100%" maxWidth="600px">
      <Flex direction="column" gap="size-200">
        <Heading level={2}>{isEditMode ? 'Edit Event' : 'Create Event'}</Heading>

        {/* T118: Character count indicator for title */}
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              isRequired
              validationState={errors.title ? 'invalid' : undefined}
              errorMessage={errors.title?.message}
              maxLength={200}
              description={`${field.value?.length || 0}/200 characters`}
            />
          )}
        />

        {/* T118: Character count indicator for description */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              value={field.value || ''}
              label="Description"
              validationState={errors.description ? 'invalid' : undefined}
              errorMessage={errors.description?.message}
              maxLength={10000}
              height="size-1600"
              description={`${field.value?.length || 0}/10000 characters`}
            />
          )}
        />

        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Location"
              isRequired
              validationState={errors.location ? 'invalid' : undefined}
              errorMessage={errors.location?.message}
              maxLength={500}
            />
          )}
        />

        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={
                field.value instanceof Date
                  ? field.value.toISOString().slice(0, 16)
                  : field.value
                  ? new Date(field.value).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(value) => {
                field.onChange(value ? new Date(value) : null)
              }}
              label="Start Date"
              type="datetime-local"
              isRequired
              validationState={errors.startDate ? 'invalid' : undefined}
              errorMessage={errors.startDate?.message}
            />
          )}
        />

        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={
                field.value instanceof Date
                  ? field.value.toISOString().slice(0, 16)
                  : field.value
                  ? new Date(field.value).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(value) => {
                field.onChange(value ? new Date(value) : null)
              }}
              label="End Date"
              type="datetime-local"
              isRequired
              validationState={errors.endDate ? 'invalid' : undefined}
              errorMessage={errors.endDate?.message}
            />
          )}
        />

        {/* T116: Timezone selector with common IANA timezones */}
        <Controller
          name="timezone"
          control={control}
          render={({ field }) => (
            <Picker
              label="Timezone"
              isRequired
              selectedKey={field.value}
              onSelectionChange={field.onChange}
              validationState={errors.timezone ? 'invalid' : undefined}
              errorMessage={errors.timezone?.message}
            >
              {TIMEZONES.map((tz) => (
                <PickerItem key={tz}>{tz}</PickerItem>
              ))}
            </Picker>
          )}
        />

        {/* T117: Past event warning */}
        {isPastEvent && (
          <View
            backgroundColor="notice"
            padding="size-200"
            borderRadius="medium"
            UNSAFE_style={{ border: '1px solid var(--spectrum-global-color-orange-600)' }}
          >
            <Flex direction="row" gap="size-100" alignItems="center">
              <AlertIcon size="S" />
              <Text>
                <strong>Warning:</strong> This event is scheduled in the past. Please verify the date and time.
              </Text>
            </Flex>
          </View>
        )}

        {mutation?.isError && (
          <View
            backgroundColor="negative"
            padding="size-200"
            borderRadius="medium"
          >
            <Text>
              Error: {mutation.error instanceof Error ? mutation.error.message : `Failed to ${isEditMode ? 'update' : 'create'} event`}
            </Text>
          </View>
        )}

        {/* T093: Display conflict error clearly */}
        {mutation?.error instanceof Error && mutation.error.message.includes('Conflict') && (
          <View
            backgroundColor="notice"
            padding="size-200"
            borderRadius="medium"
            UNSAFE_style={{ border: '1px solid var(--spectrum-global-color-orange-600)' }}
          >
            <Flex direction="row" gap="size-100" alignItems="center">
              <AlertIcon size="S" />
              <Text>
                <strong>Conflict:</strong> This event was updated by another user. Please refresh the page and try again.
              </Text>
            </Flex>
          </View>
        )}

        <Button
          type="submit"
          variant="cta"
          isDisabled={isSubmitting || mutation?.isPending}
        >
          {mutation?.isPending ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Event')}
        </Button>
      </Flex>
    </Form>
  )
}
