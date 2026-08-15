import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { AppNav } from '@/components/AppNav'
import { ProfileList } from '@/components/ProfileList'
import { chartFor } from '@/lib/profile'
import { ELEMENT_TERMS, STEM_TERMS, BRANCH_TERMS } from '@/lib/bazi'

export const metadata = { title: 'Hồ Sơ | Bát Tự' }

export default async function ProfilesPage() {
  const session = await auth()
  const profiles = await prisma.profile.findMany({
    where: { userId: session!.user!.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })

  // The four pillars are computed here so the list can show each chart at a
  // glance without shipping the engine to the client for a summary line.
  const rows = profiles.map((p) => {
    const chart = chartFor(p)
    return {
      id: p.id,
      name: p.name,
      relation: p.relation,
      isDefault: p.isDefault,
      placeName: p.placeName,
      birth: `${String(p.birthDay).padStart(2, '0')}/${String(p.birthMonth).padStart(2, '0')}/${p.birthYear} ${String(p.birthHour).padStart(2, '0')}:${String(p.birthMinute).padStart(2, '0')}`,
      gender: p.gender,
      dayMaster: `${STEM_TERMS[chart.dayMaster].vi} ${BRANCH_TERMS[chart.pillars.day.branch].vi}`,
      dayMasterZh: `${STEM_TERMS[chart.dayMaster].zh}${BRANCH_TERMS[chart.pillars.day.branch].zh}`,
      element: chart.dayMasterElement,
      elementLabel: ELEMENT_TERMS[chart.dayMasterElement].vi,
      strength: chart.strength.strength,
    }
  })

  return (
    <>
      <AppNav active="/profiles" />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Hồ Sơ</h1>
            <p className="mt-0.5 text-xs text-ink-faint">Lá số của bạn và người thân</p>
          </div>
          <Link
            href="/profiles/new"
            className="shrink-0 cursor-pointer rounded-seal bg-cinnabar px-3.5 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            Thêm lá số
          </Link>
        </div>

        <ProfileList rows={rows} />
      </main>
    </>
  )
}
