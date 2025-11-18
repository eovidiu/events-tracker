import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import { swaggerPlugin } from './plugins/swagger.js'
import { createAuthMiddleware } from './middleware/auth.js'
import { createTeamContextMiddleware } from './middleware/teamContext.js'
import { createAuthRoutes } from './routes/auth.js'
import { createEventsRoutes } from './routes/events.js'
import { db as defaultDb, sqlite as defaultSqlite } from './db/client.js'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from './db/schema.js'
import type BetterSqlite3 from 'better-sqlite3'

export async function buildApp(
  testDb?: BetterSQLite3Database<typeof schema>,
  testSqlite?: BetterSqlite3.Database
) {
  const db = testDb || defaultDb
  const sqlite = testSqlite || defaultSqlite
  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
    // T121: Generate request ID for distributed tracing
    genReqId: (req) => {
      return req.headers['x-request-id'] || crypto.randomUUID()
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  })

  // Register plugins
  // CORS must be registered first - register directly without wrapper
  console.log('🔧 Registering CORS plugin directly...')
  await fastify.register(fastifyCors, {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  })
  console.log('✅ CORS plugin registered')

  await fastify.register(fastifyCookie)

  // Temporarily disable Helmet for debugging
  // await fastify.register(fastifyHelmet, {
  //   contentSecurityPolicy: false, // Disable for development
  //   crossOriginResourcePolicy: false, // Disable for CORS
  // })

  await fastify.register(swaggerPlugin)

  // T121: Log request details with request ID
  fastify.addHook('onRequest', async (request, _reply) => {
    request.log.info({
      requestId: request.id,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
    }, 'Incoming request')
  })

  // Add global hooks for auth and team context
  fastify.addHook('onRequest', createAuthMiddleware(sqlite))
  fastify.addHook('onRequest', createTeamContextMiddleware(db))

  // T121: Log response with request ID
  fastify.addHook('onResponse', async (request, reply) => {
    request.log.info({
      requestId: request.id,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    }, 'Request completed')
  })

  // Register routes
  await fastify.register(createAuthRoutes(sqlite, db), { prefix: '/api/v1/auth' })
  await fastify.register(createEventsRoutes(db), { prefix: '/api/v1' })

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  return fastify
}
