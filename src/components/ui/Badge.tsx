import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'muted'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-elevated text-foreground',
  primary: 'bg-primary/20 text-primary-light border border-primary/30',
  success: 'bg-success/20 text-accent-light border border-success/30',
  danger: 'bg-danger/20 text-danger border border-danger/30',
  warning: 'bg-warning/20 text-warning border border-warning/30',
  secondary: 'bg-secondary/20 text-secondary-light border border-secondary/30',
  muted: 'bg-surface-elevated text-muted-foreground',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
