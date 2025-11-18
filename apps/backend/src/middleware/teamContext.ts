import { FastifyRequest, FastifyReply } from 'fastify'
import { teamMembers } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from '../db/schema.js'

export function createTeamContextMiddleware(db: BetterSQLite3Database<typeof schema>) {
  return async function teamContextMiddleware(request: FastifyRequest, _reply: FastifyReply) {
    // Skip if user is not authenticated
    if (!request.userId) {
      request.teamIds = []
      return
    }

    // Get all teams the user belongs to
    const memberships = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, request.userId))

    request.teamIds = memberships.map((m) => m.teamId)
  }
}
