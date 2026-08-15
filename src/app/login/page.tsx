import { AuthForm } from '@/components/AuthForm'
import { googleEnabled } from '@/auth.config'

export const metadata = { title: 'Đăng nhập | Bát Tự' }

export default function LoginPage() {
  return (
    <main className="paper-grain flex min-h-screen items-center justify-center px-4 py-12">
      <AuthForm mode="login" googleEnabled={googleEnabled} />
    </main>
  )
}
