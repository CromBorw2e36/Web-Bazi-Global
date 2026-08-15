'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { buildDailySnapshot, todayIn, type DailySnapshot, type Locale } from '@/lib/bazi'
import { chartFor } from '@/lib/profile'
import { generateReading } from '@/lib/reading/generate'
import { renderTemplate } from '@/lib/reading/template'
import { isReadingBody, type ReadingBody } from '@/lib/reading/schema'
import { bookmarkSchema, journalSchema, parseDateOnly } from '@/lib/validation'

export interface DayView {
  date: string
  snapshot: DailySnapshot
  body: ReadingBody
  source: 'model' | 'template'
  journal: { mood: number | null; note: string } | null
  bookmark: { kind: 'GOOD' | 'BAD' | 'NOTE'; label: string | null } | null
}

async function requireUserId(): Promise<string> {
  const session = await auth()
  const id = session?.user?.id
  if (!id) throw new Error('UNAUTHENTICATED')
  return id
}

/** Loads a profile the caller actually owns, or throws. */
async function ownedProfile(profileId: string) {
  const userId = await requireUserId()
  const profile = await prisma.profile.findFirst({ where: { id: profileId, userId } })
  if (!profile) throw new Error('NOT_FOUND')
  return profile
}

/**
 * Returns a day's reading, generating and caching it on first request.
 *
 * The cache key is (profile, date) with prose stored per locale, so switching
 * language writes a second body against the same findings rather than
 * re-deriving them — the analysis is identical, only the words differ.
 */
export async function getDayView(profileId: string, date: string, locale: Locale): Promise<DayView> {
  const profile = await ownedProfile(profileId)
  const chart = chartFor(profile)
  const day = parseDateOnly(date)

  const existing = await prisma.dailyReading.findUnique({
    where: { profileId_date: { profileId, date: day } },
  })

  const snapshot = buildDailySnapshot(chart, date)
  const column = locale === 'vi' ? 'bodyVi' : 'bodyEn'
  const cached = existing?.[column]

  let body: ReadingBody
  let source: 'model' | 'template'

  if (cached) {
    const decoded = safeParse(cached)
    body = decoded ?? renderTemplate(snapshot, locale)
    source = decoded && existing?.model ? 'model' : 'template'
  } else {
    const generated = await generateReading(chart, snapshot, locale)
    body = generated.body
    source = generated.source

    await prisma.dailyReading.upsert({
      where: { profileId_date: { profileId, date: day } },
      create: {
        profileId,
        date: day,
        facts: snapshot as unknown as object,
        score: snapshot.score,
        model: generated.model ?? null,
        [column]: JSON.stringify(body),
      },
      update: {
        facts: snapshot as unknown as object,
        score: snapshot.score,
        model: generated.model ?? existing?.model ?? null,
        [column]: JSON.stringify(body),
      },
    })
  }

  const [journal, bookmark] = await Promise.all([
    prisma.journalEntry.findUnique({ where: { profileId_date: { profileId, date: day } } }),
    prisma.dayBookmark.findUnique({ where: { profileId_date: { profileId, date: day } } }),
  ])

  // History is a record of what was looked at, so a repeat visit refreshes the
  // timestamp rather than adding a row.
  await prisma.viewHistory.upsert({
    where: { profileId_date: { profileId, date: day } },
    create: { profileId, date: day },
    update: { viewedAt: new Date() },
  })

  return {
    date,
    snapshot,
    body,
    source,
    journal: journal ? { mood: journal.mood, note: journal.note } : null,
    bookmark: bookmark ? { kind: bookmark.kind, label: bookmark.label } : null,
  }
}

/** Today's date in the signed-in user's zone. */
export async function todayForUser(): Promise<string> {
  const userId = await requireUserId()
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { timeZone: true } })
  return todayIn(user?.timeZone ?? 'Asia/Ho_Chi_Minh')
}

export async function saveJournal(input: unknown) {
  const parsed = journalSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: 'Dữ liệu chưa hợp lệ' }

  const { profileId, date, mood, note } = parsed.data
  await ownedProfile(profileId)
  const day = parseDateOnly(date)

  if (!note.trim()) {
    await prisma.journalEntry.deleteMany({ where: { profileId, date: day } })
  } else {
    await prisma.journalEntry.upsert({
      where: { profileId_date: { profileId, date: day } },
      create: { profileId, date: day, mood: mood ?? null, note },
      update: { mood: mood ?? null, note },
    })
  }

  revalidatePath('/today')
  revalidatePath('/journal')
  return { ok: true as const }
}

export async function toggleBookmark(input: unknown) {
  const parsed = bookmarkSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: 'Dữ liệu chưa hợp lệ' }

  const { profileId, date, kind, label } = parsed.data
  await ownedProfile(profileId)
  const day = parseDateOnly(date)

  const existing = await prisma.dayBookmark.findUnique({
    where: { profileId_date: { profileId, date: day } },
  })

  // Clicking the current kind clears the mark; a different kind replaces it.
  if (existing && existing.kind === kind) {
    await prisma.dayBookmark.delete({ where: { id: existing.id } })
  } else {
    await prisma.dayBookmark.upsert({
      where: { profileId_date: { profileId, date: day } },
      create: { profileId, date: day, kind, label: label ?? null },
      update: { kind, label: label ?? null },
    })
  }

  revalidatePath('/today')
  revalidatePath('/journal')
  return { ok: true as const }
}

function safeParse(value: string): ReadingBody | null {
  try {
    const parsed: unknown = JSON.parse(value)
    return isReadingBody(parsed) ? parsed : null
  } catch {
    return null
  }
}
