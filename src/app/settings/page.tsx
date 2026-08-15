import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { AppNav } from '@/components/AppNav'
import { SettingsForm } from '@/components/SettingsForm'
import { Panel } from '@/components/ui'

export const metadata = { title: 'Cài Đặt | Bát Tự' }

export default async function SettingsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { name: true, email: true, locale: true, timeZone: true, dailyEmail: true, dailyEmailHour: true },
  })

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Cài Đặt</h1>
        <Panel>
          <SettingsForm
            initial={{
              name: user?.name ?? '',
              email: user?.email ?? '',
              locale: (user?.locale ?? 'vi') as 'vi' | 'en',
              timeZone: user?.timeZone ?? 'Asia/Ho_Chi_Minh',
              dailyEmail: user?.dailyEmail ?? false,
              dailyEmailHour: user?.dailyEmailHour ?? 7,
            }}
          />
        </Panel>
      </main>
    </>
  )
}
