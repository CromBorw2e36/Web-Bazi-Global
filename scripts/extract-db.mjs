/**
 * Builds the engine's data layer from two sources:
 *
 *   1. bazi_db (SQLite) — the reference tables: stems, branches, hidden stems,
 *      ten gods, twelve phases, branch/stem relationships, seasonal strength,
 *      favourable elements. This is the knowledge content and is used verbatim.
 *
 *   2. Computed solar geometry — the calendar. The DB ships a day-per-row table
 *      for 1901-2050, but it resolves terms only to a calendar day in UTC+8 and
 *      it contains a small number of genuine errors (see the audit printed at
 *      the end of this script). Computing the term instants instead fixes those,
 *      extends the range to 1900-2100, and lets the runtime compare a birth
 *      moment against a term in any time zone — which a global site needs.
 *
 * The DB still governs correctness: every derived pillar is replayed against all
 * 54,787 of its rows, and any divergence is reported rather than silently kept.
 *
 * Run: npm run gen:data
 */
import { DatabaseSync } from 'node:sqlite'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { solveTermInstant, termLongitudeForMonth } from './solar-longitude.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/lib/bazi/data')

const db = new DatabaseSync(resolve(ROOT, 'bazi_db'), { readOnly: true })
const q = (sql) => db.prepare(sql).all().map((r) => ({ ...r }))

function assert(cond, msg) {
  if (!cond) {
    console.error(`\n  ✗ ASSERTION FAILED: ${msg}\n`)
    process.exit(1)
  }
}

const BANNER = `// GENERATED FILE — do not edit by hand.
// Reference tables from bazi_db; solar-term instants computed from solar geometry.
// Regenerate with: npm run gen:data
`

const FIRST_YEAR = 1900
const LAST_YEAR = 2100
const MINUTE = 60000

// ---------------------------------------------------------------------------
// 1. Solar terms
// ---------------------------------------------------------------------------
const instants = []
for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
  for (let m = 1; m <= 12; m++) {
    instants.push(solveTermInstant(termLongitudeForMonth(m), y, m))
  }
}
assert(instants.length === (LAST_YEAR - FIRST_YEAR + 1) * 12, 'term count mismatch')

// Delta-encode to base36. Every gap between consecutive terms is 29.4-31.5 days,
// which always fits in three base36 digits (< 46656 minutes).
const baseMinutes = Math.round(instants[0] / MINUTE)
let encoded = ''
for (let i = 1; i < instants.length; i++) {
  const delta = Math.round(instants[i] / MINUTE) - Math.round(instants[i - 1] / MINUTE)
  assert(delta > 0 && delta < 36 ** 3, `term delta ${delta} at index ${i} does not fit in 3 base36 digits`)
  encoded += delta.toString(36).padStart(3, '0')
}

// ---------------------------------------------------------------------------
// 2. Replay the DB's own table through the computed calendar
// ---------------------------------------------------------------------------
const ts = q('SELECT id, YP, MP, DP FROM TS ORDER BY id')
assert(ts.length === 54787, `expected 54787 TS rows, got ${ts.length}`)

const CN_OFFSET = 8 * 3600000 // the almanac's reference zone
const termIndexOf = (y, m) => (y - FIRST_YEAR) * 12 + (m - 1)
const MONTH_ANCHOR_INDEX = termIndexOf(1901, 1)
const MONTH_ANCHOR_JZ = 26
const DAY_ANCHOR_UTC = Date.UTC(1901, 0, 1)
const DAY_ANCHOR_JZ = 16
const YEAR_EPOCH = 1864
const mod = (n, m) => ((n % m) + m) % m

/** Calendar day (in the almanac's zone) on which each term falls. */
const termDayCN = instants.map((ms) => {
  const d = new Date(ms + CN_OFFSET)
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), ms }
})

