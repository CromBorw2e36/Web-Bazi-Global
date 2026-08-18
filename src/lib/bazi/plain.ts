import type { Element, PillarSlot, Season } from './types'

/**
 * The everyday-language layer over the technical vocabulary.
 *
 * A chart is unreadable to most people not because the arithmetic is hard but
 * because every label is a Sino-Vietnamese compound: "Thương Quan", "Dư Khí",
 * "Thân Nhược". This file gives each of those a name a reader already knows and
 * a sentence explaining it, so the same chart can be read at two depths without
 * two sets of screens.
 *
 * Written by hand rather than generated. These are the definitions the app
 * stands behind, they must not drift between sessions, and they cost nothing to
 * serve — a glossary is the one place where a fixed answer beats a fluent one.
 *
 * `short` stands in for the term itself when plain mode is on, so it has to fit
 * where the term fitted: a few words, no punctuation, no clause. `long` is what
 * the reader gets on tapping, and answers "so what does that mean for me".
 */
export interface Plain {
  /** A label that can replace the term in place. Keep it under ~24 characters. */
  short: { vi: string; en: string }
  /** One or two sentences. Plain words, concrete, no further jargon. */
  long: { vi: string; en: string }
}

const p = (vi: string, en: string, viLong: string, enLong: string): Plain => ({
  short: { vi, en },
  long: { vi: viLong, en: enLong },
})

/**
 * Thập Thần — what another stem is *to* the day master.
 *
 * The traditional names are metaphors from imperial officialdom, which is why
 * "Seven Killings" and "Eating God" tell a modern reader nothing. Each gloss
 * names the role the stem plays instead.
 */
export const TEN_GOD_PLAIN: Record<number, Plain> = {
  1: p(
    'Tiền vào đều đặn',
    'Steady income',
    'Của cải đến từ nguồn ổn định: lương tháng, khách quen, tài sản để dành. Cho thấy cách một người giữ và quản tiền hơn là cách họ kiếm lớn.',
    'Wealth from a stable source: a salary, regular customers, savings. It says more about how someone holds money than about how big the windfalls are.',
  ),
  2: p(
    'Tiền được mùa',
    'Windfall income',
    'Của cải đến theo cơ hội: buôn bán, đầu tư, việc ngoài. Có thể nhiều hơn nguồn đều đặn nhưng lên xuống thất thường.',
    'Wealth that arrives with an opportunity: a deal, an investment, work on the side. Often larger than steady income, and far less predictable.',
  ),
  3: p(
    'Khuôn phép, chức trách',
    'Rules and duty',
    'Sức ép vừa phải từ bên ngoài: cấp trên, luật lệ, trách nhiệm được giao. Nó tạo nề nếp và danh phận, đổi lấy sự tự do.',
    'Measured outside pressure: a boss, a rule, a duty you accepted. It builds standing and discipline, and costs you some freedom.',
  ),
  4: p(
    'Sức ép dữ dội',
    'Hard pressure',
    'Cạnh tranh và thử thách gắt: đối thủ mạnh, deadline ngặt, hoàn cảnh buộc phải gồng. Rèn người ta cứng lên, nhưng quá liều thì kiệt.',
    'Sharp competition and strain: a strong rival, a tight deadline, a situation that forces you to push. It hardens a person, and in excess it wears them out.',
  ),
  5: p(
    'Được chở che, dạy dỗ',
    'Support and learning',
    'Nguồn tiếp sức chính đáng: cha mẹ, thầy, bằng cấp, người đỡ đầu. Làm người ta an tâm và có chỗ dựa.',
    'Legitimate backing: a parent, a teacher, a qualification, a mentor. It gives a person something to lean on.',
  ),
  6: p(
    'Tự học, nghĩ sâu',
    'Insight and self-study',
    'Nguồn tiếp sức không chính quy: trực giác, tài lẻ, tự mày mò. Sắc về nghề riêng, nhưng dễ nghĩ nhiều và lẻ loi.',
    'Backing that comes from outside the usual channels: intuition, a self-taught craft, private study. Sharp in its own field, prone to overthinking and isolation.',
  ),
  7: p(
    'Làm ra, hưởng thụ',
    'Making and enjoying',
    'Tài năng thể hiện một cách ôn hòa: nấu nướng, viết, dạy, làm ra sản phẩm đều tay. Thường đi kèm tính dễ chịu và biết hưởng.',
    'Talent expressed gently: cooking, writing, teaching, turning out good work at a steady pace. Usually comes with an easy temperament.',
  ),
  8: p(
    'Sáng tạo phá cách',
    'Sharp creativity',
    'Tài năng thể hiện sắc và mạnh: nói thẳng, làm khác, phá lệ để tìm cách hay hơn. Nổi bật nhanh nhưng hay va vào khuôn phép.',
    'Talent expressed with an edge: speaking plainly, doing it differently, breaking a rule to find a better way. Gets noticed fast, and collides with authority.',
  ),
  9: p(
    'Người ngang sức',
    'Peers',
    'Anh em, bạn nghề, đồng nghiệp cùng vai: chỗ để cộng tác, và cũng là người so sánh với mình.',
    'Siblings, colleagues, people at your own level: someone to work alongside, and someone to be measured against.',
  ),
  10: p(
    'Người tranh phần',
    'Rivals for the same pot',
    'Cùng sức nhưng chung nguồn lực: đối thủ, người vay mượn, khoản chi bất ngờ. Có thể là trợ lực mạnh nếu chia việc rõ.',
    'Equals who draw on the same resources: a competitor, a borrower, an unplanned expense. A real ally when the division of work is clear.',
  ),
}

