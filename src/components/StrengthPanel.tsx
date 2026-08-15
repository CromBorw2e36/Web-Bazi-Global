'use client'

import {
  ELEMENT_TERMS,
  SEASON_TERMS,
  STEM_TERMS,
  UI,
  pick,
  type BaziChart,
  type Locale,
} from '@/lib/bazi'
import { ELEMENT_BG, ELEMENT_TEXT, Han, Panel, SectionTitle } from './ui'

function ElementBar({
  chart,
  locale,
}: {
  chart: BaziChart
  locale: Locale
}) {
  const max = Math.max(...chart.strength.tally.map((t) => t.score), 1)

  return (
    <div className="space-y-2">
      {chart.strength.tally.map((t) => {
        const favourable = chart.strength.favourable.includes(t.element)
        const unfavourable = chart.strength.unfavourable.includes(t.element)
        return (
          <div key={t.element} className="flex items-center gap-3">
            <Han className={`w-5 shrink-0 text-base ${ELEMENT_TEXT[t.element]}`}>{ELEMENT_TERMS[t.element].zh}</Han>
            <span className="w-12 shrink-0 text-xs text-ink-soft">{pick(ELEMENT_TERMS[t.element], locale)}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-sunken">
              <div
                className={`h-full rounded-full ${ELEMENT_BG[t.element]} transition-[width] duration-500`}
                style={{ width: `${(t.score / max) * 100}%` }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-ink-soft">{t.score.toFixed(1)}</span>
            {/* Favourability is marked with a glyph as well as colour, never colour alone. */}
            <span className="w-4 shrink-0 text-center text-xs" aria-hidden>
              {favourable ? '＋' : unfavourable ? '－' : ''}
            </span>
            <span className="sr-only">
              {favourable ? pick(UI.favourable, locale) : unfavourable ? pick(UI.unfavourable, locale) : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function StrengthPanel({ chart, locale }: { chart: BaziChart; locale: Locale }) {
  const s = chart.strength
  const dmTerm = STEM_TERMS[chart.dayMaster]
  const verdict = s.strength === 'STRONG' ? UI.strong : UI.weak

  return (
    <Panel>
      <SectionTitle label={pick(UI.strength, locale)} mark={UI.strength.zh} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          {/* Day master identity */}
          <div className="mb-4 flex items-center gap-3">
            <Han className={`text-4xl leading-none font-semibold ${ELEMENT_TEXT[chart.dayMasterElement]}`}>
              {dmTerm.zh}
            </Han>
            <div>
              <div className="text-[11px] tracking-wide text-ink-faint uppercase">{pick(UI.dayMaster, locale)}</div>
              <div className="text-sm font-medium text-ink">
                {pick(dmTerm, locale)} · {pick(ELEMENT_TERMS[chart.dayMasterElement], locale)}
              </div>
            </div>
          </div>

          {/* Strength verdict and score */}
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">
              {pick(verdict, locale)}
            </span>
            <span className="text-xs tabular-nums text-ink-faint">{s.score.toFixed(1)} / 100</span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-paper-sunken">
            <div
              className="h-full rounded-full bg-cinnabar transition-[width] duration-500"
              style={{ width: `${s.score}%` }}
            />
            {/* The 50 mark is where the verdict flips. */}
            <div aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-ink-faint/50" />
          </div>

          <dl className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-ink-faint">{pick(SEASON_TERMS[s.season], locale)}</dt>
              <dd className="text-ink-soft tabular-nums">
                {pick(UI.strength, locale)} {s.seasonalStrength}/5
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-faint">{locale === 'vi' ? 'Phù trợ' : 'Supporting'}</dt>
              <dd className="text-ink-soft tabular-nums">{s.supporting.toFixed(1)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-faint">{locale === 'vi' ? 'Tiêu hao' : 'Draining'}</dt>
              <dd className="text-ink-soft tabular-nums">{s.draining.toFixed(1)}</dd>
            </div>
          </dl>

          {/* Favourable / unfavourable elements */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(
              [
                [UI.favourable, s.favourable, 'border-wood/40'],
                [UI.unfavourable, s.unfavourable, 'border-fire/40'],
              ] as const
            ).map(([label, list, border]) => (
              <div key={label.en} className={`rounded-seal border ${border} bg-paper p-2.5`}>
                <div className="mb-1.5 flex items-baseline gap-1.5">
                  <span className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
                    {pick(label, locale)}
                  </span>
                  <Han className="text-[10px] text-ink-faint">{label.zh}</Han>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((el) => (
                    <span key={el} className="inline-flex items-center gap-1 text-xs">
                      <Han className={ELEMENT_TEXT[el]}>{ELEMENT_TERMS[el].zh}</Han>
                      <span className="text-ink-soft">{pick(ELEMENT_TERMS[el], locale)}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
              {pick(UI.distribution, locale)}
            </span>
            <Han className="text-[10px] text-ink-faint">五行</Han>
          </div>
          <ElementBar chart={chart} locale={locale} />

          <p className="mt-4 border-t border-rule pt-3 text-[11px] leading-relaxed text-ink-faint">
            {locale === 'vi'
              ? 'Điểm vượng suy là ước lượng có trọng số: can lộ tính 1, bản khí trong chi tính 1,2, trung khí 0,5, dư khí 0,3; chi tháng nhân đôi vì nắm lệnh. Các trường phái cân nặng nhẹ khác nhau, nên hãy xem đây là tham khảo.'
              : 'The strength score is a weighted estimate: a visible stem counts 1, a branch’s main hidden stem 1.2, middle 0.5, residual 0.3, and the month branch is doubled because the season commands the chart. Schools weigh these differently, so read it as a guide.'}
          </p>
        </div>
      </div>
    </Panel>
  )
}
