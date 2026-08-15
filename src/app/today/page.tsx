import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { AppNav, NAV_CLEARANCE } from '@/components/AppNav'
import { DayReading } from '@/components/DayReading'
import { DayNav } from '@/components/DayNav'
import { Panel } from '@/components/ui'
import { getDayView, todayForUser } from '@/app/actions/reading'
import type { Locale } from '@/lib/bazi'

export const metadata = { title: 'Hôm Nay | Bát Tự' }

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string; date?: string }>
}) {
  const params = await searchParams
  const session = await auth()
  const userId = session!.user!.id

  const [user, profiles] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { locale: true } }),
    prisma.profile.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    }),
  ])
  const locale = (user?.locale ?? 'vi') as Locale
  const vi = locale === 'vi'

  if (profiles.length === 0) {
    return (
      <>
        <AppNav active="/today" />
        <main className={`mx-auto max-w-2xl px-4 py-16 sm:px-6 ${NAV_CLEARANCE}`}>
          <Panel className="text-center">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
              {vi ? 'Chưa có lá số nào' : 'No chart saved yet'}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              {vi
                ? 'Luận giải hằng ngày được tính từ tứ trụ gốc, nên cần lưu ít nhất một lá số trước.'
                : 'A daily reading is derived from a natal chart, so there needs to be one saved first.'}
            </p>
            <Link
              href="/profiles/new"
              className="mt-5 inline-block cursor-pointer rounded-seal bg-cinnabar px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              {vi ? 'Lưu lá số đầu tiên' : 'Save your first chart'}
            </Link>
          </Panel>
        </main>
      </>
    )
  }

  const active = profiles.find((p) => p.id === params.profile) ?? profiles[0]
  const today = await todayForUser()
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today

  const view = await getDayView(active.id, date, locale)

  return (
    <>
      <AppNav active="/today" />
      <main className={`mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 ${NAV_CLEARANCE}`}>
        <DayNav
          profiles={profiles.map((p) => ({ id: p.id, name: p.name, relation: p.relation }))}
          activeProfileId={active.id}
          date={date}
          today={today}
          locale={locale}
        />
        <div className="mt-6">
          <DayReading view={view} locale={locale} profileId={active.id} />
        </div>
      </main>
    </>
  )
}