const divergences = []
let pillarChecks = 0
for (const row of ts) {
  const y = +row.id.slice(0, 4)
  const m = +row.id.slice(4, 6)
  const d = +row.id.slice(6, 8)

  // Day pillar — pure arithmetic, must match exactly.
  const days = Math.round((Date.UTC(y, m - 1, d) - DAY_ANCHOR_UTC) / 86400000)
  const dp = mod(DAY_ANCHOR_JZ - 1 + days, 60) + 1
  assert(dp === +row.DP, `day pillar mismatch at ${row.id}: db=${row.DP} calc=${dp}`)

  // Month pillar — depends on where the term boundary falls.
  const slot = termIndexOf(y, m)
  const idx = d >= termDayCN[slot].d ? slot : slot - 1
  const mp = mod(MONTH_ANCHOR_JZ - 1 + (idx - MONTH_ANCHOR_INDEX), 60) + 1

  // Year pillar — rolls at Li Chun.
  const liChun = termDayCN[termIndexOf(y, 2)].d
  const baziYear = m > 2 || (m === 2 && d >= liChun) ? y : y - 1
  const yp = mod(baziYear - YEAR_EPOCH, 60) + 1

  if (mp !== +row.MP) divergences.push({ id: row.id, kind: 'month', db: +row.MP, calc: mp })
  if (yp !== +row.YP) divergences.push({ id: row.id, kind: 'year', db: +row.YP, calc: yp })
  pillarChecks += 3
}

// Group divergences by the term boundary responsible for them.
const affectedTerms = new Map()
for (const dv of divergences) {
  const y = +dv.id.slice(0, 4)
  const m = +dv.id.slice(4, 6)
  const key = `${y}-${String(m).padStart(2, '0')}`
  if (!affectedTerms.has(key)) affectedTerms.set(key, { days: 0, kinds: new Set() })
  const e = affectedTerms.get(key)
  e.days++
  e.kinds.add(dv.kind)
}

// ---------------------------------------------------------------------------
// 3. Reference tables (verbatim from the DB)
// ---------------------------------------------------------------------------
const num = (v) => (v === null || v === '' ? null : Number(v))
const split = (v) => (v === null || v === '' ? [] : String(v).split('|').map(Number))

const heavenlyStems = q('SELECT _id, NAME, POLARITY, ELEMENT FROM HS ORDER BY CAST(_id AS INT)').map((r) => ({
  id: num(r._id), name: r.NAME, polarity: r.POLARITY, element: r.ELEMENT,
}))
assert(heavenlyStems.length === 10, 'expected 10 heavenly stems')

const earthlyBranches = q(
  'SELECT _id, NAME, ANIMAL, POLARITY, ELEMENT, HIDDEN_STEM, SEASON, STRUCTURE FROM EB ORDER BY CAST(_id AS INT)',
).map((r) => ({
  id: num(r._id), name: r.NAME.toUpperCase(), animal: r.ANIMAL, polarity: r.POLARITY,
  element: r.ELEMENT, hiddenStems: split(r.HIDDEN_STEM), season: r.SEASON, structure: r.STRUCTURE,
}))
assert(earthlyBranches.length === 12, 'expected 12 earthly branches')

const sexagenary = q('SELECT _id, HEAVENLY_STEM, EARTHLY_BRANCH FROM JZ ORDER BY CAST(_id AS INT)').map((r) => ({
  id: num(r._id), stem: num(r.HEAVENLY_STEM), branch: num(r.EARTHLY_BRANCH),
}))
assert(sexagenary.length === 60, 'expected 60 JiaZi entries')
for (const jz of sexagenary) {
  assert(jz.stem === ((jz.id - 1) % 10) + 1, `JZ ${jz.id} stem mismatch`)
  assert(jz.branch === ((jz.id - 1) % 12) + 1, `JZ ${jz.id} branch mismatch`)
}

const tenGods = q('SELECT _id, NAME, ABBREVIATION FROM TG ORDER BY CAST(_id AS INT)').map((r) => ({
  id: num(r._id), name: r.NAME, abbr: r.ABBREVIATION,
}))

const TEN_GOD_GRID = Array.from({ length: 10 }, () => Array(10).fill(0))
for (const r of q('SELECT DAY_MASTER, STEM, GOD FROM TGT')) {
  TEN_GOD_GRID[num(r.DAY_MASTER) - 1][num(r.STEM) - 1] = num(r.GOD)
}
assert(TEN_GOD_GRID.every((row) => row.every((v) => v > 0)), 'ten-god grid has holes')

const PHASE_GRID = Array.from({ length: 10 }, () => Array(12).fill(0))
for (const r of q('SELECT STEM, BRANCH, PHASE FROM TWELVE_PHASE')) {
  PHASE_GRID[num(r.STEM) - 1][num(r.BRANCH) - 1] = num(r.PHASE)
}
assert(PHASE_GRID.every((row) => row.every((v) => v > 0)), 'twelve-phase grid has holes')

