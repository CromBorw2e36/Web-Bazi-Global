import { HEAVENLY_STEMS } from './data/tables'
import { daysFromPrevTerm, daysToNextTerm, stemOf, branchOf, yearPillarJz } from './calendar'
import { phaseOf, tenGodOf } from './analysis'
import type { AnnualPillar, Gender, LuckCycle, LuckPillar } from './types'

const PILLAR_COUNT = 10
const YEARS_PER_PILLAR = 10

/**
 * Luck pillars (Đại Vận / 大運).
 *
 * The sequence walks the sexagenary cycle away from the month pillar. It runs
 * forward for yang-year men and yin-year women, backward for the other two
 * combinations. The starting age comes from the distance to the governing solar
 * term under the classical three-days-to-one-year rule — forward to the next
 * term when the sequence advances, back to the previous one when it retreats.
 *
 * Because the term instants are known to the minute, this start age is exact
 * rather than rounded to whole days.
 */
export function buildLuckCycle(
  instant: number,
  monthPillarJz: number,
  yearPillarStem: number,
  gender: Gender,
  birthYear: number,
): LuckCycle {
  const yearIsYang = HEAVENLY_STEMS[yearPillarStem - 1].polarity === 'YANG'
  const forward = yearIsYang === (gender === 'MALE')

  const daysToTerm = forward ? daysToNextTerm(instant) : daysFromPrevTerm(instant)
  const startAge = daysToTerm / 3

  const pillars: LuckPillar[] = []
  for (let i = 1; i <= PILLAR_COUNT; i++) {
    const offset = forward ? i : -i
    const jz = ((((monthPillarJz - 1 + offset) % 60) + 60) % 60) + 1
    const stem = stemOf(jz)
    const branch = branchOf(jz)
    const from = startAge + (i - 1) * YEARS_PER_PILLAR

    pillars.push({
      index: i,
      jz,
      stem,
      branch,
      stemTenGod: 0, // filled in by the caller, which knows the day master
      startAge: Math.round(from * 10) / 10,
      endAge: Math.round((from + YEARS_PER_PILLAR) * 10) / 10,
      startYear: birthYear + Math.floor(from),
      endYear: birthYear + Math.floor(from + YEARS_PER_PILLAR),
      phase: 0,
    })
  }

  return {
    forward,
    startAge: Math.round(startAge * 10) / 10,
    daysToTerm: Math.round(daysToTerm * 100) / 100,
    pillars,
  }
}

/** Fills in the day-master-dependent fields once the day master is known. */
export function annotateLuckCycle(cycle: LuckCycle, dayMaster: number): LuckCycle {
  return {
    ...cycle,
    pillars: cycle.pillars.map((p) => ({
      ...p,
      stemTenGod: tenGodOf(dayMaster, p.stem),
      phase: phaseOf(dayMaster, p.branch),
    })),
  }
}

/**
 * Annual pillars (Lưu Niên / 流年) for a span of years.
 *
 * The year pillar is pure arithmetic on the bazi year, so this stays valid well
 * outside the solar-term table. Note that a bazi year begins at Li Chun in early
 * February, so a calendar year and its pillar do not line up in January.
 */
export function buildAnnualPillars(
  fromYear: number,
  toYear: number,
  birthYear: number,
  dayMaster: number,
): AnnualPillar[] {
  const out: AnnualPillar[] = []
  for (let year = fromYear; year <= toYear; year++) {
    const jz = yearPillarJz(year)
    const stem = stemOf(jz)
    const branch = branchOf(jz)
    out.push({
      year,
      jz,
      stem,
      branch,
      stemTenGod: tenGodOf(dayMaster, stem),
      age: year - birthYear,
      phase: phaseOf(dayMaster, branch),
    })
  }
  return out
}

/** The luck pillar governing a given age, or null before the cycle starts. */
export function luckPillarAtAge(cycle: LuckCycle, age: number): LuckPillar | null {
  return cycle.pillars.find((p) => age >= p.startAge && age < p.endAge) ?? null
}
