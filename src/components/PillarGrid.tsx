'use client'

import {
  ANIMAL_TERMS,
  CONCEPT_PLAIN,
  HIDDEN_ROLE_PLAIN,
  PHASE_PLAIN,
  PILLAR_PLAIN,
  TEN_GOD_PLAIN,
  BRANCH_TERMS,
  ELEMENT_TERMS,
  HIDDEN_ROLE_TERMS,
  PHASE_TERMS,
  PILLAR_TERMS,
  POLARITY_TERMS,
  STEM_TERMS,
  TEN_GOD_TERMS,
  UI,
  pick,
  type BaziChart,
  type Locale,
  type Pillar,
  type PillarSlot,
} from '@/lib/bazi'
import { ELEMENT_TEXT, Han, SectionTitle } from './ui'
import { Term } from './Term'
import { PlainToggleInline } from './PlainToggle'

const SLOTS: PillarSlot[] = ['year', 'month', 'day', 'hour']

function HiddenStemRow({ hidden, locale }: { hidden: Pillar['hiddenStems'][number]; locale: Locale }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[11px] leading-relaxed">
      <span className="flex items-baseline gap-1.5">
        <Han className={`text-sm ${ELEMENT_TEXT[hidden.element]}`}>{STEM_TERMS[hidden.stem].zh}</Han>
        <span className="text-ink-soft">{pick(STEM_TERMS[hidden.stem], locale)}</span>
      </span>
      <Term
        term={pick(TEN_GOD_TERMS[hidden.tenGod], locale)}
        plain={TEN_GOD_PLAIN[hidden.tenGod]}
        mark={TEN_GOD_TERMS[hidden.tenGod].zh}
        locale={locale}
        className="text-right text-ink-faint"
      />
    </div>
  )
}

function PillarColumn({ pillar, locale }: { pillar: Pillar; locale: Locale }) {
  const isDay = pillar.slot === 'day'
  const stemTerm = STEM_TERMS[pillar.stem]
  const branchTerm = BRANCH_TERMS[pillar.branch]

  return (
    <article
      className={`relative flex flex-col rounded-seal border bg-paper-raised transition-colors ${
        isDay ? 'border-cinnabar/50 ring-1 ring-cinnabar/20' : 'border-rule'
      }`}
    >
      {/* Column header */}
      {/* min-h keeps the four headers on one baseline when a plain-language
          label wraps to two lines in one column but not the others. */}
      <header className="flex min-h-[2.75rem] items-center justify-between gap-1 border-b border-rule px-3 py-2">
        <Term
          term={pick(PILLAR_TERMS[pillar.slot], locale)}
          plain={PILLAR_PLAIN[pillar.slot]}
          mark={PILLAR_TERMS[pillar.slot].zh}
          locale={locale}
          className="font-[family-name:var(--font-display)] text-left text-xs font-semibold tracking-wide text-ink-soft"
        />
        <Han className="text-[10px] text-ink-faint">{PILLAR_TERMS[pillar.slot].zh}</Han>
      </header>

      {/* The day pillar is the chart's reference point; a seal marks it as such. */}
      {isDay && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-seal bg-cinnabar px-2 py-0.5">
          <Han className="text-[10px] font-semibold text-white">日主</Han>
        </div>
      )}

      <div className="flex flex-col items-center gap-1 px-3 py-4">
        {/* Ten god of the stem — the day pillar has none, it is the reference. */}
        <span className="flex h-4 items-baseline text-[11px] font-medium text-ink-faint">
          {pillar.stemTenGod ? (
            <Term
              term={pick(TEN_GOD_TERMS[pillar.stemTenGod], locale)}
              plain={TEN_GOD_PLAIN[pillar.stemTenGod]}
              mark={TEN_GOD_TERMS[pillar.stemTenGod].zh}
              locale={locale}
            />
          ) : (
            '—'
          )}
        </span>

        {/* Heavenly stem */}
        <Han className={`text-5xl leading-none font-semibold ${ELEMENT_TEXT[pillar.stemElement]}`}>
          {stemTerm.zh}
        </Han>
        <div className="text-center">
          <div className="text-sm font-medium text-ink">{pick(stemTerm, locale)}</div>
          <div className="text-[10px] text-ink-faint">
            {pick(POLARITY_TERMS[pillar.stemPolarity], locale)} {pick(ELEMENT_TERMS[pillar.stemElement], locale)}
          </div>
        </div>

        <div aria-hidden className="my-2 h-px w-8 bg-rule-strong" />

        {/* Earthly branch */}
        <Han className={`text-5xl leading-none font-semibold ${ELEMENT_TEXT[pillar.branchElement]}`}>
          {branchTerm.zh}
        </Han>
        <div className="text-center">
          <div className="text-sm font-medium text-ink">{pick(branchTerm, locale)}</div>
          <div className="text-[10px] text-ink-faint">{pick(ANIMAL_TERMS[pillar.branch], locale)}</div>
        </div>
      </div>

      {/* Hidden stems. Grows to fill the card so the phase footer below lands on
          the same line across all four columns, even though branches carry
          different numbers of hidden stems. */}
      <div className="flex-1 border-t border-rule px-3 py-2.5">
        <div className="mb-1.5 flex items-baseline justify-between">
          <Term
            term={pick(UI.hiddenStems, locale)}
            plain={CONCEPT_PLAIN.hiddenStems}
            mark={UI.hiddenStems.zh}
            locale={locale}
            className="text-left text-[10px] font-semibold tracking-wide text-ink-faint uppercase"
          />
          <Han className="text-[10px] text-ink-faint">藏干</Han>
        </div>
        <div className="space-y-0.5">
          {pillar.hiddenStems.map((h) => (
            <HiddenStemRow key={`${h.stem}-${h.role}`} hidden={h} locale={locale} />
          ))}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-1 text-[10px] text-ink-faint">
          {pillar.hiddenStems.map((h, i) => (
            <span key={h.role} className="flex items-baseline gap-x-1">
              {i > 0 && <span aria-hidden>·</span>}
              <Term
                term={pick(HIDDEN_ROLE_TERMS[h.role], locale)}
                plain={HIDDEN_ROLE_PLAIN[h.role]}
                mark={HIDDEN_ROLE_TERMS[h.role].zh}
                locale={locale}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Twelve-phase state of the day master in this branch */}
      <footer className="flex items-center justify-between border-t border-rule px-3 py-2">
        <Term
          term={pick(PHASE_TERMS[pillar.phase], locale)}
          plain={PHASE_PLAIN[pillar.phase]}
          mark={PHASE_TERMS[pillar.phase].zh}
          locale={locale}
          className="text-left text-[11px] text-ink-soft"
        />
        <Han className="text-[11px] text-ink-faint">{PHASE_TERMS[pillar.phase].zh}</Han>
      </footer>
    </article>
  )
}

export function PillarGrid({ chart, locale }: { chart: BaziChart; locale: Locale }) {
  return (
    <div>
      <SectionTitle
        label={<Term term={pick(UI.chart, locale)} plain={CONCEPT_PLAIN.chart} mark={UI.chart.zh} locale={locale} />}
        mark={UI.chart.zh}
      />
      <p className="mb-3 text-[11px] leading-relaxed text-ink-faint">
        {locale === 'vi' ? 'Bấm vào thuật ngữ gạch chân để xem giải thích, hoặc ' : 'Tap any underlined term for an explanation, or '}
        <PlainToggleInline locale={locale} />.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {SLOTS.map((slot) => (
          <PillarColumn key={slot} pillar={chart.pillars[slot]} locale={locale} />
        ))}
      </div>
    </div>
  )
}
