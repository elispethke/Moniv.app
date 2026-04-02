import { AuthLayout } from './components/AuthLayout'
import { LoginForm } from './components/LoginForm'
import { useTranslation } from '@/hooks/useTranslation'

export function LoginPage() {
  const { t } = useTranslation()
  return (
    <AuthLayout
      title={t('auth.login_title')}
      subtitle={t('auth.login_subtitle')}
    >
      <LoginForm />
    </AuthLayout>
  )
}
