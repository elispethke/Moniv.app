import { ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Transaction } from '@/types/transaction'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { useTranslation } from '@/hooks/useTranslation'
import { useFormatters } from '@/hooks/useFormatters'
import { cn } from '@/utils/cn'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { t } = useTranslation()
  const { formatCurrency, formatDateShort } = useFormatters()
  const recent = transactions.slice(0, 5)

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <h3 className="text-sm font-semibold text-foreground">
          {t('dashboard.recent_transactions')}
        </h3>
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
        >
          {t('dashboard.view_all')}
          <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardBody className="p-4">
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('dashboard.no_recent')}
          </p>
        ) : (
          <ul className="space-y-3">
            {recent.map((tx) => (
              <li key={tx.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
                    tx.type === 'income' ? 'bg-success/20' : 'bg-danger/20'
                  )}
                >
                  {tx.type === 'income' ? (
                    <ArrowUpRight className="h-4 w-4 text-accent" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-danger" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{t(`categories.${tx.category}`)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      tx.type === 'income' ? 'text-accent' : 'text-danger'
                    )}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateShort(tx.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
