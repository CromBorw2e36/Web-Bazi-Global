import { FIRST_YEAR, LAST_YEAR } from '@/lib/bazi'

/**
 * Data extracted from a Vietnamese Citizen ID (CCCD) QR code.
 *
 * The QR encodes a pipe-separated UTF-8 string:
 *   [ID 12 digits]|[Old ID or empty]|[Full name]|[DDMMYYYY]|[Gender]|[Address]|[Issue date]
 *
 * We only keep the fields relevant to a Bazi chart; the raw string is never
 * stored or sent to the server.
 */
export interface CccdData {
  /** 12-digit citizen ID number. */
  idNumber: string
  /** Full name, trimmed and capped at 80 characters. */
  name: string
  birthYear: number
  birthMonth: number
  birthDay: number
  gender: 'MALE' | 'FEMALE'
}

// ── helpers ──────────────────────────────────────────────────────────────────

const DAYS_IN_MONTH = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function isLeapYear(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

function isValidDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1) return false
  const maxDay = m === 2 && !isLeapYear(y) ? 28 : DAYS_IN_MONTH[m]
  return d <= maxDay
}

/** Strip anything that looks like an HTML tag — a safety net, not the main XSS
 *  barrier (React state is already safe). */
function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '')
}

// ── main parser ──────────────────────────────────────────────────────────────

/**
 * Parse and validate the raw text decoded from a CCCD QR code.
 *
 * Returns a `CccdData` on success, or `{ error: string }` with a
 * human-readable Vietnamese error message on failure.
 *
 * The function is deliberately strict: any field that does not match the
 * expected format causes the entire parse to fail, so partial / garbage data
 * never leaks into the form.
 */
export function parseCccdQr(raw: string): CccdData | { error: string } {
  if (!raw || typeof raw !== 'string') {
    return { error: 'Dữ liệu QR rỗng hoặc không hợp lệ.' }
  }

  const parts = raw.split('|')

  // The CCCD QR has at least 7 fields; we need indices 0–4 at minimum.
  if (parts.length < 5) {
    return { error: 'Mã QR không đúng định dạng căn cước công dân.' }
  }

  // ── ID number (index 0) ────────────────────────────────────────────────
  const idNumber = parts[0].trim()
  if (!/^\d{12}$/.test(idNumber)) {
    return { error: 'Số căn cước không hợp lệ (cần đúng 12 chữ số).' }
  }

  // ── Name (index 2) ────────────────────────────────────────────────────
  const rawName = (parts[2] ?? '').trim()
  if (rawName.length === 0) {
    return { error: 'Không đọc được họ tên từ mã QR.' }
  }
  const name = stripTags(rawName).slice(0, 80)

  // ── Date of birth (index 3) — format DDMMYYYY ─────────────────────────
  const rawDob = (parts[3] ?? '').trim()
  if (!/^\d{8}$/.test(rawDob)) {
    return { error: 'Ngày sinh trên mã QR không đúng định dạng (cần DDMMYYYY).' }
  }

  const day = parseInt(rawDob.slice(0, 2), 10)
  const month = parseInt(rawDob.slice(2, 4), 10)
  const year = parseInt(rawDob.slice(4, 8), 10)

  if (!isValidDate(year, month, day)) {
    return { error: `Ngày sinh ${rawDob} không hợp lệ.` }
  }

  if (year < FIRST_YEAR + 1 || year > LAST_YEAR - 1) {
    return {
      error: `Năm sinh ${year} nằm ngoài phạm vi hỗ trợ (${FIRST_YEAR + 1}–${LAST_YEAR - 1}).`,
    }
  }

  // ── Gender (index 4) ──────────────────────────────────────────────────
  const rawGender = (parts[4] ?? '').trim().toLowerCase()
  let gender: 'MALE' | 'FEMALE'
  if (rawGender === 'nam' || rawGender === 'male') {
    gender = 'MALE'
  } else if (rawGender === 'nữ' || rawGender === 'nu' || rawGender === 'female') {
    gender = 'FEMALE'
  } else {
    return { error: 'Không nhận diện được giới tính trên mã QR.' }
  }

  return { idNumber, name, birthYear: year, birthMonth: month, birthDay: day, gender }
}
