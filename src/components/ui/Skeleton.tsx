import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
  /** Arredondamento. Default: 'md' */
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

const roundedMap = {
  sm:   'rounded-md',
  md:   'rounded-xl',
  lg:   'rounded-2xl',
  full: 'rounded-full',
}

/**
 * Bloco de skeleton animado.
 * Use className para definir width, height e outras propriedades.
 */
export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-surface-elevated animate-shimmer',
        'bg-[length:200%_100%]',
        'bg-gradient-to-r from-surface-elevated via-surface-border/50 to-surface-elevated',
        roundedMap[rounded],
        className,
      )}
    />
  )
}
