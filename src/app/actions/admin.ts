'use server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.email || session.user.email.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) {
    throw new Error('FORBIDDEN')
  }
}

export async function getAdminStats() {
  await requireAdmin()
  const [userCount, profileCount, journalCount] = await Promise.all([
    prisma.user.count(),
    prisma.profile.count(),
    prisma.journalEntry.count(),
  ])
  return { userCount, profileCount, journalCount }
}

export async function listUsers(page = 1, perPage = 20) {
  await requireAdmin()
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, createdAt: true, locale: true,
        _count: { select: { profiles: true } },
      },
    }),
    prisma.user.count(),
  ])
  return { users, total, page, perPage, totalPages: Math.ceil(total / perPage) }
}

export async function getUserDetail(userId: string) {
  await requireAdmin()
  // Get user with profiles and recent journal entries
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, createdAt: true, locale: true, timeZone: true,
      dailyEmail: true,
      profiles: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true, name: true, relation: true,
          birthYear: true, birthMonth: true, birthDay: true,
          birthHour: true, birthMinute: true,
          gender: true, placeName: true, isDefault: true, createdAt: true,
          journal: { orderBy: { date: 'desc' }, take: 20, select: { id: true, date: true, mood: true, note: true } },
          _count: { select: { readings: true, journal: true, bookmarks: true } },
        },
      },
    },
  })
  return user
}
