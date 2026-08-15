import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { AppNav, NAV_CLEARANCE } from '@/components/AppNav'
import { Panel, Han, ELEMENT_TEXT } from '@/components/ui'
import { formatDateOnly } from '@/lib/validation'
import { BRANCH_TERMS, STEM_TERMS, HEAVENLY_STEMS, dayPillarJz, stemOf, branchOf } from '@/lib/bazi'

export const metadata = { title: 'Nhật Ký | Bát Tự' }

const KIND_STYLE: Record<string, { label: string; glyph: string; tone: string }> = {
  GOOD: { label: 'Ngày tốt', glyph: '吉', tone: 'border-wood/40 bg-wood/5 text-wood' },
  BAD: { label: 'Ngày xấu', glyph: '凶', tone: 'border-fire/40 bg-fire/5 text-fire' },
  NOTE: { label: 'Đáng nhớ', glyph: '記', tone: 'border-water/40 bg-water/5 text-water' },
}

const MOOD_LABEL: Record<number, string> = {
  [-2]: 'Rất khó',
  [-1]: 'Khó',
  0: 'Bình thường',
  1: 'Tốt',
  2: 'Rất tốt',
}

function pillarFor(date: Date) {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()
  const jz = dayPillarJz(y, m, d)
  const stem = stemOf(jz)
  const branch = branchOf(jz)
  return {
    zh: `${STEM_TERMS[stem].zh}${BRANCH_TERMS[branch].zh}`,
    vi: `${STEM_TERMS[stem].vi} ${BRANCH_TERMS[branch].vi}`,
    element: HEAVENLY_STEMS[stem - 1].element,
  }
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string }>
}) {
  const params = await searchParams
  const session = await auth()
  const userId = session!.user!.id

  const profiles = await prisma.profile.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })

  if (profiles.length === 0) {
    return (
      <>
        <AppNav active="/journal" />
        <main className={`mx-auto max-w-2xl px-4 py-16 sm:px-6 ${NAV_CLEARANCE}`}>
          <Panel className="text-center">
            <p className="text-sm text-ink-soft">Chưa có hồ sơ nào để ghi nhật ký.</p>
            <Link href="/profiles/new" className="mt-3 inline-flex min-h-11 items-center px-2 text-sm text-cinnabar underline-offset-2 hover:underline">
              Thêm lá số
            </Link>
          </Panel>
        </main>
      </>
    )
  }

  const active = profiles.find((p) => p.id === params.profile) ?? profiles[0]

  const [entries, bookmarks] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { profileId: active.id },
      orderBy: { date: 'desc' },
      take: 60,
    }),
    prisma.dayBookmark.findMany({
      where: { profileId: active.id },
      orderBy: { date: 'desc' },
      take: 60,
    }),
  ])

  const bookmarkByDate = new Map(bookmarks.map((b) => [formatDateOnly(b.date), b]))
  // Days that carry a mark but no written note still belong in the timeline.
  const markOnly = bookmarks.filter((b) => !entries.some((e) => formatDateOnly(e.date) === formatDateOnly(b.date)))

  const timeline = [
    ...entries.map((e) => ({ date: e.date, note: e.note, mood: e.mood })),
    ...markOnly.map((b) => ({ date: b.date, note: '', mood: null as number | null })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <>
      <AppNav active="/journal" />
      <main className={`mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 ${NAV_CLEARANCE}`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Nhật Ký</h1>
            <p className="mt-0.5 text-xs text-ink-faint">Đối chiếu luận giải với thực tế đã xảy ra</p>
          </div>
          {profiles.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {profiles.map((p) => (
                <Link
                  key={p.id}
                  href={`/journal?profile=${p.id}`}
                  className={`rounded-seal border px-2.5 py-1.5 text-xs transition-colors duration-200 ${
                    p.id === active.id ? 'border-cinnabar bg-cinnabar/8 text-cinnabar' : 'border-rule text-ink-soft hover:border-rule-strong'
                  }`}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {timeline.length === 0 ? (
          <Panel className="text-center">
            <p className="text-sm text-ink-soft">Chưa có ghi chép nào cho hồ sơ này.</p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-ink-faint">
              Ghi lại điều đã xảy ra ở trang Hôm Nay. Sau vài tuần, đối chiếu ngược lại là cách duy nhất để biết luận
              giải có bám đúng thực tế của bạn hay không.
            </p>
            <Link href="/today" className="mt-3 inline-flex min-h-11 items-center px-2 text-sm text-cinnabar underline-offset-2 hover:underline">
              Tới trang Hôm Nay
            </Link>
          </Panel>
        ) : (
          <ul className="space-y-3">
            {timeline.map((item) => {
              const iso = formatDateOnly(item.date)
              const mark = bookmarkByDate.get(iso)
              const pillar = pillarFor(item.date)
              return (
                <li key={iso} className="rounded-seal border border-rule bg-paper-raised p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Han className={`text-2xl leading-none font-semibold ${ELEMENT_TEXT[pillar.element]}`}>
                        {pillar.zh}
                      </Han>
                      <div>
                        <Link href={`/today?profile=${active.id}&date=${iso}`} className="-my-2 inline-flex min-h-11 items-center py-2 text-sm font-medium text-ink hover:text-cinnabar sm:min-h-0 sm:my-0 sm:py-0">
                          {new Intl.DateTimeFormat('vi-VN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            timeZone: 'UTC',
                          }).format(item.date)}
                        </Link>
                        <div className="text-[11px] text-ink-faint">{pillar.vi}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {item.mood !== null && (
                        <span className="rounded-seal border border-rule px-2 py-1 text-[11px] text-ink-soft">
                          {MOOD_LABEL[item.mood]}
                        </span>
                      )}
                      {mark && (
                        <span className={`inline-flex items-center gap-1.5 rounded-seal border px-2 py-1 text-[11px] ${KIND_STYLE[mark.kind].tone}`}>
                          <Han className="text-[11px]">{KIND_STYLE[mark.kind].glyph}</Han>
                          {KIND_STYLE[mark.kind].label}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.note && (
                    <p className="mt-3 border-t border-rule pt-3 text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
                      {item.note}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </>
  )
}
