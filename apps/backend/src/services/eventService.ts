import { db as defaultDb } from '../db/client.js'
import { events, teams } from '../db/schema.js'
import { eq, inArray } from 'drizzle-orm'
import type { CreateEventInput, UpdateEventInput } from '@events-tracker/shared'

export class EventService {
  constructor(private db = defaultDb) {}

  async createEvent(
    data: Omit<CreateEventInput, 'teamId'> & { teamId: string },
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger?: any
  ) {
    // T122: Structured logging for mutations
    logger?.info({
      action: 'event.create.start',
      userId,
      teamId: data.teamId,
      title: data.title,
    }, 'Creating event')

    // Verify team exists
    const team = await this.db.select().from(teams).where(eq(teams.id, data.teamId)).get()

    if (!team) {
      logger?.error({
        action: 'event.create.failed',
        userId,
        teamId: data.teamId,
        reason: 'team_not_found',
      }, 'Team not found')
      throw new Error('Team not found')
    }

    // Create event
    const [event] = await this.db
      .insert(events)
      .values({
        teamId: data.teamId,
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        timezone: data.timezone || 'UTC',
        createdBy: userId,
      })
      .returning()

    logger?.info({
      action: 'event.create.success',
      userId,
      teamId: data.teamId,
      eventId: event.id,
      title: event.title,
    }, 'Event created successfully')

    return event
  }

  async getEventsByTeams(teamIds: string[]) {
    if (teamIds.length === 0) {
      return []
    }

    const eventsList = await this.db
      .select()
      .from(events)
      .where(inArray(events.teamId, teamIds))
      .orderBy(events.startDate)

    return eventsList
  }

  async getEventById(eventId: string, teamIds: string[], includeRelations = false) {
    if (!includeRelations) {
      // Simple query for backward compatibility
      const event = await this.db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .get()

      if (!event) {
        throw new Error('Event not found')
      }

      // Check team access
      if (!teamIds.includes(event.teamId)) {
        throw new Error('Access denied')
      }

      return event
    }

    // T096: Enhanced query with relations (creator, updater, team)
    const eventWithRelations = await this.db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        creator: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        updater: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          columns: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })

    if (!eventWithRelations) {
      throw new Error('Event not found')
    }

    // Check team access
    if (!teamIds.includes(eventWithRelations.teamId)) {
      throw new Error('Access denied')
    }

    return eventWithRelations
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateEvent(eventId: string, updateData: UpdateEventInput, teamIds: string[], userId: string, logger?: any, clientUpdatedAt?: string) {
    // T122: Structured logging for mutations
    logger?.info({
      action: 'event.update.start',
      userId,
      eventId,
      updateFields: Object.keys(updateData),
    }, 'Updating event')

    // First verify the event exists and user has access
    const currentEvent = await this.getEventById(eventId, teamIds)

    // T080: Optimistic locking check
    if (clientUpdatedAt) {
      const clientTimestamp = new Date(clientUpdatedAt).getTime()
      const serverTimestamp = new Date(currentEvent.updatedAt).getTime()

      if (serverTimestamp > clientTimestamp) {
        logger?.warn({
          action: 'event.update.conflict',
          userId,
          eventId,
          clientUpdatedAt,
          serverUpdatedAt: currentEvent.updatedAt,
        }, 'Concurrent edit detected')

        throw new Error('Conflict: Event was updated by another user')
      }
    }

    // Update the event with new data and track who updated it
    const [updatedEvent] = await this.db
      .update(events)
      .set({
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
      .returning()

    logger?.info({
      action: 'event.update.success',
      userId,
      eventId,
      teamId: updatedEvent.teamId,
      updateFields: Object.keys(updateData),
    }, 'Event updated successfully')

    return updatedEvent
  }

  async deleteEvent(eventId: string, teamIds: string[]): Promise<void> {
    // First verify the event exists and user has access
    await this.getEventById(eventId, teamIds)

    // Delete the event
    await this.db
      .delete(events)
      .where(eq(events.id, eventId))
  }
}
