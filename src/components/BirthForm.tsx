'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { FIRST_YEAR, LAST_YEAR, UI, pick, type BirthInput, type Gender, type Locale } from '@/lib/bazi'
import { Han } from './ui'
import { PlaceField } from './PlaceField'
import type { CccdData } from '@/lib/cccd'

const CccdScanner = dynamic(() => import('./CccdScanner').then((m) => m.CccdScanner), { ssr: false })

const FIELD =
  'w-full rounded-seal border border-rule bg-paper px-3 py-2 text-sm text-ink transition-colors duration-200 hover:border-rule-strong focus:border-cinnabar focus:outline-none'

const LABEL = 'mb-1.5 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase'

export interface FormValues {
  date: string
  time: string
  gender: Gender
  /** null when the point came from the map rather than the list. */
  placeId: string | null
  placeName: string
  longitude: number
  latitude: number
  utcOffset: number
  useEquationOfTime: boolean
}

export const DEFAULT_VALUES: FormValues = {
  date: '1990-06-15',
  time: '08:30',
  gender: 'MALE',
  placeId: 'ha-noi',
  placeName: 'Hà Nội',
  longitude: 105.85,
  latitude: 21.03,
  utcOffset: 7,
  useEquationOfTime: true,
}

export function toBirthInput(v: FormValues): BirthInput | { error: string } {
  const [y, m, d] = v.date.split('-').map(Number)
  const [hh, mm] = v.time.split(':').map(Number)
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return { error: 'INVALID' }
  if (y < FIRST_YEAR + 1 || y > LAST_YEAR - 1) return { error: 'RANGE' }
  return {
    year: y,
    month: m,
    day: d,
    hour: hh,
    minute: mm,
    gender: v.gender,
    longitude: v.longitude,
    utcOffset: v.utcOffset,
    useEquationOfTime: v.useEquationOfTime,
  }
}

export function BirthForm({
  values,
  onChange,
  locale,
  error,
}: {
  values: FormValues
  onChange: (v: FormValues) => void
  locale: Locale
  error?: string
}) {
  const [showScanner, setShowScanner] = useState(false)
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => onChange({ ...values, [key]: value })

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-seal border border-cinnabar/30 px-3 py-1.5 text-xs font-medium text-cinnabar transition-colors hover:bg-cinnabar/5"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {locale === 'vi' ? 'Quét CCCD' : 'Scan ID card'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="birth-date">
            {pick(UI.birthDate, locale)}
          </label>
          <input
            id="birth-date"
            type="date"
            className={FIELD}
            value={values.date}
            min={`${FIRST_YEAR + 1}-01-01`}
            max={`${LAST_YEAR - 1}-12-31`}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="birth-time">
            {pick(UI.birthTime, locale)}
          </label>
          <input
            id="birth-time"
            type="time"
            className={FIELD}
            value={values.time}
            onChange={(e) => set('time', e.target.value)}
          />
        </div>
      </div>

      <fieldset>
        <legend className={LABEL}>{pick(UI.gender, locale)}</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['MALE', UI.male],
              ['FEMALE', UI.female],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => set('gender', value)}
              aria-pressed={values.gender === value}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-seal border px-3 py-2 text-sm transition-colors duration-200 ${
                values.gender === value
                  ? 'border-cinnabar bg-cinnabar/8 text-ink'
                  : 'border-rule bg-paper text-ink-soft hover:border-rule-strong'
              }`}
            >
              <Han className="text-base">{label.zh}</Han>
              {pick(label, locale)}
            </button>
          ))}
        </div>
      </fieldset>

      <PlaceField
        value={{
          placeId: values.placeId,
          placeName: values.placeName,
          longitude: values.longitude,
          latitude: values.latitude,
          utcOffset: values.utcOffset,
        }}
        onChange={(v) => onChange({ ...values, ...v })}
        locale={locale}
        idPrefix="birth"
      />

      <label className="flex cursor-pointer items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-cinnabar)]"
          checked={values.useEquationOfTime}
          onChange={(e) => set('useEquationOfTime', e.target.checked)}
        />
        <span className="text-xs leading-snug text-ink-soft">
          {pick(UI.useEot, locale)}
          <span className="mt-0.5 block text-[11px] text-ink-faint">
            {locale === 'vi'
              ? 'Cộng thêm sai lệch giữa giờ mặt trời thật và giờ mặt trời trung bình, dao động khoảng ±16 phút theo mùa.'
              : 'Adds the seasonal gap between apparent and mean solar time, which swings about ±16 minutes across the year.'}
          </span>
        </span>
      </label>

      {error && (
        <p className="flex items-start gap-1.5 rounded-seal border border-fire/40 bg-fire/5 px-3 py-2 text-xs text-fire">
          <span aria-hidden>⚠</span>
          <span>{error}</span>
        </p>
      )}

      {showScanner && (
        <CccdScanner
          onClose={() => setShowScanner(false)}
          onScan={(data) => {
            const dateStr = `${data.birthYear}-${String(data.birthMonth).padStart(2, '0')}-${String(data.birthDay).padStart(2, '0')}`
            onChange({ ...values, date: dateStr, gender: data.gender })
            setShowScanner(false)
          }}
        />
      )}
    </form>
  )
}
