'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { PLACES, REGION_LABEL, findPlace, searchPlaces, type Place, type Region } from '@/lib/places'
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
 * Birth place, as a searchable list or a point on a map.
 *
 * A native select with 95 options is a scroll, not a choice — worse on a phone,
 * where the picker is a wheel. This is a combobox instead: type to narrow,
 * arrows to move, Enter to take. Matching ignores diacritics, because people
 * type "dong nai", not "Đồng Nai".
 *
 * The map handles everything the list does not name — a village, a birth
 * abroad — because asking someone for their birth longitude is not a question a
 * person can answer.
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
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)

  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const results = useMemo(() => searchPlaces(query), [query])
  const custom = value.placeId === null

  // Close on a click anywhere else, and on Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Keep the highlighted row in view while arrowing through it.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const choose = (p: Place) => {
    onChange({
      placeId: p.id,
      placeName: vi ? p.vi : p.en,
      longitude: p.longitude,
      latitude: p.latitude,
      utcOffset: p.utcOffset,
    })
    setQuery('')
    setOpen(false)
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

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      setCursor((c) => {
        const next = e.key === 'ArrowDown' ? c + 1 : c - 1
        return Math.max(0, Math.min(results.length - 1, next))
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && results[cursor]) choose(results[cursor])
      else setOpen(true)
    }
  }

  /*
    Region headers only make sense in the unfiltered list; once results are
    ranked by how well they match, grouping them by geography fights that order.

    Computed up front rather than tracked with a running variable during render:
    mutating across a map callback is exactly what the compiler cannot reason
    about, and it breaks outright if React ever re-orders the work.
  */
  const headers = useMemo(() => {
    if (query.trim() !== '') return new Map<number, Region>()
    const out = new Map<number, Region>()
    let last: Region | null = null
    results.forEach((p, i) => {
      if (p.region !== last) {
        out.set(i, p.region)
        last = p.region
      }
    })
    return out
  }, [results, query])

  return (
    <div ref={rootRef} className="relative">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className={`${LABEL} mb-0`} htmlFor={`${idPrefix}-input`}>
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
        // rather than snapping the field back to something the user did not choose.
        <div className="flex items-center justify-between gap-3 rounded-seal border border-cinnabar/40 bg-cinnabar/5 px-3 py-2.5">
          <div className="min-w-0">
            <div className="truncate text-sm text-ink">{value.placeName}</div>
            <div className="text-[11px] tabular-nums text-ink-faint">
              {Math.abs(value.longitude).toFixed(2)}°{value.longitude >= 0 ? 'E' : 'W'} · UTC
              {value.utcOffset >= 0 ? '+' : ''}
              {value.utcOffset}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const p = findPlace('ha-noi') ?? PLACES[0]
              choose(p)
            }}
            className="shrink-0 cursor-pointer text-[11px] text-cinnabar underline-offset-2 hover:underline"
          >
            {vi ? 'Chọn từ danh sách' : 'Use the list'}
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <input
              id={`${idPrefix}-input`}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls={`${idPrefix}-list`}
              aria-autocomplete="list"
              autoComplete="off"
              className={`${FIELD} pr-9`}
              value={open ? query : value.placeName}
              placeholder={vi ? 'Gõ để tìm tỉnh thành…' : 'Type to search…'}
              onFocus={() => {
                setOpen(true)
                setQuery('')
                setCursor(0)
              }}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
                setCursor(0)
              }}
              onKeyDown={onKeyDown}
            />
            <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-faint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
              </svg>
            </span>
          </div>

          {open && (
            <ul
              id={`${idPrefix}-list`}
              ref={listRef}
              role="listbox"
              className="absolute z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-seal border border-rule-strong bg-paper-raised py-1 shadow-lg"
            >
              {results.length === 0 && (
                <li className="px-3 py-3 text-xs text-ink-faint">
                  {vi
                    ? 'Không tìm thấy. Thử bỏ dấu, hoặc chọn trên bản đồ.'
                    : 'No match. Try without diacritics, or pick on the map.'}
                </li>
              )}
              {results.map((p, i) => {
                const header = headers.get(i)
                return (
                  <li key={p.id}>
                    {header && (
                      <div className="mt-1 border-t border-rule px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase first:mt-0 first:border-t-0 first:pt-1">
                        {vi ? REGION_LABEL[header].vi : REGION_LABEL[header].en}
                      </div>
                    )}
                    <button
                      type="button"
                      data-index={i}
                      role="option"
                      aria-selected={p.id === value.placeId}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => choose(p)}
                      className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-3 text-left text-sm transition-colors duration-100 sm:min-h-9 ${
                        i === cursor ? 'bg-cinnabar/10 text-ink' : 'text-ink-soft'
                      }`}
                    >
                      <span className="truncate">{vi ? p.vi : p.en}</span>
                      {p.region === 'quocte' && (
                        <span className="shrink-0 text-[11px] tabular-nums text-ink-faint">
                          UTC{p.utcOffset >= 0 ? '+' : ''}
                          {p.utcOffset}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
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