const htRows = q('SELECT START_HOUR, DAY_MASTER, HOUR_PILLAR FROM HT')
assert(htRows.length === 130, `expected 130 hour rows, got ${htRows.length}`)
const HOUR_GRID = Array.from({ length: 10 }, () => Array(13).fill(0))
for (const r of htRows) {
  const start = num(r.START_HOUR)
  const slot = start === 23 ? 12 : Math.floor((start + 1) / 2) % 12
  HOUR_GRID[num(r.DAY_MASTER) - 1][slot] = num(r.HOUR_PILLAR)
}
assert(HOUR_GRID.every((row) => row.every((v) => v > 0)), 'hour grid has holes')
for (let dm = 0; dm < 10; dm++) {
  for (let slot = 0; slot < 13; slot++) {
    assert(
      sexagenary[HOUR_GRID[dm][slot] - 1].branch === (slot % 12) + 1,
      `hour pillar (dm=${dm + 1}, slot=${slot}) has the wrong branch`,
    )
  }
  const nextDm = dm === 9 ? 0 : dm + 1
  assert(HOUR_GRID[dm][12] === HOUR_GRID[nextDm][0], `late Zi for stem ${dm + 1} != next day's Zi`)
}

const seasonStrength = q('SELECT SEASON, ELEMENT, STRENGTH FROM SS').map((r) => ({
  season: r.SEASON, element: r.ELEMENT, strength: num(r.STRENGTH),
}))

const favourable = q('SELECT DM_ELEMENT, STRENGTH, FAVOURABLE, UNFAVOURABLE FROM FAV').map((r) => ({
  element: r.DM_ELEMENT, strength: r.STRENGTH,
  favourable: String(r.FAVOURABLE).split('|'), unfavourable: String(r.UNFAVOURABLE).split('|'),
}))

const ELEMENT_ORDER = ['METAL', 'WOOD', 'EARTH', 'WATER', 'FIRE']
const structure = q('SELECT * FROM STRUCTURE').map((r) => ({
  self: r.SELF_ELEMENT, relations: Object.fromEntries(ELEMENT_ORDER.map((e) => [e, r[e]])),
}))

const BRANCH_COLS = ['ZI', 'CHOU', 'YIN', 'MAO', 'CHEN', 'SI', 'WU', 'WEI', 'SHEN', 'YOU', 'XU', 'Hai']
const branchRelations = q('SELECT * FROM EBR').map((r) => ({
  type: r.RELATIONSHIP, targets: BRANCH_COLS.map((c) => num(r[c])),
}))

const STEM_COLS = ['JIA', 'YI', 'BING', 'DING', 'WU', 'JI', 'GENG', 'XIN', 'REN', 'GUI']
const stemRelations = q('SELECT * FROM HSR').map((r) => ({
  type: r.RELATIONSHIP,
  targets: STEM_COLS.map((c) => (num(r[c]) === 0 ? null : num(r[c]))),
}))

// ---------------------------------------------------------------------------
// 4. Emit
// ---------------------------------------------------------------------------
writeFileSync(
  resolve(OUT, 'calendar.ts'),
  `${BANNER}
export const FIRST_YEAR = ${FIRST_YEAR}
export const LAST_YEAR = ${LAST_YEAR}

/** Day pillar anchor: 1901-01-01 is JiaZi #${DAY_ANCHOR_JZ}. */
export const DAY_ANCHOR_JZ = ${DAY_ANCHOR_JZ}
export const DAY_ANCHOR_UTC = Date.UTC(1901, 0, 1)

/** Month pillar anchor: the term opening January 1901 is JiaZi #${MONTH_ANCHOR_JZ}. */
export const MONTH_ANCHOR_INDEX = ${MONTH_ANCHOR_INDEX}
export const MONTH_ANCHOR_JZ = ${MONTH_ANCHOR_JZ}

/** Year pillar reference: 1864 was a Jia Zi year. */
export const YEAR_EPOCH = ${YEAR_EPOCH}

/** UTC minute of the first solar term (January ${FIRST_YEAR}). */
export const TERM_BASE_MINUTE = ${baseMinutes}

/**
 * Gaps between consecutive solar terms, in minutes, base36, three digits each.
 * Term i opens the (i % 12 + 1)-th calendar month of year FIRST_YEAR + floor(i / 12).
 * Precision is about ±15 minutes, so a birth within an hour of a boundary
 * should be flagged rather than silently resolved.
 */
export const TERM_DELTAS = '${encoded}'
`,
)

