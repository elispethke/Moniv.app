import { useState } from 'react'
import type { FormEvent } from 'react'
import { authService } from '@/services/authService'
import { useTranslation } from '@/hooks/useTranslation'
import { mapAuthError } from '../utils/authErrors'

export function useForgotPasswordForm() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  function handleEmailChange(value: string) {
    setEmail(value)
    if (emailError) setEmailError(null)
    if (apiError) setApiError(null)
  }

  function validate(): boolean {
    if (!email.trim()) { setEmailError(t('auth.errors.invalid_email')); return false }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError(t('auth.errors.invalid_email')); return false }
    return true
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setApiError(null)
    try {
      const { error } = await authService.resetPasswordForEmail(email.trim())
      if (error) throw error
      setIsSuccess(true)
    } catch (err) {
      setApiError(mapAuthError(err, t))
    } finally {
      setIsLoading(false)
    }
  }

  return { email, emailError, apiError, isLoading, isSuccess, handleEmailChange, handleSubmit }
}
