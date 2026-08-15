import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { authConfig } from './auth.config'
import { credentialsSchema } from '@/lib/validation'

/*
  @auth/prisma-adapter's signature is written against the legacy generator's
  PrismaClient type, which is structurally different from the one Prisma 7's
  `prisma-client` generator emits. The runtime contract the adapter actually
  uses — user/account/session/verificationToken delegates — is identical, so the
  mismatch is purely nominal. Cast at this single boundary rather than loosening
  types anywhere the client is actually used.
*/
const adapter = PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0])

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })

        // An account created through Google has no password hash. Comparing
        // against a dummy hash anyway keeps the response time the same whether
        // the address exists or not, so this cannot be used to enumerate users.
        const hash = user?.passwordHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv'
        const ok = await bcrypt.compare(parsed.data.password, hash)

        if (!user?.passwordHash || !ok) return null
        return { id: user.id, name: user.name, email: user.email, image: user.image }
      },
    }),
  ],
})
