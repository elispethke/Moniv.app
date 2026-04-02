import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-11 w-full rounded-xl border border-surface-border bg-surface-elevated px-4 text-sm text-foreground',
              'placeholder:text-muted-foreground',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-danger focus:ring-danger',
              leftIcon != null && 'pl-10',
              rightIcon != null && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
