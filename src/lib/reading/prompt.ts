import {
  BRANCH_TERMS,
  ELEMENT_TERMS,
  PHASE_TERMS,
  PILLAR_TERMS,
  RELATION_TERMS,
  STEM_TERMS,
  TEN_GOD_TERMS,
  groupHits,
  type BaziChart,
  type DailySnapshot,
  type Element,
  type Locale,
} from '@/lib/bazi'

/**
 * The system prompt is deliberately free of dates, names, and chart data.
 *
 * Everything volatile lives in the user turn instead, which keeps this block
 * byte-identical on every request — the condition prompt caching needs to hit.
 * It is comfortably over the 512-token minimum, so it caches on Claude Opus 5.
 */
export const SYSTEM_PROMPT = `You write daily readings for a BaZi (Four Pillars of Destiny) application.

Every reading is generated from a rules engine that has already done the analysis. You will receive a list of findings: the transit pillar for the day, how it meets the natal chart, which elements it brings, and whether those elements are ones the chart wants or struggles with. Your job is to turn those findings into prose a person can use. You are the writer, not the analyst.

## The one rule that matters

Say only what the findings support. Every claim must trace to a finding you were given. Do not introduce a clash, harmony, star, or element that is not in the list. Do not invent a life area — work, health, money, relationships — unless a finding names the relevant god or element and you are drawing a conventional association from it. If the findings are thin, write a short reading. A short honest reading is the correct output for an uneventful day; padding it with generic advice is not.

You will sometimes receive findings that pull in opposite directions — a harmony and a clash on the same day, a favourable element arriving alongside an unfavourable one. Do not resolve this by picking a side or averaging it into blandness. Say plainly that the day pulls both ways, and name what each side touches.

## Register

Write the way a knowledgeable practitioner talks to a client they respect: direct, specific, unhurried. The reader is an adult making their own decisions.

- Describe conditions, not fates. "This is a day when X meets Y, which tends to bring Z" — not "you will experience Z". BaZi describes weather, not destiny; the reader still chooses what to do in it.
- No hedging into meaninglessness. "Something may or may not happen" is not a reading. Commit to what the findings say.
- No flattery, no reassurance-by-default, no cosmic language. Do not open by telling the reader they are special or that the universe is aligning.
- Do not predict specific events, medical outcomes, financial results, or the behaviour of named people. Speak to tendencies and what they suggest about approach.
- Never tell the reader to avoid medical care, legal advice, or a decision that matters, on the basis of a chart.

## Structure

Return the fields requested. Each has a job:

- headline: one clause naming the day's character. No punctuation at the end, no colon-subtitle construction.
- summary: two or three sentences. What is meeting what, and what that tends to mean. This is the reading; the rest supports it.
- focus: what this day supports. One or two sentences, concrete.
- caution: what to hold lightly today. One or two sentences. If the findings show nothing to be careful about, say the day is unremarkable in this respect rather than manufacturing a warning.
- practical: two to four suggestions, each a short imperative clause. Concrete enough to act on before tonight. Avoid self-care boilerplate — "drink water", "be mindful" — unless a finding genuinely points there.

Write in the requested language only. In Vietnamese, use standard BaZi terminology (Chính Tài, Thất Sát, Lục Hợp, Xung, Tự Hình) rather than translating the terms loosely, and write natural Vietnamese prose around them — not a translation of English sentence structure.`

const gods = (id: number, locale: Locale) => (locale === 'vi' ? TEN_GOD_TERMS[id].vi : TEN_GOD_TERMS[id].en)
const el = (e: string, locale: Locale) =>
  locale === 'vi' ? ELEMENT_TERMS[e as keyof typeof ELEMENT_TERMS].vi : ELEMENT_TERMS[e as keyof typeof ELEMENT_TERMS].en

function pillarLabel(stem: number, branch: number, locale: Locale) {
  const s = locale === 'vi' ? STEM_TERMS[stem].vi : STEM_TERMS[stem].en
  const b = locale === 'vi' ? BRANCH_TERMS[branch].vi : BRANCH_TERMS[branch].en
  return `${s} ${b} (${STEM_TERMS[stem].zh}${BRANCH_TERMS[branch].zh})`
}

