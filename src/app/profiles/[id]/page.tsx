import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { AppNav, NAV_CLEARANCE } from '@/components/AppNav'
import { ProfileEditor } from '@/components/ProfileEditor'
import { Panel } from '@/components/ui'

export const metadata = { title: 'Sửa lá số | Bát Tự' }

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  // Scoped by userId, so a guessed id is indistinguishable from a missing one.
  const profile = await prisma.profile.findFirst({ where: { id, userId: session!.user!.id } })
  if (!profile) notFound()

  return (
    <>
      <AppNav active="/profiles" />
      <main className={`mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 ${NAV_CLEARANCE}`}>
        <h1 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Sửa lá số</h1>
        <Panel>
          <ProfileEditor
            initial={{
              id: profile.id,
              name: profile.name,
              relation: profile.relation,
              birthYear: profile.birthYear,
              birthMonth: profile.birthMonth,
              birthDay: profile.birthDay,
              birthHour: profile.birthHour,
              birthMinute: profile.birthMinute,
              gender: profile.gender,
              longitude: profile.longitude,
              latitude: profile.latitude,
              utcOffset: profile.utcOffset,
              placeId: profile.placeId,
              placeName: profile.placeName,
              useEquationOfTime: profile.useEquationOfTime,
            }}
          />
        </Panel>
        <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
          Sửa dữ liệu sinh sẽ xoá các luận giải đã lưu của hồ sơ này, vì chúng được viết dựa trên lá số cũ. Nhật ký và
          đánh dấu vẫn giữ nguyên.
        </p>
      </main>
    </>
  )
}
