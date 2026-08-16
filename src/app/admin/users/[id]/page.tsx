import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUserDetail } from '@/app/actions/admin'
import { Panel } from '@/components/ui'

export const metadata = { title: 'Chi tiết người dùng | Quản trị' }

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUserDetail(id)

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm font-medium text-ink-soft hover:text-ink">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <Panel>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-4">Thông tin người dùng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-ink-faint uppercase tracking-wider">Tên</div>
            <div className="mt-1 text-sm text-ink">{user.name || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-faint uppercase tracking-wider">Email</div>
            <div className="mt-1 text-sm text-ink">{user.email}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-faint uppercase tracking-wider">Đăng ký lúc</div>
            <div className="mt-1 text-sm text-ink">{user.createdAt.toLocaleString('vi-VN')}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-faint uppercase tracking-wider">Ngôn ngữ</div>
            <div className="mt-1 text-sm text-ink">{user.locale}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-faint uppercase tracking-wider">Múi giờ</div>
            <div className="mt-1 text-sm text-ink">{user.timeZone || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-faint uppercase tracking-wider">Email hàng ngày</div>
            <div className="mt-1 text-sm text-ink">{user.dailyEmail ? 'Có' : 'Không'}</div>
          </div>
        </div>
      </Panel>

      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mt-8 mb-4">Hồ sơ ({user.profiles.length})</h2>
      
      <div className="space-y-4">
        {user.profiles.map((profile) => (
          <Panel key={profile.id}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-rule">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink">{profile.name}</h3>
                  {profile.isDefault && (
                    <span className="rounded bg-cinnabar/10 px-1.5 py-0.5 text-[10px] font-medium text-cinnabar">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="text-sm text-ink-soft mt-1">
                  {profile.relation} • {profile.gender === 'MALE' ? 'Nam' : 'Nữ'}
                </div>
              </div>
              <div className="text-sm text-right text-ink-soft">
                <div>{String(profile.birthDay).padStart(2, '0')}/{String(profile.birthMonth).padStart(2, '0')}/{profile.birthYear}</div>
                <div>{String(profile.birthHour).padStart(2, '0')}:{String(profile.birthMinute).padStart(2, '0')}</div>
                <div className="text-xs text-ink-faint mt-1">{profile.placeName}</div>
              </div>
            </div>

            {profile.journal.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-ink">Nhật ký gần đây</h4>
                {profile.journal.map((entry) => (
                  <div className="text-sm border-l-2 border-rule pl-3 py-1" key={entry.id}>
                    <div className="flex items-center gap-2 text-ink-soft mb-1">
                      <span className="text-base">{entry.mood}</span>
                      <span className="text-xs">{entry.date.toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="text-ink line-clamp-3">
                      {entry.note.length > 200 ? entry.note.slice(0, 200) + '...' : entry.note}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-ink-faint italic">Chưa có nhật ký</div>
            )}
          </Panel>
        ))}
        {user.profiles.length === 0 && (
          <div className="text-center py-8 text-sm text-ink-soft">
            Người dùng này chưa tạo hồ sơ nào.
          </div>
        )}
      </div>
    </div>
  )
}
