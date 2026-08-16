/**
 * Birth-place presets.
 *
 * Only two numbers reach the engine: the longitude, which sets local solar
 * time, and the standard UTC offset of the civil clock the birth was recorded
 * against. Latitude is carried for the map only — it has no effect on a chart.
 *
 * Precision beyond about a tenth of a degree is wasted here. The hour pillar
 * turns every two hours, all of Vietnam spans roughly 25 minutes of solar time,
 * and 0.1° is 24 seconds. A provincial centre is more than close enough; being
 * off by a district changes nothing.
 *
 * Historical time zones are not modelled. A birth recorded under a wartime or
 * pre-reform offset needs its offset entered by hand.
 */
export interface Place {
  id: string
  vi: string
  en: string
  longitude: number
  latitude: number
  utcOffset: number
  region: Region
}

export type Region = 'bac' | 'trung' | 'taynguyen' | 'nam' | 'quocte'

export const REGION_LABEL: Record<Region, { vi: string; en: string }> = {
  bac: { vi: 'Miền Bắc', en: 'Northern Vietnam' },
  trung: { vi: 'Miền Trung', en: 'Central Vietnam' },
  taynguyen: { vi: 'Tây Nguyên', en: 'Central Highlands' },
  nam: { vi: 'Miền Nam', en: 'Southern Vietnam' },
  quocte: { vi: 'Quốc tế', en: 'International' },
}

