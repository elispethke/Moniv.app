import { Trash2, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useFormatters } from '@/hooks/useFormatters'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'
import type { Installment } from '@/types/installment'
import type { InstallmentScheduleItem } from '@/hooks/useInstallments'

interface InstallmentCardProps {
  installment: Installment
  currentInstallment: number
  schedule: InstallmentScheduleItem[]
  onDelete: () => void
}

export function InstallmentCard({ installment, currentInstallment, schedule, onDelete }: InstallmentCardProps) {
  const { formatCurrency, formatDate } = useFormatters()
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const perInstallment = installment.totalAmount / installment.totalInstallments
  const progress = ((currentInstallment - 1) / installment.totalInstallments) * 100
  const isComplete = currentInstallment > installment.totalInstallments

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/20">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{installment.description}</p>
                <p className="text-xs text-muted-foreground">
                  {t('pro.installment_label')}: {isComplete ? installment.totalInstallments : currentInstallment}/{installment.totalInstallments}
                  {' · '}{formatCurrency(perInstallment)}/mês
                </p>
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

            <div className="mt-3">
              <ProgressBar value={progress} variant={isComplete ? 'success' : 'default'} size="sm" />
              <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(installment.totalAmount)} {t('pro.total')}</span>
                <span>{isComplete ? t('pro.installment_complete') : `${progress.toFixed(0)}%`}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded((x) => !x)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? t('pro.hide_schedule') : t('pro.show_schedule')}
        </button>

        {expanded && (
          <div className="mt-2 space-y-1 rounded-xl bg-surface-elevated p-3">
            {schedule.map((item) => (
              <div
                key={item.installmentNumber}
                className={cn(
                  'flex items-center justify-between text-xs',
                  item.isPast ? 'text-muted-foreground line-through' : 'text-foreground'
                )}
              >
                <span>
                  {t('pro.installment_label')} {item.installmentNumber}/{item.totalInstallments}
                  {' — '}{formatDate(item.dueDate)}
                </span>
                <span className="font-medium">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
