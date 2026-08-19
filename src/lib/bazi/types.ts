import type { Element, Polarity, Season } from './data/tables'

export type { Element, Polarity, Season }

export type Gender = 'MALE' | 'FEMALE'
export type Strength = 'WEAK' | 'STRONG'
export type PillarSlot = 'year' | 'month' | 'day' | 'hour'

/** A stem sitting inside a branch, with its weight in the branch. */
export interface HiddenStem {
  stem: number
  element: Element
  /** MAIN = 本气, MIDDLE = 中气, RESIDUAL = 余气 */
  role: 'MAIN' | 'MIDDLE' | 'RESIDUAL'
  tenGod: number
}

export interface Pillar {
  slot: PillarSlot
  /** JiaZi index, 1-60 */
  jz: number
  stem: number
  branch: number
  stemElement: Element
  branchElement: Element
  stemPolarity: Polarity
  /** Ten god of the stem relative to the day master; null for the day pillar itself. */
  stemTenGod: number | null
  hiddenStems: HiddenStem[]
  /** 12-phase of the day master in this branch (Trường sinh). */
  phase: number
}

export interface BirthInput {
  /** Civil calendar date as entered by the user. */
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: Gender
  /** Degrees east of Greenwich; negative for west. */
  longitude: number
  /** Standard UTC offset in hours at the birth place, e.g. 7 for Vietnam. */
  utcOffset: number
  /** Apply the equation of time on top of the longitude correction. */
  useEquationOfTime?: boolean
}

export interface SolarCorrection {
  /** The absolute moment of birth in UTC milliseconds. */
  instant: number
  /** Minutes added to civil time to reach local mean solar time. */
  longitudeMinutes: number
  equationOfTimeMinutes: number
  totalMinutes: number
  /** Corrected civil-calendar fields actually used for the chart. */
  corrected: { year: number; month: number; day: number; hour: number; minute: number }
  /** True when the correction pushed the chart across midnight. */
  dayShifted: boolean
}

export interface ElementTally {
  element: Element
  /** Weighted score used for the strength verdict. */
  score: number
  /** Raw count of visible stems + branches. */
  count: number
}

export interface StrengthAnalysis {
  dayMaster: number
  dayMasterElement: Element
  strength: Strength
  /** 0-100; above 50 reads as strong. */
  score: number
  seasonalStrength: number
  season: Season
  supporting: number
  draining: number
  favourable: Element[]
  unfavourable: Element[]
  tally: ElementTally[]
}

export interface Relation {
  type: string
  /** Pillar slots involved. */
  slots: PillarSlot[]
  /** Human-readable members, e.g. ["ZI", "WU"]. Three of them for a trine. */
  members: string[]
  scope: 'STEM' | 'BRANCH'
  /** The element a combination forms. Only combinations carry one. */
  element?: Element
}

export interface LuckPillar {
  index: number
  jz: number
  stem: number
  branch: number
  stemTenGod: number
  startAge: number
  endAge: number
  startYear: number
  endYear: number
  phase: number
}

export interface AnnualPillar {
  year: number
  jz: number
  stem: number
  branch: number
  stemTenGod: number
  age: number
  phase: number
}

export interface LuckCycle {
  /** True when the sequence runs forward through the JiaZi. */
  forward: boolean
  /** Age at which the first luck pillar takes over, to one decimal. */
  startAge: number
  /** Days from birth to the governing solar term, before the /3 conversion. */
  daysToTerm: number
  pillars: LuckPillar[]
}

export interface BaziChart {
  input: BirthInput
  correction: SolarCorrection
  pillars: Record<PillarSlot, Pillar>
  dayMaster: number
  dayMasterElement: Element
  /** True when the birth date lands on a solar-term boundary day. */
  onTermBoundary: boolean
  strength: StrengthAnalysis
  relations: Relation[]
  luck: LuckCycle
  /** The bazi year the chart belongs to (may differ from the civil year). */
  baziYear: number
}
