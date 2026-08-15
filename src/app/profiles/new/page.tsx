import { AppNav } from '@/components/AppNav'
import { EMPTY_PROFILE, ProfileEditor } from '@/components/ProfileEditor'
import { Panel } from '@/components/ui'

export const metadata = { title: 'Thêm lá số | Bát Tự' }

export default function NewProfilePage() {
  return (
    <>
      <AppNav active="/profiles" />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Thêm lá số</h1>
        <Panel>
          <ProfileEditor initial={EMPTY_PROFILE} />
        </Panel>
      </main>
    </>
  )
}
