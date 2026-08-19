import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  TEN_GOD_GRID,
  PHASE_GRID,
  SEASON_STRENGTH,
  FAVOURABLE,
  BRANCH_RELATIONS,
  STEM_RELATIONS,
} from './data/tables'
import type {
  Element,
  ElementTally,
  HiddenStem,
  Pillar,
  PillarSlot,
  Relation,
  StrengthAnalysis,
} from './types'

export const ELEMENTS: Element[] = ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER']

/** Wu Xing generation cycle: producer -> produced. */
const GENERATES: Record<Element, Element> = {
  WOOD: 'FIRE',
  FIRE: 'EARTH',
  EARTH: 'METAL',
  METAL: 'WATER',
  WATER: 'WOOD',
}

/** Wu Xing control cycle: controller -> controlled. */
const CONTROLS: Record<Element, Element> = {
  WOOD: 'EARTH',
  EARTH: 'WATER',
  WATER: 'FIRE',
  FIRE: 'METAL',
  METAL: 'WOOD',
}

export const generates = (a: Element, b: Element) => GENERATES[a] === b
export const controls = (a: Element, b: Element) => CONTROLS[a] === b

export const stemElement = (stem: number) => HEAVENLY_STEMS[stem - 1].element
export const branchElement = (branch: number) => EARTHLY_BRANCHES[branch - 1].element
export const tenGodOf = (dayMaster: number, stem: number) => TEN_GOD_GRID[dayMaster - 1][stem - 1]
export const phaseOf = (stem: number, branch: number) => PHASE_GRID[stem - 1][branch - 1]

const HIDDEN_ROLES: HiddenStem['role'][] = ['MAIN', 'MIDDLE', 'RESIDUAL']

export function hiddenStemsOf(branch: number, dayMaster: number): HiddenStem[] {
  return EARTHLY_BRANCHES[branch - 1].hiddenStems.map((stem, i) => ({
    stem,
    element: stemElement(stem),
    role: HIDDEN_ROLES[i] ?? 'RESIDUAL',
    tenGod: tenGodOf(dayMaster, stem),
  }))
}

// ---------------------------------------------------------------------------
// Strength
// ---------------------------------------------------------------------------

/**
 * Weights used to tally elemental influence.
 *
 * Classical texts disagree on exact numbers, so these are a documented,
 * conventional choice rather than a canonical one: a visible stem counts for
 * one unit, a branch's main hidden stem counts a little more because a rooted
 * element is treated as stronger than a floating one, and the month branch is
 * doubled because the season commands the chart.
 */
const WEIGHT = { stem: 1.0, MAIN: 1.2, MIDDLE: 0.5, RESIDUAL: 0.3 } as const
const MONTH_BRANCH_MULTIPLIER = 2

export function analyseStrength(
  pillars: Record<PillarSlot, Pillar>,
  dayMaster: number,
): StrengthAnalysis {
  const dmElement = stemElement(dayMaster)
  const raw: Record<Element, number> = { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 }
  const counts: Record<Element, number> = { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 }

  for (const slot of ['year', 'month', 'day', 'hour'] as PillarSlot[]) {
    const pillar = pillars[slot]
    const branchWeight = slot === 'month' ? MONTH_BRANCH_MULTIPLIER : 1

    // The day stem is the day master itself; it anchors the chart rather than
    // adding to the support it receives, so it is tallied but not weighted in.
    if (slot !== 'day') {
      raw[pillar.stemElement] += WEIGHT.stem
    }
    counts[pillar.stemElement]++

    for (const hidden of pillar.hiddenStems) {
      raw[hidden.element] += WEIGHT[hidden.role] * branchWeight
    }
    counts[pillar.branchElement]++
  }

  const season = EARTHLY_BRANCHES[pillars.month.branch - 1].season
  const seasonalStrength =
    SEASON_STRENGTH.find((s) => s.season === season && s.element === dmElement)?.strength ?? 3

  // Support = the day master's own element plus whatever produces it.
  // Drain = what it produces, what it controls, and what controls it.
  let supporting = 0
  let draining = 0
  for (const el of ELEMENTS) {
    if (el === dmElement || generates(el, dmElement)) supporting += raw[el]
    else draining += raw[el]
  }

  const ratio = supporting + draining === 0 ? 0.5 : supporting / (supporting + draining)
  const seasonalBonus = (seasonalStrength - 3) * 7.5
  const score = Math.max(0, Math.min(100, ratio * 100 + seasonalBonus))
  const strength = score >= 50 ? 'STRONG' : 'WEAK'

  const fav = FAVOURABLE.find((f) => f.element === dmElement && f.strength === strength)

  const tally: ElementTally[] = ELEMENTS.map((element) => ({
    element,
    score: Math.round(raw[element] * 100) / 100,
    count: counts[element],
  }))

  return {
    dayMaster,
    dayMasterElement: dmElement,
    strength,
    score: Math.round(score * 10) / 10,
    seasonalStrength,
    season,
    supporting: Math.round(supporting * 100) / 100,
    draining: Math.round(draining * 100) / 100,
    favourable: (fav?.favourable ?? []) as Element[],
    unfavourable: (fav?.unfavourable ?? []) as Element[],
    tally,
  }
}

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

