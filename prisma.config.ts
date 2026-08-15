import { defineConfig, env } from '@prisma/config'

// Prisma 7 does not read .env on its own, and the CLI runs outside Next.js's
// env loading, so pull the file in explicitly before the config is evaluated.
try {
  process.loadEnvFile('.env')
} catch {
  // Fine in CI or production, where the environment is already populated.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
