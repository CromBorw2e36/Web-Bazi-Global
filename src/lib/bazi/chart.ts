import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from './data/tables'
import {
  baziYearOf,
  branchOf,
  dayPillarJz,
  hourPillarJz,
  isSupportedYear,
  minutesFromNearestTerm,
  monthPillarJz,
  OutOfRangeError,
  stemOf,
  yearPillarJz,
} from './calendar'
import { analyseStrength, findRelations, hiddenStemsOf, phaseOf, tenGodOf } from './analysis'
import { annotateLuckCycle, buildLuckCycle } from './luck'
import { applySolarCorrection } from './solar'
import type { BaziChart, BirthInput, Pillar, PillarSlot } from './types'

/** Minutes from a solar term within which the term-day assignment is uncertain. */
const BOUNDARY_WARNING_MINUTES = 60

function makePillar(slot: PillarSlot, jz: number, dayMaster: number): Pillar {
  const stem = stemOf(jz)
  const branch = branchOf(jz)
  return {
    slot,
    jz,
    stem,
    branch,
    stemElement: HEAVENLY_STEMS[stem - 1].element,
    branchElement: EARTHLY_BRANCHES[branch - 1].element,
    stemPolarity: HEAVENLY_STEMS[stem - 1].polarity,
    stemTenGod: slot === 'day' ? null : tenGodOf(dayMaster, stem),
    hiddenStems: hiddenStemsOf(branch, dayMaster),
    phase: phaseOf(dayMaster, branch),
  }
}

/**
 * Casts a full chart from a birth record.
 *
 * The year and month pillars are decided by comparing the absolute birth moment
 * against solar-term instants, so they are correct from any time zone. The day
 * and hour pillars instead follow local solar time at the birth longitude, since
 * those cycles turn with the Sun overhead rather than with the clock on the wall.
 */
export function castChart(input: BirthInput): BaziChart {
  if (!isSupportedYear(input.year)) throw new OutOfRangeError(`Year ${input.year}`)

  const correction = applySolarCorrection(input)
  const { instant } = correction
  const local = correction.corrected

  const baziYear = baziYearOf(instant)
  const yearJz = yearPillarJz(baziYear)
  const monthJz = monthPillarJz(instant)
  const dayJz = dayPillarJz(local.year, local.month, local.day)
  const dayMaster = stemOf(dayJz)
  const hourJz = hourPillarJz(dayMaster, local.hour)

  const pillars: Record<PillarSlot, Pillar> = {
    year: makePillar('year', yearJz, dayMaster),
    month: makePillar('month', monthJz, dayMaster),
    day: makePillar('day', dayJz, dayMaster),
    hour: makePillar('hour', hourJz, dayMaster),
  }

  const luck = annotateLuckCycle(
    buildLuckCycle(instant, monthJz, pillars.year.stem, input.gender, input.year),
    dayMaster,
  )

  return {
    input,
    correction,
    pillars,
    dayMaster,
    dayMasterElement: HEAVENLY_STEMS[dayMaster - 1].element,
    onTermBoundary: minutesFromNearestTerm(instant) < BOUNDARY_WARNING_MINUTES,
    strength: analyseStrength(pillars, dayMaster),
    relations: findRelations(pillars),
    luck,
    baziYear,
  }
}