/**
 * Vòng Trường Sinh — the day master's condition in a given branch, told as the
 * twelve stages of a life. The stage names are already a metaphor; the gloss
 * just says which part of the arc it is.
 */
export const PHASE_PLAIN: Record<number, Plain> = {
  1: p('Mới nhú, đang lên', 'Just starting', 'Như mầm vừa nhú: còn non nhưng đầy sức lớn, việc gì cũng ở buổi đầu.', 'Like a shoot breaking ground: young, untested, full of growth ahead.'),
  2: p('Lóng ngóng, chưa định', 'Finding its shape', 'Đang gột rửa để thành hình: dễ thay đổi, thử rồi sửa, chưa vững chỗ nào.', 'Being washed into shape: changeable, trial and error, nothing settled yet.'),
  3: p('Vào nề nếp', 'Coming of age', 'Bắt đầu có hình có dạng: học nghề, có kỷ luật, chuẩn bị ra đời.', 'Starting to hold a form: learning a trade, gaining discipline, getting ready.'),
  4: p('Đủ sức đảm việc', 'Ready for office', 'Đã đủ sức nhận việc lớn, gần đỉnh sức và biết mình làm được gì.', 'Strong enough to carry real responsibility, near full power and aware of it.'),
  5: p('Đỉnh sức', 'At full strength', 'Mạnh nhất trong vòng: làm được nhiều, và dễ chủ quan nhất.', 'The peak of the cycle: most capable, and most likely to overreach.'),
  6: p('Qua đỉnh, chậm lại', 'Past the peak', 'Sức bắt đầu rút: vẫn làm được nhưng phải tính sức, không còn dư dả.', 'Strength starting to ebb: still capable, but the reserves are gone.'),
  7: p('Yếu, nhiều trở ngại', 'Weakened', 'Giai đoạn dễ gặp vướng: sức không theo ý, cần dưỡng hơn là xông.', 'A stretch where things resist: energy falls short of intent, better to recover than to push.'),
  8: p('Hết đà', 'At a standstill', 'Đà cũ dứt hẳn: việc theo lối cũ khó tiếp, phải chuyển cách.', 'The old momentum is spent: the previous approach stops working.'),
  9: p('Thu vào, cất giữ', 'Storing away', 'Khép một vòng và tích lại: hướng vào trong, giữ của, tổng kết.', 'Closing a cycle and putting things by: turning inward, keeping rather than spending.'),
  10: p('Cạn nguồn', 'Emptied out', 'Điểm thấp nhất của vòng, ngay trước lúc mọi thứ bắt đầu lại.', 'The low point of the cycle, immediately before it begins again.'),
  11: p('Đang thành hình bên trong', 'Conceived', 'Chưa thấy gì bên ngoài nhưng bên trong đã kết: giai đoạn ấp ủ.', 'Nothing visible yet, but something has already formed inside.'),
  12: p('Được nuôi, chờ ra', 'Being nurtured', 'Được bồi dưỡng để bước vào vòng mới: nên tích lũy hơn là ra mặt.', 'Being fed for the next cycle: a time to gather rather than to appear.'),
}

