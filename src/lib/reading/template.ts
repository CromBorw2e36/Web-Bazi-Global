import {
  ELEMENT_TERMS,
  PHASE_TERMS,
  PILLAR_TERMS,
  RELATION_TERMS,
  STEM_TERMS,
  BRANCH_TERMS,
  TEN_GOD_TERMS,
  groupHits,
  harmoniousRelations,
  frictionRelations,
  type DailySnapshot,
  type Locale,
} from '@/lib/bazi'
import type { ReadingBody } from './schema'

/**
 * The deterministic renderer.
 *
 * This is the fallback when no API key is configured, when the model declines,
 * or when generation fails — and it is also the floor the generated prose is
 * measured against. It states the findings plainly without dressing them up,
 * so a reading is never fabricated just because the network was unavailable.
 */
export function renderTemplate(snapshot: DailySnapshot, locale: Locale): ReadingBody {
  const vi = locale === 'vi'
  const pick = <T extends { vi: string; en: string }>(t: T) => (vi ? t.vi : t.en)

  const dayPillar = `${pick(STEM_TERMS[snapshot.day.stem])} ${pick(BRANCH_TERMS[snapshot.day.branch])}`
  const stemGod = pick(TEN_GOD_TERMS[snapshot.stemTenGod])
  const phase = pick(PHASE_TERMS[snapshot.phase])

  // Grouped, so a day that is one element twice reads as emphasis rather than
  // as the same word printed back to back.
  const label = ({ element, count }: { element: (typeof snapshot.favourableHits)[number]; count: number }) => {
    const name = pick(ELEMENT_TERMS[element])
    if (count < 2) return name
    return vi ? `${name} (cả can lẫn chi)` : `${name} in both stem and branch`
  }
  const fav = groupHits(snapshot.favourableHits).map(label)
  const unfav = groupHits(snapshot.unfavourableHits).map(label)

  const relationLabel = (r: (typeof snapshot.relations)[number]) => {
    const name = RELATION_TERMS[r.type] ? pick(RELATION_TERMS[r.type]) : r.type
    return `${name} — ${pick(PILLAR_TERMS[r.slot])}`
  }
  // Harmony belongs with what the day supports, not with what to watch. Lumping
  // every relationship into "caution" told readers to be wary of a Six Harmony.
  const harmonies = harmoniousRelations(snapshot).map(relationLabel)
  const frictions = frictionRelations(snapshot).map(relationLabel)

  const headline = vi ? `Ngày ${dayPillar} · ${stemGod}` : `${dayPillar} day · ${stemGod}`

  const summaryParts: string[] = []
  summaryParts.push(
    vi
      ? `Trụ ngày hôm nay là ${dayPillar}, can ngày mang ${stemGod} đối với nhật chủ. Nhật chủ ở vị trí ${phase}.`
      : `Today's pillar is ${dayPillar}; its stem is the ${stemGod} to your day master, which sits in ${phase}.`,
  )
  if (fav.length) {
    summaryParts.push(vi ? `Ngày mang ${fav.join(', ')} — thuộc dụng thần.` : `The day brings ${fav.join(' and ')}, which this chart wants.`)
  }
  if (unfav.length) {
    summaryParts.push(
      vi ? `Đồng thời mang ${unfav.join(', ')} — thuộc kỵ thần.` : `It also brings ${unfav.join(' and ')}, which this chart struggles with.`,
    )
  }
  if (!snapshot.relations.length) {
    summaryParts.push(
      vi ? 'Không có hợp, xung, hình hay hại nào với tứ trụ gốc.' : 'Nothing in the day clashes or harmonises with the natal chart.',
    )
  }

  const focusParts: string[] = []
  if (fav.length) {
    focusParts.push(vi ? `Ngày thuận cho việc dựa vào ${fav.join(', ')}.` : `The day supports work that leans on ${fav.join(' and ')}.`)
  }
  if (harmonies.length) {
    focusParts.push(vi ? `Có ${harmonies.join('; ')}.` : `It brings ${harmonies.join('; ')}.`)
  }
  if (!focusParts.length) {
    focusParts.push(
      vi ? 'Không có hành nào được trợ lực rõ rệt; giữ nhịp bình thường.' : 'No element is strongly supported today; keep to your usual pace.',
    )
  }

  const cautionItems = [...unfav, ...frictions]
  const caution = cautionItems.length
    ? vi
      ? `Cần lưu ý: ${cautionItems.join('; ')}.`
      : `Worth watching: ${cautionItems.join('; ')}.`
    : vi
      ? 'Không có dấu hiệu cần đặc biệt đề phòng.'
      : 'Nothing here calls for particular caution.'

  const practical: string[] = []
  const favBase = groupHits(snapshot.favourableHits)[0]
  const unfavBase = groupHits(snapshot.unfavourableHits)[0]
  if (favBase) {
    practical.push(
      vi
        ? `Ưu tiên việc liên quan đến hành ${pick(ELEMENT_TERMS[favBase.element])}.`
        : `Put the ${pick(ELEMENT_TERMS[favBase.element])}-natured work first.`,
    )
  }
  if (unfavBase) {
    practical.push(
      vi
        ? `Hoãn việc phụ thuộc nhiều vào hành ${pick(ELEMENT_TERMS[unfavBase.element])}.`
        : `Defer anything that leans hard on ${pick(ELEMENT_TERMS[unfavBase.element])}.`,
    )
  }
  if (frictions.length) {
    const slot = pick(PILLAR_TERMS[frictionRelations(snapshot)[0].slot])
    practical.push(vi ? `Xem lại việc liên quan tới ${slot}.` : `Re-check anything tied to your ${slot}.`)
  }
  if (harmonies.length) {
    const slot = pick(PILLAR_TERMS[harmoniousRelations(snapshot)[0].slot])
    practical.push(vi ? `Việc liên quan tới ${slot} dễ xuôi hơn thường lệ.` : `Anything tied to your ${slot} should run smoother than usual.`)
  }
  if (practical.length < 2) {
    practical.push(vi ? 'Ngày bình thường — cứ theo kế hoạch đã có.' : 'An ordinary day — carry on with what you had planned.')
  }

  return {
    headline,
    summary: summaryParts.join(' '),
    focus: focusParts.join(' '),
    caution,
    practical: practical.slice(0, 4),
  }
}
