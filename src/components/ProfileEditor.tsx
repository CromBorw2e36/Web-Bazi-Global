'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FIRST_YEAR, LAST_YEAR } from '@/lib/bazi'
import { PLACES, findPlace } from '@/lib/places'
import { createProfile, updateProfile } from '@/app/actions/profiles'

const FIELD =
  'w-full rounded-seal border border-rule bg-paper px-3 py-2 text-sm text-ink transition-colors duration-200 hover:border-rule-strong focus:border-cinnabar focus:outline-none'
const LABEL = 'mb-1.5 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase'

export interface ProfileValues {
  id?: string
  name: string
  relation: 'SELF' | 'FAMILY' | 'FRIEND' | 'OTHER'
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  birthMinute: number
  gender: 'MALE' | 'FEMALE'
  longitude: number
  utcOffset: number
  placeId: string | null
  placeName: string
  useEquationOfTime: boolean
}

export const EMPTY_PROFILE: ProfileValues = {
  name: '',
  relation: 'SELF',
  birthYear: 1990,
  birthMonth: 6,
  birthDay: 15,
  birthHour: 8,
  birthMinute: 30,
  gender: 'MALE',
  longitude: 105.85,
  utcOffset: 7,
  placeId: 'hanoi',
  placeName: 'Hà Nội',
  useEquationOfTime: true,
}

export function ProfileEditor({ initial }: { initial: ProfileValues }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [error, setError] = useState<string>()
  const [fields, setFields] = useState<Record<string, string>>({})
  const [pending, start] = useTransition()
  const [manual, setManual] = useState(!v.placeId)

  const set = <K extends keyof ProfileValues>(k: K, value: ProfileValues[K]) => setV({ ...v, [k]: value })

  const selectPlace = (id: string) => {
    const place = findPlace(id)
    if (!place) return
    setV({ ...v, placeId: id, placeName: place.vi, longitude: place.longitude, utcOffset: place.utcOffset })
  }

  const date = `${v.birthYear}-${String(v.birthMonth).padStart(2, '0')}-${String(v.birthDay).padStart(2, '0')}`
  const time = `${String(v.birthHour).padStart(2, '0')}:${String(v.birthMinute).padStart(2, '0')}`

  const submit = () => {
    setError(undefined)
    setFields({})
    start(async () => {
      const payload = { ...v, placeId: v.placeId ?? null }
      const result = v.id ? await updateProfile(v.id, payload) : await createProfile(payload)
      if (!result.ok) {
        setError(result.error)
        setFields(result.fields ?? {})
        return
      }
      router.push('/profiles')
      router.refresh()
    })
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="p-name">
            Tên hồ sơ
          </label>
          <input
            id="p-name"
            className={FIELD}
            value={v.name}
            maxLength={80}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ví dụ: Mẹ, Con trai, Tôi"
          />
          {fields.name && <p className="mt-1 text-[11px] text-fire">{fields.name}</p>}
        </div>
        <div>
          <label className={LABEL} htmlFor="p-relation">
            Quan hệ
          </label>
          <select
            id="p-relation"
            className={`${FIELD} cursor-pointer`}
            value={v.relation}
            onChange={(e) => set('relation', e.target.value as ProfileValues['relation'])}
          >
            <option value="SELF">Bản thân</option>
            <option value="FAMILY">Gia đình</option>
            <option value="FRIEND">Bạn bè</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="p-date">
            Ngày sinh
          </label>
          <input
            id="p-date"
            type="date"
            className={FIELD}
            value={date}
            min={`${FIRST_YEAR + 1}-01-01`}
            max={`${LAST_YEAR - 1}-12-31`}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split('-').map(Number)
              if (y && m && d) setV({ ...v, birthYear: y, birthMonth: m, birthDay: d })
            }}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="p-time">
            Giờ sinh
          </label>
          <input
            id="p-time"
            type="time"
            className={FIELD}
            value={time}
            onChange={(e) => {
              const [h, mi] = e.target.value.split(':').map(Number)
              if (!Number.isNaN(h) && !Number.isNaN(mi)) setV({ ...v, birthHour: h, birthMinute: mi })
            }}
          />
        </div>
      </div>

      <fieldset>
        <legend className={LABEL}>Giới tính</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['MALE', 'Nam', '乾'],
              ['FEMALE', 'Nữ', '坤'],
            ] as const
          ).map(([value, label, glyph]) => (
            <button
              key={value}
              type="button"
              onClick={() => set('gender', value)}
              aria-pressed={v.gender === value}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-seal border px-3 py-2 text-sm transition-colors duration-200 ${
                v.gender === value ? 'border-cinnabar bg-cinnabar/8 text-ink' : 'border-rule bg-paper text-ink-soft hover:border-rule-strong'
              }`}
            >
              <span style={{ fontFamily: "'Noto Serif TC', serif" }}>{glyph}</span>
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className={`${LABEL} mb-0`}>Nơi sinh</span>
          <button
            type="button"
            onClick={() => setManual((m) => !m)}
            className="-my-3 cursor-pointer py-3 text-[11px] text-cinnabar underline-offset-2 hover:underline"
          >
            {manual ? 'Chọn thành phố' : 'Nhập toạ độ'}
          </button>
        </div>

        {manual ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              className={FIELD}
              value={v.placeName}
              maxLength={120}
              onChange={(e) => setV({ ...v, placeName: e.target.value, placeId: null })}
              placeholder="Tên nơi sinh"
              aria-label="Tên nơi sinh"
            />
            <input
              className={FIELD}
              type="number"
              step="0.01"
              min={-180}
              max={180}
              value={v.longitude}
              onChange={(e) => set('longitude', Number(e.target.value))}
              aria-label="Kinh độ"
              placeholder="Kinh độ °E"
            />
            <input
              className={FIELD}
              type="number"
              step="0.5"
              min={-12}
              max={14}
              value={v.utcOffset}
              onChange={(e) => set('utcOffset', Number(e.target.value))}
              aria-label="Múi giờ UTC"
              placeholder="UTC"
            />
          </div>
        ) : (
          <select className={`${FIELD} cursor-pointer`} value={v.placeId ?? ''} onChange={(e) => selectPlace(e.target.value)}>
            {PLACES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.vi} · {p.longitude > 0 ? `${p.longitude}°E` : `${-p.longitude}°W`} · UTC
                {p.utcOffset >= 0 ? `+${p.utcOffset}` : p.utcOffset}
              </option>
            ))}
          </select>
        )}
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
          Kinh độ quyết định giờ mặt trời thật, nên ảnh hưởng trực tiếp tới trụ giờ. Múi giờ là múi giờ hành chính lúc
          sinh — người sinh thời chiến hoặc trước cải cách giờ cần nhập tay.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-cinnabar)]"
          checked={v.useEquationOfTime}
          onChange={(e) => set('useEquationOfTime', e.target.checked)}
        />
        <span className="text-xs leading-snug text-ink-soft">Hiệu chỉnh phương trình thời gian</span>
      </label>

      {error && (
        <p className="flex items-start gap-1.5 rounded-seal border border-fire/40 bg-fire/5 px-3 py-2 text-xs text-fire">
          <span aria-hidden>⚠</span>
          <span>{error}</span>
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-seal bg-cinnabar px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'Đang lưu…' : v.id ? 'Cập nhật' : 'Lưu lá số'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/profiles')}
          className="cursor-pointer rounded-seal border border-rule px-4 py-2 text-sm text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink"
        >
          Huỷ
        </button>
      </div>
    </form>
  )
}
