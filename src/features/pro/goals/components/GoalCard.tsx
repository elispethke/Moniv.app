import { Trash2, Target, Clock } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { useFormatters } from '@/hooks/useFormatters'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'
import type { Goal } from '@/types/goal'

interface GoalCardProps {
  goal: Goal
  progress: number
  monthlyNeeded: number
  isOverdue: boolean
  onDelete: () => void
  onAddDeposit: () => void
}

export function GoalCard({ goal, progress, monthlyNeeded, isOverdue, onDelete, onAddDeposit }: GoalCardProps) {
  const { formatCurrency, formatDate } = useFormatters()
  const { t } = useTranslation()
  const isComplete = goal.currentAmount >= goal.targetAmount

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
              isComplete ? 'bg-success/20' : isOverdue ? 'bg-danger/20' : 'bg-primary/20'
            )}>
              <Target className={cn('h-4 w-4', isComplete ? 'text-accent' : isOverdue ? 'text-danger' : 'text-primary')} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{goal.name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDate(goal.deadline)}
                {isOverdue && !isComplete && (
                  <span className="text-danger font-medium ml-1">{t('pro.goal_overdue')}</span>
                )}
              </div>
            </div>
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

        <ProgressBar
          value={progress}
          variant={isComplete ? 'success' : isOverdue ? 'danger' : 'default'}
          size="md"
        />

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </span>
          <span className={cn('font-medium', isComplete ? 'text-accent' : 'text-foreground')}>
            {progress.toFixed(0)}%
          </span>
        </div>

        {!isComplete && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {t('pro.goal_monthly_needed')}: <span className="font-semibold text-foreground">{formatCurrency(monthlyNeeded)}/mês</span>
          </p>
        )}

        {isComplete && (
          <p className="mt-1.5 text-[11px] font-semibold text-accent">{t('pro.goal_achieved')}</p>
        )}

        {!isComplete && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            className="mt-3"
            onClick={onAddDeposit}
          >
            {t('pro.goal_add_deposit')}
          </Button>
        )}
      </CardBody>
    </Card>
  )
}
