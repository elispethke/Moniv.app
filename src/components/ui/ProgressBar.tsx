import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number  // 0–100
  variant?: 'default' | 'warning' | 'danger' | 'success'
  size?: 'sm' | 'md'
  className?: string
  showLabel?: boolean
}

const variantBar: Record<string, string> = {
  default: 'bg-primary',
  success: 'bg-accent',
  warning: 'bg-warning',
  danger:  'bg-danger',
}

export function ProgressBar({ value, variant = 'default', size = 'md', className, showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-surface-elevated',
          size === 'sm' ? 'h-1.5' : 'h-2.5'
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            variantBar[variant] ?? variantBar.default
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-right text-xs text-muted-foreground">{clamped.toFixed(0)}%</p>
      )}
    </div>
  )
}
