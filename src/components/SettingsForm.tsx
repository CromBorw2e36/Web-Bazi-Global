'use client'

import { useActionState } from 'react'
import { updateSettings, type FormState } from '@/app/actions/auth'

const FIELD =
  'w-full rounded-seal border border-rule bg-paper px-3 py-2 text-sm text-ink transition-colors duration-200 hover:border-rule-strong focus:border-cinnabar focus:outline-none'
const LABEL = 'mb-1.5 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase'

/** Zones the app's likely readers are actually born or living in. */
const ZONES = [
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Taipei',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'UTC',
]

export function SettingsForm({
  initial,
}: {
  initial: { name: string; email: string; locale: 'vi' | 'en'; timeZone: string; dailyEmail: boolean; dailyEmailHour: number }
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateSettings, null)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={LABEL} htmlFor="s-name">
          Tên
        </label>
        <input id="s-name" name="name" defaultValue={initial.name} maxLength={80} className={FIELD} required />
      </div>

      <div>
        <label className={LABEL} htmlFor="s-email">
          Email
        </label>
        <input id="s-email" value={initial.email} readOnly disabled className={`${FIELD} opacity-60`} />
        <p className="mt-1 text-[11px] text-ink-faint">Email đăng nhập không đổi được ở đây.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="s-locale">
            Ngôn ngữ luận giải
          </label>
          <select id="s-locale" name="locale" defaultValue={initial.locale} className={`${FIELD} cursor-pointer`}>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="s-tz">
            Múi giờ hiện tại
          </label>
          <select id="s-tz" name="timeZone" defaultValue={initial.timeZone} className={`${FIELD} cursor-pointer`}>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="-mt-1 text-[11px] leading-relaxed text-ink-faint">
        Múi giờ này quyết định &ldquo;hôm nay&rdquo; là ngày nào — không liên quan tới múi giờ nơi sinh trong hồ sơ. Người ở
        Hà Nội lúc 23:30 vẫn đang xem ngày hôm nay, không phải ngày mai.
      </p>

      <div className="border-t border-rule pt-4">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            name="dailyEmail"
            defaultChecked={initial.dailyEmail}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-cinnabar)]"
          />
          <span className="text-sm text-ink">
            Gửi email tử vi hằng ngày
            <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-faint">
              Gửi cho hồ sơ mặc định, mỗi ngày một lần.
            </span>
          </span>
        </label>

        <div className="mt-3 max-w-[180px]">
          <label className={LABEL} htmlFor="s-hour">
            Giờ gửi
          </label>
          <select id="s-hour" name="dailyEmailHour" defaultValue={String(initial.dailyEmailHour)} className={`${FIELD} cursor-pointer`}>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.error && (
        <p className="flex items-start gap-1.5 rounded-seal border border-fire/40 bg-fire/5 px-3 py-2 text-xs text-fire">
          <span aria-hidden>⚠</span>
          <span>{state.error}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 cursor-pointer items-center rounded-seal bg-cinnabar px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 sm:min-h-0"
      >
        {pending ? 'Đang lưu…' : 'Lưu cài đặt'}
      </button>
    </form>
  )
}
