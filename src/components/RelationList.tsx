'use client'

import {
  BRANCH_TERMS,
  CONCEPT_PLAIN,
  ELEMENT_PLAIN,
  ELEMENT_TERMS,
  PILLAR_PLAIN,
  RELATION_PLAIN,
  PILLAR_TERMS,
  RELATION_TERMS,
  STEM_TERMS,
  UI,
  pick,
  type BaziChart,
  type Locale,
  type Relation,
} from '@/lib/bazi'
import { ELEMENT_TEXT, Han, Panel, SectionTitle } from './ui'
import { Term } from './Term'

/** Harmonies read as gathering, the rest as friction — enough to group them by. */
const HARMONIOUS = new Set(['SIX_COMBINATION', 'COMBINATION', 'TRINE', 'HALF_TRINE'])

function glyphFor(relation: Relation, index: number): string {
  const name = relation.members[index]
  if (relation.scope === 'STEM') {
    return Object.values(STEM_TERMS).find((t) => t.en.toUpperCase() === name.toUpperCase())?.zh ?? name
  }
  return Object.values(BRANCH_TERMS).find((t) => t.en.toUpperCase() === name.toUpperCase())?.zh ?? name
}

function nameFor(relation: Relation, index: number, locale: Locale): string {
  const name = relation.members[index]
  const table = relation.scope === 'STEM' ? STEM_TERMS : BRANCH_TERMS
  const term = Object.values(table).find((t) => t.en.toUpperCase() === name.toUpperCase())
  return term ? pick(term, locale) : name
}

export function RelationList({ chart, locale }: { chart: BaziChart; locale: Locale }) {
  const relations = chart.relations

  return (
    <Panel>
      <SectionTitle
        label={
          <Term
            term={pick(UI.relations, locale)}
            plain={CONCEPT_PLAIN.relations}
            mark={UI.relations.zh}
            locale={locale}
          />
        }
        mark={UI.relations.zh}
      />

      {relations.length === 0 ? (
        <p className="text-sm text-ink-faint">{pick(UI.noRelations, locale)}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {relations.map((rel, i) => {
            const term = RELATION_TERMS[rel.type]
            const harmonious = HARMONIOUS.has(rel.type)
            return (
              <li
                key={`${rel.type}-${rel.slots.join('-')}-${i}`}
                className={`flex items-center gap-3 rounded-seal border bg-paper px-3 py-2.5 ${
                  harmonious ? 'border-wood/35' : 'border-fire/30'
                }`}
              >
                {/* A trine has three members, everything else two, so the row
                    is built from the list rather than from two fixed slots. */}
                <div className="flex shrink-0 items-center gap-1.5">
                  {rel.members.map((m, mi) => (
                    <span key={`${m}-${mi}`} className="flex items-center gap-1.5">
                      {mi > 0 && (
                        <Han className={`text-xs ${harmonious ? 'text-wood' : 'text-fire'}`}>
                          {mi === 1 ? (term?.zh ?? '') : '·'}
                        </Han>
                      )}
                      <Han className="text-xl text-ink">{glyphFor(rel, mi)}</Han>
                    </span>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">
                    {term && RELATION_PLAIN[rel.type] ? (
                      <Term
                        term={pick(term, locale)}
                        plain={RELATION_PLAIN[rel.type]}
                        mark={term.zh}
                        locale={locale}
                        className="text-left"
                      />
                    ) : (
                      (term ? pick(term, locale) : rel.type)
                    )}
                    {/* Which element the combination forms — the whole point of
                        a trine, and meaningless on a clash, which forms none. */}
                    {rel.element && (
                      <>
                        <span className="text-ink-faint"> · </span>
                        <Han className={`text-sm ${ELEMENT_TEXT[rel.element]}`}>
                          {ELEMENT_TERMS[rel.element].zh}
                        </Han>{' '}
                        <Term
                          term={pick(ELEMENT_TERMS[rel.element], locale)}
                          plain={ELEMENT_PLAIN[rel.element]}
                          mark={ELEMENT_TERMS[rel.element].zh}
                          locale={locale}
                          className={`text-sm font-normal ${ELEMENT_TEXT[rel.element]}`}
                        />
                      </>
                    )}
                  </div>
                  <div className="truncate text-[11px] text-ink-faint">
                    {rel.members.map((_, mi) => (mi === 0 ? '' : ' · ') + nameFor(rel, mi, locale)).join('')}
                    {' — '}
                    {rel.slots.map((s, si) => (
                      <span key={s}>
                        {si > 0 && ' / '}
                        <Term
                          term={pick(PILLAR_TERMS[s], locale)}
                          plain={PILLAR_PLAIN[s]}
                          mark={PILLAR_TERMS[s].zh}
                          locale={locale}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
