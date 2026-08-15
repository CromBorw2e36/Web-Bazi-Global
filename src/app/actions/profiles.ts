'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { profileSchema } from '@/lib/validation'

async function requireUserId(): Promise<string> {
  const session = await auth()
  const id = session?.user?.id
  if (!id) throw new Error('UNAUTHENTICATED')
  return id
}

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string; fields?: Record<string, string> }

export async function listProfiles() {
  const userId = await requireUserId()
  return prisma.profile.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })
}

export async function createProfile(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId()
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Dữ liệu chưa hợp lệ', fields: fieldErrors(parsed.error) }
  }

  // The first profile a user saves becomes their default.
  const existing = await prisma.profile.count({ where: { userId } })

  const profile = await prisma.profile.create({
    data: { ...parsed.data, userId, isDefault: existing === 0 },
  })

  revalidatePath('/profiles')
  revalidatePath('/today')
  return { ok: true, data: { id: profile.id } }
}

export async function updateProfile(id: string, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId()
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Dữ liệu chưa hợp lệ', fields: fieldErrors(parsed.error) }
  }

  // Scoping the update by userId means a forged id cannot touch another
  // account's row — the where clause simply matches nothing.
  const result = await prisma.profile.updateMany({
    where: { id, userId },
    data: parsed.data,
  })
  if (result.count === 0) return { ok: false, error: 'Không tìm thấy hồ sơ' }

  // Any cached reading was written against the old birth data.
  await prisma.dailyReading.deleteMany({ where: { profileId: id } })

  revalidatePath('/profiles')
  revalidatePath('/today')
  return { ok: true, data: undefined }
}

export async function deleteProfile(id: string): Promise<ActionResult> {
  const userId = await requireUserId()

  const profile = await prisma.profile.findFirst({ where: { id, userId } })
  if (!profile) return { ok: false, error: 'Không tìm thấy hồ sơ' }

  await prisma.profile.delete({ where: { id } })

  // Promote another profile so the account is never left without a default.
  if (profile.isDefault) {
    const next = await prisma.profile.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } })
    if (next) await prisma.profile.update({ where: { id: next.id }, data: { isDefault: true } })
  }

  revalidatePath('/profiles')
  revalidatePath('/today')
  return { ok: true, data: undefined }
}

export async function setDefaultProfile(id: string): Promise<ActionResult> {
  const userId = await requireUserId()

  const owned = await prisma.profile.findFirst({ where: { id, userId }, select: { id: true } })
  if (!owned) return { ok: false, error: 'Không tìm thấy hồ sơ' }

  // Exactly one default per user, enforced here rather than by a partial index.
  await prisma.$transaction([
    prisma.profile.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.profile.update({ where: { id }, data: { isDefault: true } }),
  ])

  revalidatePath('/profiles')
  revalidatePath('/today')
  return { ok: true, data: undefined }
}

function fieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_')
    out[key] ??= issue.message
  }
  return out
}
