import type { Element, Polarity, Season } from './types'

export type Locale = 'vi' | 'en'

export interface Term {
  vi: string
  en: string
  /** Traditional Chinese, shown as a secondary mark. */
  zh: string
}

const t = (vi: string, en: string, zh: string): Term => ({ vi, en, zh })

/** Thiên Can — indexed 1-10. */
export const STEM_TERMS: Record<number, Term> = {
  1: t('Giáp', 'Jia', '甲'),
  2: t('Ất', 'Yi', '乙'),
  3: t('Bính', 'Bing', '丙'),
  4: t('Đinh', 'Ding', '丁'),
  5: t('Mậu', 'Wu', '戊'),
  6: t('Kỷ', 'Ji', '己'),
  7: t('Canh', 'Geng', '庚'),
  8: t('Tân', 'Xin', '辛'),
  9: t('Nhâm', 'Ren', '壬'),
  10: t('Quý', 'Gui', '癸'),
}

/** Địa Chi — indexed 1-12. */
export const BRANCH_TERMS: Record<number, Term> = {
  1: t('Tý', 'Zi', '子'),
  2: t('Sửu', 'Chou', '丑'),
  3: t('Dần', 'Yin', '寅'),
  4: t('Mão', 'Mao', '卯'),
  5: t('Thìn', 'Chen', '辰'),
  6: t('Tỵ', 'Si', '巳'),
  7: t('Ngọ', 'Wu', '午'),
  8: t('Mùi', 'Wei', '未'),
  9: t('Thân', 'Shen', '申'),
  10: t('Dậu', 'You', '酉'),
  11: t('Tuất', 'Xu', '戌'),
  12: t('Hợi', 'Hai', '亥'),
}

/**
 * Zodiac animals. Two of these genuinely differ between the Vietnamese and
 * Chinese cycles rather than being translation choices: the fourth sign is a cat
 * in Vietnam and a rabbit in China, and the second is a water buffalo rather
 * than an ox. The English column follows the Chinese convention, which is what
 * an international reader expects.
 */
export const ANIMAL_TERMS: Record<number, Term> = {
  1: t('Chuột', 'Rat', '鼠'),
  2: t('Trâu', 'Ox', '牛'),
  3: t('Hổ', 'Tiger', '虎'),
  4: t('Mèo', 'Rabbit', '兔'),
  5: t('Rồng', 'Dragon', '龍'),
  6: t('Rắn', 'Snake', '蛇'),
  7: t('Ngựa', 'Horse', '馬'),
  8: t('Dê', 'Goat', '羊'),
  9: t('Khỉ', 'Monkey', '猴'),
  10: t('Gà', 'Rooster', '雞'),
  11: t('Chó', 'Dog', '狗'),
  12: t('Lợn', 'Pig', '豬'),
}

/** Ngũ Hành. */
export const ELEMENT_TERMS: Record<Element, Term> = {
  WOOD: t('Mộc', 'Wood', '木'),
  FIRE: t('Hỏa', 'Fire', '火'),
  EARTH: t('Thổ', 'Earth', '土'),
  METAL: t('Kim', 'Metal', '金'),
  WATER: t('Thủy', 'Water', '水'),
}

export const POLARITY_TERMS: Record<Polarity, Term> = {
  YANG: t('Dương', 'Yang', '陽'),
  YIN: t('Âm', 'Yin', '陰'),
}

export const SEASON_TERMS: Record<Season, Term> = {
  SPRING: t('Xuân', 'Spring', '春'),
  SUMMER: t('Hạ', 'Summer', '夏'),
  AUTUMN: t('Thu', 'Autumn', '秋'),
  WINTER: t('Đông', 'Winter', '冬'),
}

/** Thập Thần — keyed by the TG table's ids. */
export const TEN_GOD_TERMS: Record<number, Term> = {
  1: t('Chính Tài', 'Direct Wealth', '正財'),
  2: t('Thiên Tài', 'Indirect Wealth', '偏財'),
  3: t('Chính Quan', 'Direct Officer', '正官'),
  4: t('Thất Sát', 'Seven Killings', '七殺'),
  5: t('Chính Ấn', 'Direct Resource', '正印'),
  6: t('Thiên Ấn', 'Indirect Resource', '偏印'),
  7: t('Thực Thần', 'Eating God', '食神'),
  8: t('Thương Quan', 'Hurting Officer', '傷官'),
  9: t('Tỷ Kiên', 'Friend', '比肩'),
  10: t('Kiếp Tài', 'Rob Wealth', '劫財'),
}

export const TEN_GOD_SHORT: Record<number, { vi: string; en: string }> = {
  1: { vi: 'C.Tài', en: 'DW' },
  2: { vi: 'T.Tài', en: 'IW' },
  3: { vi: 'C.Quan', en: 'DO' },
  4: { vi: 'T.Sát', en: '7K' },
  5: { vi: 'C.Ấn', en: 'DR' },
  6: { vi: 'T.Ấn', en: 'IR' },
  7: { vi: 'T.Thần', en: 'EG' },
  8: { vi: 'Th.Quan', en: 'HO' },
  9: { vi: 'Tỷ Kiên', en: 'F' },
  10: { vi: 'Kiếp Tài', en: 'RW' },
}

/** Vòng Trường Sinh — the twelve phases, in the order the DB numbers them. */
export const PHASE_TERMS: Record<number, Term> = {
  1: t('Trường Sinh', 'Growth', '長生'),
  2: t('Mộc Dục', 'Bathing', '沐浴'),
  3: t('Quan Đới', 'Youth', '冠帶'),
  4: t('Lâm Quan', 'Maturity', '臨官'),
  5: t('Đế Vượng', 'Prime', '帝旺'),
  6: t('Suy', 'Decline', '衰'),
  7: t('Bệnh', 'Illness', '病'),
  8: t('Tử', 'Death', '死'),
  9: t('Mộ', 'Grave', '墓'),
  10: t('Tuyệt', 'Extinction', '絕'),
  11: t('Thai', 'Conception', '胎'),
  12: t('Dưỡng', 'Nurture', '養'),
}

