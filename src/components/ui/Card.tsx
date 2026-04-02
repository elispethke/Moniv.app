import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  elevated?: boolean
  glow?: 'primary' | 'accent' | 'danger' | 'none'
}

export function Card({ glass, elevated, glow = 'none', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-surface-border transition-all duration-200',
        elevated ? 'bg-surface-elevated' : 'bg-surface',
        glass && 'backdrop-blur-sm bg-surface/80',
        glow === 'primary' && 'shadow-glow-primary',
        glow === 'accent' && 'shadow-glow-accent',
        glow === 'danger' && 'shadow-glow-danger',
        glow === 'none' && 'shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-4 pb-0', className)} {...props}>
      {children}
    </div>
  )
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}
export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}
export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('flex items-center p-4 pt-0', className)} {...props}>
      {children}
    </div>
  )
}
