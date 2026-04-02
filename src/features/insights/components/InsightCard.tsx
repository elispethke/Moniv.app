import type { ReactNode } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface InsightCardProps {
  icon: ReactNode
  title: string
  body: string
  variant?: 'info' | 'success' | 'warning' | 'danger'
  tag?: string
}

const variantStyles = {
  info: { border: 'border-primary/30', iconBg: 'bg-primary/20', iconColor: 'text-primary-light', tag: 'bg-primary/20 text-primary-light' },
  success: { border: 'border-success/30', iconBg: 'bg-success/20', iconColor: 'text-accent-light', tag: 'bg-success/20 text-accent-light' },
  warning: { border: 'border-warning/30', iconBg: 'bg-warning/20', iconColor: 'text-warning', tag: 'bg-warning/20 text-warning' },
  danger: { border: 'border-danger/30', iconBg: 'bg-danger/20', iconColor: 'text-danger', tag: 'bg-danger/20 text-danger' },
}

export function InsightCard({ icon, title, body, variant = 'info', tag }: InsightCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn('border', styles.border)}>
      <CardBody className="p-4">
        <div className="flex gap-3">
          <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl', styles.iconBg)}>
            <div className={styles.iconColor}>{icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              {tag && (
                <span className={cn('flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', styles.tag)}>
                  {tag}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
