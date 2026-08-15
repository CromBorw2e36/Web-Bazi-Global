import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { Han } from './ui'
import { ThemeToggle } from './ThemeToggle'

const LINKS = [
  { href: '/today', vi: 'Hôm Nay', zh: '今日' },
  { href: '/profiles', vi: 'Hồ Sơ', zh: '命造' },
  { href: '/journal', vi: 'Nhật Ký', zh: '日誌' },
  { href: '/', vi: 'Lập Lá Số', zh: '排盤' },
]

export async function AppNav({ active }: { active?: string }) {
  const session = await auth()

  return (
    <header className="border-b border-rule bg-paper-raised">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/today" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-seal bg-cinnabar">
            <Han className="text-sm leading-none font-bold text-white">八字</Han>
          </span>
          <span className="hidden font-[family-name:var(--font-display)] text-base font-bold text-ink sm:block">
            Bát Tự
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex shrink-0 items-baseline gap-1.5 rounded-seal px-2.5 py-1.5 text-sm transition-colors duration-200 ${
                active === l.href ? 'bg-cinnabar/10 text-cinnabar' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {l.vi}
              <Han className="text-[10px] opacity-60">{l.zh}</Han>
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {session?.user ? (
            <>
              <Link
                href="/settings"
                className="hidden max-w-[140px] truncate text-xs text-ink-faint hover:text-ink sm:block"
              >
                {session.user.name ?? session.user.email}
              </Link>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button
                  type="submit"
                  className="cursor-pointer rounded-seal border border-rule px-2.5 py-1.5 text-xs text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink"
                >
                  Thoát
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-seal bg-cinnabar px-3 py-1.5 text-xs font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