/**
 * Serialises the engine's findings into the user turn.
 *
 * Deliberately plain and enumerated: the model is being asked to write from a
 * fixed list, so the list is what it gets — no chart to re-interpret, no room
 * to derive a finding that the engine did not produce.
 */
export function buildUserPrompt(chart: BaziChart, snapshot: DailySnapshot, locale: Locale): string {
  const L = locale === 'vi' ? 'Vietnamese' : 'English'
  const lines: string[] = []

  lines.push(`Language: ${L}`)
  lines.push(`Date: ${snapshot.date}`)
  lines.push('')
  lines.push('## The chart')
  lines.push(
    `- Day master: ${pillarLabel(chart.dayMaster, chart.pillars.day.branch, locale)}, element ${el(chart.dayMasterElement, locale)}`,
  )
  lines.push(
    `- Strength: ${chart.strength.strength === 'STRONG' ? 'strong' : 'weak'} (${chart.strength.score}/100)`,
  )
  lines.push(`- Elements the chart wants: ${chart.strength.favourable.map((e) => el(e, locale)).join(', ')}`)
  lines.push(`- Elements the chart struggles with: ${chart.strength.unfavourable.map((e) => el(e, locale)).join(', ')}`)
  lines.push(
    `- Natal pillars: ${(['year', 'month', 'day', 'hour'] as const)
      .map((s) => `${PILLAR_TERMS[s].en} ${pillarLabel(chart.pillars[s].stem, chart.pillars[s].branch, locale)}`)
      .join('; ')}`,
  )

  lines.push('')
  lines.push('## The day')
  lines.push(`- Day pillar: ${pillarLabel(snapshot.day.stem, snapshot.day.branch, locale)}`)
  lines.push(`- Its stem is the ${gods(snapshot.stemTenGod, locale)} to the day master`)
  lines.push(`- Its branch carries the ${gods(snapshot.branchTenGod, locale)}`)
  lines.push(
    `- Day master's twelve-phase position today: ${locale === 'vi' ? PHASE_TERMS[snapshot.phase].vi : PHASE_TERMS[snapshot.phase].en}`,
  )
  if (snapshot.luck) {
    lines.push(
      `- Current luck pillar: ${pillarLabel(snapshot.luck.stem, snapshot.luck.branch, locale)}, ages ${snapshot.luck.startAge}-${snapshot.luck.endAge}`,
    )
  }
  lines.push(`- Annual pillar: ${pillarLabel(snapshot.year.stem, snapshot.year.branch, locale)}`)

  lines.push('')
  lines.push('## Findings')

  // Grouped: a day whose stem and branch are the same element is one finding
  // with emphasis, not the same finding stated twice.
  const describe = ({ element, count }: { element: Element; count: number }) =>
    count > 1 ? `${el(element, locale)} in both the stem and the branch` : el(element, locale)

  for (const hit of groupHits(snapshot.favourableHits)) {
    lines.push(`- The day brings ${describe(hit)} — an element this chart wants.`)
  }
  for (const hit of groupHits(snapshot.unfavourableHits)) {
    lines.push(`- The day brings ${describe(hit)} — an element this chart struggles with.`)
  }

  // Marked as gathering or grinding, so the writer does not have to infer the
  // valence of a relationship name it may not know.
  for (const r of snapshot.relations) {
    const name = locale === 'vi' ? RELATION_TERMS[r.type]?.vi : RELATION_TERMS[r.type]?.en
    const slot = locale === 'vi' ? PILLAR_TERMS[r.slot].vi : PILLAR_TERMS[r.slot].en
    const valence = r.weight > 0 ? 'this one gathers and supports' : 'this one abrades'
    lines.push(
      `- ${name ?? r.type} between the day's ${r.scope.toLowerCase()} and the natal ${slot} — ${valence}.`,
    )
  }

  if (!snapshot.relations.length) {
    lines.push('- No clash, harmony, punishment, or harm with the natal chart today.')
  }

  lines.push('')
  lines.push(`Overall tenor from the engine: ${snapshot.band} (score ${snapshot.score}).`)
  lines.push('')
  lines.push(`Write the reading in ${L}.`)

  return lines.join('\n')
}
