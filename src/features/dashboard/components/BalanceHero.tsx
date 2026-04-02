import { Wallet, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { TransactionSummary } from '@/types/transaction'
import { useTranslation } from '@/hooks/useTranslation'
import { useFormatters } from '@/hooks/useFormatters'
import { cn } from '@/utils/cn'

interface BalanceHeroProps {
  summary: TransactionSummary
}

export function BalanceHero({ summary }: BalanceHeroProps) {
  const [hidden, setHidden] = useState(false)
  const isPositive = summary.balance >= 0
  const { t } = useTranslation()
  const { formatCurrency, formatPercentage } = useFormatters()

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-6 shadow-glow-primary">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/5 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-secondary/30 blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary-foreground/70" />
            <span className="text-sm font-medium text-primary-foreground/70">
              {t('dashboard.balance_label')}
            </span>
          </div>
          <button
            onClick={() => setHidden((h) => !h)}
            className="rounded-lg p-1.5 text-primary-foreground/70 hover:bg-primary-foreground/10 transition-colors"
            aria-label={hidden ? t('dashboard.show_balance') : t('dashboard.hide_balance')}
          >
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-3">
          <p className="text-3xl font-extrabold text-primary-foreground tracking-tight">
            {hidden ? '••••••' : formatCurrency(summary.balance)}
          </p>
          <div
            className={cn(
              'mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
              isPositive ? 'bg-success/30 text-accent-light' : 'bg-danger/30 text-danger-foreground'
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', isPositive ? 'bg-accent' : 'bg-danger')} />
            {isPositive ? t('dashboard.positive_balance') : t('dashboard.negative_balance')}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-primary-foreground/10 p-3">
            <p className="text-[10px] font-medium text-primary-foreground/60 uppercase tracking-wider">
              {t('dashboard.income')}
            </p>
            <p className="mt-0.5 text-base font-bold text-primary-foreground">
              {hidden ? '••••' : formatCurrency(summary.totalIncome)}
            </p>
          </div>
          <div className="rounded-xl bg-primary-foreground/10 p-3">
            <p className="text-[10px] font-medium text-primary-foreground/60 uppercase tracking-wider">
              {t('dashboard.expenses')}
            </p>
            <p className="mt-0.5 text-base font-bold text-primary-foreground">
              {hidden ? '••••' : formatCurrency(summary.totalExpense)}
            </p>
          </div>
        </div>

        {summary.savingsRate > 0 && (
          <div className="mt-3 flex items-center justify-between text-xs text-primary-foreground/70">
            <span>{t('dashboard.savings_rate')}</span>
            <span className="font-semibold text-accent-light">
              {formatPercentage(summary.savingsRate)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
