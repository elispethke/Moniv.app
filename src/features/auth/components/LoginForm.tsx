import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from './PasswordInput'
import { AuthAlert } from './AuthAlert'
import { useLoginForm } from '../hooks/useLoginForm'
import { useTranslation } from '@/hooks/useTranslation'

export function LoginForm() {
  const { fields, errors, apiError, isLoading, setField, handleSubmit } = useLoginForm()
  const { t } = useTranslation()

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && <AuthAlert message={apiError} variant="error" />}

      <Input
        id="login-email"
        label={t('auth.email')}
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        value={fields.email}
        onChange={(e) => setField('email', e.target.value)}
        error={errors.email}
        leftIcon={<Mail className="h-4 w-4" />}
      />

      <PasswordInput
        id="login-password"
        label={t('auth.password')}
        value={fields.password}
        onChange={(v) => setField('password', v)}
        error={errors.password}
      />

      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="text-xs text-primary hover:text-primary-light transition-colors"
        >
          {t('auth.forgot_password_link')}
        </Link>
      </div>

      <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
        {t('auth.login_button')}
      </Button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        {t('auth.no_account')}{' '}
        <Link
          to="/signup"
          className="font-medium text-primary hover:text-primary-light transition-colors"
        >
          {t('auth.signup_link')}
        </Link>
      </p>
    </form>
  )
}
