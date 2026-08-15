import {
  FIRST_YEAR,
  LAST_YEAR,
  DAY_ANCHOR_JZ,
  DAY_ANCHOR_UTC,
  MONTH_ANCHOR_INDEX,
  MONTH_ANCHOR_JZ,
  YEAR_EPOCH,
  TERM_BASE_MINUTE,
  TERM_DELTAS,
} from './data/calendar'
import { HOUR_GRID, SEXAGENARY } from './data/tables'

const DAY_MS = 86400000
const MINUTE_MS = 60000

export { FIRST_YEAR, LAST_YEAR }

export class OutOfRangeError extends Error {
  constructor(what: string) {
    super(`${what} is outside the supported range ${FIRST_YEAR}-${LAST_YEAR}.`)
    this.name = 'OutOfRangeError'
  }
}

/** Decoded once: absolute UTC instant (ms) of every solar term, 1900-2100. */
const TERM_INSTANTS: number[] = (() => {
  const count = TERM_DELTAS.length / 3 + 1
  const out = new Array<number>(count)
  let minute = TERM_BASE_MINUTE
  out[0] = minute * MINUTE_MS
  for (let i = 1; i < count; i++) {
    minute += parseInt(TERM_DELTAS.slice((i - 1) * 3, i * 3), 36)
    out[i] = minute * MINUTE_MS
  }
  return out
})()

export const TERM_COUNT = TERM_INSTANTS.length

/** Index of the term that opens the given calendar month. */
export const termSlot = (year: number, month: number) => (year - FIRST_YEAR) * 12 + (month - 1)

export function termInstant(index: number): number {
  if (index < 0 || index >= TERM_INSTANTS.length) throw new OutOfRangeError(`Solar term index ${index}`)
  return TERM_INSTANTS[index]
}

export const isSupportedYear = (year: number) => year >= FIRST_YEAR + 1 && year <= LAST_YEAR - 1

/** Index of the most recent solar term at or before the instant. Binary search. */
export function termIndexAt(instant: number): number {
  if (instant < TERM_INSTANTS[0] || instant > TERM_INSTANTS[TERM_INSTANTS.length - 1]) {
    throw new OutOfRangeError(new Date(instant).toISOString().slice(0, 10))
  }
  let lo = 0
  let hi = TERM_INSTANTS.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (TERM_INSTANTS[mid] <= instant) lo = mid
    else hi = mid - 1
  }
  return lo
}

const mod = (n: number, m: number) => ((n % m) + m) % m

/**
 * The bazi year an instant belongs to. Rolls over at the Li Chun instant, not at
 * 1 January and not at local midnight — the term is a moment in the Sun's orbit,
 * so it happens simultaneously everywhere on Earth.
 */
export function baziYearOf(instant: number): number {
  const civilYear = new Date(instant).getUTCFullYear()
  // Compare against Li Chun of the civil year the instant falls in, in UTC terms.
  for (const y of [civilYear + 1, civilYear, civilYear - 1]) {
    const slot = termSlot(y, 2)
    if (slot >= 0 && slot < TERM_INSTANTS.length && instant >= TERM_INSTANTS[slot]) return y
  }
  throw new OutOfRangeError(new Date(instant).toISOString().slice(0, 10))
}

/** Year pillar. Pure arithmetic, valid for any year. */
export const yearPillarJz = (baziYear: number) => mod(baziYear - YEAR_EPOCH, 60) + 1

export function monthPillarJz(instant: number): number {
  const idx = termIndexAt(instant)
  return mod(MONTH_ANCHOR_JZ - 1 + (idx - MONTH_ANCHOR_INDEX), 60) + 1
}

/**
 * Day pillar. Unlike the year and month pillars this follows the local solar
 * calendar day, so it takes already-corrected local date fields rather than an
 * absolute instant.
 */
export function dayPillarJz(year: number, month: number, day: number): number {
  const days = Math.round((Date.UTC(year, month - 1, day) - DAY_ANCHOR_UTC) / DAY_MS)
  return mod(DAY_ANCHOR_JZ - 1 + days, 60) + 1
}

/** Hour slot 0-11 for Zi..Hai, plus 12 for the late Zi hour (23:00-24:00). */
export const hourSlot = (hour: number) => (hour === 23 ? 12 : Math.floor((hour + 1) / 2) % 12)

export const hourPillarJz = (dayStem: number, hour: number) => HOUR_GRID[dayStem - 1][hourSlot(hour)]

export const stemOf = (jz: number) => SEXAGENARY[jz - 1].stem
export const branchOf = (jz: number) => SEXAGENARY[jz - 1].branch

/**
 * How close the instant sits to a term boundary, in minutes.
 * The underlying solar model is good to roughly ±15 minutes, so anything inside
 * an hour of a boundary deserves a caveat in the UI rather than a silent answer.
 */
export function minutesFromNearestTerm(instant: number): number {
  const idx = termIndexAt(instant)
  const before = instant - TERM_INSTANTS[idx]
  const after = idx + 1 < TERM_INSTANTS.length ? TERM_INSTANTS[idx + 1] - instant : Infinity
  return Math.min(before, after) / MINUTE_MS
}

/** Exact days from the instant forward to the next term, as a fraction. */
export function daysToNextTerm(instant: number): number {
  const idx = termIndexAt(instant)
  if (idx + 1 >= TERM_INSTANTS.length) throw new OutOfRangeError('next solar term')
  return (TERM_INSTANTS[idx + 1] - instant) / DAY_MS
}

/** Exact days from the previous term forward to the instant, as a fraction. */
export function daysFromPrevTerm(instant: number): number {
  const idx = termIndexAt(instant)
  return (instant - TERM_INSTANTS[idx]) / DAY_MS
}
