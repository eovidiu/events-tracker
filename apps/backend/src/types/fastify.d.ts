import type { Session } from 'lucia'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string | null
    session: Session | null
    teamIds: string[]
  }
}
