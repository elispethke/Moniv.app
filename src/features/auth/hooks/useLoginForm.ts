import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from '@/hooks/useTranslation'
import { mapAuthError } from '../utils/authErrors'

interface LoginFields {
  email: string
  password: string
}

type LoginErrors = Partial<LoginFields>

export function useLoginForm() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [fields, setFields] = useState<LoginFields>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const setField = (key: keyof LoginFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (apiError) setApiError(null)
  }

  const validate = (): boolean => {
    const next: LoginErrors = {}
    if (!fields.email.trim()) next.email = t('auth.errors.invalid_email')
    else if (!/\S+@\S+\.\S+/.test(fields.email)) next.email = t('auth.errors.invalid_email')
    if (!fields.password) next.password = t('auth.errors.weak_password')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setApiError(null)
    try {
      await login(fields.email.trim(), fields.password)
      navigate('/transactions', { replace: true })
    } catch (err) {
      setApiError(mapAuthError(err, t))
    } finally {
      setIsLoading(false)
    }
  }

  return { fields, errors, apiError, isLoading, setField, handleSubmit }
}
