import { z } from 'zod'
import { FIRST_YEAR, LAST_YEAR } from '@/lib/bazi'

export const credentialsSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Cần nhập tên').max(80),
    email: z.string().trim().toLowerCase().email('Email không hợp lệ').max(200),
    password: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự').max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirm'],
  })

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Cần nhập tên').max(80),
  relation: z.enum(['SELF', 'FAMILY', 'FRIEND', 'OTHER']),
  birthYear: z.coerce.number().int().min(FIRST_YEAR + 1).max(LAST_YEAR - 1),
  birthMonth: z.coerce.number().int().min(1).max(12),
  birthDay: z.coerce.number().int().min(1).max(31),
  birthHour: z.coerce.number().int().min(0).max(23),
  birthMinute: z.coerce.number().int().min(0).max(59),
  gender: z.enum(['MALE', 'FEMALE']),
  longitude: z.coerce.number().min(-180).max(180),
  latitude: z.coerce.number().min(-90).max(90),
  utcOffset: z.coerce.number().min(-12).max(14),
  placeId: z.string().max(60).optional().nullable(),
  placeName: z.string().trim().min(1).max(120),
  useEquationOfTime: z.coerce.boolean().default(true),
})

export const journalSchema = z.object({
  profileId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ'),
  mood: z.coerce.number().int().min(-2).max(2).optional().nullable(),
  note: z.string().trim().max(4000),
})

export const bookmarkSchema = z.object({
  profileId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(['GOOD', 'BAD', 'NOTE']),
  label: z.string().trim().max(120).optional().nullable(),
})

export const settingsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  locale: z.enum(['vi', 'en']),
  timeZone: z.string().min(1).max(60),
  dailyEmail: z.coerce.boolean().default(false),
  dailyEmailHour: z.coerce.number().int().min(0).max(23),
})

/** A date-only string parsed as UTC midnight, which is how Postgres @db.Date round-trips. */
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export const formatDateOnly = (d: Date) => d.toISOString().slice(0, 10)
