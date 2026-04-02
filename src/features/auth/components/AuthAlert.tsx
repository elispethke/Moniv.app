import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface AuthAlertProps {
  message: string
  variant: 'error' | 'success'
}

export function AuthAlert({ message, variant }: AuthAlertProps) {
  const isError = variant === 'error'
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm',
        isError
          ? 'border-danger/30 bg-danger/10 text-danger'
          : 'border-success/30 bg-success/10 text-accent-light'
      )}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  )
}