const SLOTS: PillarSlot[] = ['year', 'month', 'day', 'hour']

/**
 * Tam Hợp — the four groups of three branches that combine into one element.
 *
 * Read out of the branch table's own `structure` column rather than written
 * here: bazi_db already carries the frame each branch belongs to, and a second
 * copy would be a second thing to keep right.
 *
 * The cardinal member (đế vượng) falls out of the same data — it is the branch
 * whose own element is the frame's element, true for exactly one branch per
 * group. The other two are the opening branch and the storage branch, and the
 * storage one is always an Earth branch, which is what puts each group into the
 * order it is traditionally named in: Thân-Tý-Thìn, not Tý-Thìn-Thân.
 */
export interface Trine {
  element: Element
  /** Branch ids in traditional order: opening, cardinal, storage. */
  branches: [number, number, number]
  /** The branch the group is named for; a half combination needs it. */
  cardinal: number
}

export const TRINES: Trine[] = (() => {
  const byElement = new Map<Element, number[]>()
  for (const b of EARTHLY_BRANCHES) {
    const list = byElement.get(b.structure) ?? []
    list.push(b.id)
    byElement.set(b.structure, list)
  }

  return [...byElement].map(([element, ids]) => {
    const cardinal = ids.find((id) => EARTHLY_BRANCHES[id - 1].element === element)!
    const storage = ids.find((id) => EARTHLY_BRANCHES[id - 1].element === 'EARTH')!
    const opening = ids.find((id) => id !== cardinal && id !== storage)!
    return { element, branches: [opening, cardinal, storage] as [number, number, number], cardinal }
  })
})()

/**
 * The group two branches half-combine into, or null.
 *
 * A pair only carries the frame if it includes the cardinal branch. Without it —
 * Thân with Thìn, say — the two ends of the group are present but the thing they
 * were supposed to gather around is missing, and most schools read that as no
 * combination at all rather than a weak one.
 */
export function halfTrineOf(a: number, b: number): Trine | null {
  if (a === b) return null
  const group = TRINES.find((t) => t.branches.includes(a) && t.branches.includes(b))
  if (!group) return null
  return a === group.cardinal || b === group.cardinal ? group : null
}

/**
 * Finds every stem and branch relationship present between the four pillars.
 *
 * Self-punishment rows point a branch at itself, so they only fire when the same
 * branch occupies two different pillars — which the pairwise walk handles for
 * free, since it compares distinct slots rather than distinct branch values.
 */
export function findRelations(pillars: Record<PillarSlot, Pillar>): Relation[] {
  const found: Relation[] = []
  const seen = new Set<string>()

  for (let i = 0; i < SLOTS.length; i++) {
    for (let k = i + 1; k < SLOTS.length; k++) {
      const a = pillars[SLOTS[i]]
      const b = pillars[SLOTS[k]]

      for (const rel of BRANCH_RELATIONS) {
        if (rel.targets[a.branch - 1] === b.branch) {
          const key = `B|${rel.type}|${SLOTS[i]}|${SLOTS[k]}`
          if (seen.has(key)) continue
          seen.add(key)
          found.push({
            type: rel.type,
            slots: [SLOTS[i], SLOTS[k]],
            members: [EARTHLY_BRANCHES[a.branch - 1].name, EARTHLY_BRANCHES[b.branch - 1].name],
            scope: 'BRANCH',
          })
        }
      }

      for (const rel of STEM_RELATIONS) {
        if (rel.targets[a.stem - 1] === b.stem) {
          const key = `S|${rel.type}|${SLOTS[i]}|${SLOTS[k]}`
          if (seen.has(key)) continue
          seen.add(key)
          found.push({
            type: rel.type,
            slots: [SLOTS[i], SLOTS[k]],
            members: [HEAVENLY_STEMS[a.stem - 1].name, HEAVENLY_STEMS[b.stem - 1].name],
            scope: 'STEM',
          })
        }
      }
    }
  }

  /*
    Tam Hợp, which the pairwise walk above cannot see: it is a three-branch
    agreement, and the relationship table it walks holds only pairs.

    Reported once per group, full combination in preference to half, so a chart
    holding all three does not also list the two halves inside it. Slots are
    every pillar carrying a member — four of them when a branch repeats — while
    members stay the three distinct branches of the frame.
  */
  for (const group of TRINES) {
    const slots = SLOTS.filter((slot) => group.branches.includes(pillars[slot].branch))
    if (slots.length < 2) continue

    const present = [...new Set(slots.map((slot) => pillars[slot].branch))]
    const full = present.length === 3
    if (!full && !present.includes(group.cardinal)) continue

    const order = full ? group.branches : group.branches.filter((b) => present.includes(b))
    found.push({
      type: full ? 'TRINE' : 'HALF_TRINE',
      slots,
      members: order.map((b) => EARTHLY_BRANCHES[b - 1].name),
      scope: 'BRANCH',
      element: group.element,
    })
  }

  return found
}
