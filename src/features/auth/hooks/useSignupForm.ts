import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from '@/hooks/useTranslation'
import { mapAuthError } from '../utils/authErrors'

interface SignupFields {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

type SignupErrors = Partial<SignupFields>

export function useSignupForm() {
  const { signup } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [fields, setFields] = useState<SignupFields>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<SignupErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const setField = (key: keyof SignupFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (apiError) setApiError(null)
  }

  const validate = (): boolean => {
    const next: SignupErrors = {}
    if (!fields.fullName.trim()) next.fullName = t('auth.errors.unexpected')
    if (!fields.email.trim()) next.email = t('auth.errors.invalid_email')
    else if (!/\S+@\S+\.\S+/.test(fields.email)) next.email = t('auth.errors.invalid_email')
    if (!fields.password) next.password = t('auth.errors.weak_password')
    else if (fields.password.length < 6) next.password = t('auth.errors.weak_password')
    if (!fields.confirmPassword) next.confirmPassword = t('auth.errors.unexpected')
    else if (fields.password !== fields.confirmPassword)
      next.confirmPassword = t('auth.errors.unexpected')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setApiError(null)
    try {
      await signup(fields.email.trim(), fields.password, fields.fullName.trim())
      setIsSuccess(true)
      navigate('/transactions', { replace: true })
    } catch (err) {
      setApiError(mapAuthError(err, t))
    } finally {
      setIsLoading(false)
    }
  }

  return { fields, errors, apiError, isLoading, isSuccess, setField, handleSubmit }
}
