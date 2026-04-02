import { Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ProBadgeProps {
  className?: string
  size?: 'sm' | 'md'
}

export function ProBadge({ className, size = 'sm' }: ProBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider',
        'bg-gradient-primary text-primary-foreground shadow-glow-primary',
        size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs',
        className
      )}
    >
      <Sparkles className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      Pro
    </span>
  )
}
