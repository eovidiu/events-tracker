import { FastifyInstance } from 'fastify'
import { EventService } from '../services/eventService.js'
import { createEventSchema, updateEventSchema } from '@events-tracker/shared'
import { ZodError } from 'zod'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from '../db/schema.js'

export function createEventsRoutes(db: BetterSQLite3Database<typeof schema>) {
  const eventService = new EventService(db)

  return async function eventsRoutes(fastify: FastifyInstance) {
  // Create event
  fastify.post('/events', async (request, reply) => {
    // Require authentication
    if (!request.userId) {
      return reply.code(401).send({ error: 'Authentication required' })
    }

    try {
      // Validate request body
      const validatedData = createEventSchema.parse(request.body)

      // Check team membership
      if (!request.teamIds.includes(validatedData.teamId)) {
        return reply.code(403).send({ error: 'Access denied to team' })
      }

      // Create event - T122: Pass logger for structured logging
      const event = await eventService.createEvent(validatedData, request.userId, request.log)

      return reply.code(201).send(event)
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: error.errors,
        })
      }

      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message })
      }

      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // List events
  fastify.get('/events', async (request, reply) => {
    // Require authentication
    if (!request.userId) {
      return reply.code(401).send({ error: 'Authentication required' })
    }

    try {
      const events = await eventService.getEventsByTeams(request.teamIds)

      return reply.send({ events })
    } catch (error) {
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // Get single event - T097: Return full details with creator/updater/team info
  fastify.get('/events/:id', async (request, reply) => {
    // Require authentication
    if (!request.userId) {
      return reply.code(401).send({ error: 'Authentication required' })
    }

    try {
      const { id } = request.params as { id: string }
      // Pass true to include relations (creator, updater, team)
      const event = await eventService.getEventById(id, request.teamIds, true)

      return reply.send(event)
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        return reply.code(404).send({ error: 'Event not found' })
      }

      if (error instanceof Error && error.message === 'Access denied') {
        return reply.code(403).send({ error: 'Access denied' })
      }

      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // Update event - T079: Fastify JSON Schema
  fastify.patch('/events/:id', {
    schema: {
      description: 'Update an existing event',
      tags: ['events'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Event ID' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 10000 },
          location: { type: 'string', minLength: 1, maxLength: 500 },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          timezone: { type: 'string' },
          updatedAt: { type: 'string', format: 'date-time', description: 'Client-side timestamp for optimistic locking' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            teamId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            timezone: { type: 'string' },
            createdBy: { type: 'string' },
            updatedBy: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    // Require authentication
    if (!request.userId) {
      return reply.code(401).send({ error: 'Authentication required' })
    }

    try {
      const { id } = request.params as { id: string }

      // Validate request body
      const validatedData = updateEventSchema.parse(request.body)

      // T080: Extract updatedAt for optimistic locking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clientUpdatedAt = (request.body as any).updatedAt

      // Update event - T122: Pass logger and userId
      const event = await eventService.updateEvent(id, validatedData, request.teamIds, request.userId, request.log, clientUpdatedAt)

      return reply.send(event)
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: error.errors,
        })
      }

      if (error instanceof Error && error.message === 'Event not found') {
        return reply.code(404).send({ error: 'Event not found' })
      }

      if (error instanceof Error && error.message === 'Access denied') {
        return reply.code(403).send({ error: 'Access denied' })
      }

      // T093: Handle concurrent edit conflict
      if (error instanceof Error && error.message === 'Conflict: Event was updated by another user') {
        return reply.code(409).send({
          error: 'Conflict',
          message: 'This event was updated by another user. Please refresh and try again.'
        })
      }

      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
  }
}
