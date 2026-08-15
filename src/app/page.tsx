import { auth } from '@/auth'
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
 */
export default async function Home() {
  const session = await auth()

  return (
    <>
      <AppNav active="/" />
      <BaziApp currentYear={new Date().getFullYear()} signedIn={Boolean(session?.user)} />
    </>
  )
}
