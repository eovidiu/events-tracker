import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { buildApp } from '../../src/app.js'
import { createTestDb, cleanupTestDb } from '../helpers/testDb.js'
import { users, teams, teamMembers, events } from '../../src/db/schema.js'
import type { FastifyInstance } from 'fastify'

describe('POST /api/v1/events', () => {
  let app: FastifyInstance
  let testDb: ReturnType<typeof createTestDb>
  let sessionCookie: string

  beforeEach(async () => {
    // Create test database
    testDb = createTestDb()

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

    // Build app with test database
    app = await buildApp(testDb.db, testDb.sqlite)

    // Login to get session cookie
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'test@example.com' },
    })

    const cookies = loginResponse.cookies
    if (!cookies || cookies.length === 0) {
      throw new Error('No session cookie received from login')
    }
    sessionCookie = cookies[0].name + '=' + cookies[0].value
  })

  afterEach(async () => {
    await app.close()
    cleanupTestDb(testDb.sqlite)
  })

  it('should create an event with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: {
        cookie: sessionCookie,
      },
      payload: {
        teamId: '660e8400-e29b-41d4-a716-446655440001',
        title: 'Team Offsite',
        description: 'Annual team building event',
        location: 'San Francisco',
        startDate: '2025-02-01T10:00:00Z',
        endDate: '2025-02-01T18:00:00Z',
        timezone: 'America/Los_Angeles',
      },
    })

    expect(response.statusCode).toBe(201)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('id')
    expect(body.title).toBe('Team Offsite')
    expect(body.teamId).toBe('660e8400-e29b-41d4-a716-446655440001')
    expect(body.createdBy).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('should enforce team isolation - reject event for non-member team', async () => {
    // Create another team the user doesn't belong to
    await testDb.db.insert(teams).values({
      id: '770e8400-e29b-41d4-a716-446655440002',
      name: 'Other Team',
    }).returning()

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: {
        cookie: sessionCookie,
      },
      payload: {
        teamId: '770e8400-e29b-41d4-a716-446655440002',
        title: 'Unauthorized Event',
        location: 'Nowhere',
        startDate: '2025-02-01T10:00:00Z',
        endDate: '2025-02-01T18:00:00Z',
      },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should validate required fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: {
        cookie: sessionCookie,
      },
      payload: {
        teamId: '660e8400-e29b-41d4-a716-446655440001',
        // Missing title, location, dates
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should validate end date is after start date', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: {
        cookie: sessionCookie,
      },
      payload: {
        teamId: '660e8400-e29b-41d4-a716-446655440001',
        title: 'Invalid Event',
        location: 'Test Location',
        startDate: '2025-02-01T18:00:00Z',
        endDate: '2025-02-01T10:00:00Z', // Before start date
      },
    })

    expect(response.statusCode).toBe(400)
  })
})

describe('GET /api/v1/events', () => {
  let app: FastifyInstance
  let testDb: ReturnType<typeof createTestDb>
  let sessionCookie: string

  beforeEach(async () => {
    testDb = createTestDb()

    // Create test user and teams with proper UUIDs
    const [user] = await testDb.db.insert(users).values({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      name: 'Test User',
    }).returning()

    const [team1] = await testDb.db.insert(teams).values({
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Team 1',
    }).returning()

    const [team2] = await testDb.db.insert(teams).values({
      id: '770e8400-e29b-41d4-a716-446655440002',
      name: 'Team 2',
    }).returning()

    // User belongs to team-1 only
    await testDb.db.insert(teamMembers).values({
      userId: user.id,
      teamId: team1.id,
      role: 'member',
    })

    // Create events
    await testDb.db.insert(events).values([
      {
        id: '880e8400-e29b-41d4-a716-446655440003',
        teamId: team1.id,
        title: 'Team 1 Event',
        location: 'Office',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-01'),
        createdBy: user.id,
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440004',
        teamId: team2.id,
        title: 'Team 2 Event',
        location: 'Remote',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-02-15'),
        createdBy: user.id,
      },
    ])

    app = await buildApp(testDb.db, testDb.sqlite)

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'test@example.com' },
    })

    const cookies = loginResponse.cookies
    sessionCookie = cookies[0]?.name + '=' + cookies[0]?.value
  })

  afterEach(async () => {
    await app.close()
    cleanupTestDb(testDb.sqlite)
  })

  it('should list only events from user teams', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/events',
      headers: {
        cookie: sessionCookie,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.events).toHaveLength(1)
    expect(body.events[0].id).toBe('880e8400-e29b-41d4-a716-446655440003')
    expect(body.events[0].title).toBe('Team 1 Event')
  })

  it('should require authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/events',
    })

    expect(response.statusCode).toBe(401)
  })
})

