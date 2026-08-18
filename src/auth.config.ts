import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import { isAdminEmail } from '@/lib/admin'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin?: boolean
    } & import('next-auth').DefaultSession['user']
  }
  interface User {
    isAdmin?: boolean
  }
}
/**
 * The half of the auth config that must run on the edge, in middleware.
 *
 * Anything touching Prisma or bcrypt lives in `auth.ts` instead — those pull in
 * Node built-ins that the edge runtime does not provide, and importing them
 * here would break every request rather than just the sign-in route.
 */

/** Google is only offered when it has actually been configured. */
export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)

/** Routes that require a signed-in user. */
const PROTECTED = ['/today', '/profiles', '/journal', '/settings', '/admin']

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: googleEnabled ? [Google] : [],
  session: {
    // Credentials sign-in cannot use database sessions, and mixing strategies
    // across providers is worse than picking one for both.
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    authorized({ auth, request }) {
      const signedIn = Boolean(auth?.user)
      const path = request.nextUrl.pathname

      if (PROTECTED.some((p) => path === p || path.startsWith(`${p}/`))) {

        return signedIn
      }

      // Send an already-signed-in visitor away from the sign-in pages.
      if (signedIn && (path === '/login' || path === '/register')) {
        return Response.redirect(new URL('/today', request.nextUrl))
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
        /*
          Derived here rather than stamped into the token at sign-in. A JWT
          lives for thirty days, so a token-time answer would keep a promoted
          account locked out — and a demoted one still admitted — until it
          expired. The session is rebuilt per request, so the answer follows
          ADMIN_EMAIL immediately.
        */
        session.user.isAdmin = isAdminEmail(session.user.email)
      }
      return session
    },
  },
} satisfies NextAuthConfig
