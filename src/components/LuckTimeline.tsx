'use client'

import { useMemo, useState } from 'react'
import {
  BRANCH_TERMS,
  CONCEPT_PLAIN,
  PHASE_PLAIN,
  PHASE_TERMS,
  STEM_TERMS,
  TEN_GOD_SHORT,
  UI,
  buildAnnualPillars,
  pick,
  type BaziChart,
  type Locale,
} from '@/lib/bazi'
import { ELEMENT_TEXT, Han, Panel, SectionTitle } from './ui'
import { Term } from './Term'
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '@/lib/bazi'

const stemElement = (stem: number) => HEAVENLY_STEMS[stem - 1].element
const branchElement = (branch: number) => EARTHLY_BRANCHES[branch - 1].element

export function LuckTimeline({
  chart,
  locale,
  today,
}: {
  chart: BaziChart
  locale: Locale
  /** Passed in rather than read from the clock, so server and client agree. */
  today: { year: number }
}) {
  const currentAge = today.year - chart.input.year
  const activeIndex = chart.luck.pillars.findIndex((p) => currentAge >= p.startAge && currentAge < p.endAge)
  const [selected, setSelected] = useState(activeIndex >= 0 ? activeIndex : 0)

  const pillar = chart.luck.pillars[selected]
  const annual = useMemo(
    () => buildAnnualPillars(pillar.startYear, pillar.startYear + 9, chart.input.year, chart.dayMaster),
    [pillar.startYear, chart.input.year, chart.dayMaster],
  )

  const favourable = new Set(chart.strength.favourable)

  return (
    <Panel>
      <SectionTitle
        label={<Term term={pick(UI.luck, locale)} plain={CONCEPT_PLAIN.luck} mark={UI.luck.zh} locale={locale} />}
        mark={UI.luck.zh}
      />

      <p className="mb-4 text-xs text-ink-faint">
        {locale === 'vi'
          ? `Vận ${chart.luck.forward ? 'thuận' : 'nghịch'} · khởi vận ${chart.luck.startAge} tuổi (cách tiết khí ${chart.luck.daysToTerm} ngày, quy đổi 3 ngày = 1 năm)`
          : `${chart.luck.forward ? 'Forward' : 'Reverse'} sequence · starts at age ${chart.luck.startAge} (${chart.luck.daysToTerm} days to the governing term, at three days to the year)`}
      </p>

      {/* Luck pillars. Horizontally scrollable rather than wrapped, so the decade
          sequence stays readable as a single timeline on a phone. */}
      <div className="-mx-1 overflow-x-auto px-1 pb-2">
        <div className="flex min-w-max gap-2">
          {chart.luck.pillars.map((p, i) => {
            const isActive = i === activeIndex
            const isSelected = i === selected
            return (
              <button
                key={p.index}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={isSelected}
                className={`w-[74px] shrink-0 cursor-pointer rounded-seal border px-2 py-2.5 text-center transition-colors duration-200 ${
                  isSelected
                    ? 'border-cinnabar bg-cinnabar/8'
                    : 'border-rule bg-paper hover:border-rule-strong'
                }`}
              >
                <div className="mb-1 text-[10px] text-ink-faint tabular-nums">
                  {p.startAge}–{p.endAge}
                </div>
                <div className="flex flex-col items-center leading-none">
                  <Han className={`text-2xl font-semibold ${ELEMENT_TEXT[stemElement(p.stem)]}`}>
                    {STEM_TERMS[p.stem].zh}
                  </Han>
                  <Han className={`mt-0.5 text-2xl font-semibold ${ELEMENT_TEXT[branchElement(p.branch)]}`}>
                    {BRANCH_TERMS[p.branch].zh}
                  </Han>
                </div>
                <div className="mt-1.5 truncate text-[10px] text-ink-soft">
                  {TEN_GOD_SHORT[p.stemTenGod][locale]}
                </div>
                <div className="text-[10px] text-ink-faint tabular-nums">{p.startYear}</div>
                {isActive && (
                  <div className="mt-1 text-[9px] font-semibold text-cinnabar">
                    {locale === 'vi' ? 'ĐANG VẬN' : 'CURRENT'}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Annual pillars inside the selected decade */}
      <div className="mt-5 border-t border-rule pt-4">
        <div className="mb-3 flex items-baseline gap-2">
          <Term
            term={pick(UI.annual, locale)}
            plain={CONCEPT_PLAIN.annual}
            mark={UI.annual.zh}
            locale={locale}
            className="font-[family-name:var(--font-display)] text-left text-sm font-semibold text-ink"
          />
          <Han className="text-[11px] text-ink-faint">{UI.annual.zh}</Han>
          <span className="text-[11px] text-ink-faint tabular-nums">
            {pillar.startYear}–{pillar.startYear + 9}
          </span>
        </div>

        <div className="-mx-1 overflow-x-auto px-1">
          <div className="flex min-w-max gap-1.5">
            {annual.map((a) => {
              const isNow = a.year === today.year
              const stemFav = favourable.has(stemElement(a.stem))
              return (
                <div
                  key={a.year}
                  className={`w-[58px] shrink-0 rounded-seal border px-1.5 py-2 text-center ${
                    isNow ? 'border-cinnabar bg-cinnabar/8' : 'border-rule bg-paper'
                  }`}
                >
                  <div className="text-[10px] text-ink-faint tabular-nums">{a.year}</div>
                  <div className="flex flex-col items-center leading-none">
                    <Han className={`text-lg font-semibold ${ELEMENT_TEXT[stemElement(a.stem)]}`}>
                      {STEM_TERMS[a.stem].zh}
                    </Han>
                    <Han className={`text-lg font-semibold ${ELEMENT_TEXT[branchElement(a.branch)]}`}>
                      {BRANCH_TERMS[a.branch].zh}
                    </Han>
                  </div>
                  <div className="mt-1 text-[9px] text-ink-soft">{TEN_GOD_SHORT[a.stemTenGod][locale]}</div>
                  <div className="text-[9px] text-ink-faint tabular-nums">
                    {a.age} {locale === 'vi' ? 't' : 'y'}
                  </div>
                  {/* A mark, not just a tint, so the cue survives greyscale. */}
                  <div className="text-[9px] text-ink-faint" aria-hidden>
                    {stemFav ? '＋' : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-ink-faint">
          {locale === 'vi'
            ? 'Chặng đời của bản thân trong vận này: '
            : 'Day master phase in this luck pillar: '}
          <Term
            term={pick(PHASE_TERMS[pillar.phase], locale)}
            plain={PHASE_PLAIN[pillar.phase]}
            mark={PHASE_TERMS[pillar.phase].zh}
            locale={locale}
            className="text-ink-soft"
          />
          {locale === 'vi'
            ? '. Lưu niên đổi trụ vào tiết Lập Xuân, không phải mùng 1 tháng Giêng dương lịch.'
            : '. Annual pillars turn at Li Chun in early February, not on 1 January.'}
        </p>
      </div>
    </Panel>
  )
}
