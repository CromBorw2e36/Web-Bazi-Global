import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Han } from '@/components/ui'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user?.email || session.user.email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-rule bg-paper-raised/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5 sm:px-6 sm:py-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-seal bg-cinnabar">
              <Han className="text-sm leading-none font-bold text-white">管</Han>
            </span>
            <span className="font-[family-name:var(--font-display)] text-base font-bold text-ink">Quản trị</span>
          </Link>
          
          <div className="flex-1" />

          <Link href="/today" className="text-sm font-medium text-ink-soft hover:text-ink">
            &larr; Về trang chính
          </Link>
          <div className="hidden h-5 w-px bg-rule sm:block" />
          <div className="hidden text-sm text-ink-soft sm:block">
            {session.user.name || session.user.email}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