/** Ngũ Hành — the five elements as behaviours rather than as substances. */
export const ELEMENT_PLAIN: Record<Element, Plain> = {
  WOOD: p(
    'Vươn lên, mở rộng',
    'Growth',
    'Tính của cây: lớn lên, đâm ra, muốn tiến. Nhân hậu và có kế hoạch dài, nhưng bị chặn thì bực.',
    'The behaviour of a plant: growing, branching, pressing forward. Kind and long-sighted, and frustrated by obstruction.',
  ),
  FIRE: p(
    'Bùng sáng, lan tỏa',
    'Radiance',
    'Tính của lửa: sáng, nóng, làm người khác thấy mình. Nhiệt tình và cuốn hút, nhưng cạn nhanh nếu không có gì nuôi.',
    'The behaviour of fire: bright, hot, seen from a distance. Warm and magnetic, and quick to burn out unfed.',
  ),
  EARTH: p(
    'Chứa đựng, ổn định',
    'Stability',
    'Tính của đất: giữ, nuôi, đứng yên. Đáng tin và bền, nhưng đổi hướng chậm.',
    'The behaviour of soil: holding, feeding, staying put. Dependable and durable, slow to change direction.',
  ),
  METAL: p(
    'Sắc gọn, quyết đoán',
    'Precision',
    'Tính của kim khí: cắt, tỉa, phân định rõ. Có nguyên tắc và dứt khoát, nhưng dễ lạnh và cứng.',
    'The behaviour of metal: cutting, trimming, drawing clear lines. Principled and decisive, and easily cold.',
  ),
  WATER: p(
    'Trôi chảy, thấm sâu',
    'Flow',
    'Tính của nước: len lỏi, thích ứng, đi đường vòng mà tới. Thông minh linh hoạt, nhưng khó nắm bắt.',
    'The behaviour of water: seeping, adapting, arriving by an indirect route. Quick-witted and flexible, and hard to pin down.',
  ),
}

