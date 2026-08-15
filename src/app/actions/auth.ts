'use server'

import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { prisma } from '@/lib/db'
import { signIn } from '@/auth'
import { credentialsSchema, registerSchema, settingsSchema } from '@/lib/validation'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export type FormState = { error?: string; fields?: Record<string, string> } | null

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '_')
      fields[key] ??= issue.message
    }
    return { error: 'Vui lòng kiểm tra lại thông tin', fields }
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    // Deliberately specific: the sign-up form already reveals whether an address
    // is taken the moment you try it, so a vague message only wastes the user's
    // time without hiding anything.
    return { error: 'Email này đã được đăng ký', fields: { email: 'Đã có tài khoản với email này' } }
  }

  await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
  })

  await signIn('credentials', { email, password, redirectTo: '/today' })
  return null
}

/**
 * OAuth sign-in has to be a POST, not a link: a GET to the provider endpoint
 * skips the CSRF token Auth.js issues, and prefetching a plain anchor would
 * start the flow before the user ever clicks.
 */
export async function signInWithGoogle() {
  await signIn('google', { redirectTo: '/today' })
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Email hoặc mật khẩu chưa hợp lệ' }

  try {
    await signIn('credentials', { ...parsed.data, redirectTo: '/today' })
  } catch (error) {
    // signIn throws a redirect on success, which must be allowed to propagate.
    if (error instanceof AuthError) return { error: 'Email hoặc mật khẩu không đúng' }
    throw error
  }
  return null
}

export async function updateSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Chưa đăng nhập' }

  const raw = Object.fromEntries(formData)
  const parsed = settingsSchema.safeParse({ ...raw, dailyEmail: raw.dailyEmail === 'on' || raw.dailyEmail === 'true' })
  if (!parsed.success) return { error: 'Dữ liệu chưa hợp lệ' }

  await prisma.user.update({ where: { id: userId }, data: parsed.data })
  revalidatePath('/settings')
  return null
}
