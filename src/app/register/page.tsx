import { AuthForm } from '@/components/AuthForm'
import { googleEnabled } from '@/auth.config'

export const metadata = { title: 'Đăng ký | Bát Tự' }

export default function RegisterPage() {
  return (
    <main className="paper-grain flex min-h-screen items-center justify-center px-4 py-12">
      <AuthForm mode="register" googleEnabled={googleEnabled} />
    </main>
  )
}