/*
  The 63 provinces as they stood before the 2025 consolidation, because a birth
  certificate names the province that existed at the time — which for most
  people alive today is one of these. Coordinates are the provincial seat.
*/
const VN: [string, string, number, number, Region][] = [
  // ─── Miền Bắc ───────────────────────────────────────────────
  ['ha-noi', 'Hà Nội', 105.85, 21.03, 'bac'],
  ['hai-phong', 'Hải Phòng', 106.68, 20.86, 'bac'],
  ['quang-ninh', 'Quảng Ninh (Hạ Long)', 107.08, 20.95, 'bac'],
  ['bac-giang', 'Bắc Giang', 106.19, 21.27, 'bac'],
  ['bac-kan', 'Bắc Kạn', 105.83, 22.15, 'bac'],
  ['bac-ninh', 'Bắc Ninh', 106.08, 21.19, 'bac'],
  ['cao-bang', 'Cao Bằng', 106.26, 22.67, 'bac'],
  ['dien-bien', 'Điện Biên (Điện Biên Phủ)', 103.02, 21.39, 'bac'],
  ['ha-giang', 'Hà Giang', 104.98, 22.83, 'bac'],
  ['ha-nam', 'Hà Nam (Phủ Lý)', 105.91, 20.54, 'bac'],
  ['hai-duong', 'Hải Dương', 106.33, 20.94, 'bac'],
  ['hoa-binh', 'Hoà Bình', 105.34, 20.81, 'bac'],
  ['hung-yen', 'Hưng Yên', 106.05, 20.65, 'bac'],
  ['lai-chau', 'Lai Châu', 103.47, 22.4, 'bac'],
  ['lang-son', 'Lạng Sơn', 106.76, 21.85, 'bac'],
  ['lao-cai', 'Lào Cai', 103.97, 22.49, 'bac'],
  ['nam-dinh', 'Nam Định', 106.18, 20.42, 'bac'],
  ['ninh-binh', 'Ninh Bình', 105.97, 20.25, 'bac'],
  ['phu-tho', 'Phú Thọ (Việt Trì)', 105.4, 21.32, 'bac'],
  ['son-la', 'Sơn La', 103.92, 21.33, 'bac'],
  ['thai-binh', 'Thái Bình', 106.34, 20.45, 'bac'],
  ['thai-nguyen', 'Thái Nguyên', 105.84, 21.59, 'bac'],
  ['tuyen-quang', 'Tuyên Quang', 105.21, 21.82, 'bac'],
  ['vinh-phuc', 'Vĩnh Phúc (Vĩnh Yên)', 105.6, 21.31, 'bac'],
  ['yen-bai', 'Yên Bái', 104.87, 21.72, 'bac'],

  // ─── Miền Trung ─────────────────────────────────────────────
  ['thanh-hoa', 'Thanh Hoá', 105.78, 19.81, 'trung'],
  ['nghe-an', 'Nghệ An (Vinh)', 105.67, 18.68, 'trung'],
  ['ha-tinh', 'Hà Tĩnh', 105.9, 18.34, 'trung'],
  ['quang-binh', 'Quảng Bình (Đồng Hới)', 106.6, 17.48, 'trung'],
  ['quang-tri', 'Quảng Trị (Đông Hà)', 107.1, 16.82, 'trung'],
  ['hue', 'Thừa Thiên Huế', 107.58, 16.46, 'trung'],
  ['da-nang', 'Đà Nẵng', 108.22, 16.05, 'trung'],
  ['quang-nam', 'Quảng Nam (Tam Kỳ)', 108.48, 15.57, 'trung'],
  ['quang-ngai', 'Quảng Ngãi', 108.8, 15.12, 'trung'],
  ['binh-dinh', 'Bình Định (Quy Nhơn)', 109.22, 13.78, 'trung'],
  ['phu-yen', 'Phú Yên (Tuy Hoà)', 109.29, 13.1, 'trung'],
  ['khanh-hoa', 'Khánh Hoà (Nha Trang)', 109.19, 12.24, 'trung'],
  ['ninh-thuan', 'Ninh Thuận (Phan Rang)', 108.99, 11.56, 'trung'],
  ['binh-thuan', 'Bình Thuận (Phan Thiết)', 108.1, 10.93, 'trung'],

  // ─── Tây Nguyên ─────────────────────────────────────────────
  ['kon-tum', 'Kon Tum', 108.0, 14.35, 'taynguyen'],
  ['gia-lai', 'Gia Lai (Pleiku)', 108.0, 13.98, 'taynguyen'],
  ['dak-lak', 'Đắk Lắk (Buôn Ma Thuột)', 108.05, 12.67, 'taynguyen'],
  ['dak-nong', 'Đắk Nông (Gia Nghĩa)', 107.77, 11.99, 'taynguyen'],
  ['lam-dong', 'Lâm Đồng (Đà Lạt)', 108.44, 11.94, 'taynguyen'],

  // ─── Miền Nam ───────────────────────────────────────────────
  ['ho-chi-minh', 'TP. Hồ Chí Minh', 106.7, 10.78, 'nam'],
  ['ba-ria-vung-tau', 'Bà Rịa – Vũng Tàu', 107.08, 10.35, 'nam'],
  ['binh-duong', 'Bình Dương (Thủ Dầu Một)', 106.68, 10.98, 'nam'],
  ['binh-phuoc', 'Bình Phước (Đồng Xoài)', 106.9, 11.53, 'nam'],
  ['dong-nai', 'Đồng Nai (Biên Hoà)', 106.82, 10.95, 'nam'],
  ['tay-ninh', 'Tây Ninh', 106.1, 11.31, 'nam'],
  ['an-giang', 'An Giang (Long Xuyên)', 105.44, 10.39, 'nam'],
  ['bac-lieu', 'Bạc Liêu', 105.72, 9.29, 'nam'],
  ['ben-tre', 'Bến Tre', 106.38, 10.24, 'nam'],
  ['ca-mau', 'Cà Mau', 105.15, 9.18, 'nam'],
  ['can-tho', 'Cần Thơ', 105.78, 10.04, 'nam'],
  ['dong-thap', 'Đồng Tháp (Cao Lãnh)', 105.63, 10.46, 'nam'],
  ['hau-giang', 'Hậu Giang (Vị Thanh)', 105.47, 9.78, 'nam'],
  ['kien-giang', 'Kiên Giang (Rạch Giá)', 105.08, 10.01, 'nam'],
  ['long-an', 'Long An (Tân An)', 106.41, 10.53, 'nam'],
  ['soc-trang', 'Sóc Trăng', 105.97, 9.6, 'nam'],
  ['tien-giang', 'Tiền Giang (Mỹ Tho)', 106.36, 10.36, 'nam'],
  ['tra-vinh', 'Trà Vinh', 106.34, 9.93, 'nam'],
  ['vinh-long', 'Vĩnh Long', 105.97, 10.25, 'nam'],
]

