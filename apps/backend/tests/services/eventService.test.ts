import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { EventService } from '../../src/services/eventService.js'
import { createTestDb, cleanupTestDb } from '../helpers/testDb.js'
import { users, teams, teamMembers } from '../../src/db/schema.js'

describe('EventService', () => {
  let testDb: ReturnType<typeof createTestDb>
  let eventService: EventService
  let testUserId: string
  let testTeamId: string

  beforeEach(async () => {
    testDb = createTestDb()
    eventService = new EventService(testDb.db)

    // Create test user and team with proper UUIDs
    const [user] = await testDb.db.insert(users).values({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      name: 'Test User',
    }).returning()

    const [team] = await testDb.db.insert(teams).values({
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Test Team',
    }).returning()

    await testDb.db.insert(teamMembers).values({
      userId: user.id,
      teamId: team.id,
      role: 'admin',
    })

    testUserId = user.id
    testTeamId = team.id
  })

  afterEach(() => {
    cleanupTestDb(testDb.sqlite)
  })

  describe('createEvent', () => {
    it('should create event with valid data', async () => {
      const eventData = {
        teamId: testTeamId,
        title: 'Sprint Planning',
        description: 'Q1 2025 sprint planning session',
        location: 'Conference Room A',
        startDate: new Date('2025-02-01T10:00:00Z'),
        endDate: new Date('2025-02-01T12:00:00Z'),
        timezone: 'America/Los_Angeles',
      }

      const event = await eventService.createEvent(eventData, testUserId)

      expect(event.id).toBeDefined()
      expect(event.title).toBe('Sprint Planning')
      expect(event.teamId).toBe(testTeamId)
      expect(event.createdBy).toBe(testUserId)
      expect(event.createdAt).toBeDefined()
    })

    it('should set default timezone to UTC if not provided', async () => {
      const eventData = {
        teamId: testTeamId,
        title: 'Test Event',
        location: 'Online',
        startDate: new Date('2025-02-01T10:00:00Z'),
        endDate: new Date('2025-02-01T12:00:00Z'),
        timezone: 'UTC',
      }

      const event = await eventService.createEvent(eventData, testUserId)

      expect(event.timezone).toBe('UTC')
    })

    it('should reject event creation for non-existent team', async () => {
      const eventData = {
        teamId: 'non-existent-team',
        title: 'Invalid Event',
        location: 'Nowhere',
        startDate: new Date('2025-02-01T10:00:00Z'),
        endDate: new Date('2025-02-01T12:00:00Z'),
        timezone: 'UTC',
      }

      await expect(
        eventService.createEvent(eventData, testUserId)
      ).rejects.toThrow()
    })
  })

  describe('getEventsByTeams', () => {
    it('should return events for specified teams', async () => {
      // Create events
      await eventService.createEvent({
        teamId: testTeamId,
        title: 'Event 1',
        location: 'Location 1',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-01'),
        timezone: 'UTC',
      }, testUserId)

      await eventService.createEvent({
        teamId: testTeamId,
        title: 'Event 2',
        location: 'Location 2',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-02-15'),
        timezone: 'UTC',
      }, testUserId)

      const events = await eventService.getEventsByTeams([testTeamId])

      expect(events).toHaveLength(2)
      expect(events[0].title).toBe('Event 1')
      expect(events[1].title).toBe('Event 2')
    })

    it('should return empty array for teams with no events', async () => {
      const events = await eventService.getEventsByTeams([testTeamId])

      expect(events).toHaveLength(0)
    })
  })

  describe('updateEvent', () => {
    it('should update event with partial data', async () => {
      const eventData = {
        teamId: testTeamId,
        title: 'Original Title',
        description: 'Original Description',
        location: 'Original Location',
        startDate: new Date('2025-02-01T10:00:00Z'),
        endDate: new Date('2025-02-01T12:00:00Z'),
        timezone: 'UTC',
      }

      const createdEvent = await eventService.createEvent(eventData, testUserId)

      const updateData = {
        title: 'Updated Title',
        location: 'Updated Location',
      }

      const updatedEvent = await eventService.updateEvent(
        createdEvent.id,
        updateData,
        [testTeamId]
      )

      expect(updatedEvent.title).toBe('Updated Title')
      expect(updatedEvent.location).toBe('Updated Location')
      expect(updatedEvent.description).toBe('Original Description') // Unchanged
    })

    it('should throw error for non-existent event', async () => {
      const updateData = {
        title: 'Updated Title',
      }

      await expect(
        eventService.updateEvent('non-existent-id', updateData, [testTeamId])
      ).rejects.toThrow('Event not found')
    })

    it('should throw error for event in different team', async () => {
      const eventData = {
        teamId: testTeamId,
        title: 'Test Event',
        location: 'Test Location',
        startDate: new Date('2025-02-01T10:00:00Z'),
        endDate: new Date('2025-02-01T12:00:00Z'),
        timezone: 'UTC',
      }

      const createdEvent = await eventService.createEvent(eventData, testUserId)

      const updateData = {
        title: 'Hacked Title',
      }

      await expect(
        eventService.updateEvent(createdEvent.id, updateData, ['different-team-id'])
      ).rejects.toThrow('Access denied')
    })

    it('should update updatedAt timestamp', async () => {
      const eventData = {
        teamId: testTeamId,
        title: 'Original Title',
        location: 'Original Location',
        startDate: new Date('2025-02-01T10:00:00Z'),
        endDate: new Date('2025-02-01T12:00:00Z'),
        timezone: 'UTC',
      }

      const createdEvent = await eventService.createEvent(eventData, testUserId)
      const originalUpdatedAt = createdEvent.updatedAt

      // Wait to ensure timestamp difference (SQLite stores timestamps in seconds)
      await new Promise((resolve) => setTimeout(resolve, 1100))

      const updateData = {
        title: 'Updated Title',
      }

      const updatedEvent = await eventService.updateEvent(
        createdEvent.id,
        updateData,
        [testTeamId]
      )

      expect(new Date(updatedEvent.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      )
    })
  })

  describe('getEventById', () => {
    it('should get event by id', async () => {
      const eventData = {
        teamId: testTeamId,
        title: 'Test Event',
        location: 'Test Location',
        startDate: new Date('2025-02-01T10:00:00Z'),
        endDate: new Date('2025-02-01T12:00:00Z'),
        timezone: 'UTC',
      }

      const createdEvent = await eventService.createEvent(eventData, testUserId)

      const fetchedEvent = await eventService.getEventById(createdEvent.id, [testTeamId])

      expect(fetchedEvent.id).toBe(createdEvent.id)
      expect(fetchedEvent.title).toBe('Test Event')
    })

    it('should throw error for non-existent event', async () => {
      await expect(
        eventService.getEventById('non-existent-id', [testTeamId])
      ).rejects.toThrow('Event not found')
    })

    it('should throw error for event in different team', async () => {
      const eventData = {
        teamId: testTeamId,
        title: 'Test Event',
        location: 'Test Location',
        startDate: new Date('2025-02-01T10:00:00Z'),
        endDate: new Date('2025-02-01T12:00:00Z'),
        timezone: 'UTC',
      }

      const createdEvent = await eventService.createEvent(eventData, testUserId)

      await expect(
        eventService.getEventById(createdEvent.id, ['different-team-id'])
      ).rejects.toThrow('Access denied')
    })
  })
})
