import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface PasswordInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  id?: string
}

export function PasswordInput({
  label = 'Senha',
  value,
  onChange,
  error,
  placeholder = '••••••••',
  id,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <Input
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      error={error}
      autoComplete={label.toLowerCase().includes('confirm') ? 'new-password' : 'current-password'}
      leftIcon={<Lock className="h-4 w-4" />}
      rightIcon={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          className="transition-colors hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  )
}
