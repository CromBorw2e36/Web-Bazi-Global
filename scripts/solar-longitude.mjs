/**
 * Apparent geocentric solar longitude, and solar-term instant solving.
 *
 * Meeus, "Astronomical Algorithms" ch. 25 (low-accuracy solar position).
 * Longitude is good to about 0.01°, which is ~15 minutes of time. That is far
 * finer than the day-level resolution of the source almanac, but it does mean a
 * term falling within a quarter hour of local midnight cannot be pinned to a
 * calendar day with certainty — callers should surface a warning in that case.
 */

const RAD = Math.PI / 180

/** Julian Day from a UTC millisecond timestamp. */
export const jdFromMs = (ms) => ms / 86400000 + 2440587.5

/**
 * Approximate TT - UT1 in seconds (Espenak & Meeus polynomial set).
 * Solar terms are defined in dynamical time; ignoring ΔT would skew early
 * 20th-century terms by nearly a minute of arc.
 */
export function deltaT(year) {
  if (year < 1900) {
    const t = (year - 1860) / 100
    return 7.62 + 57.37 * t - 2.6884 * t * t
  }
  if (year < 1920) {
    const t = year - 1900
    return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t ** 3 - 0.000197 * t ** 4
  }
  if (year < 1941) {
    const t = year - 1920
    return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t ** 3
  }
  if (year < 1961) {
    const t = year - 1950
    return 29.07 + 0.407 * t - t * t / 233 + t ** 3 / 2547
  }
  if (year < 1986) {
    const t = year - 1975
    return 45.45 + 1.067 * t - t * t / 260 - t ** 3 / 718
  }
  if (year < 2005) {
    const t = year - 2000
    return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5
  }
  if (year < 2050) {
    const t = year - 2000
    return 62.92 + 0.32217 * t + 0.005589 * t * t
  }
  const t = year - 1820
  return -20 + 32 * (t / 100) ** 2 - 0.5628 * (2150 - year)
}

/** Apparent geocentric longitude of the Sun in degrees, for a Julian Ephemeris Day. */
export function apparentSolarLongitude(jde) {
  const T = (jde - 2451545.0) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const Mr = (M % 360) * RAD
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr)
  const trueLon = L0 + C
  const omega = 125.04 - 1934.136 * T
  // -0.00569 is aberration; the omega term is the dominant nutation in longitude.
  const apparent = trueLon - 0.00569 - 0.00478 * Math.sin((omega % 360) * RAD)
  return ((apparent % 360) + 360) % 360
}

/** Signed angular distance from the Sun's longitude to `target`, in (-180, 180]. */
function offsetFrom(ms, target) {
  const year = new Date(ms).getUTCFullYear()
  const jde = jdFromMs(ms) + deltaT(year) / 86400
  const diff = (apparentSolarLongitude(jde) - target + 360) % 360
  return diff > 180 ? diff - 360 : diff
}

/**
 * UTC timestamp (ms) at which the Sun reaches `targetLongitude`, searched
 * around the given calendar month. Bisection to one-second resolution.
 */
export function solveTermInstant(targetLongitude, year, month) {
  let lo = Date.UTC(year, month - 1, 1) - 12 * 86400000
  let hi = lo + 40 * 86400000
  if (offsetFrom(lo, targetLongitude) > 0 || offsetFrom(hi, targetLongitude) < 0) {
    throw new Error(`no solar-term crossing for longitude ${targetLongitude} near ${year}-${month}`)
  }
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    if (offsetFrom(mid, targetLongitude) < 0) lo = mid
    else hi = mid
  }
  return Math.round((lo + hi) / 2)
}

/**
 * Target solar longitude of the "jie" term that opens each calendar month.
 * January opens at 285° (Xiao Han), February at 315° (Li Chun), and so on.
 */
export const termLongitudeForMonth = (month) => (285 + (month - 1) * 30) % 360
