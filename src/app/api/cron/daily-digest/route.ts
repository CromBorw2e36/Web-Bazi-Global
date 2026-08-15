import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { chartFor } from '@/lib/profile'
import { buildDailySnapshot, todayIn, BRANCH_TERMS, STEM_TERMS, type Locale } from '@/lib/bazi'
import { generateReading } from '@/lib/reading/generate'
import { renderDigest, sendEmail } from '@/lib/email'
import { parseDateOnly } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Daily digest.
 *
 * Meant to be hit once an hour by a scheduler; it picks out the users whose
 * chosen send-hour has just arrived in their own zone, so a single hourly cron
 * serves every time zone without per-user scheduling.
 *
 * Delivery is recorded by writing the reading row, which is also the render
 * cache. That makes the run idempotent: a retry within the same hour finds the
 * row already written and skips the send rather than mailing twice.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const users = await prisma.user.findMany({
    where: { dailyEmail: true, email: { not: null } },
    select: { id: true, email: true, locale: true, timeZone: true, dailyEmailHour: true },
  })

  const origin = process.env.AUTH_URL ?? new URL(request.url).origin
  let sent = 0
  let skipped = 0
  const failures: string[] = []

  for (const user of users) {
    try {
      if (localHour(user.timeZone, now) !== user.dailyEmailHour) {
        skipped++
        continue
      }

      const profile = await prisma.profile.findFirst({
        where: { userId: user.id, isDefault: true },
      })
      if (!profile || !user.email) {
        skipped++
        continue
      }

      const locale = (user.locale ?? 'vi') as Locale
      const date = todayIn(user.timeZone, now)
      const day = parseDateOnly(date)
      const column = locale === 'vi' ? 'bodyVi' : 'bodyEn'

      const existing = await prisma.dailyReading.findUnique({
        where: { profileId_date: { profileId: profile.id, date: day } },
      })
      // Already produced for this profile and day — a retry must not re-send.
      if (existing?.[column]) {
        skipped++
        continue
      }

      const chart = chartFor(profile)
      const snapshot = buildDailySnapshot(chart, date)
      const generated = await generateReading(chart, snapshot, locale)

      await prisma.dailyReading.upsert({
        where: { profileId_date: { profileId: profile.id, date: day } },
        create: {
          profileId: profile.id,
          date: day,
          facts: snapshot as unknown as object,
          score: snapshot.score,
          model: generated.model ?? null,
          [column]: JSON.stringify(generated.body),
        },
        update: {
          model: generated.model ?? existing?.model ?? null,
          [column]: JSON.stringify(generated.body),
        },
      })

      const stem = STEM_TERMS[snapshot.day.stem]
      const branch = BRANCH_TERMS[snapshot.day.branch]
      const ok = await sendEmail(
        user.email,
        locale === 'vi'
          ? `${profile.name} · ${stem.vi} ${branch.vi} · ${date}`
          : `${profile.name} · ${stem.en} ${branch.en} · ${date}`,
        renderDigest({
          profileName: profile.name,
          dateLabel: new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(day),
          pillarZh: `${stem.zh}${branch.zh}`,
          pillarLabel: locale === 'vi' ? `${stem.vi} ${branch.vi}` : `${stem.en} ${branch.en}`,
          body: generated.body,
          locale,
          url: `${origin}/today?profile=${profile.id}`,
        }),
      )

      if (ok) sent++
      else skipped++
    } catch (error) {
      // One bad profile must not abort the batch.
      failures.push(`${user.id}: ${error instanceof Error ? error.message : 'unknown'}`)
    }
  }

  return NextResponse.json({ considered: users.length, sent, skipped, failures })
}

/** The hour of day at a location right now, 0-23. */
function localHour(timeZone: string, now: Date): number {
  try {
    return Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hour12: false }).format(now))
  } catch {
    return -1
  }
}
