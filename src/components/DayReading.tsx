'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  BRANCH_TERMS,
  ELEMENT_TERMS,
  PHASE_TERMS,
  PILLAR_TERMS,
  RELATION_TERMS,
  STEM_TERMS,
  TEN_GOD_TERMS,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  groupHits,
  pick,
  type Locale,
} from '@/lib/bazi'
import type { DayView } from '@/app/actions/reading'
import { saveJournal, toggleBookmark } from '@/app/actions/reading'
import { ELEMENT_TEXT, Han, Panel, SectionTitle } from './ui'

const BAND_LABEL: Record<string, { vi: string; en: string; tone: string }> = {
  AUSPICIOUS: { vi: 'Rất thuận', en: 'Auspicious', tone: 'text-wood border-wood/40 bg-wood/5' },
  FAVOURABLE: { vi: 'Thuận', en: 'Favourable', tone: 'text-wood border-wood/30 bg-wood/5' },
  NEUTRAL: { vi: 'Bình hòa', en: 'Neutral', tone: 'text-ink-soft border-rule bg-paper' },
  CAUTION: { vi: 'Cần thận trọng', en: 'Caution', tone: 'text-earth border-earth/40 bg-earth/5' },
  CHALLENGING: { vi: 'Nghịch', en: 'Challenging', tone: 'text-fire border-fire/40 bg-fire/5' },
}

