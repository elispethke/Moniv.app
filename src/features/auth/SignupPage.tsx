import { AuthLayout } from './components/AuthLayout'
import { SignupForm } from './components/SignupForm'

export function SignupPage() {
  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Comece a controlar suas finanças gratuitamente"
    >
      <SignupForm />
    </AuthLayout>
  )
}