/** Relationship names as they appear in the EBR and HSR tables. */
export const RELATION_TERMS: Record<string, Term> = {
  SIX_COMBINATION: t('Lục Hợp', 'Six Harmony', '六合'),
  TRINE: t('Tam Hợp', 'Three Harmony', '三合'),
  HALF_TRINE: t('Bán Hợp', 'Half Harmony', '半合'),
  CLASH: t('Xung', 'Clash', '沖'),
  DESTRUCTION: t('Phá', 'Destruction', '破'),
  HARM: t('Hại', 'Harm', '害'),
  UNGRATEFUL_PUNISHMENT: t('Hình Vô Ân', 'Ungrateful Punishment', '無恩之刑'),
  BULLYING_PUNISHMENT: t('Hình Trì Thế', 'Bullying Punishment', '恃勢之刑'),
  UNCIVILIZED_PUNISHMENT: t('Hình Vô Lễ', 'Uncivil Punishment', '無禮之刑'),
  SELF_PUNISHMENT: t('Tự Hình', 'Self Punishment', '自刑'),
  COMBINATION: t('Hợp', 'Combination', '合'),
  COUNTER: t('Khắc', 'Counter', '剋'),
}

export const STRUCTURE_TERMS: Record<string, Term> = {
  COMPANION: t('Tỷ Kiếp', 'Companion', '比劫'),
  WEALTH: t('Tài', 'Wealth', '財'),
  RESOURCE: t('Ấn', 'Resource', '印'),
  OUTPUT: t('Thực Thương', 'Output', '食傷'),
  INFLUENCE: t('Quan Sát', 'Influence', '官殺'),
}

export const PILLAR_TERMS = {
  year: t('Trụ Năm', 'Year', '年柱'),
  month: t('Trụ Tháng', 'Month', '月柱'),
  day: t('Trụ Ngày', 'Day', '日柱'),
  hour: t('Trụ Giờ', 'Hour', '時柱'),
} as const

export const HIDDEN_ROLE_TERMS = {
  MAIN: t('Bản Khí', 'Main', '本氣'),
  MIDDLE: t('Trung Khí', 'Middle', '中氣'),
  RESIDUAL: t('Dư Khí', 'Residual', '餘氣'),
} as const

export const pick = (term: Term, locale: Locale) => (locale === 'vi' ? term.vi : term.en)

/** UI copy. Keys are grouped by where they appear. */
export const UI = {
  title: t('Bát Tự', 'Bazi', '八字'),
  subtitle: t('Tứ Trụ Mệnh Lý', 'Four Pillars of Destiny', '四柱命理'),
  formTitle: t('Lập lá số', 'Cast a chart', ''),
  birthDate: t('Ngày sinh', 'Birth date', ''),
  birthTime: t('Giờ sinh', 'Birth time', ''),
  gender: t('Giới tính', 'Gender', ''),
  male: t('Nam', 'Male', '乾'),
  female: t('Nữ', 'Female', '坤'),
  place: t('Nơi sinh', 'Birth place', ''),
  longitude: t('Kinh độ', 'Longitude', ''),
  timezone: t('Múi giờ', 'Time zone', ''),
  submit: t('Lập lá số', 'Cast chart', ''),
  useEot: t('Hiệu chỉnh phương trình thời gian', 'Apply equation of time', ''),
  chart: t('Tứ Trụ', 'Four Pillars', '四柱'),
  hiddenStems: t('Tàng Can', 'Hidden Stems', '藏干'),
  tenGod: t('Thập Thần', 'Ten Gods', '十神'),
  phase: t('Trường Sinh', 'Life Phase', '十二長生'),
  strength: t('Vượng Suy', 'Strength', '旺衰'),
  strong: t('Thân Vượng', 'Strong', '身旺'),
  weak: t('Thân Nhược', 'Weak', '身弱'),
  favourable: t('Dụng Thần', 'Favourable', '用神'),
  unfavourable: t('Kỵ Thần', 'Unfavourable', '忌神'),
  dayMaster: t('Nhật Chủ', 'Day Master', '日主'),
  relations: t('Quan Hệ Can Chi', 'Relationships', '刑沖合害'),
  luck: t('Đại Vận', 'Luck Pillars', '大運'),
  annual: t('Lưu Niên', 'Annual Pillars', '流年'),
  age: t('Tuổi', 'Age', ''),
  year: t('Năm', 'Year', ''),
  distribution: t('Phân bố Ngũ Hành', 'Element Distribution', '五行'),
  solarCorrection: t('Hiệu chỉnh giờ mặt trời', 'Solar time correction', ''),
  noRelations: t('Không có quan hệ đặc biệt', 'No notable relationships', ''),
  boundaryWarning: t(
    'Giờ sinh nằm sát mốc giao tiết khí. Sai số tính toán khoảng ±15 phút nên trụ tháng có thể lệch — nên kiểm chứng lại giờ sinh.',
    'This birth time sits within an hour of a solar term. The model is accurate to about ±15 minutes, so the month pillar may shift — worth double-checking the recorded time.',
    '',
  ),
  dayShifted: t(
    'Hiệu chỉnh giờ mặt trời đã đẩy ngày sang ngày khác, nên trụ ngày và trụ giờ thay đổi theo.',
    'The solar correction moved this birth across midnight, so the day and hour pillars shift with it.',
    '',
  ),
} as const
