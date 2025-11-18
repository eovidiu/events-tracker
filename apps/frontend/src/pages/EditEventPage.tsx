import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateEventSchema, type UpdateEventInput } from '@events-tracker/shared'
import {
  TextField,
  TextArea,
  Button,
  Form,
  View,
  Flex,
  Heading,
  Text,
  ProgressCircle,
} from '@adobe/react-spectrum'
import { useEvent, useUpdateEvent } from '../hooks/useEvents'

export function EditEventPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: event, isLoading, isError, error } = useEvent(id!)
  const updateEvent = useUpdateEvent(id!)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEventInput>({
    resolver: zodResolver(updateEventSchema),
    values: event
      ? {
          title: event.title,
          description: event.description,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          timezone: event.timezone,
        }
      : undefined,
  })

  const onSubmit = async (data: UpdateEventInput) => {
    try {
      await updateEvent.mutateAsync(data)
      navigate('/events')
    } catch (error) {
      console.error('Failed to update event:', error)
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
          Back to Events
        </Button>
      </View>
    )
  }

  if (!event) {
    return (
      <View padding="size-400">
        <Text>Event not found</Text>
        <Button variant="secondary" onPress={() => navigate('/events')} marginTop="size-200">
          Back to Events
        </Button>
      </View>
    )
  }

  return (
    <View padding="size-400">
      <Form onSubmit={handleSubmit(onSubmit)} width="100%" maxWidth="600px">
        <Flex direction="column" gap="size-200">
          <Heading level={2}>Edit Event</Heading>

          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
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
                validationState={errors.timezone ? 'invalid' : undefined}
                errorMessage={errors.timezone?.message}
                description="e.g., America/Los_Angeles, UTC, Europe/London"
              />
            )}
          />

          {updateEvent.isError && (
            <View backgroundColor="negative" padding="size-200" borderRadius="medium">
              <Text>
                Error: {updateEvent.error instanceof Error ? updateEvent.error.message : 'Failed to update event'}
              </Text>
            </View>
          )}

          <Flex direction="row" gap="size-200">
            <Button
              type="submit"
              variant="cta"
              isDisabled={isSubmitting || updateEvent.isPending}
            >
              {updateEvent.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="secondary"
              onPress={() => navigate('/events')}
              isDisabled={isSubmitting || updateEvent.isPending}
            >
              Cancel
            </Button>
          </Flex>
        </Flex>
      </Form>
    </View>
  )
}
