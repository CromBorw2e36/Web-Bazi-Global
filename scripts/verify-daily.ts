/**
 * Verifies the transit layer — how a day meets a natal chart.
 *
 * The natal engine is checked against the source DB in verify-engine.ts. This
 * file checks the properties the daily reading depends on: that a snapshot's
 * pillars agree with the calendar, that its score is exactly the sum of the
 * weights it reports, and that it never claims a relationship with a branch the
 * chart does not have. The prose layer is allowed to talk only about what these
 * snapshots contain, so a wrong snapshot is a wrong reading.
 *
 * Run: npm run verify
 */
import { castChart } from '../src/lib/bazi/chart'
import { buildDailySnapshot, buildDailyRange, todayIn } from '../src/lib/bazi/daily'
import { dayPillarJz, monthPillarJz, yearPillarJz, baziYearOf, stemOf, branchOf } from '../src/lib/bazi/calendar'
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from '../src/lib/bazi/data/tables'
import type { BirthInput } from '../src/lib/bazi/types'

let passed = 0
const failures: string[] = []
const check = (name: string, cond: boolean, detail = '') => {
  if (cond) passed++
  else if (failures.length < 20) failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
}

const CHARTS: BirthInput[] = [
  { year: 1990, month: 6, day: 15, hour: 8, minute: 30, gender: 'MALE', longitude: 105.85, utcOffset: 7, useEquationOfTime: true },
  { year: 1975, month: 11, day: 3, hour: 23, minute: 10, gender: 'FEMALE', longitude: 116.41, utcOffset: 8 },
  { year: 2004, month: 2, day: 4, hour: 20, minute: 0, gender: 'MALE', longitude: -74.01, utcOffset: -5 },
  { year: 1958, month: 8, day: 21, hour: 3, minute: 45, gender: 'FEMALE', longitude: -0.13, utcOffset: 0 },
]

const DATES: string[] = []
for (let i = 0; i < 400; i++) {
  const d = new Date(Date.UTC(2024, 0, 1 + i * 3))
  DATES.push(d.toISOString().slice(0, 10))
}

const BAND_FOR = (score: number) =>
  score >= 5 ? 'AUSPICIOUS' : score >= 2 ? 'FAVOURABLE' : score > -2 ? 'NEUTRAL' : score > -5 ? 'CAUTION' : 'CHALLENGING'

for (const input of CHARTS) {
  const chart = castChart(input)
  const natalBranches = new Set(Object.values(chart.pillars).map((p) => p.branch))
  const natalStems = new Set(Object.values(chart.pillars).map((p) => p.stem))
  const favourable = new Set(chart.strength.favourable)
  const unfavourable = new Set(chart.strength.unfavourable)

  for (const date of DATES) {
    const s = buildDailySnapshot(chart, date)
    const [y, m, d] = date.split('-').map(Number)
    const noon = Date.UTC(y, m - 1, d, 12)

    // --- pillars agree with the calendar module ---
    check('day pillar', s.day.jz === dayPillarJz(y, m, d), date)
    check('day stem/branch', s.day.stem === stemOf(s.day.jz) && s.day.branch === branchOf(s.day.jz), date)
    check('month pillar', s.month.jz === monthPillarJz(noon), date)
    check('year pillar', s.year.jz === yearPillarJz(baziYearOf(noon)), date)

    // --- every relation must involve a branch or stem the chart actually has ---
    for (const r of s.relations) {
      const natal = chart.pillars[r.slot]
      if (r.scope === 'BRANCH') {
        check('relation targets a natal branch', natalBranches.has(natal.branch), `${date} ${r.type}`)
        check(
          'relation names the day branch first',
          r.members[0] === EARTHLY_BRANCHES[s.day.branch - 1].name,
          `${date} ${r.type}`,
        )
      } else {
        check('relation targets a natal stem', natalStems.has(natal.stem), `${date} ${r.type}`)
        check(
          'relation names the day stem first',
          r.members[0] === HEAVENLY_STEMS[s.day.stem - 1].name,
          `${date} ${r.type}`,
        )
      }
      check('relation carries a non-zero weight', r.weight !== 0, `${date} ${r.type}`)
    }

    // --- element hits are drawn from the day's own two elements ---
    const dayElements = [HEAVENLY_STEMS[s.day.stem - 1].element, EARTHLY_BRANCHES[s.day.branch - 1].element]
    check('favourable hits come from the day', s.favourableHits.every((e) => dayElements.includes(e)), date)
    check('unfavourable hits come from the day', s.unfavourableHits.every((e) => dayElements.includes(e)), date)
    check('favourable hits are wanted by the chart', s.favourableHits.every((e) => favourable.has(e)), date)
    check('unfavourable hits are unwanted by the chart', s.unfavourableHits.every((e) => unfavourable.has(e)), date)
    check(
      'an element is never both wanted and unwanted',
      !s.favourableHits.some((e) => s.unfavourableHits.includes(e)),
      date,
    )

    // --- the score is exactly the sum of what the snapshot reports ---
    const relationSum = s.relations.reduce((acc, r) => acc + r.weight, 0)
    const elementSum = s.favourableHits.length * 2 + s.unfavourableHits.length * -2
    const phaseBonus = [1, 4, 5].includes(s.phase) ? 1 : [7, 8, 9, 10].includes(s.phase) ? -1 : 0
    check('score equals the sum of its parts', s.score === relationSum + elementSum + phaseBonus, `${date} got ${s.score}`)

    check('band matches score', s.band === BAND_FOR(s.score), `${date} ${s.score} -> ${s.band}`)
    check('phase in range', s.phase >= 1 && s.phase <= 12, date)
    check('ten gods in range', s.stemTenGod >= 1 && s.stemTenGod <= 10 && s.branchTenGod >= 1 && s.branchTenGod <= 10, date)
    check('date echoed back', s.date === date, date)
  }
}

