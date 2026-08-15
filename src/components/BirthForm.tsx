'use client'

import { useState } from 'react'
import { FIRST_YEAR, LAST_YEAR, UI, pick, type BirthInput, type Gender, type Locale } from '@/lib/bazi'
import { PLACES, findPlace } from '@/lib/places'
import { Han } from './ui'

const FIELD =
  'w-full rounded-seal border border-rule bg-paper px-3 py-2 text-sm text-ink transition-colors duration-200 hover:border-rule-strong focus:border-cinnabar focus:outline-none'

const LABEL = 'mb-1.5 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase'

export interface FormValues {
  date: string
  time: string
  gender: Gender
  placeId: string
  longitude: number
  utcOffset: number
  useEquationOfTime: boolean
}

export const DEFAULT_VALUES: FormValues = {
  date: '1990-06-15',
  time: '08:30',
  gender: 'MALE',
  placeId: 'hanoi',
  longitude: 105.85,
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
  const [manualPlace, setManualPlace] = useState(false)
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => onChange({ ...values, [key]: value })

  const selectPlace = (id: string) => {
    const place = findPlace(id)
    if (!place) return
    onChange({ ...values, placeId: id, longitude: place.longitude, utcOffset: place.utcOffset })
  }

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label className={`${LABEL} mb-0`} htmlFor="birth-place">
            {pick(UI.place, locale)}
          </label>
          <button
            type="button"
            onClick={() => setManualPlace((v) => !v)}
            className="cursor-pointer text-[11px] text-cinnabar underline-offset-2 hover:underline"
          >
            {manualPlace
              ? locale === 'vi'
                ? 'Chọn thành phố'
                : 'Pick a city'
              : locale === 'vi'
                ? 'Nhập toạ độ'
                : 'Enter coordinates'}
          </button>
        </div>

        {manualPlace ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] text-ink-faint" htmlFor="longitude">
                {pick(UI.longitude, locale)} (°E)
              </label>
              <input
                id="longitude"
                type="number"
                step="0.01"
                min={-180}
                max={180}
                className={FIELD}
                value={values.longitude}
                onChange={(e) => set('longitude', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-ink-faint" htmlFor="utc-offset">
                {pick(UI.timezone, locale)} (UTC)
              </label>
              <input
                id="utc-offset"
                type="number"
                step="0.5"
                min={-12}
                max={14}
                className={FIELD}
                value={values.utcOffset}
                onChange={(e) => set('utcOffset', Number(e.target.value))}
              />
            </div>
          </div>
        ) : (
          <select
            id="birth-place"
            className={`${FIELD} cursor-pointer`}
            value={values.placeId}
            onChange={(e) => selectPlace(e.target.value)}
          >
            {PLACES.map((p) => (
              <option key={p.id} value={p.id}>
                {locale === 'vi' ? p.vi : p.en} · {p.longitude > 0 ? `${p.longitude}°E` : `${-p.longitude}°W`} · UTC
                {p.utcOffset >= 0 ? `+${p.utcOffset}` : p.utcOffset}
              </option>
            ))}
          </select>
        )}
      </div>

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
    </form>
  )
}
