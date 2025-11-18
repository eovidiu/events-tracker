import { FastifyInstance } from 'fastify'
import fastifyCors from '@fastify/cors'

export async function corsPlugin(fastify: FastifyInstance) {
  console.log('🔧 Registering CORS plugin...')

  await fastify.register(fastifyCors, {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  })

  console.log('✅ CORS plugin registered successfully')
}
