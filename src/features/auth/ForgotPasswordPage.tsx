import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AuthLayout } from './components/AuthLayout'
import { AuthAlert } from './components/AuthAlert'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useForgotPasswordForm } from './hooks/useForgotPasswordForm'
import { useTranslation } from '@/hooks/useTranslation'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { email, emailError, apiError, isLoading, isSuccess, handleEmailChange, handleSubmit } = useForgotPasswordForm()

  return (
    <AuthLayout
      title={t('auth.forgot_password_title')}
      subtitle={t('auth.forgot_password_subtitle')}
    >
      {isSuccess ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/20">
            <CheckCircle className="h-7 w-7 text-accent" />
          </div>
          <p className="text-sm text-foreground-secondary">{t('auth.forgot_password_email_sent')}</p>
          <Link
            to="/login"
            className="mt-2 text-sm font-medium text-primary hover:text-primary-light transition-colors"
          >
            {t('auth.back_to_login')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {apiError && <AuthAlert message={apiError} variant="error" />}

          <Input
            id="forgot-email"
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            error={emailError ?? undefined}
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
            {t('auth.forgot_password_button')}
          </Button>

          <div className="flex justify-center pt-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('auth.back_to_login')}
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
