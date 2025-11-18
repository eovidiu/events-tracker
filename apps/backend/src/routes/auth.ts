import { FastifyInstance } from 'fastify'
import { createLucia } from '../services/authService.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type BetterSqlite3 from 'better-sqlite3'
import { db as defaultDb } from '../db/client.js'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from '../db/schema.js'

export function createAuthRoutes(
  sqlite: BetterSqlite3.Database,
  db?: BetterSQLite3Database<typeof schema>
) {
  const lucia = createLucia(sqlite)
  const dbInstance = db || defaultDb

  return async function authRoutes(fastify: FastifyInstance) {
  // Register endpoint (simplified - no password hashing for MVP)
  fastify.post('/register', async (request, reply) => {
    const { email, name } = request.body as { email: string; name: string }

    // Check if user already exists
    const existingUser = await dbInstance.select().from(users).where(eq(users.email, email)).get()

    if (existingUser) {
      return reply.code(400).send({ error: 'User already exists' })
    }

    // Create user
    const [newUser] = await dbInstance
      .insert(users)
      .values({
        email,
        name,
        hashedPassword: null, // Simplified for MVP
      })
      .returning()

    // Create session
    const session = await lucia.createSession(newUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    // Set cookie with explicit options for development
    reply.setCookie(sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // false for development (http)
    })

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      session,
    }
  })

  // Login endpoint (simplified - no password verification for MVP)
  fastify.post('/login', async (request, reply) => {
    const { email } = request.body as { email: string }

    const user = await dbInstance.select().from(users).where(eq(users.email, email)).get()

    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }

    // Create session
    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    // Set cookie with explicit options for development
    reply.setCookie(sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // false for development (http)
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      session,
    }
  })

  // Logout endpoint
  fastify.post('/logout', async (request, reply) => {
    if (!request.session) {
      return reply.code(401).send({ error: 'Not authenticated' })
    }

    await lucia.invalidateSession(request.session.id)
    const sessionCookie = lucia.createBlankSessionCookie()
    reply.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return { success: true }
  })

  // Get current user
  fastify.get('/me', async (request, reply) => {
    if (!request.userId) {
      return reply.code(401).send({ error: 'Not authenticated' })
    }

    const user = await dbInstance.select().from(users).where(eq(users.id, request.userId)).get()

    if (!user) {
      return reply.code(404).send({ error: 'User not found' })
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  })
  }
}