const INTL: [string, string, string, number, number, number][] = [
  ['beijing', 'Bắc Kinh', 'Beijing', 116.41, 39.9, 8],
  ['shanghai', 'Thượng Hải', 'Shanghai', 121.47, 31.23, 8],
  ['hongkong', 'Hồng Kông', 'Hong Kong', 114.17, 22.32, 8],
  ['taipei', 'Đài Bắc', 'Taipei', 121.56, 25.03, 8],
  ['singapore', 'Singapore', 'Singapore', 103.82, 1.35, 8],
  ['kuala-lumpur', 'Kuala Lumpur', 'Kuala Lumpur', 101.69, 3.14, 8],
  ['seoul', 'Seoul', 'Seoul', 126.98, 37.57, 9],
  ['tokyo', 'Tokyo', 'Tokyo', 139.69, 35.69, 9],
  ['bangkok', 'Bangkok', 'Bangkok', 100.5, 13.76, 7],
  ['phnom-penh', 'Phnôm Pênh', 'Phnom Penh', 104.92, 11.56, 7],
  ['vientiane', 'Viêng Chăn', 'Vientiane', 102.6, 17.97, 7],
  ['jakarta', 'Jakarta', 'Jakarta', 106.85, -6.21, 7],
  ['manila', 'Manila', 'Manila', 120.98, 14.6, 8],
  ['sydney', 'Sydney', 'Sydney', 151.21, -33.87, 10],
  ['melbourne', 'Melbourne', 'Melbourne', 144.96, -37.81, 10],
  ['delhi', 'New Delhi', 'New Delhi', 77.21, 28.61, 5.5],
  ['dubai', 'Dubai', 'Dubai', 55.27, 25.2, 4],
  ['moscow', 'Moskva', 'Moscow', 37.62, 55.76, 3],
  ['berlin', 'Berlin', 'Berlin', 13.4, 52.52, 1],
  ['praha', 'Praha', 'Prague', 14.44, 50.08, 1],
  ['warszawa', 'Warszawa', 'Warsaw', 21.01, 52.23, 1],
  ['paris', 'Paris', 'Paris', 2.35, 48.86, 1],
  ['madrid', 'Madrid', 'Madrid', -3.7, 40.42, 1],
  ['london', 'London', 'London', -0.13, 51.51, 0],
  ['newyork', 'New York', 'New York', -74.01, 40.71, -5],
  ['toronto', 'Toronto', 'Toronto', -79.38, 43.65, -5],
  ['chicago', 'Chicago', 'Chicago', -87.63, 41.88, -6],
  ['houston', 'Houston', 'Houston', -95.37, 29.76, -6],
  ['losangeles', 'Los Angeles', 'Los Angeles', -118.24, 34.05, -8],
  ['san-jose', 'San Jose', 'San Jose', -121.89, 37.34, -8],
  ['vancouver', 'Vancouver', 'Vancouver', -123.12, 49.28, -8],
  ['saopaulo', 'São Paulo', 'São Paulo', -46.63, -23.55, -3],
]

export const PLACES: Place[] = [
  ...VN.map(([id, vi, longitude, latitude, region]) => ({
    id,
    vi,
    en: vi,
    longitude,
    latitude,
    utcOffset: 7,
    region,
  })),
  ...INTL.map(([id, vi, en, longitude, latitude, utcOffset]) => ({
    id,
    vi,
    en,
    longitude,
    latitude,
    utcOffset,
    region: 'quocte' as Region,
  })),
]

export const REGION_ORDER: Region[] = ['bac', 'trung', 'taynguyen', 'nam', 'quocte']

export const findPlace = (id: string) => PLACES.find((p) => p.id === id)

/** Places grouped for a select with optgroups. */
export function placesByRegion(): { region: Region; places: Place[] }[] {
  return REGION_ORDER.map((region) => ({
    region,
    places: PLACES.filter((p) => p.region === region),
  }))
}

/**
 * Nearest listed place to a point, used to guess a time zone after a map click.
 *
 * Longitude alone would be wrong — Hanoi and Jakarta sit within a degree of each
 * other but seven hours apart is not the issue; their offsets differ by none,
 * while London and Lagos share a meridian and differ by an hour. Distance over
 * both axes picks the sensible neighbour, and the user can still override.
 */
export function nearestPlace(longitude: number, latitude: number): Place {
  let best = PLACES[0]
  let bestDistance = Infinity
  for (const p of PLACES) {
    const dx = p.longitude - longitude
    const dy = p.latitude - latitude
    const d = dx * dx + dy * dy
    if (d < bestDistance) {
      bestDistance = d
      best = p
    }
  }
  return best
}

/**
 * Folds Vietnamese text for searching: strips tone marks and vowel diacritics,
 * and maps đ to d.
 *
 * NFD decomposition handles ă â ê ô ơ ư and every tone, but đ has no
 * decomposition — it is its own letter, not d plus a mark — so it needs its own
 * line. Without it, someone typing "da nang" finds Đà Nẵng but someone typing
 * "dong nai" never finds Đồng Nai, which is the more common way people search.
 */
export const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()

/** Places matching a query, accent-insensitive, listed places first by prefix. */
export function searchPlaces(query: string): Place[] {
  const q = fold(query)
  if (!q) return PLACES

  const scored: { p: Place; rank: number }[] = []
  for (const p of PLACES) {
    const vi = fold(p.vi)
    const en = fold(p.en)
    // A name that starts with what was typed outranks one that merely contains
    // it, so "ha" puts Hà Nội above Thanh Hoá.
    if (vi.startsWith(q) || en.startsWith(q)) scored.push({ p, rank: 0 })
    else if (vi.includes(q) || en.includes(q)) scored.push({ p, rank: 1 })
  }
  return scored.sort((a, b) => a.rank - b.rank).map((s) => s.p)
}