describe('GET /api/v1/events/:id', () => {
  let app: FastifyInstance
  let testDb: ReturnType<typeof createTestDb>
  let sessionCookie: string
  let testEventId: string

  beforeEach(async () => {
    testDb = createTestDb()

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

    const [event] = await testDb.db.insert(events).values({
      id: '880e8400-e29b-41d4-a716-446655440003',
      teamId: team.id,
      title: 'Test Event',
      location: 'Test Location',
      startDate: new Date('2025-02-01T10:00:00Z'),
      endDate: new Date('2025-02-01T12:00:00Z'),
      createdBy: user.id,
    }).returning()

    testEventId = event.id

    app = await buildApp(testDb.db, testDb.sqlite)

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'test@example.com' },
    })

    const cookies = loginResponse.cookies
    sessionCookie = cookies[0].name + '=' + cookies[0].value
  })

  afterEach(async () => {
    await app.close()
    cleanupTestDb(testDb.sqlite)
  })

  it('should get single event by id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/events/${testEventId}`,
      headers: {
        cookie: sessionCookie,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.id).toBe(testEventId)
    expect(body.title).toBe('Test Event')
  })

  it('should return 404 for non-existent event', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/events/990e8400-e29b-41d4-a716-446655440099',
      headers: {
        cookie: sessionCookie,
      },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 403 for event in different team', async () => {
    const [otherTeam] = await testDb.db.insert(teams).values({
      id: '770e8400-e29b-41d4-a716-446655440002',
      name: 'Other Team',
    }).returning()

    const [otherEvent] = await testDb.db.insert(events).values({
      id: '990e8400-e29b-41d4-a716-446655440004',
      teamId: otherTeam.id,
      title: 'Other Event',
      location: 'Other Location',
      startDate: new Date('2025-02-01T10:00:00Z'),
      endDate: new Date('2025-02-01T12:00:00Z'),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
    }).returning()

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/events/${otherEvent.id}`,
      headers: {
        cookie: sessionCookie,
      },
    })

    expect(response.statusCode).toBe(403)
  })
})

describe('PATCH /api/v1/events/:id', () => {
  let app: FastifyInstance
  let testDb: ReturnType<typeof createTestDb>
  let sessionCookie: string
  let testEventId: string

  beforeEach(async () => {
    testDb = createTestDb()

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

    const [event] = await testDb.db.insert(events).values({
      id: '880e8400-e29b-41d4-a716-446655440003',
      teamId: team.id,
      title: 'Original Title',
      description: 'Original Description',
      location: 'Original Location',
      startDate: new Date('2025-02-01T10:00:00Z'),
      endDate: new Date('2025-02-01T12:00:00Z'),
      createdBy: user.id,
    }).returning()

    testEventId = event.id

    app = await buildApp(testDb.db, testDb.sqlite)

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'test@example.com' },
    })

    const cookies = loginResponse.cookies
    sessionCookie = cookies[0].name + '=' + cookies[0].value
  })

  afterEach(async () => {
    await app.close()
    cleanupTestDb(testDb.sqlite)
  })

  it('should update event with partial data', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/events/${testEventId}`,
      headers: {
        cookie: sessionCookie,
      },
      payload: {
        title: 'Updated Title',
        location: 'Updated Location',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.title).toBe('Updated Title')
    expect(body.location).toBe('Updated Location')
    expect(body.description).toBe('Original Description') // Unchanged
  })

  it('should validate updated data', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/events/${testEventId}`,
      headers: {
        cookie: sessionCookie,
      },
      payload: {
        title: 'a'.repeat(201), // Exceeds max length
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return 404 for non-existent event', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/events/990e8400-e29b-41d4-a716-446655440099',
      headers: {
        cookie: sessionCookie,
      },
      payload: {
        title: 'Updated Title',
      },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should enforce team isolation on update', async () => {
    const [otherTeam] = await testDb.db.insert(teams).values({
      id: '770e8400-e29b-41d4-a716-446655440002',
      name: 'Other Team',
    }).returning()

    const [otherEvent] = await testDb.db.insert(events).values({
      id: '990e8400-e29b-41d4-a716-446655440004',
      teamId: otherTeam.id,
      title: 'Other Event',
      location: 'Other Location',
      startDate: new Date('2025-02-01T10:00:00Z'),
      endDate: new Date('2025-02-01T12:00:00Z'),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
    }).returning()

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/events/${otherEvent.id}`,
      headers: {
        cookie: sessionCookie,
      },
      payload: {
        title: 'Hacked Title',
      },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should update updatedAt timestamp', async () => {
    const beforeUpdate = new Date()

    // Wait 1 second to ensure timestamp difference (SQLite stores timestamps in seconds)
    await new Promise((resolve) => setTimeout(resolve, 1100))

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/events/${testEventId}`,
      headers: {
        cookie: sessionCookie,
      },
      payload: {
        title: 'Updated Title',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    const updatedAt = new Date(body.updatedAt)
    expect(updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime())
  })
})
