import { z } from 'zod'

// Event validation schema
export const eventSchema = z.object({
  teamId: z.string().uuid(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z
    .string()
    .max(10000, 'Description must be 10,000 characters or less')
    .optional(),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(500, 'Location must be 500 characters or less'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  timezone: z.string().default('UTC'),
})

// Validation that endDate >= startDate
export const eventSchemaWithDateValidation = eventSchema.refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
)

// Schema for creating events
export const createEventSchema = eventSchemaWithDateValidation

// Schema for updating events (all fields optional except teamId for authorization)
export const updateEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .optional(),
  description: z
    .string()
    .max(10000, 'Description must be 10,000 characters or less')
    .optional(),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(500, 'Location must be 500 characters or less')
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  timezone: z.string().optional(),
})

// Type exports
export type EventInput = z.infer<typeof eventSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