const j = (v) => JSON.stringify(v, null, 2)
writeFileSync(
  resolve(OUT, 'tables.ts'),
  `${BANNER}
export type Element = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER'
export type Polarity = 'YANG' | 'YIN'
export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'

export interface HeavenlyStem { id: number; name: string; polarity: Polarity; element: Element }
export interface EarthlyBranch {
  id: number; name: string; animal: string; polarity: Polarity; element: Element
  hiddenStems: number[]; season: Season; structure: Element
}

/** 10 Heavenly Stems (Thiên Can). */
export const HEAVENLY_STEMS: HeavenlyStem[] = ${j(heavenlyStems)}

/** 12 Earthly Branches (Địa Chi); hidden stems are ordered main-first. */
export const EARTHLY_BRANCHES: EarthlyBranch[] = ${j(earthlyBranches)}

/** The 60 JiaZi (Lục thập hoa giáp). */
export const SEXAGENARY: { id: number; stem: number; branch: number }[] = ${j(sexagenary)}

/** The 10 Gods (Thập Thần). */
export const TEN_GODS: { id: number; name: string; abbr: string }[] = ${j(tenGods)}

/** TEN_GOD_GRID[dayMaster-1][stem-1] -> ten god id. */
export const TEN_GOD_GRID: number[][] = ${j(TEN_GOD_GRID)}

/** PHASE_GRID[stem-1][branch-1] -> 12-phase id (1 = Trường Sinh). */
export const PHASE_GRID: number[][] = ${j(PHASE_GRID)}

/**
 * HOUR_GRID[dayStem-1][slot] -> hour pillar JiaZi index.
 * Slots 0..11 are Zi..Hai; slot 12 is the late Zi hour (23:00-24:00), which
 * borrows the next day's stem while the day pillar stays unchanged.
 */
export const HOUR_GRID: number[][] = ${j(HOUR_GRID)}

/** Seasonal strength of each element, 1 (weakest) to 5 (strongest). */
export const SEASON_STRENGTH: { season: Season; element: Element; strength: number }[] = ${j(seasonStrength)}

/** Favourable / unfavourable elements (dụng thần, kỵ thần) by day master and strength. */
export const FAVOURABLE: { element: Element; strength: 'WEAK' | 'STRONG'; favourable: Element[]; unfavourable: Element[] }[] = ${j(favourable)}

/** Structural relation of each element to the day master's element. */
export const STRUCTURE: { self: Element; relations: Record<Element, string> }[] = ${j(structure)}

/** Branch relationships. targets[i] is the branch (1-12) related to branch i+1, or null. */
export const BRANCH_RELATIONS: { type: string; targets: (number | null)[] }[] = ${j(branchRelations)}

/** Stem relationships. targets[i] is the stem (1-10) related to stem i+1, or null. */
export const STEM_RELATIONS: { type: string; targets: (number | null)[] }[] = ${j(stemRelations)}
`,
)

db.close()

console.log(`  ✓ calendar.ts  — ${instants.length} solar terms, ${FIRST_YEAR}-${LAST_YEAR}, ${encoded.length} chars`)
console.log(`  ✓ tables.ts    — 12 reference tables, verbatim from bazi_db`)
console.log(`  ✓ ${pillarChecks.toLocaleString()} pillar values replayed against all ${ts.length.toLocaleString()} DB rows`)
console.log(`  ✓ day pillars match the DB exactly`)

if (affectedTerms.size === 0) {
  console.log(`  ✓ no calendar divergences`)
} else {
  const totalDays = [...affectedTerms.values()].reduce((s, e) => s + e.days, 0)
  console.log(
    `\n  ! ${affectedTerms.size} solar terms differ from the DB, affecting ${totalDays} of ${ts.length} days (${((totalDays / ts.length) * 100).toFixed(2)}%).`,
  )
  console.log(`    These are dates where the DB's term day disagrees with computed solar position:\n`)
  for (const [key, e] of [...affectedTerms].sort()) {
    console.log(`      ${key}  ${e.days.toString().padStart(2)} day(s)  [${[...e.kinds].join(', ')} pillar]`)
  }
  console.log(`\n    Computed positions are used. Run "npm run audit" for the per-term comparison.`)
}