/** Quan hệ giữa các can chi — how two pillars act on each other. */
export const RELATION_PLAIN: Record<string, Plain> = {
  SIX_COMBINATION: p(
    'Hai bên hợp nhau',
    'They pair up',
    'Hai chi kết thành một cặp: việc dễ thành, người dễ gắn, nhưng cũng dễ bị ràng.',
    'Two branches lock into a pair: things come together easily, and so do commitments.',
  ),
  COMBINATION: p(
    'Hai bên kết dính',
    'They bond',
    'Hai can hút nhau và hòa vào nhau. Êm thuận, nhưng mỗi bên mất phần tính riêng.',
    'Two stems attract and merge. Harmonious, at the cost of each one’s distinct character.',
  ),
  CLASH: p(
    'Đối đầu, xáo trộn',
    'They clash',
    'Hai bên ở thế đối diện: hay kéo theo thay đổi, đi lại, dọn dẹp cái cũ. Không hẳn xấu, nhưng không êm.',
    'Two sides facing off: usually brings change, movement, a clearing out of the old. Not necessarily bad, never quiet.',
  ),
  DESTRUCTION: p(
    'Rạn nứt dần',
    'It wears down',
    'Không đổ vỡ ngay mà hỏng dần: chuyện nhỏ tích lại thành hỏng lớn.',
    'Nothing breaks at once; it erodes. Small damage accumulating into something that matters.',
  ),
  HARM: p(
    'Ngấm ngầm gây tổn',
    'It quietly hurts',
    'Tổn thương âm thầm, thường từ chỗ gần gũi nhất, nên phát hiện muộn.',
    'Damage that works quietly, usually from close quarters, and so is noticed late.',
  ),
  UNGRATEFUL_PUNISHMENT: p(
    'Ơn thành oán',
    'Kindness turned sour',
    'Chỗ đáng lẽ biết ơn lại thành trách móc: hay xảy ra giữa người thân.',
    'Where gratitude was owed, resentment grows instead — typically among family.',
  ),
  BULLYING_PUNISHMENT: p(
    'Lấn thế, ép nhau',
    'Throwing weight around',
    'Dựa vào chỗ mạnh của mình mà chèn bên kia; bên bị chèn tìm cách trả lại.',
    'Leaning on an advantage to push the other side, which looks for a way to push back.',
  ),
  UNCIVILIZED_PUNISHMENT: p(
    'Vượt lễ, thất kính',
    'Boundaries crossed',
    'Ranh giới bị bước qua: nói năng, đối xử không đúng vai, sinh khó xử.',
    'A line gets crossed — words or conduct that do not fit the relationship.',
  ),
  SELF_PUNISHMENT: p(
    'Tự làm khổ mình',
    'Self-inflicted',
    'Không phải ai làm mình: nghĩ quẩn, tự trách, tự đặt mình vào chỗ khó.',
    'Nobody else is doing it: rumination, self-blame, walking into the same corner again.',
  ),
  COUNTER: p(
    'Bên này chế bên kia',
    'One overrides the other',
    'Một bên kìm bên kia lại. Có lúc cần thiết — kìm đúng chỗ thì thành kỷ luật.',
    'One side holds the other in check. Sometimes exactly what is needed.',
  ),
}

/** Tàng Can — how much weight a stem hidden inside a branch carries. */
export const HIDDEN_ROLE_PLAIN = {
  MAIN: p(
    'Phần chính',
    'The main part',
    'Thành phần mạnh nhất nằm trong con giáp này — nói lên bản chất của nó.',
    'The strongest component inside this branch, and the one that defines it.',
  ),
  MIDDLE: p(
    'Phần phụ',
    'The secondary part',
    'Thành phần thứ hai, ảnh hưởng vừa phải, thường chỉ lộ ra khi có yếu tố khác gọi đến.',
    'The second component, moderate in weight, and often only visible when something else calls it out.',
  ),
  RESIDUAL: p(
    'Phần còn sót',
    'The leftover',
    'Dấu vết mờ của mùa trước còn đọng lại, ảnh hưởng nhẹ.',
    'A faint trace of the previous season, still present but weak.',
  ),
} as const

/**
 * Mùa sinh. The short wording keeps the season itself — it is a fact about the
 * chart, not jargon to be traded away — and only the explanation is added.
 */
const SEASON_NOTE_VI =
  'Mùa lúc sinh quyết định yếu tố nào đang thịnh, nên con giáp của tháng nặng hơn mọi cột khác.'
const SEASON_NOTE_EN =
  'The season of birth decides which element is in season, which is why the month branch outweighs every other column.'

