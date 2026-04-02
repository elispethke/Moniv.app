import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { useFormatters } from '@/hooks/useFormatters'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'
import type { Budget } from '@/types/budget'

interface BudgetCardProps {
  budget: Budget
  spent: number
  progress: number
  status: 'ok' | 'warning' | 'danger'
  onDelete: () => void
}

export function BudgetCard({ budget, spent, progress, status, onDelete }: BudgetCardProps) {
  const { formatCurrency } = useFormatters()
  const { t } = useTranslation()

  const statusColor = { ok: 'text-accent', warning: 'text-warning', danger: 'text-danger' }[status]
  const statusBg   = { ok: 'bg-success/10', warning: 'bg-warning/10', danger: 'bg-danger/10' }[status]

  return (
    <Card className={cn('transition-all', statusBg)}>
      <CardBody className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {t(`categories.${budget.category}`)}
              </p>
              {status === 'danger' && <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-danger" />}
              {status === 'ok' && progress > 0 && <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-accent" />}
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              {t('pro.budget_month')}: {budget.month}
            </p>

            <ProgressBar value={progress} variant={status === 'ok' ? 'success' : status} size="md" />

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={cn('font-medium', statusColor)}>
                {formatCurrency(spent)} {t('pro.of')} {formatCurrency(budget.limit)}
              </span>
              <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
            </div>

            {status !== 'ok' && (
              <p className={cn('mt-1.5 text-[11px] font-medium', statusColor)}>
                {status === 'danger'
                  ? t('pro.budget_exceeded')
                  : t('pro.budget_near_limit')}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-danger"
            onClick={onDelete}
            aria-label={t('common.delete')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
