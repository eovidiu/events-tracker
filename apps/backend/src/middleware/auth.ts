import { FastifyRequest, FastifyReply } from 'fastify'
import { createLucia } from '../services/authService.js'
import type BetterSqlite3 from 'better-sqlite3'

export function createAuthMiddleware(sqlite: BetterSqlite3.Database) {
  const lucia = createLucia(sqlite)

  return async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const sessionCookieName = lucia.sessionCookieName
    const sessionId = request.cookies[sessionCookieName]

    if (!sessionId) {
      request.userId = null
      request.session = null
      return
    }

    const { session, user } = await lucia.validateSession(sessionId)

    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id)
      reply.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }

    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      reply.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }

    request.userId = user?.id ?? null
    request.session = session
  }
}
