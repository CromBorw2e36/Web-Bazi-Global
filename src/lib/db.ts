import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Prisma 7 reaches Postgres through a driver adapter rather than a bundled
 * engine, so the connection string is supplied here instead of in the schema.
 *
 * The instance is cached on globalThis because Next.js reloads modules on every
 * edit in development, and a fresh client per reload exhausts the connection
 * pool within a few minutes of work.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and start Postgres with `docker compose up -d`.')
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
