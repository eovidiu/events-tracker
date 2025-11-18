import type { Session, User } from 'lucia'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string | null
    session: Session | null
  }
}
