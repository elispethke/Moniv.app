import { AuthLayout } from './components/AuthLayout'
import { AuthAlert } from './components/AuthAlert'
import { PasswordInput } from './components/PasswordInput'
import { Button } from '@/components/ui/Button'
import { useResetPasswordForm } from './hooks/useResetPasswordForm'
import { useTranslation } from '@/hooks/useTranslation'

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const { fields, errors, apiError, isLoading, setField, handleSubmit } = useResetPasswordForm()

  return (
    <AuthLayout
      title={t('auth.reset_password_title')}
      subtitle={t('auth.reset_password_subtitle')}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {apiError && <AuthAlert message={apiError} variant="error" />}

        <PasswordInput
          id="new-password"
          label={t('auth.new_password')}
          value={fields.password}
          onChange={(v) => setField('password', v)}
          error={errors.password}
        />

        <PasswordInput
          id="confirm-password"
          label={t('auth.confirm_new_password')}
          value={fields.confirmPassword}
          onChange={(v) => setField('confirmPassword', v)}
          error={errors.confirmPassword}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
          {t('auth.reset_password_button')}
        </Button>
      </form>
    </AuthLayout>
  )
}
