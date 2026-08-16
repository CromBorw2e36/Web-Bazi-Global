import Link from 'next/link'
import { getAdminStats, listUsers } from '@/app/actions/admin'
import { Panel } from '@/components/ui'

export const metadata = { title: 'Quản trị | Bát Tự' }

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams
  const currentPage = pageStr ? parseInt(pageStr, 10) : 1

  const stats = await getAdminStats()
  const { users, totalPages } = await listUsers(currentPage)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink-soft">Tổng người dùng</span>
          <span className="font-[family-name:var(--font-display)] text-3xl text-ink">{stats.userCount}</span>
        </Panel>
        <Panel className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink-soft">Tổng hồ sơ</span>
          <span className="font-[family-name:var(--font-display)] text-3xl text-ink">{stats.profileCount}</span>
        </Panel>
        <Panel className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink-soft">Tổng nhật ký</span>
          <span className="font-[family-name:var(--font-display)] text-3xl text-ink">{stats.journalCount}</span>
        </Panel>
      </div>

      <Panel className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rule bg-paper">
              <tr>
                <th className="px-4 py-3 font-medium text-ink-soft">Tên</th>
                <th className="px-4 py-3 font-medium text-ink-soft">Email</th>
                <th className="px-4 py-3 font-medium text-ink-soft">Ngày đăng ký</th>
                <th className="px-4 py-3 font-medium text-ink-soft text-right">Hồ sơ</th>
                <th className="px-4 py-3 font-medium text-ink-soft text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule bg-paper-raised">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-paper">
                  <td className="px-4 py-3 font-medium text-ink">{u.name || '—'}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.createdAt.toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-right text-ink-soft">{u._count.profiles}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/users/${u.id}`} className="font-medium text-cinnabar hover:underline">
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="border-t border-rule px-4 py-3 flex items-center justify-between">
            <Link
              href={currentPage > 1 ? `/admin?page=${currentPage - 1}` : '#'}
              className={`text-sm font-medium ${currentPage > 1 ? 'text-ink hover:text-cinnabar' : 'text-ink-faint pointer-events-none'}`}
            >
              &larr; Trước
            </Link>
            <span className="text-sm text-ink-soft">Trang {currentPage} / {totalPages}</span>
            <Link
              href={currentPage < totalPages ? `/admin?page=${currentPage + 1}` : '#'}
              className={`text-sm font-medium ${currentPage < totalPages ? 'text-ink hover:text-cinnabar' : 'text-ink-faint pointer-events-none'}`}
            >
              Sau &rarr;
            </Link>
          </div>
        )}
      </Panel>
    </div>
  )
}
