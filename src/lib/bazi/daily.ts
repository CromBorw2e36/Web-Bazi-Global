import { BRANCH_RELATIONS, EARTHLY_BRANCHES, HEAVENLY_STEMS, STEM_RELATIONS } from './data/tables'
import { branchOf, dayPillarJz, monthPillarJz, stemOf, yearPillarJz, baziYearOf } from './calendar'
import { halfTrineOf, phaseOf, tenGodOf } from './analysis'
import { luckPillarAtAge } from './luck'
import type { BaziChart, Element, LuckPillar, PillarSlot } from './types'

/**
 * The transit layer: how a given day meets a natal chart.
 *
 * Everything here is deterministic and derived from the same tables the natal
 * chart uses. Nothing in this file writes prose — it produces the findings that
 * prose is later allowed to talk about, so that every sentence shown to a user
 * can be traced back to a rule rather than invented.
 */

export type Band = 'AUSPICIOUS' | 'FAVOURABLE' | 'NEUTRAL' | 'CAUTION' | 'CHALLENGING'

export interface TransitRelation {
  type: string
  scope: 'STEM' | 'BRANCH'
  /** Which natal pillar the transit meets. */
  slot: PillarSlot
  /** Transit member first, natal member second. */
  members: [string, string]
  weight: number
}

export interface DailySnapshot {
  /** ISO date the snapshot is for, in the viewer's zone. */
  date: string

  day: { jz: number; stem: number; branch: number }
  month: { jz: number; stem: number; branch: number }
  year: { jz: number; stem: number; branch: number }
  luck: LuckPillar | null

  /** Ten god of the day's stem, seen from the natal day master. */
  stemTenGod: number
  /** Ten god of the main hidden stem inside the day's branch. */
  branchTenGod: number
  /** Twelve-phase position of the day master in the day's branch. */
  phase: number

  relations: TransitRelation[]

  /** Elements the day brings, split by how the natal chart receives them. */
  favourableHits: Element[]
  unfavourableHits: Element[]

  score: number
  band: Band
}

/*
  Weights.

  These encode a plain reading of the classics rather than a numeric claim: a
  clash against the day pillar is the most personal event a transit can bring,
  harmony gathers, punishment and harm grind. The day's own element matters most
  when it lands on what the chart already needs. None of it is precise, which is
  why the band is coarse and the prose is told to hedge.
*/
const W = {
  favourableElement: 2,
  unfavourableElement: -2,
  sixCombination: 2,
  /*
    Below a Six Harmony, not above it, even though a full Tam Hợp outranks one:
    a transit meets the chart one branch at a time, so what forms here is only
    ever the half. When the day completes a frame the chart already half-held,
    it half-combines with each of those branches and the two ones add up on
    their own.
  */
  halfTrine: 1,
  stemCombination: 1,
  clash: -3,
  clashDayPillar: -4,
  punishment: -2,
  harm: -2,
  destruction: -1,
  stemCounter: -1,
  strongPhase: 1,
  weakPhase: -1,
} as const

const HARMONIOUS_BRANCH = new Set(['SIX_COMBINATION'])
const PUNISHMENTS = new Set([
  'UNGRATEFUL_PUNISHMENT',
  'BULLYING_PUNISHMENT',
  'UNCIVILIZED_PUNISHMENT',
  'SELF_PUNISHMENT',
])

/** Trường Sinh, Lâm Quan, Đế Vượng — the day master standing on solid ground. */
const STRONG_PHASES = new Set([1, 4, 5])
/** Bệnh, Tử, Mộ, Tuyệt — the day master with little support underfoot. */
const WEAK_PHASES = new Set([7, 8, 9, 10])

const SLOTS: PillarSlot[] = ['year', 'month', 'day', 'hour']

function branchRelationWeight(type: string, slot: PillarSlot): number {
  if (HARMONIOUS_BRANCH.has(type)) return W.sixCombination
  if (type === 'CLASH') return slot === 'day' ? W.clashDayPillar : W.clash
  if (PUNISHMENTS.has(type)) return W.punishment
  if (type === 'HARM') return W.harm
  if (type === 'DESTRUCTION') return W.destruction
  return 0
}

function stemRelationWeight(type: string): number {
  if (type === 'COMBINATION') return W.stemCombination
  if (type === 'COUNTER' || type === 'CLASH') return W.stemCounter
  return 0
}

function bandFor(score: number): Band {
  if (score >= 5) return 'AUSPICIOUS'
  if (score >= 2) return 'FAVOURABLE'
  if (score > -2) return 'NEUTRAL'
  if (score > -5) return 'CAUTION'
  return 'CHALLENGING'
}

/**
 * Builds the snapshot for one calendar day against one natal chart.
 *
 * `date` is the viewer's local calendar day. Transits are read at day
 * granularity, so unlike a birth moment this needs no solar correction — the
 * day pillar turns at local midnight either way.
 */
