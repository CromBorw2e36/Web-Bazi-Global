import type { BirthInput, SolarCorrection } from './types'

const DAY_MS = 86400000
const MINUTE_MS = 60000

/**
 * Equation of time — the gap between apparent and mean solar time, produced by
 * Earth's orbital eccentricity and axial tilt. Swings roughly -14..+16 minutes
 * across a year.
 */
export function equationOfTime(year: number, month: number, day: number): number {
  const dayOfYear = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / DAY_MS) + 1
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
}

/** The absolute moment of birth, independent of any time zone. */
export function birthInstant(input: BirthInput): number {
  return Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute) - input.utcOffset * 3600000
}

/**
 * Re-expresses the birth moment in local solar time at the birth longitude.
 *
 * A birth certificate records a civil clock, but the day and hour pillars follow
 * the Sun over the birth place. Someone born at 07:00 in western Spain — on
 * Central European Time yet sitting near 7°W — is at about 05:30 solar time, two
 * hour pillars earlier. Time zones are political; the pillars are not.
 */
export function applySolarCorrection(input: BirthInput): SolarCorrection {
  const instant = birthInstant(input)

  // Local mean solar time is UTC shifted by 4 minutes per degree of longitude.
  const longitudeMinutes = input.longitude * 4 - input.utcOffset * 60
  const eot = input.useEquationOfTime ? equationOfTime(input.year, input.month, input.day) : 0

  const solarLocal = new Date(instant + (input.longitude * 4 + eot) * MINUTE_MS)
  const corrected = {
    year: solarLocal.getUTCFullYear(),
    month: solarLocal.getUTCMonth() + 1,
    day: solarLocal.getUTCDate(),
    hour: solarLocal.getUTCHours(),
    minute: solarLocal.getUTCMinutes(),
  }

  return {
    instant,
    longitudeMinutes,
    equationOfTimeMinutes: eot,
    totalMinutes: longitudeMinutes + eot,
    corrected,
    dayShifted: corrected.day !== input.day,
  }
}
