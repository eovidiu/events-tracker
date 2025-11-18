import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventSchema, type CreateEventInput } from '@events-tracker/shared'
import {
  TextField,
  TextArea,
  Button,
  Form,
  View,
  Flex,
  Heading,
  Text,
} from '@adobe/react-spectrum'
import { useCreateEvent } from '../hooks/useEvents'

interface EventFormProps {
  teamId: string
  onSuccess?: () => void
}

export function EventForm({ teamId, onSuccess }: EventFormProps) {
  const createEvent = useCreateEvent()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      teamId,
      title: '',
      description: '',
      location: '',
      timezone: 'UTC',
    },
  })

  const onSubmit = async (data: CreateEventInput) => {
    try {
      await createEvent.mutateAsync(data)
      reset()
      onSuccess?.()
    } catch (error) {
      // Error is handled by mutation error state
      console.error('Failed to create event:', error)
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} width="100%" maxWidth="600px">
      <Flex direction="column" gap="size-200">
        <Heading level={2}>Create New Event</Heading>

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
            />
          )}
        />

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

        <Controller
          name="timezone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Timezone"
              isRequired
              validationState={errors.timezone ? 'invalid' : undefined}
              errorMessage={errors.timezone?.message}
              description="e.g., America/Los_Angeles, UTC, Europe/London"
            />
          )}
        />

        {createEvent.isError && (
          <View
            backgroundColor="negative"
            padding="size-200"
            borderRadius="medium"
          >
            <Text>
              Error: {createEvent.error instanceof Error ? createEvent.error.message : 'Failed to create event'}
            </Text>
          </View>
        )}

        <Button
          type="submit"
          variant="cta"
          isDisabled={isSubmitting || createEvent.isPending}
        >
          {createEvent.isPending ? 'Creating...' : 'Create Event'}
        </Button>
      </Flex>
    </Form>
  )
}
