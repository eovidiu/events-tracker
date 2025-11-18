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

      // Create event
      const event = await eventService.createEvent(validatedData, request.userId)

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

  // Get single event
  fastify.get('/events/:id', async (request, reply) => {
    // Require authentication
    if (!request.userId) {
      return reply.code(401).send({ error: 'Authentication required' })
    }

    try {
      const { id } = request.params as { id: string }
      const event = await eventService.getEventById(id, request.teamIds)

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

  // Update event
  fastify.patch('/events/:id', async (request, reply) => {
    // Require authentication
    if (!request.userId) {
      return reply.code(401).send({ error: 'Authentication required' })
    }

    try {
      const { id } = request.params as { id: string }

      // Validate request body
      const validatedData = updateEventSchema.parse(request.body)

      // Update event
      const event = await eventService.updateEvent(id, validatedData, request.teamIds)

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

      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
  }
}
