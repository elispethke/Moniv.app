import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface SummaryCardProps {
  title: string
  value: string
  icon: ReactNode
  trend?: number
  variant?: 'default' | 'income' | 'expense' | 'balance'
  className?: string
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary-light',
    valueColor: 'text-foreground',
  },
  income: {
    iconBg: 'bg-success/20',
    iconColor: 'text-accent-light',
    valueColor: 'text-accent',
  },
  expense: {
    iconBg: 'bg-danger/20',
    iconColor: 'text-danger',
    valueColor: 'text-danger',
  },
  balance: {
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary-light',
    valueColor: 'text-foreground',
  },
}

export function SummaryCard({ title, value, icon, trend, variant = 'default', className }: SummaryCardProps) {
  const styles = variantStyles[variant]
  const isPositiveTrend = trend !== undefined && trend >= 0

  return (
    <Card className={cn('hover:border-surface-elevated transition-all duration-300', className)}>
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', styles.iconBg)}>
            <div className={styles.iconColor}>{icon}</div>
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                isPositiveTrend
                  ? 'bg-success/20 text-accent-light'
                  : 'bg-danger/20 text-danger'
              )}
            >
              {isPositiveTrend ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={cn('mt-1 text-xl font-bold tracking-tight', styles.valueColor)}>{value}</p>
        </div>
      </CardBody>
    </Card>
  )
}