export const SEASON_PLAIN: Record<Season, Plain> = {
  SPRING: p('Sinh mùa xuân', 'Born in spring', `Sinh vào mùa xuân — mùa của Mộc. ${SEASON_NOTE_VI}`, `Born in spring, the season of Wood. ${SEASON_NOTE_EN}`),
  SUMMER: p('Sinh mùa hạ', 'Born in summer', `Sinh vào mùa hạ — mùa của Hỏa. ${SEASON_NOTE_VI}`, `Born in summer, the season of Fire. ${SEASON_NOTE_EN}`),
  AUTUMN: p('Sinh mùa thu', 'Born in autumn', `Sinh vào mùa thu — mùa của Kim. ${SEASON_NOTE_VI}`, `Born in autumn, the season of Metal. ${SEASON_NOTE_EN}`),
  WINTER: p('Sinh mùa đông', 'Born in winter', `Sinh vào mùa đông — mùa của Thủy. ${SEASON_NOTE_VI}`, `Born in winter, the season of Water. ${SEASON_NOTE_EN}`),
}

/** Bốn trụ — which part of a life each column speaks about. */
export const PILLAR_PLAIN: Record<PillarSlot, Plain> = {
  year: p(
    'Gốc gác, ông bà',
    'Roots and family',
    'Nền nhà mình sinh ra: ông bà, hoàn cảnh gia đình, thời thơ ấu.',
    'The ground you were born onto: grandparents, family circumstances, early childhood.',
  ),
  month: p(
    'Cha mẹ, sự nghiệp',
    'Parents and career',
    'Môi trường lớn lên và đường nghề. Cột này nặng nhất vì con giáp của tháng nắm mùa sinh.',
    'The environment you grew up in and the working life. The heaviest column, because the month branch holds the season.',
  ),
  // Kept to one line: this column's header sits under the 日主 seal, and a
  // second line would run beneath it.
  day: p(
    'Chính mình',
    'Yourself',
    'Trên là bản thân, dưới là người bạn đời. Cả lá số đọc quanh cột này.',
    'The upper half is you, the lower half is your partner. The whole chart is read around this column.',
  ),
  hour: p(
    'Con cái, hậu vận',
    'Children and later life',
    'Phần riêng tư và về sau: con cháu, tuổi già, chỗ nghỉ.',
    'The private and the later part: children, old age, where you end up.',
  ),
}

/**
 * The framing vocabulary — the words a reader meets as headings and verdicts
 * rather than as cell contents.
 */
