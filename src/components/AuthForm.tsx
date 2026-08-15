'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction, registerAction, signInWithGoogle, type FormState } from '@/app/actions/auth'
import { Han } from './ui'

const FIELD =
  'w-full rounded-seal border border-rule bg-paper px-3 py-2 text-sm text-ink transition-colors duration-200 hover:border-rule-strong focus:border-cinnabar focus:outline-none'
const LABEL = 'mb-1.5 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-start gap-1 text-[11px] text-fire">
      <span aria-hidden>⚠</span>
      <span>{message}</span>
    </p>
  )
}

export function AuthForm({ mode, googleEnabled }: { mode: 'login' | 'register'; googleEnabled: boolean }) {
  const isRegister = mode === 'register'
  const [state, action, pending] = useActionState<FormState, FormData>(
    isRegister ? registerAction : loginAction,
    null,
  )

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex size-14 items-center justify-center rounded-seal bg-cinnabar">
          <Han className="text-2xl leading-none font-bold text-white">八字</Han>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
        </h1>
        <p className="mt-1 text-xs text-ink-faint">
          {isRegister ? 'Lưu lá số và xem luận giải mỗi ngày' : 'Tiếp tục với lá số đã lưu'}
        </p>
      </div>

      <div className="rounded-seal border border-rule bg-paper-raised p-5">
        {googleEnabled && (
          <>
            <form action={signInWithGoogle} className="mb-4">
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-seal border border-rule bg-paper px-3 py-2 text-sm text-ink transition-colors duration-200 hover:border-rule-strong"
              >
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
                <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.4 7.6 24 12 24z" />
                <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 010-4.6v-3H1.8a12 12 0 000 10.6l3.8-3z" />
                  <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.6 0 3.7 2.6 1.8 6.1l3.8 3c.9-2.7 3.4-4.3 6.4-4.3z" />
                </svg>
                Tiếp tục với Google
              </button>
            </form>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-rule" />
              <span className="text-[10px] tracking-wide text-ink-faint uppercase">hoặc</span>
              <div className="h-px flex-1 bg-rule" />
            </div>
          </>
        )}

        <form action={action} className="space-y-3">
          {isRegister && (
            <div>
              <label className={LABEL} htmlFor="name">
                Tên
              </label>
              <input id="name" name="name" type="text" required maxLength={80} className={FIELD} autoComplete="name" />
              <FieldError message={state?.fields?.name} />
            </div>
          )}

          <div>
            <label className={LABEL} htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" required className={FIELD} autoComplete="email" />
            <FieldError message={state?.fields?.email} />
          </div>

          <div>
            <label className={LABEL} htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={FIELD}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
            <FieldError message={state?.fields?.password} />
          </div>

          {isRegister && (
            <div>
              <label className={LABEL} htmlFor="confirm">
                Nhập lại mật khẩu
              </label>
              <input id="confirm" name="confirm" type="password" required className={FIELD} autoComplete="new-password" />
              <FieldError message={state?.fields?.confirm} />
            </div>
          )}

          {state?.error && (
            <p className="flex items-start gap-1.5 rounded-seal border border-fire/40 bg-fire/5 px-3 py-2 text-xs text-fire">
              <span aria-hidden>⚠</span>
              <span>{state.error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full cursor-pointer rounded-seal bg-cinnabar px-3 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? 'Đang xử lý…' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-ink-faint">
        {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
        <Link href={isRegister ? '/login' : '/register'} className="text-cinnabar underline-offset-2 hover:underline">
          {isRegister ? 'Đăng nhập' : 'Đăng ký'}
        </Link>
      </p>
    </div>
  )
}
