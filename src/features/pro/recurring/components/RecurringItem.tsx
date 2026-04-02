import { Trash2, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useFormatters } from '@/hooks/useFormatters'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'
import type { RecurringTransaction } from '@/types/recurring'

interface RecurringItemProps {
  item: RecurringTransaction
  onDelete: () => void
}

export function RecurringItem({ item, onDelete }: RecurringItemProps) {
  const { formatCurrency, formatDate } = useFormatters()
  const { t } = useTranslation()
  const isIncome = item.type === 'income'

  return (
    <div className="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-surface-elevated">
      <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl', isIncome ? 'bg-success/20' : 'bg-danger/20')}>
        {isIncome ? <ArrowUpRight className="h-5 w-5 text-accent" /> : <ArrowDownLeft className="h-5 w-5 text-danger" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{item.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <RefreshCw className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">
            {item.frequency === 'monthly' ? t('pro.monthly') : t('pro.weekly')}
            {' · '}{t('pro.next')}: {formatDate(item.nextDate)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className={cn('text-sm font-semibold', isIncome ? 'text-accent' : 'text-danger')}>
          {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-danger"
          onClick={onDelete}
          aria-label={t('common.delete')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