export function buildDailySnapshot(chart: BaziChart, date: string): DailySnapshot {
  const [y, m, d] = date.split('-').map(Number)
  const noonUtc = Date.UTC(y, m - 1, d, 12)

  const dayJz = dayPillarJz(y, m, d)
  const monthJz = monthPillarJz(noonUtc)
  const yearJz = yearPillarJz(baziYearOf(noonUtc))

  const dayStem = stemOf(dayJz)
  const dayBranch = branchOf(dayJz)
  const dm = chart.dayMaster

  const age = y - chart.input.year
  const luck = luckPillarAtAge(chart.luck, age)

  // --- relationships between the day's pillar and each natal pillar ---
  const relations: TransitRelation[] = []
  for (const slot of SLOTS) {
    const natal = chart.pillars[slot]

    for (const rel of BRANCH_RELATIONS) {
      if (rel.targets[dayBranch - 1] === natal.branch) {
        const weight = branchRelationWeight(rel.type, slot)
        if (weight === 0) continue
        relations.push({
          type: rel.type,
          scope: 'BRANCH',
          slot,
          members: [EARTHLY_BRANCHES[dayBranch - 1].name, EARTHLY_BRANCHES[natal.branch - 1].name],
          weight,
        })
      }
    }

    const half = halfTrineOf(dayBranch, natal.branch)
    if (half) {
      relations.push({
        type: 'HALF_TRINE',
        scope: 'BRANCH',
        slot,
        members: [EARTHLY_BRANCHES[dayBranch - 1].name, EARTHLY_BRANCHES[natal.branch - 1].name],
        weight: W.halfTrine,
      })
    }

    for (const rel of STEM_RELATIONS) {
      if (rel.targets[dayStem - 1] === natal.stem) {
        const weight = stemRelationWeight(rel.type)
        if (weight === 0) continue
        relations.push({
          type: rel.type,
          scope: 'STEM',
          slot,
          members: [HEAVENLY_STEMS[dayStem - 1].name, HEAVENLY_STEMS[natal.stem - 1].name],
          weight,
        })
      }
    }
  }

  // --- which elements the day brings, and how the chart receives them ---
  const favourable = new Set(chart.strength.favourable)
  const unfavourable = new Set(chart.strength.unfavourable)
  const dayElements: Element[] = [
    HEAVENLY_STEMS[dayStem - 1].element,
    EARTHLY_BRANCHES[dayBranch - 1].element,
  ]

  const favourableHits = dayElements.filter((e) => favourable.has(e))
  const unfavourableHits = dayElements.filter((e) => unfavourable.has(e))

  const phase = phaseOf(dm, dayBranch)

  let score = 0
  score += favourableHits.length * W.favourableElement
  score += unfavourableHits.length * W.unfavourableElement
  for (const r of relations) score += r.weight
  if (STRONG_PHASES.has(phase)) score += W.strongPhase
  if (WEAK_PHASES.has(phase)) score += W.weakPhase

  const branchMainHidden = EARTHLY_BRANCHES[dayBranch - 1].hiddenStems[0]

  return {
    date,
    day: { jz: dayJz, stem: dayStem, branch: dayBranch },
    month: { jz: monthJz, stem: stemOf(monthJz), branch: branchOf(monthJz) },
    year: { jz: yearJz, stem: stemOf(yearJz), branch: branchOf(yearJz) },
    luck,
    stemTenGod: tenGodOf(dm, dayStem),
    branchTenGod: tenGodOf(dm, branchMainHidden),
    phase,
    relations,
    favourableHits,
    unfavourableHits,
    score,
    band: bandFor(score),
  }
}

/**
 * Groups element hits for display.
 *
 * A day carries two elements, one in its stem and one in its branch, and they
 * are often the same — Xin You is Metal twice over. That doubling is real and
 * the score counts it, but rendering the raw list prints "Metal, Metal", so
 * every reader-facing surface groups first and shows the count instead.
 */
export function groupHits(hits: Element[]): { element: Element; count: number }[] {
  const counts = new Map<Element, number>()
  for (const e of hits) counts.set(e, (counts.get(e) ?? 0) + 1)
  return [...counts].map(([element, count]) => ({ element, count }))
}

/** Relations the day brings that gather rather than grind. */
export const harmoniousRelations = (s: DailySnapshot) => s.relations.filter((r) => r.weight > 0)

/** Relations that abrade — clash, punishment, harm, destruction. */
export const frictionRelations = (s: DailySnapshot) => s.relations.filter((r) => r.weight < 0)

/** Snapshots for a span of days, used by the month view and the calendar strip. */
export function buildDailyRange(chart: BaziChart, startDate: string, days: number): DailySnapshot[] {
  const [y, m, d] = startDate.split('-').map(Number)
  const out: DailySnapshot[] = []
  for (let i = 0; i < days; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i))
    out.push(buildDailySnapshot(chart, dt.toISOString().slice(0, 10)))
  }
  return out
}

/** Today's date in a given IANA zone, as YYYY-MM-DD. */
export function todayIn(timeZone: string, now = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now)
  } catch {
    return now.toISOString().slice(0, 10)
  }
}
