import { ArrowUpCircle, ArrowDownCircle, Crown, Lock, Sparkles } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { BalanceHero } from './BalanceHero'
import { RecentTransactions } from './RecentTransactions'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PeriodSelector } from '@/components/ui/PeriodSelector'
import { useTransactions } from '@/hooks/useTransactions'
import { useFormatters } from '@/hooks/useFormatters'
import { useUIStore } from '@/store/useUIStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from '@/hooks/useTranslation'
import { toUserProfile } from '@/types/user'
import { filterByPeriod, calculateCategoryTotals } from '@/utils/calculations'

interface Props {
  showSuccessBanner: boolean
}

export function FreeDashboard({ showSuccessBanner }: Props) {
  const { transactions } = useTransactions()
  const { user } = useAuthStore()
  const { preset, customFrom, customTo } = usePeriodStore()
  const { formatCurrency } = useFormatters()
  const { openModal } = useUIStore()
  const { t } = useTranslation()

  const profile = user ? toUserProfile(user) : null
  const h = new Date().getHours()
  const greeting =
    h < 12 ? t('dashboard.greeting_morning')
    : h < 18 ? t('dashboard.greeting_afternoon')
    : t('dashboard.greeting_evening')

  const periodTx     = filterByPeriod(transactions, preset, customFrom, customTo)
  const totalIncome  = periodTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = periodTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
  const categoryTotals = calculateCategoryTotals(periodTx)

  return (
    <PageLayout>
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/6 blur-3xl" />
      </div>

      {/* Success banner */}
      {showSuccessBanner && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm shadow-glow-accent">
          <Sparkles className="h-5 w-5 flex-shrink-0 text-accent" />
          <span className="font-medium text-foreground">{t('pro.payment_success')}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            {greeting}
          </p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-foreground tracking-tight">
            {profile?.fullName.split(' ')[0] ?? 'Usuário'} 👋
          </h1>
        </div>
        <div className="mt-1">
          <PeriodSelector />
        </div>
      </div>

      <div className="space-y-4">
        {/* Balance hero */}
        <BalanceHero summary={{ totalIncome, totalExpense, balance, savingsRate }} />

        {/* Simple income/expense summary row */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15">
                  <ArrowUpCircle className="h-4 w-4 text-accent" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{t('dashboard.income')}</p>
              </div>
              <p className="text-lg font-extrabold text-accent">{formatCurrency(totalIncome)}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger/15">
                  <ArrowDownCircle className="h-4 w-4 text-danger" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{t('dashboard.expenses')}</p>
              </div>
              <p className="text-lg font-extrabold text-danger">{formatCurrency(totalExpense)}</p>
            </CardBody>
          </Card>
        </div>

        {/* Expense pie chart */}
        {categoryTotals.length > 0 && (
          <Card>
            <CardBody className="p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">{t('dashboard.expenses_by_category')}</p>
              <ExpensePieChart data={categoryTotals} />
            </CardBody>
          </Card>
        )}

        {/* Recent transactions */}
        <RecentTransactions transactions={periodTx} />

        {/* Pro upgrade teaser */}
        <Card className="overflow-hidden border-primary/20" style={{ boxShadow: '0 0 28px 0 rgba(99,102,241,0.1)' }}>
          <CardBody className="p-0">
            {/* Blurred preview */}
            <div className="relative overflow-hidden">
              <div className="pointer-events-none flex h-28 select-none items-end justify-around gap-1 px-4 pt-4 opacity-20 blur-sm">
                {[40, 80, 55, 100, 60, 120, 70, 90, 45, 110, 65, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{
                      height: `${h * 0.75}px`,
                      background: i % 2 === 0
                        ? 'linear-gradient(to top, #10b981, #34d399)'
                        : 'linear-gradient(to top, #6366f1, #818cf8)',
                    }}
                  />
                ))}
              </div>
              {/* Lock overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/90 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow-primary">
                  <Lock className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Análise avançada</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Gráficos de tendências, breakdown e evolução mensal
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openModal('upgrade')}
                  className="gap-1.5 text-xs shadow-glow-primary"
                >
                  <Crown className="h-3.5 w-3.5" />
                  Upgrade para Pro — €6/mês
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Empty state */}
        {periodTx.length === 0 && (
          <div className="rounded-2xl border border-surface-border bg-surface p-10 text-center">
            <p className="text-sm font-semibold text-foreground mb-1">{t('dashboard.no_recent')}</p>
            <p className="text-xs text-muted-foreground">{t('transactions.add_first')}</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
