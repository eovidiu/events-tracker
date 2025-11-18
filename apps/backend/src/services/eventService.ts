import { db as defaultDb } from '../db/client.js'
import { events, teams } from '../db/schema.js'
import { eq, inArray } from 'drizzle-orm'
import type { CreateEventInput, UpdateEventInput } from '@events-tracker/shared'

export class EventService {
  constructor(private db = defaultDb) {}

  async createEvent(
    data: Omit<CreateEventInput, 'teamId'> & { teamId: string },
    userId: string
  ) {
    // Verify team exists
    const team = await this.db.select().from(teams).where(eq(teams.id, data.teamId)).get()

    if (!team) {
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

  async getEventById(eventId: string, teamIds: string[]) {
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

  async updateEvent(eventId: string, updateData: UpdateEventInput, teamIds: string[]) {
    // First verify the event exists and user has access
    await this.getEventById(eventId, teamIds)

    // Update the event with new data
    const [updatedEvent] = await this.db
      .update(events)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
      .returning()

    return updatedEvent
  }
}