export const CONCEPT_PLAIN = {
  chart: p(
    'Bốn cột giờ sinh',
    'The four columns',
    'Năm, tháng, ngày và giờ sinh, mỗi mốc viết thành một cột gồm một chữ trên và một con giáp dưới.',
    'Year, month, day and hour of birth, each written as a column: one stem above, one animal branch below.',
  ),
  dayMaster: p(
    'Chính bạn',
    'You, in the chart',
    'Chữ trên của cột ngày là bản thân người xem. Mọi thứ còn lại chỉ có nghĩa khi đọc trong quan hệ với nó.',
    'The stem above the day column is the person themselves. Everything else only means something in relation to it.',
  ),
  strength: p(
    'Mệnh mạnh hay yếu',
    'Strong or weak',
    'So sức tiếp cho bản thân với sức tiêu hao đi, để biết nên bồi thêm hay nên tiết ra.',
    'Weighs what feeds the day master against what drains it, to say whether it needs topping up or letting out.',
  ),
  strong: p(
    'Mệnh mạnh',
    'Strong chart',
    'Bản thân được nhiều thứ tiếp sức. Người mệnh mạnh thường nên tiết ra: làm việc, cho đi, nhận trách nhiệm.',
    'The day master is well fed. A strong chart usually wants an outlet: work, giving, responsibility.',
  ),
  weak: p(
    'Mệnh yếu',
    'Weak chart',
    'Bản thân bị tiêu hao nhiều hơn được tiếp. Người mệnh yếu thường nên được bồi: nghỉ đủ, học thêm, dựa vào chỗ dựa tốt. Yếu không có nghĩa là kém.',
    'The day master is drained more than it is fed. A weak chart usually wants feeding: rest, learning, good support. Weak does not mean lesser.',
  ),
  favourable: p(
    'Nên tăng cường',
    'Worth leaning on',
    'Những yếu tố giúp cân lại lá số. Thường được dùng qua nghề, màu sắc, phương hướng, người mình gần.',
    'The elements that bring the chart back into balance — usually applied through work, colours, direction, the people you keep close.',
  ),
  unfavourable: p(
    'Nên tránh',
    'Better avoided',
    'Những yếu tố làm lá số lệch thêm. Không phải điều xấu tuyệt đối, chỉ là quá liều với người này.',
    'The elements that push the chart further off balance. Not bad in themselves — just too much for this person.',
  ),
  hiddenStems: p(
    'Ẩn trong con giáp',
    'Hidden inside',
    'Mỗi con giáp chứa một đến ba chữ bên trong. Đó là phần không thấy ngay nhưng vẫn tính, nên hai lá số trông giống nhau vẫn luận khác.',
    'Each animal branch contains one to three stems. They count even though they are not on the surface, which is why two similar-looking charts read differently.',
  ),
  tenGod: p(
    'Vai với bạn',
    'Role to you',
    'Mỗi chữ trong lá số đứng ở một vai so với bản thân: tiền, sức ép, chỗ dựa, tài năng, hay người ngang mình.',
    'Every stem in the chart stands in a role relative to you: money, pressure, support, talent, or peer.',
  ),
  phase: p(
    'Chặng đời',
    'Life stage',
    'Sức của bản thân ở mỗi cột được xếp vào một trong mười hai chặng, từ mới sinh đến cạn rồi lại bắt đầu.',
    'The day master’s condition in each column, placed on a twelve-stage arc from birth to exhaustion and round again.',
  ),
  distribution: p(
    'Tỉ lệ năm yếu tố',
    'Element balance',
    'Đếm xem lá số nhiều gì và thiếu gì. Thiếu hẳn hoặc thừa hẳn một yếu tố đều đáng chú ý.',
    'Counts what the chart has too much and too little of. Both an absence and a glut are worth noting.',
  ),
  luck: p(
    'Giai đoạn mười năm',
    'Ten-year periods',
    'Đời người được chia thành các chặng mười năm, mỗi chặng thêm một cột mới vào lá số gốc.',
    'Life is divided into ten-year stretches, each adding one new column to the birth chart.',
  ),
  annual: p(
    'Từng năm',
    'Year by year',
    'Cột của riêng mỗi năm, xếp trong giai đoạn mười năm đang xét. Năm mới tính từ tiết Lập Xuân đầu tháng 2, không phải mùng 1 tháng 1.',
    'One column per year inside the current ten-year stretch. The year turns at Li Chun in early February, not on 1 January.',
  ),
  relations: p(
    'Các cột tác động nhau',
    'How the columns interact',
    'Các cột không đứng riêng: chúng hợp lại, đối nhau hoặc làm tổn nhau, và đó thường là chỗ đáng đọc nhất.',
    'The columns do not stand alone: they pair, oppose or wear on each other, and that is usually the most telling part.',
  ),
  solarCorrection: p(
    'Chỉnh theo giờ mặt trời',
    'True solar time',
    'Giờ đồng hồ là giờ của cả múi giờ, không phải giờ mặt trời tại nơi sinh. Lệch này có thể đổi cột giờ, nên được tính lại theo kinh độ.',
    'Clock time belongs to a whole time zone, not to the birthplace. The gap can move the hour column, so it is recomputed from the longitude.',
  ),
} as const

export type ConceptKey = keyof typeof CONCEPT_PLAIN

/** Picks the wording for a locale, mirroring `pick` for `Term`. */
export const plainShort = (plain: Plain, locale: 'vi' | 'en') => (locale === 'vi' ? plain.short.vi : plain.short.en)
export const plainLong = (plain: Plain, locale: 'vi' | 'en') => (locale === 'vi' ? plain.long.vi : plain.long.en)
