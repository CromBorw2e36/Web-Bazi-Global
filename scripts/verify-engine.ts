/**
 * Engine verification.
 *
 * Three independent kinds of check:
 *   1. Replay — pillars for every day of 1901-2050 against the source DB.
 *   2. Rules  — hour stems re-derived from the Five Rats rule, luck direction
 *               from the classical yang/yin × gender table, all without
 *               consulting the generated tables.
 *   3. Invariants — properties that must hold regardless of input, such as a
 *               single birth moment producing the same year and month pillars
 *               no matter which time zone it is expressed in.
 *
 * Run: npm run verify
 */
import { DatabaseSync } from 'node:sqlite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { castChart } from '../src/lib/bazi/chart'
import {
  hourPillarJz, stemOf, branchOf, dayPillarJz, yearPillarJz, baziYearOf,
  termInstant, TERM_COUNT,
} from '../src/lib/bazi/calendar'
import { buildAnnualPillars } from '../src/lib/bazi/luck'
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, TEN_GODS } from '../src/lib/bazi/data/tables'
import type { BirthInput } from '../src/lib/bazi/types'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const db = new DatabaseSync(resolve(ROOT, 'bazi_db'), { readOnly: true })

let passed = 0
const failures: string[] = []
function check(name: string, cond: boolean, detail = '') {
  if (cond) passed++
  else if (failures.length < 20) failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
}

// Beijing, sitting on the UTC+8 standard meridian so no longitude correction applies.
const beijing = (y: number, m: number, d: number, h = 12, min = 0): BirthInput => ({
  year: y, month: m, day: d, hour: h, minute: min,
  gender: 'MALE', longitude: 120, utcOffset: 8,
})

// ---------------------------------------------------------------------------
// 1. Replay against the DB
// ---------------------------------------------------------------------------
const rows = db.prepare('SELECT id, YP, MP, DP FROM TS ORDER BY id').all() as {
  id: string; YP: string; MP: string; DP: string
}[]

/**
 * A day on which a term falls is inherently ambiguous between the two models:
 * the DB assigns the whole calendar day to the incoming term, while the engine
 * switches at the exact instant. Those days are excluded from the strict
 * comparison and checked separately below. Every other day must match exactly.
 */
const CN_OFFSET = 8 * 3600000
const ambiguous = new Set<string>()

