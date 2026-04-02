import { Mail, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from './PasswordInput'
import { AuthAlert } from './AuthAlert'
import { useSignupForm } from '../hooks/useSignupForm'

export function SignupForm() {
  const { fields, errors, apiError, isLoading, isSuccess, setField, handleSubmit } =
    useSignupForm()

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <AuthAlert
          message="Cadastro realizado! Verifique seu email para confirmar sua conta."
          variant="success"
        />
        <Link
          to="/login"
          className="inline-block text-sm font-medium text-primary hover:text-primary-light transition-colors"
        >
          Ir para o login →
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && <AuthAlert message={apiError} variant="error" />}

      <Input
        id="signup-name"
        label="Nome completo"
        type="text"
        autoComplete="name"
        placeholder="Seu nome"
        value={fields.fullName}
        onChange={(e) => setField('fullName', e.target.value)}
        error={errors.fullName}
        leftIcon={<User className="h-4 w-4" />}
      />

      <Input
        id="signup-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        value={fields.email}
        onChange={(e) => setField('email', e.target.value)}
        error={errors.email}
        leftIcon={<Mail className="h-4 w-4" />}
      />

      <PasswordInput
        id="signup-password"
        label="Senha"
        value={fields.password}
        onChange={(v) => setField('password', v)}
        error={errors.password}
        placeholder="Mínimo 6 caracteres"
      />

      <PasswordInput
        id="signup-confirm"
        label="Confirmar senha"
        value={fields.confirmPassword}
        onChange={(v) => setField('confirmPassword', v)}
        error={errors.confirmPassword}
        placeholder="Repita a senha"
      />

      <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
        Criar conta
      </Button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link
          to="/login"
          className="font-medium text-primary hover:text-primary-light transition-colors"
        >
          Fazer login
        </Link>
      </p>
    </form>
  )
}
