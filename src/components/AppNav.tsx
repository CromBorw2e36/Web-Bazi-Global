import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { Han } from './ui'
import { ThemeToggle } from './ThemeToggle'
import { PlainToggle } from './PlainToggle'

const LINKS = [
  { href: '/today', vi: 'Hôm Nay', zh: '今日', icon: SunPath },
  { href: '/profiles', vi: 'Hồ Sơ', zh: '命造', icon: PeoplePath },
  { href: '/journal', vi: 'Nhật Ký', zh: '日誌', icon: BookPath },
  { href: '/', vi: 'Lập Số', zh: '排盤', icon: GridPath },
]

function SunPath() {
  return (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path strokeLinecap="round" d="M12 3v1.5M12 19.5V21M5.6 5.6l1 1M17.4 17.4l1 1M3 12h1.5M19.5 12H21M5.6 18.4l1-1M17.4 6.6l1-1" />
    </>
  )
}
function PeoplePath() {
  return (
    <>
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" d="M3.5 19a5.5 5.5 0 0111 0M16 6.2a3 3 0 010 5.6M17.5 19a5.5 5.5 0 00-2-4.2" />
    </>
  )
}
function BookPath() {
  return (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 5.5A1.5 1.5 0 015.5 4H10a2 2 0 012 2v13a2 2 0 00-2-2H5.5A1.5 1.5 0 014 15.5zM20 5.5A1.5 1.5 0 0018.5 4H14a2 2 0 00-2 2v13a2 2 0 012-2h4.5a1.5 1.5 0 001.5-1.5z"
    />
  )
}
function GridPath() {
  return (
    <path
      strokeLinecap="round"
      d="M4 4h6v16H4zM14 4h6v16h-6zM4 9.5h6M14 9.5h6"
    />
  )
}

/**
 * Two navigations, one source of truth.
 *
 * Four labelled links plus an account name and a sign-out button do not fit in
 * a 390px bar — they compress into an unreadable scroll strip. So the phone
 * gets a bottom tab row, where the thumb already is and where each target can
 * be a full 44px, and the top bar keeps only identity and the two controls that
 * are not navigation. Above `sm` the tabs disappear and the links move inline.
 */
export async function AppNav({ active }: { active?: string }) {
  const session = await auth()
  const signedIn = Boolean(session?.user)
  const isAdmin = Boolean(session?.user?.isAdmin)

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rule bg-paper-raised/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <Link href={signedIn ? '/today' : '/'} className="flex h-11 shrink-0 items-center gap-2.5 sm:h-auto">
            <span className="flex size-9 items-center justify-center rounded-seal bg-cinnabar">
              <Han className="text-sm leading-none font-bold text-white">八字</Han>
            </span>
            <span className="font-[family-name:var(--font-display)] text-base font-bold text-ink">Bát Tự</span>
          </Link>

          {/* Inline links, tablet and up. On a phone these live in the tab row. */}
          <nav className="hidden flex-1 items-center gap-1 sm:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active === l.href ? 'page' : undefined}
                className={`flex shrink-0 items-baseline gap-1.5 rounded-seal px-2.5 py-1.5 text-sm transition-colors duration-200 ${
                  active === l.href ? 'bg-cinnabar/10 text-cinnabar' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {l.vi}
                <Han className="text-[10px] opacity-60">{l.zh}</Han>
              </Link>
            ))}
            {/* Only the operator ever sees this; everyone else has no /admin to reach. */}
            {isAdmin && (
              <Link
                href="/admin"
                aria-current={active === '/admin' ? 'page' : undefined}
                className={`flex shrink-0 items-baseline gap-1.5 rounded-seal px-2.5 py-1.5 text-sm transition-colors duration-200 ${
                  active === '/admin' ? 'bg-cinnabar/10 text-cinnabar' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Quản trị
                <Han className="text-[10px] opacity-60">管理</Han>
              </Link>
            )}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
            <PlainToggle />
            <ThemeToggle />
            {signedIn ? (
              <>
                <Link
                  href="/settings"
                  className="hidden max-w-[140px] truncate text-xs text-ink-faint hover:text-ink md:block"
                >
                  {session!.user!.name ?? session!.user!.email}
                </Link>
                <form
                  action={async () => {
                    'use server'
                    await signOut({ redirectTo: '/' })
                  }}
                >
                  <button
                    type="submit"
                    aria-label="Đăng xuất"
                    className="flex h-11 cursor-pointer items-center rounded-seal border border-rule px-3 text-xs text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink sm:h-9"
                  >
                    Thoát
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="flex h-11 items-center rounded-seal bg-cinnabar px-3 text-xs font-semibold text-white transition-opacity duration-200 hover:opacity-90 sm:h-9"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/*
        Bottom tabs, phone only. Fixed rather than sticky so it stays put while a
        long reading scrolls, and padded by the safe-area inset so the labels
        clear the home indicator on iOS.
      */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper-raised/95 backdrop-blur-sm sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-md">
          {LINKS.map((l) => {
            const on = active === l.href
            const Icon = l.icon
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={on ? 'page' : undefined}
                className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-colors duration-200 ${
                  on ? 'text-cinnabar' : 'text-ink-faint active:text-ink'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-5" aria-hidden>
                  <Icon />
                </svg>
                <span className="text-[10px] font-medium">{l.vi}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

/**
 * Clears the fixed tab row. Every page that renders AppNav needs this on its
 * main element, or the last card sits under the tabs on a phone.
 */
export const NAV_CLEARANCE = 'pb-[calc(60px+env(safe-area-inset-bottom))] sm:pb-0'
