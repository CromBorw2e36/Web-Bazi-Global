/**
 * Birth-place presets.
 *
 * Only two numbers matter for a chart: the longitude, which sets local solar
 * time, and the standard UTC offset of the civil clock the birth was recorded
 * against. Historical offsets are not modelled — a birth recorded under a
 * wartime or pre-reform zone needs its offset entered by hand.
 */
export interface Place {
  id: string
  vi: string
  en: string
  longitude: number
  utcOffset: number
}

export const PLACES: Place[] = [
  { id: 'hanoi', vi: 'Hà Nội', en: 'Hanoi', longitude: 105.85, utcOffset: 7 },
  { id: 'hcmc', vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', longitude: 106.63, utcOffset: 7 },
  { id: 'danang', vi: 'Đà Nẵng', en: 'Da Nang', longitude: 108.22, utcOffset: 7 },
  { id: 'haiphong', vi: 'Hải Phòng', en: 'Hai Phong', longitude: 106.68, utcOffset: 7 },
  { id: 'cantho', vi: 'Cần Thơ', en: 'Can Tho', longitude: 105.78, utcOffset: 7 },
  { id: 'beijing', vi: 'Bắc Kinh', en: 'Beijing', longitude: 116.41, utcOffset: 8 },
  { id: 'shanghai', vi: 'Thượng Hải', en: 'Shanghai', longitude: 121.47, utcOffset: 8 },
  { id: 'hongkong', vi: 'Hồng Kông', en: 'Hong Kong', longitude: 114.17, utcOffset: 8 },
  { id: 'taipei', vi: 'Đài Bắc', en: 'Taipei', longitude: 121.56, utcOffset: 8 },
  { id: 'singapore', vi: 'Singapore', en: 'Singapore', longitude: 103.82, utcOffset: 8 },
  { id: 'seoul', vi: 'Seoul', en: 'Seoul', longitude: 126.98, utcOffset: 9 },
  { id: 'tokyo', vi: 'Tokyo', en: 'Tokyo', longitude: 139.69, utcOffset: 9 },
  { id: 'bangkok', vi: 'Bangkok', en: 'Bangkok', longitude: 100.5, utcOffset: 7 },
  { id: 'jakarta', vi: 'Jakarta', en: 'Jakarta', longitude: 106.85, utcOffset: 7 },
  { id: 'sydney', vi: 'Sydney', en: 'Sydney', longitude: 151.21, utcOffset: 10 },
  { id: 'delhi', vi: 'New Delhi', en: 'New Delhi', longitude: 77.21, utcOffset: 5.5 },
  { id: 'dubai', vi: 'Dubai', en: 'Dubai', longitude: 55.27, utcOffset: 4 },
  { id: 'moscow', vi: 'Moskva', en: 'Moscow', longitude: 37.62, utcOffset: 3 },
  { id: 'berlin', vi: 'Berlin', en: 'Berlin', longitude: 13.4, utcOffset: 1 },
  { id: 'paris', vi: 'Paris', en: 'Paris', longitude: 2.35, utcOffset: 1 },
  { id: 'madrid', vi: 'Madrid', en: 'Madrid', longitude: -3.7, utcOffset: 1 },
  { id: 'london', vi: 'London', en: 'London', longitude: -0.13, utcOffset: 0 },
  { id: 'newyork', vi: 'New York', en: 'New York', longitude: -74.01, utcOffset: -5 },
  { id: 'toronto', vi: 'Toronto', en: 'Toronto', longitude: -79.38, utcOffset: -5 },
  { id: 'chicago', vi: 'Chicago', en: 'Chicago', longitude: -87.63, utcOffset: -6 },
  { id: 'losangeles', vi: 'Los Angeles', en: 'Los Angeles', longitude: -118.24, utcOffset: -8 },
  { id: 'vancouver', vi: 'Vancouver', en: 'Vancouver', longitude: -123.12, utcOffset: -8 },
  { id: 'saopaulo', vi: 'São Paulo', en: 'São Paulo', longitude: -46.63, utcOffset: -3 },
]

export const findPlace = (id: string) => PLACES.find((p) => p.id === id)
