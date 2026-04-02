import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { useTranslation } from '@/hooks/useTranslation'
import { mapAuthError } from '../utils/authErrors'

interface Fields {
  password: string
  confirmPassword: string
}

type Errors = Partial<Fields>

export function useResetPasswordForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [fields, setFields] = useState<Fields>({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function setField(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (apiError) setApiError(null)
  }

  function validate(): boolean {
    const next: Errors = {}
    if (!fields.password) next.password = t('auth.errors.weak_password')
    else if (fields.password.length < 6) next.password = t('auth.errors.weak_password')
    if (!fields.confirmPassword) next.confirmPassword = t('auth.errors.unexpected')
    else if (fields.password !== fields.confirmPassword)
      next.confirmPassword = t('auth.errors.unexpected')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setApiError(null)
    try {
      const { error } = await authService.updatePassword(fields.password)
      if (error) throw error
      navigate('/login', { replace: true })
    } catch (err) {
      setApiError(mapAuthError(err, t))
    } finally {
      setIsLoading(false)
    }
  }

  return { fields, errors, apiError, isLoading, setField, handleSubmit }
}