export function DayReading({
  view,
  locale,
  profileId,
}: {
  view: DayView
  locale: Locale
  profileId: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [note, setNote] = useState(view.journal?.note ?? '')
  const [mood, setMood] = useState<number | null>(view.journal?.mood ?? null)
  const [saved, setSaved] = useState(false)

  const s = view.snapshot
  const band = BAND_LABEL[s.band]
  const vi = locale === 'vi'

  const stemEl = HEAVENLY_STEMS[s.day.stem - 1].element
  const branchEl = EARTHLY_BRANCHES[s.day.branch - 1].element

  const onSaveJournal = () => {
    startTransition(async () => {
      await saveJournal({ profileId, date: view.date, mood, note })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    })
  }

  const onBookmark = (kind: 'GOOD' | 'BAD' | 'NOTE') => {
    startTransition(async () => {
      await toggleBookmark({ profileId, date: view.date, kind, label: null })
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* The day's pillar, and the engine's verdict on it */}
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center leading-none">
              <Han className={`text-4xl font-semibold ${ELEMENT_TEXT[stemEl]}`}>{STEM_TERMS[s.day.stem].zh}</Han>
              <Han className={`mt-1 text-4xl font-semibold ${ELEMENT_TEXT[branchEl]}`}>
                {BRANCH_TERMS[s.day.branch].zh}
              </Han>
            </div>
            <div>
              <div className="text-[11px] tracking-wide text-ink-faint uppercase">
                {vi ? 'Lưu Nhật' : 'Day pillar'} · {view.date}
              </div>
              <div className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
                {pick(STEM_TERMS[s.day.stem], locale)} {pick(BRANCH_TERMS[s.day.branch], locale)}
              </div>
              <div className="mt-0.5 text-xs text-ink-soft">
                {pick(TEN_GOD_TERMS[s.stemTenGod], locale)} · {pick(PHASE_TERMS[s.phase], locale)}
              </div>
            </div>
          </div>

          <div className={`rounded-seal border px-3 py-1.5 text-sm font-semibold ${band.tone}`}>
            {vi ? band.vi : band.en}
          </div>
        </div>

        {/* Element hits. Grouped, because a day is often one element twice over —
            that doubling is emphasis, not two separate findings. */}
        {(s.favourableHits.length > 0 || s.unfavourableHits.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-rule pt-4">
            {groupHits(s.favourableHits).map(({ element, count }) => (
              <span key={`f-${element}`} className="inline-flex items-center gap-1.5 rounded-seal border border-wood/40 bg-wood/5 px-2.5 py-1 text-xs">
                <span aria-hidden className="text-wood">＋</span>
                <Han className={ELEMENT_TEXT[element]}>{ELEMENT_TERMS[element].zh}</Han>
                <span className="text-ink-soft">{pick(ELEMENT_TERMS[element], locale)}</span>
                {count > 1 && <span className="text-wood tabular-nums">×{count}</span>}
                <span className="text-ink-faint">{vi ? 'dụng thần' : 'wanted'}</span>
              </span>
            ))}
            {groupHits(s.unfavourableHits).map(({ element, count }) => (
              <span key={`u-${element}`} className="inline-flex items-center gap-1.5 rounded-seal border border-fire/40 bg-fire/5 px-2.5 py-1 text-xs">
                <span aria-hidden className="text-fire">－</span>
                <Han className={ELEMENT_TEXT[element]}>{ELEMENT_TERMS[element].zh}</Han>
                <span className="text-ink-soft">{pick(ELEMENT_TERMS[element], locale)}</span>
                {count > 1 && <span className="text-fire tabular-nums">×{count}</span>}
                <span className="text-ink-faint">{vi ? 'kỵ thần' : 'unwanted'}</span>
              </span>
            ))}
          </div>
        )}

        {/* Relationships, split by whether they gather or grind. A Six Harmony
            and a Clash are not the same kind of news and must not look alike. */}
        {s.relations.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {s.relations.map((r, i) => {
              const harmonious = r.weight > 0
              return (
                <li
                  key={`${r.type}-${r.slot}-${i}`}
                  className={`inline-flex items-center gap-1.5 rounded-seal border px-2.5 py-1 text-xs ${
                    harmonious ? 'border-wood/40 bg-wood/5' : 'border-fire/30 bg-fire/5'
                  }`}
                >
                  <span aria-hidden className={harmonious ? 'text-wood' : 'text-fire'}>
                    {harmonious ? '＋' : '－'}
                  </span>
                  <Han className="text-ink">{RELATION_TERMS[r.type]?.zh ?? ''}</Han>
                  <span className="text-ink-soft">{RELATION_TERMS[r.type] ? pick(RELATION_TERMS[r.type], locale) : r.type}</span>
                  <span className="text-ink-faint">· {pick(PILLAR_TERMS[r.slot], locale)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      {/* The written reading */}
      <Panel>
        <SectionTitle label={vi ? 'Luận Giải' : 'Reading'} mark="斷語" />

        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">{view.body.headline}</h3>
        <p className="mt-3 leading-relaxed text-ink">{view.body.summary}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-seal border border-wood/30 bg-wood/5 p-3.5">
            <div className="mb-1.5 flex items-baseline gap-2">
              <span className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
                {vi ? 'Nên' : 'Lean into'}
              </span>
              <Han className="text-[10px] text-ink-faint">宜</Han>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">{view.body.focus}</p>
          </div>
          <div className="rounded-seal border border-earth/30 bg-earth/5 p-3.5">
            <div className="mb-1.5 flex items-baseline gap-2">
              <span className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
                {vi ? 'Nên tránh' : 'Hold lightly'}
              </span>
              <Han className="text-[10px] text-ink-faint">忌</Han>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">{view.body.caution}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5">
          {view.body.practical.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-ink-soft">
              <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-cinnabar" />
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>

        {/* The reader is told which path wrote this. */}
        <p className="mt-5 border-t border-rule pt-3 text-[11px] leading-relaxed text-ink-faint">
          {view.source === 'template'
            ? vi
              ? 'Bản này do bộ luật sinh trực tiếp, chưa qua diễn đạt. Nội dung vẫn bám đúng dữ kiện lá số.'
              : 'Written directly by the rules engine, without a prose pass. The findings are the same either way.'
            : vi
              ? 'Phần chữ được viết từ đúng các dữ kiện bộ luật đưa ra ở trên — không thêm luận điểm nào ngoài đó.'
              : 'The prose is written from exactly the findings listed above, with nothing added beyond them.'}
        </p>
      </Panel>

      {/* Journal and marks */}
      <Panel>
        <SectionTitle label={vi ? 'Nhật Ký Ngày' : 'Journal'} mark="日誌" />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-faint">{vi ? 'Đánh dấu:' : 'Mark this day:'}</span>
          {(
            [
              ['GOOD', vi ? 'Ngày tốt' : 'Good day', 'border-wood/50 text-wood', '吉'],
              ['BAD', vi ? 'Ngày xấu' : 'Hard day', 'border-fire/50 text-fire', '凶'],
              ['NOTE', vi ? 'Đáng nhớ' : 'Notable', 'border-water/50 text-water', '記'],
            ] as const
          ).map(([kind, label, tone, glyph]) => {
            const on = view.bookmark?.kind === kind
            return (
              <button
                key={kind}
                type="button"
                disabled={pending}
                onClick={() => onBookmark(kind)}
                aria-pressed={on}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-seal border px-3 py-1.5 text-xs transition-colors duration-200 disabled:opacity-50 sm:min-h-0 ${
                  on ? `${tone} bg-paper-sunken` : 'border-rule text-ink-soft hover:border-rule-strong'
                }`}
              >
                <Han className="text-[11px]">{glyph}</Han>
                {label}
              </button>
            )
          })}
        </div>

        <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase" htmlFor="note">
          {vi ? 'Thực tế hôm nay ra sao?' : 'What actually happened?'}
        </label>
        <textarea
          id="note"
          rows={4}
          value={note}
          maxLength={4000}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            vi
              ? 'Ghi lại điều đã xảy ra để sau này đối chiếu với luận giải…'
              : 'Note what happened, so you can check it against the reading later…'
          }
          className="w-full resize-y rounded-seal border border-rule bg-paper px-3 py-2 text-sm text-ink transition-colors duration-200 hover:border-rule-strong focus:border-cinnabar focus:outline-none"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-xs text-ink-faint">{vi ? 'Cảm nhận:' : 'How was it:'}</span>
            {[-2, -1, 0, 1, 2].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(mood === m ? null : m)}
                aria-pressed={mood === m}
                aria-label={`${vi ? 'Mức' : 'Level'} ${m}`}
                className={`size-11 cursor-pointer rounded-seal border text-xs tabular-nums transition-colors duration-200 sm:size-8 ${
                  mood === m ? 'border-cinnabar bg-cinnabar/10 text-cinnabar' : 'border-rule text-ink-faint hover:border-rule-strong'
                }`}
              >
                {m > 0 ? `+${m}` : m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-wood">{vi ? 'Đã lưu' : 'Saved'}</span>}
            <button
              type="button"
              disabled={pending}
              onClick={onSaveJournal}
              className="min-h-11 cursor-pointer rounded-seal bg-cinnabar px-4 py-1.5 text-xs font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 sm:min-h-0"
            >
              {pending ? (vi ? 'Đang lưu…' : 'Saving…') : vi ? 'Lưu' : 'Save'}
            </button>
          </div>
        </div>
      </Panel>
    </div>
  )
}
