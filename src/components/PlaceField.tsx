'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { PLACES, REGION_LABEL, findPlace, placesByRegion } from '@/lib/places'
import type { Locale } from '@/lib/bazi'
import type { PickedPoint } from './MapPicker'

// Leaflet and its CSS only load when someone actually opens the map. The
// province list serves almost everyone, so this keeps ~150 KB out of the path
// most people take.
const MapPicker = dynamic(() => import('./MapPicker').then((m) => m.MapPicker), { ssr: false })

export interface PlaceValue {
  placeId: string | null
  placeName: string
  longitude: number
  latitude: number
  utcOffset: number
}

const FIELD =
  'w-full rounded-seal border border-rule bg-paper px-3 py-2.5 text-sm text-ink transition-colors duration-200 hover:border-rule-strong focus:border-cinnabar focus:outline-none sm:py-2'
const LABEL = 'mb-1.5 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase'

/**
 * Birth place, as a list or a point on a map.
 *
 * The list is the fast path and covers every Vietnamese province plus the
 * cities the diaspora is actually in. The map is for everything else — a
 * village, a birth abroad, anywhere the list does not name — and it exists
 * because asking someone for their birth longitude is not a question a person
 * can answer.
 */
export function PlaceField({
  value,
  onChange,
  locale,
  idPrefix = 'place',
}: {
  value: PlaceValue
  onChange: (v: PlaceValue) => void
  locale: Locale
  idPrefix?: string
}) {
  const vi = locale === 'vi'
  const [mapOpen, setMapOpen] = useState(false)

  const selectPlace = (id: string) => {
    const p = findPlace(id)
    if (!p) return
    onChange({
      placeId: p.id,
      placeName: vi ? p.vi : p.en,
      longitude: p.longitude,
      latitude: p.latitude,
      utcOffset: p.utcOffset,
    })
  }

  const applyPoint = (p: PickedPoint) => {
    onChange({
      placeId: null,
      placeName: p.label,
      longitude: p.longitude,
      latitude: p.latitude,
      utcOffset: p.utcOffset,
    })
    setMapOpen(false)
  }

  const custom = value.placeId === null

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className={`${LABEL} mb-0`} htmlFor={`${idPrefix}-select`}>
          {vi ? 'Nơi sinh' : 'Birth place'}
        </label>
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="-my-3 flex cursor-pointer items-center gap-1 py-3 text-[11px] text-cinnabar underline-offset-2 hover:underline"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.4" />
          </svg>
          {vi ? 'Chọn trên bản đồ' : 'Pick on a map'}
        </button>
      </div>

      {custom ? (
        // A map-picked point has no entry in the list, so show what was picked
        // and offer the way back rather than snapping the select to something
        // that is not what the user chose.
        <div className="flex items-center justify-between gap-3 rounded-seal border border-cinnabar/40 bg-cinnabar/5 px-3 py-2.5">
          <div className="min-w-0">
            <div className="truncate text-sm text-ink">{value.placeName}</div>
            <div className="text-[11px] tabular-nums text-ink-faint">
              {value.longitude.toFixed(2)}°{value.longitude >= 0 ? 'E' : 'W'} · UTC
              {value.utcOffset >= 0 ? '+' : ''}
              {value.utcOffset}
            </div>
          </div>
          <button
            type="button"
            onClick={() => selectPlace(PLACES[0].id)}
            className="shrink-0 cursor-pointer text-[11px] text-cinnabar underline-offset-2 hover:underline"
          >
            {vi ? 'Chọn từ danh sách' : 'Use the list'}
          </button>
        </div>
      ) : (
        <select
          id={`${idPrefix}-select`}
          className={`${FIELD} cursor-pointer`}
          value={value.placeId ?? ''}
          onChange={(e) => selectPlace(e.target.value)}
        >
          {placesByRegion().map(({ region, places }) => (
            <optgroup key={region} label={vi ? REGION_LABEL[region].vi : REGION_LABEL[region].en}>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {vi ? p.vi : p.en}
                  {region === 'quocte'
                    ? ` · UTC${p.utcOffset >= 0 ? '+' : ''}${p.utcOffset}`
                    : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      )}

      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
        {vi
          ? 'Kinh độ quyết định giờ mặt trời thật nên ảnh hưởng trực tiếp tới trụ giờ. Sai vài chục cây số không đổi gì — cả nước chỉ chênh nhau 25 phút, mà trụ giờ đổi mỗi 2 tiếng.'
          : 'Longitude sets local solar time, so it moves the hour pillar. Being off by a few tens of kilometres changes nothing: all of Vietnam spans 25 minutes and the hour pillar turns every two.'}
      </p>

      {mapOpen && (
        <MapPicker
          initial={{ longitude: value.longitude, latitude: value.latitude }}
          locale={locale}
          onPick={applyPoint}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  )
}
