'use client'

import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/bazi'
import { Han } from './ui'

const RELATION_LABEL: Record<string, { vi: string; en: string }> = {
  SELF: { vi: 'Bản thân', en: 'Self' },
  FAMILY: { vi: 'Gia đình', en: 'Family' },
  FRIEND: { vi: 'Bạn bè', en: 'Friend' },
  OTHER: { vi: 'Khác', en: 'Other' },
}

const shiftDate = (date: string, days: number) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

export function DayNav({
  profiles,
  activeProfileId,
  date,
  today,
  locale,
}: {
  profiles: { id: string; name: string; relation: string }[]
  activeProfileId: string
  date: string
  today: string
  locale: Locale
}) {
  const router = useRouter()
  const vi = locale === 'vi'

  const go = (nextProfile: string, nextDate: string) => {
    const q = new URLSearchParams({ profile: nextProfile })
    if (nextDate !== today) q.set('date', nextDate)
    router.push(`/today?${q.toString()}`)
  }

  const formatted = new Intl.DateTimeFormat(vi ? 'vi-VN' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      {profiles.length > 1 ? (
        <select
          value={activeProfileId}
          onChange={(e) => go(e.target.value, date)}
          aria-label={vi ? 'Chọn hồ sơ' : 'Select profile'}
          className="w-full cursor-pointer rounded-seal border border-rule bg-paper px-3 py-2.5 text-sm text-ink transition-colors duration-200 hover:border-rule-strong focus:border-cinnabar focus:outline-none sm:w-auto sm:py-2"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {vi ? RELATION_LABEL[p.relation]?.vi : RELATION_LABEL[p.relation]?.en}
            </option>
          ))}
        </select>
      ) : (
        <div className="text-sm font-medium text-ink">{profiles[0]?.name}</div>
      )}

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <button
          type="button"
          onClick={() => go(activeProfileId, shiftDate(date, -1))}
          aria-label={vi ? 'Ngày trước' : 'Previous day'}
          className="flex size-11 cursor-pointer items-center justify-center rounded-seal border border-rule text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink sm:size-9"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="min-w-0 flex-1 px-2 text-center sm:min-w-[190px] sm:flex-none">
          <div className="text-sm font-medium text-ink">{formatted}</div>
          {date !== today && (
            <button
              type="button"
              onClick={() => go(activeProfileId, today)}
              className="cursor-pointer text-[11px] text-cinnabar underline-offset-2 hover:underline"
            >
              {vi ? 'Về hôm nay' : 'Back to today'}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => go(activeProfileId, shiftDate(date, 1))}
          aria-label={vi ? 'Ngày sau' : 'Next day'}
          className="flex size-11 cursor-pointer items-center justify-center rounded-seal border border-rule text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink sm:size-9"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <Han className="ml-2 hidden text-xs text-ink-faint sm:block">流日</Han>
      </div>
    </div>
  )
}
