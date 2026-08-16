import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { AppNav } from '@/components/AppNav'
import { BaziApp } from '@/components/BaziApp'

/**
 * The public calculator.
 *
 * The engine is pure TypeScript over ~26 KB of generated tables, so the whole
 * chart is cast in the browser — every edit to the form is instant and the page
 * works offline once loaded. Nothing here needs an account.
 *
 * The current year is resolved on the server and handed down rather than read
 * from the clock inside a component, so the server and client markup agree on
 * which luck pillar is the active one.
 *
 * Saved profiles are fetched on the server so the calculator can offer a "load
 * from profile" option without a waterfall fetch on the client.
 */
export default async function Home() {
  const session = await auth()
  const signedIn = Boolean(session?.user)

  const profiles = signedIn
    ? await prisma.profile.findMany({
        where: { userId: session!.user!.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          name: true,
          relation: true,
          isDefault: true,
          birthYear: true,
          birthMonth: true,
          birthDay: true,
          birthHour: true,
          birthMinute: true,
          gender: true,
          longitude: true,
          latitude: true,
          utcOffset: true,
          placeId: true,
          placeName: true,
          useEquationOfTime: true,
        },
      })
    : []

  return (
    <>
      <AppNav active="/" />
      <BaziApp currentYear={new Date().getFullYear()} signedIn={signedIn} profiles={profiles} />
    </>
  )
}
