'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { nearestPlace } from '@/lib/places'
import type { Locale } from '@/lib/bazi'

export interface PickedPoint {
  longitude: number
  latitude: number
  utcOffset: number
  label: string
}

/**
 * Click a map, get a longitude.
 *
 * Leaflet is loaded inside an effect rather than imported at module scope: it
 * touches `window` on import and would break server rendering. That also keeps
 * it out of the bundle for anyone who never opens the map, which is most people
 * — the province list covers them.
 *
 * The panel reports the resulting solar-time correction as you click, because
 * that number, not the coordinate, is what actually moves the chart.
 */
export function MapPicker({
  initial,
  locale,
  onPick,
  onClose,
}: {
  initial: { longitude: number; latitude: number }
  locale: Locale
  onPick: (p: PickedPoint) => void
  onClose: () => void
}) {
  const vi = locale === 'vi'
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<Marker | null>(null)

  const [point, setPoint] = useState(initial)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let map: LeafletMap | null = null

    void (async () => {
      const L = await import('leaflet')
      if (cancelled || !containerRef.current) return

      map = L.map(containerRef.current, { attributionControl: true }).setView(
        [initial.latitude, initial.longitude],
        9,
      )
      mapRef.current = map

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map)

      // A divIcon rather than Leaflet's default marker: the default pulls PNGs
      // by relative URL, which bundlers rewrite and then fail to resolve. This
      // also matches the seal red used everywhere else.
      const icon = L.divIcon({
        className: '',
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#b23a31;border:2px solid #fff;box-shadow:0 0 0 1px #b23a31"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      markerRef.current = L.marker([initial.latitude, initial.longitude], { icon }).addTo(map)

      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng
        markerRef.current?.setLatLng([lat, lng])
        setPoint({ latitude: lat, longitude: lng })
      })

      setReady(true)
    })()

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Runs once; later coordinate changes come from clicks on the map itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const near = nearestPlace(point.longitude, point.latitude)
  const correction = (point.longitude - near.utcOffset * 15) * 4

  const confirm = () =>
    onPick({
      longitude: Number(point.longitude.toFixed(4)),
      latitude: Number(point.latitude.toFixed(4)),
      utcOffset: near.utcOffset,
      label: vi ? `Toạ độ ${point.longitude.toFixed(2)}°` : `${point.longitude.toFixed(2)}° coordinate`,
    })

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={vi ? 'Chọn nơi sinh trên bản đồ' : 'Pick a birth place on the map'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-seal border border-rule bg-paper-raised">
        <header className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">
              {vi ? 'Chọn nơi sinh' : 'Pick a birth place'}
            </h2>
            <p className="mt-0.5 text-[11px] text-ink-faint">
              {vi ? 'Chạm vào bản đồ để đặt điểm' : 'Tap the map to drop a pin'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={vi ? 'Đóng' : 'Close'}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-seal border border-rule text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="relative min-h-0 flex-1">
          <div ref={containerRef} className="h-[46dvh] w-full sm:h-80" />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper-sunken text-xs text-ink-faint">
              {vi ? 'Đang tải bản đồ…' : 'Loading map…'}
            </div>
          )}
        </div>

        {/* What the click actually changed. The coordinate is a means; the
            correction is the thing that moves the hour pillar. */}
        <div className="border-t border-rule px-4 py-3">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] sm:grid-cols-4">
            <div>
              <dt className="text-ink-faint">{vi ? 'Kinh độ' : 'Longitude'}</dt>
              <dd className="font-medium tabular-nums text-ink">{point.longitude.toFixed(2)}°</dd>
            </div>
            <div>
              <dt className="text-ink-faint">{vi ? 'Vĩ độ' : 'Latitude'}</dt>
              <dd className="tabular-nums text-ink-soft">{point.latitude.toFixed(2)}°</dd>
            </div>
            <div>
              <dt className="text-ink-faint">{vi ? 'Múi giờ' : 'Time zone'}</dt>
              <dd className="tabular-nums text-ink-soft">
                UTC{near.utcOffset >= 0 ? '+' : ''}
                {near.utcOffset}
              </dd>
            </div>
            <div>
              <dt className="text-ink-faint">{vi ? 'Lệch giờ mặt trời' : 'Solar offset'}</dt>
              <dd className="font-medium tabular-nums text-cinnabar">
                {correction >= 0 ? '+' : ''}
                {correction.toFixed(1)} {vi ? 'phút' : 'min'}
              </dd>
            </div>
          </dl>

          <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
            {vi
              ? `Múi giờ đoán theo nơi gần nhất (${near.vi}) — sửa lại được nếu sai. Vĩ độ không ảnh hưởng tới lá số, chỉ để định vị trên bản đồ.`
              : `Time zone is guessed from the nearest listed place (${near.en}) — change it if that is wrong. Latitude does not affect the chart; it only places the pin.`}
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={confirm}
              className="min-h-11 flex-1 cursor-pointer rounded-seal bg-cinnabar px-4 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 sm:min-h-10"
            >
              {vi ? 'Dùng toạ độ này' : 'Use this point'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 cursor-pointer rounded-seal border border-rule px-4 text-sm text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink sm:min-h-10"
            >
              {vi ? 'Huỷ' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
