'use client'

import Link from 'next/link'
import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProfile, setDefaultProfile } from '@/app/actions/profiles'
import type { Element } from '@/lib/bazi'
import { ELEMENT_TEXT, Han, Panel } from './ui'

const RELATION: Record<string, string> = {
  SELF: 'Bản thân',
  FAMILY: 'Gia đình',
  FRIEND: 'Bạn bè',
  OTHER: 'Khác',
}

export interface ProfileRow {
  id: string
  name: string
  relation: string
  isDefault: boolean
  placeName: string
  birth: string
  gender: string
  dayMaster: string
  dayMasterZh: string
  element: Element
  elementLabel: string
  strength: string
}

export function ProfileList({ rows }: { rows: ProfileRow[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [confirming, setConfirming] = useState<string | null>(null)

  if (rows.length === 0) {
    return (
      <Panel className="text-center">
        <p className="text-sm text-ink-soft">Chưa có lá số nào được lưu.</p>
        <Link
          href="/profiles/new"
          className="mt-4 inline-block cursor-pointer rounded-seal bg-cinnabar px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
        >
          Thêm lá số đầu tiên
        </Link>
      </Panel>
    )
  }

  const act = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn()
      setConfirming(null)
      router.refresh()
    })

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.id} className="rounded-seal border border-rule bg-paper-raised p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Han className={`text-3xl leading-none font-semibold ${ELEMENT_TEXT[r.element]}`}>{r.dayMasterZh}</Han>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">{r.name}</span>
                  {r.isDefault && (
                    <span className="rounded-seal bg-cinnabar px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      MẶC ĐỊNH
                    </span>
                  )}
                  <span className="text-[11px] text-ink-faint">{RELATION[r.relation]}</span>
                </div>
                <div className="mt-0.5 text-xs text-ink-soft">
                  {r.dayMaster} · {r.elementLabel} · {r.strength === 'STRONG' ? 'Thân vượng' : 'Thân nhược'}
                </div>
                <div className="mt-0.5 text-[11px] text-ink-faint">
                  {r.gender === 'MALE' ? 'Nam' : 'Nữ'} · {r.birth} · {r.placeName}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-1.5">
              <Link
                href={`/today?profile=${r.id}`}
                className="cursor-pointer rounded-seal border border-rule px-2.5 py-1.5 text-xs text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink"
              >
                Xem hôm nay
              </Link>
              <Link
                href={`/profiles/${r.id}`}
                className="cursor-pointer rounded-seal border border-rule px-2.5 py-1.5 text-xs text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink"
              >
                Sửa
              </Link>
              {!r.isDefault && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => act(() => setDefaultProfile(r.id))}
                  className="cursor-pointer rounded-seal border border-rule px-2.5 py-1.5 text-xs text-ink-soft transition-colors duration-200 hover:border-rule-strong hover:text-ink disabled:opacity-50"
                >
                  Đặt mặc định
                </button>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => (confirming === r.id ? act(() => deleteProfile(r.id)) : setConfirming(r.id))}
                className={`cursor-pointer rounded-seal border px-2.5 py-1.5 text-xs transition-colors duration-200 disabled:opacity-50 ${
                  confirming === r.id ? 'border-fire bg-fire/10 text-fire' : 'border-rule text-ink-faint hover:border-fire/50 hover:text-fire'
                }`}
              >
                {confirming === r.id ? 'Xoá thật?' : 'Xoá'}
              </button>
            </div>
          </div>

          {/* Deleting a profile takes its journal and marks with it — say so before it happens. */}
          {confirming === r.id && (
            <p className="mt-3 border-t border-rule pt-3 text-[11px] leading-relaxed text-fire">
              Xoá hồ sơ này sẽ xoá luôn toàn bộ nhật ký, đánh dấu và luận giải đã lưu của nó. Không khôi phục được.
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