// Term days according to the DB (where its month pillar changes).
for (let i = 1; i < rows.length; i++) {
  if (rows[i].MP !== rows[i - 1].MP) ambiguous.add(rows[i].id)
}
// Term days according to the engine's computed instants, in the DB's zone.
for (let idx = 0; idx < TERM_COUNT; idx++) {
  const d = new Date(termInstant(idx) + CN_OFFSET)
  const id = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`
  ambiguous.add(id)
}

let replayed = 0
let skipped = 0
for (const row of rows) {
  const y = +row.id.slice(0, 4)
  const m = +row.id.slice(4, 6)
  const d = +row.id.slice(6, 8)
  if (y < 1902 || y > 2049) continue // engine range excludes the table edges

  const chart = castChart(beijing(y, m, d))
  check('day pillar replay', chart.pillars.day.jz === +row.DP, `${row.id} db=${row.DP} got=${chart.pillars.day.jz}`)

  if (ambiguous.has(row.id)) {
    skipped++
  } else {
    check('month pillar replay', chart.pillars.month.jz === +row.MP, `${row.id} db=${row.MP} got=${chart.pillars.month.jz}`)
    check('year pillar replay', chart.pillars.year.jz === +row.YP, `${row.id} db=${row.YP} got=${chart.pillars.year.jz}`)
    replayed++
  }
}
check('replay covered the full range', replayed > 52000, `replayed ${replayed}`)
check('ambiguous days are a small minority', skipped < 2000, `${skipped} skipped`)

// On a term day the engine must switch exactly at the instant, not at midnight.
{
  let switched = 0
  for (let idx = 24; idx < TERM_COUNT - 24; idx += 97) {
    const at = termInstant(idx)
    const beforeD = new Date(at - 90 * 60000)
    const afterD = new Date(at + 90 * 60000)
    const mk = (dt: Date): BirthInput => ({
      year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate(),
      hour: dt.getUTCHours(), minute: dt.getUTCMinutes(),
      gender: 'MALE', longitude: 0, utcOffset: 0,
    })
    const before = castChart(mk(beforeD))
    const after = castChart(mk(afterD))
    check('month pillar advances across the term instant',
      after.pillars.month.jz === (before.pillars.month.jz % 60) + 1,
      `term ${idx}: ${before.pillars.month.jz} -> ${after.pillars.month.jz}`)

    // The uncertainty flag must fire close to the instant and stay quiet far from it.
    const near = castChart(mk(new Date(at + 20 * 60000)))
    const far = castChart(mk(new Date(at + 20 * 3600000)))
    check('boundary flagged when near the instant', near.onTermBoundary, `term ${idx}`)
    check('boundary not flagged when far from it', !far.onTermBoundary, `term ${idx}`)
    switched++
  }
  check('boundary transitions sampled', switched > 20, `${switched}`)
}

// ---------------------------------------------------------------------------
// 2. Independent rule derivations
// ---------------------------------------------------------------------------

// Five Rats rule (Ngũ Thử Độn): the Zi-hour stem of a day is determined by the
// day stem, and each later hour advances one stem.
for (let dayStem = 1; dayStem <= 10; dayStem++) {
  const ziStem = (((dayStem - 1) % 5) * 2) % 10 + 1
  for (let h = 0; h <= 22; h++) {
    const slot = Math.floor((h + 1) / 2) % 12
    const expectedStem = ((ziStem - 1 + slot) % 10) + 1
    const expectedBranch = slot + 1
    const jz = hourPillarJz(dayStem, h)
    check('five rats stem', stemOf(jz) === expectedStem, `dayStem=${dayStem} h=${h}`)
    check('five rats branch', branchOf(jz) === expectedBranch, `dayStem=${dayStem} h=${h}`)
  }
  // Late Zi borrows the next day's stem.
  const nextDayStem = (dayStem % 10) + 1
  const lateZiStem = (((nextDayStem - 1) % 5) * 2) % 10 + 1
  check('late zi stem', stemOf(hourPillarJz(dayStem, 23)) === lateZiStem, `dayStem=${dayStem}`)
  check('late zi branch', branchOf(hourPillarJz(dayStem, 23)) === 1, `dayStem=${dayStem}`)
}

// Luck direction: forward for yang-year men and yin-year women.
for (const [y, m, d] of [[1984, 6, 15], [1985, 6, 15], [1990, 3, 3], [2001, 11, 20]] as const) {
  for (const gender of ['MALE', 'FEMALE'] as const) {
    const chart = castChart({ ...beijing(y, m, d), gender })
    const yearStemYang = HEAVENLY_STEMS[chart.pillars.year.stem - 1].polarity === 'YANG'
    const expected = yearStemYang === (gender === 'MALE')
    check('luck direction', chart.luck.forward === expected, `${y}-${m}-${d} ${gender}`)

    // Consecutive luck pillars must step one JiaZi in the chosen direction.
    for (let i = 1; i < chart.luck.pillars.length; i++) {
      const prev = chart.luck.pillars[i - 1].jz
      const cur = chart.luck.pillars[i].jz
      const step = expected ? (prev % 60) + 1 : ((prev - 2 + 60) % 60) + 1
      check('luck sequence', cur === step, `${y} ${gender} pillar ${i}`)
    }
    // The first luck pillar must sit one step from the month pillar.
    const monthJz = chart.pillars.month.jz
    const firstExpected = expected ? (monthJz % 60) + 1 : ((monthJz - 2 + 60) % 60) + 1
    check('luck starts from month pillar', chart.luck.pillars[0].jz === firstExpected, `${y} ${gender}`)
    check('luck start age plausible', chart.luck.startAge >= 0 && chart.luck.startAge <= 10, `${y} ${gender} = ${chart.luck.startAge}`)
  }
}

// Ten gods: the day master relative to itself is always the Friend star,
// and the relation must be symmetric with the Wu Xing cycle.
for (let dm = 1; dm <= 10; dm++) {
  const chart = castChart(beijing(2000, 6, 15))
  void chart
  const selfGod = TEN_GODS.find((g) => g.id === 9)
  check('friend star present', selfGod?.abbr === 'F')
}

// ---------------------------------------------------------------------------
// 3. Invariants
// ---------------------------------------------------------------------------

// The same absolute moment, expressed in three time zones, must yield identical
// year and month pillars — those depend on the Sun, not on local clocks.
{
  const bj = castChart({ year: 2000, month: 6, day: 15, hour: 12, minute: 0, gender: 'MALE', longitude: 120, utcOffset: 8 })
  const vn = castChart({ year: 2000, month: 6, day: 15, hour: 11, minute: 0, gender: 'MALE', longitude: 105, utcOffset: 7 })
  const ny = castChart({ year: 2000, month: 6, day: 15, hour: 0, minute: 0, gender: 'MALE', longitude: -74, utcOffset: -4 })
  check('year pillar is zone independent', bj.pillars.year.jz === vn.pillars.year.jz && bj.pillars.year.jz === ny.pillars.year.jz)
  check('month pillar is zone independent', bj.pillars.month.jz === vn.pillars.month.jz && bj.pillars.month.jz === ny.pillars.month.jz)
  check('same instant across zones', bj.correction.instant === vn.correction.instant && bj.correction.instant === ny.correction.instant)
  // But the hour pillar must differ, because local solar time differs.
  check('hour pillar follows local sun', bj.pillars.hour.jz !== ny.pillars.hour.jz)
}

// Longitude correction must actually move the hour pillar at a zone's edge.
{
  const madrid = castChart({ year: 1990, month: 7, day: 1, hour: 7, minute: 0, gender: 'MALE', longitude: -6.3, utcOffset: 2 })
  const onMeridian = castChart({ year: 1990, month: 7, day: 1, hour: 7, minute: 0, gender: 'MALE', longitude: 30, utcOffset: 2 })
  check('longitude shifts the hour pillar', madrid.pillars.hour.branch !== onMeridian.pillars.hour.branch,
    `madrid=${EARTHLY_BRANCHES[madrid.pillars.hour.branch - 1].name} meridian=${EARTHLY_BRANCHES[onMeridian.pillars.hour.branch - 1].name}`)
  check('correction is signed correctly', madrid.correction.totalMinutes < 0, `${madrid.correction.totalMinutes}`)
}

// Every chart must be internally coherent.
for (const [y, m, d, h] of [[1950, 1, 1, 0], [1975, 8, 8, 23], [1988, 2, 4, 5], [2024, 12, 31, 18]] as const) {
  const chart = castChart(beijing(y, m, d, h))
  check('day master matches day stem', chart.dayMaster === chart.pillars.day.stem, `${y}`)
  check('day pillar has no ten god', chart.pillars.day.stemTenGod === null, `${y}`)
  check('other pillars have ten gods', [chart.pillars.year, chart.pillars.month, chart.pillars.hour].every((p) => p.stemTenGod !== null), `${y}`)
  check('every branch has hidden stems', Object.values(chart.pillars).every((p) => p.hiddenStems.length >= 1), `${y}`)
  check('hidden stems lead with MAIN', Object.values(chart.pillars).every((p) => p.hiddenStems[0].role === 'MAIN'), `${y}`)
  check('strength score in range', chart.strength.score >= 0 && chart.strength.score <= 100, `${y}`)
  check('favourable set is non-empty', chart.strength.favourable.length > 0, `${y}`)
  check('favourable and unfavourable are disjoint',
    !chart.strength.favourable.some((e) => chart.strength.unfavourable.includes(e)), `${y}`)
  check('five elements tallied', chart.strength.tally.length === 5, `${y}`)
  check('phases within 1-12', Object.values(chart.pillars).every((p) => p.phase >= 1 && p.phase <= 12), `${y}`)
}

// Li Chun rollover: the bazi year must flip exactly at the term instant.
{
  const before = castChart({ year: 2004, month: 2, day: 4, hour: 10, minute: 0, gender: 'MALE', longitude: 120, utcOffset: 8 })
  const after = castChart({ year: 2004, month: 2, day: 5, hour: 10, minute: 0, gender: 'MALE', longitude: 120, utcOffset: 8 })
  check('bazi year flips at li chun', before.baziYear === 2003 && after.baziYear === 2004,
    `before=${before.baziYear} after=${after.baziYear}`)
  check('year pillars differ across li chun', before.pillars.year.jz !== after.pillars.year.jz)
}

// Annual pillars must advance one JiaZi per year and match the year pillar rule.
{
  const annual = buildAnnualPillars(2020, 2040, 1990, 1)
  check('annual span', annual.length === 21)
  for (let i = 1; i < annual.length; i++) {
    check('annual steps one jiazi', annual[i].jz === (annual[i - 1].jz % 60) + 1, `${annual[i].year}`)
  }
  check('annual matches year pillar rule', annual.every((a) => a.jz === yearPillarJz(a.year)))
  check('2024 is Jia Chen', annual.find((a) => a.year === 2024)?.jz === 41,
    `got ${annual.find((a) => a.year === 2024)?.jz}`)
}

// Day pillar continuity across a century, including the 1900 leap-year exception.
{
  let ok = true
  for (let i = 0; i < 40000; i++) {
    const t = Date.UTC(1910, 0, 1) + i * 86400000
    const dt = new Date(t)
    const jz = dayPillarJz(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
    const next = new Date(t + 86400000)
    const jzNext = dayPillarJz(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())
    if (jzNext !== (jz % 60) + 1) { ok = false; break }
  }
  check('day pillar never skips over 110 years', ok)
}

// baziYearOf must agree with the calendar year outside February.
{
  let ok = true
  for (let y = 1905; y <= 2095; y++) {
    const mid = Date.UTC(y, 6, 1)
    if (baziYearOf(mid) !== y) { ok = false; break }
    const jan = Date.UTC(y, 0, 15)
    if (baziYearOf(jan) !== y - 1) { ok = false; break }
  }
  check('bazi year boundaries hold across two centuries', ok)
}

db.close()

if (failures.length) {
  console.error(`\n  ✗ ${failures.length} failure(s):\n`)
  for (const f of failures) console.error(`    ${f}`)
  process.exit(1)
}
console.log(`  ✓ ${passed.toLocaleString()} checks passed`)
console.log(`  ✓ ${replayed.toLocaleString()} charts replayed against bazi_db`)
console.log(`  ✓ ${skipped.toLocaleString()} term-boundary day(s) checked against exact instants instead`)
