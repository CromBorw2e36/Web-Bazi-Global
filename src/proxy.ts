import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

/*
  Next.js 16 renamed middleware to proxy. Only the edge-safe half of the auth
  config is used here — the Prisma adapter and bcrypt live in auth.ts and never
  reach this bundle, which has no Node built-ins available.

  The handler is bound to a named const before being exported: Next's build-time
  analysis reads the export statically, and a destructured `export const { auth }`
  does not register as a function export.
*/
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
}