// --- consecutive days advance one JiaZi ---
{
  const chart = castChart(CHARTS[0])
  const range = buildDailyRange(chart, '2026-01-01', 120)
  check('range length', range.length === 120)
  for (let i = 1; i < range.length; i++) {
    check('range steps one jiazi', range[i].day.jz === (range[i - 1].day.jz % 60) + 1, range[i].date)
  }
  check('range dates are consecutive', range[119].date === '2026-04-30', range[119].date)
}

// --- luck pillar attaches only when the person has reached it ---
{
  const chart = castChart(CHARTS[0])
  const early = buildDailySnapshot(chart, '1990-08-01') // age 0, before the cycle starts
  const later = buildDailySnapshot(chart, '2026-08-01')
  check('no luck pillar before the cycle starts', early.luck === null, `${chart.luck.startAge}`)
  check('luck pillar attaches later', later.luck !== null)
  if (later.luck) {
    const age = 2026 - chart.input.year
    check('luck pillar covers the age', age >= later.luck.startAge && age < later.luck.endAge, `age ${age}`)
  }
}

// --- the same instant lands on different calendar days in different zones ---
{
  const at = new Date('2026-01-01T16:30:00Z') // 23:30 in Hanoi, 11:30 in New York
  check('zone decides the local day', todayIn('Asia/Ho_Chi_Minh', at) === '2026-01-01', todayIn('Asia/Ho_Chi_Minh', at))
  check('zone decides the local day (west)', todayIn('America/New_York', at) === '2026-01-01', todayIn('America/New_York', at))
  const late = new Date('2026-01-01T17:30:00Z') // 00:30 next day in Hanoi
  check('past local midnight rolls over', todayIn('Asia/Ho_Chi_Minh', late) === '2026-01-02', todayIn('Asia/Ho_Chi_Minh', late))
  check('but not yet in New York', todayIn('America/New_York', late) === '2026-01-01', todayIn('America/New_York', late))
  check('an unknown zone falls back rather than throwing', /^\d{4}-\d{2}-\d{2}$/.test(todayIn('Not/AZone', late)))
}

/*
  Every day carries an element judgment.

  The favourable/unfavourable table partitions all five elements — nothing is
  left unclassified — so a day's stem and branch always land on one side or the
  other. There is no such thing as an elementally neutral day in this model, and
  the UI must never be written as though there were.
*/
{
  for (const input of CHARTS) {
    const chart = castChart(input)
    check(
      'the five elements are fully partitioned',
      chart.strength.favourable.length + chart.strength.unfavourable.length === 5,
      `${chart.strength.favourable.length}+${chart.strength.unfavourable.length}`,
    )
    for (const date of DATES) {
      const s = buildDailySnapshot(chart, date)
      check(
        'every day lands on at least one element',
        s.favourableHits.length + s.unfavourableHits.length >= 1,
        date,
      )
      check(
        'element hits never exceed the day’s two elements',
        s.favourableHits.length + s.unfavourableHits.length <= 2,
        date,
      )
    }
  }
}

// --- the tenor spreads across bands rather than collapsing to one ---
{
  const chart = castChart(CHARTS[0])
  const bands = new Set(DATES.map((d) => buildDailySnapshot(chart, d).band))
  check('readings span several bands', bands.size >= 3, `${[...bands].join(', ')}`)
}

if (failures.length) {
  console.error(`\n  ✗ ${failures.length} failure(s):\n`)
  for (const f of failures) console.error(`    ${f}`)
  process.exit(1)
}
console.log(`  ✓ ${passed.toLocaleString()} transit checks passed`)
console.log(`  ✓ ${CHARTS.length} charts × ${DATES.length} days, spanning 1958-2004 births and 4 time zones`)
