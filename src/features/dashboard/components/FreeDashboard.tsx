import { ArrowUpCircle, ArrowDownCircle, Crown, Lock, Sparkles, Share2, BarChart2, Target, RefreshCw, Wallet } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { BalanceHero } from './BalanceHero'
import { RecentTransactions } from './RecentTransactions'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PeriodSelector } from '@/components/ui/PeriodSelector'
import { useTransactions } from '@/hooks/useTransactions'
import { useFormatters } from '@/hooks/useFormatters'
import { useShareSnapshot } from '@/hooks/useShareSnapshot'
import { useUIStore } from '@/store/useUIStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from '@/hooks/useTranslation'
import { toUserProfile } from '@/types/user'
import { filterByPeriod, calculateCategoryTotals } from '@/utils/calculations'

interface Props {
  showSuccessBanner: boolean
}

const PRO_BENEFITS = [
  { icon: <BarChart2 className="h-3.5 w-3.5" />, label: 'Gráficos de tendência e evolução mensal' },
  { icon: <Target className="h-3.5 w-3.5" />,    label: 'Metas financeiras com progresso visual' },
  { icon: <RefreshCw className="h-3.5 w-3.5" />, label: 'Gestão de despesas recorrentes' },
  { icon: <Wallet className="h-3.5 w-3.5" />,    label: 'Múltiplas carteiras e contas' },
]

export function FreeDashboard({ showSuccessBanner }: Props) {
  const { transactions } = useTransactions()
  const { user } = useAuthStore()
  const { preset, customFrom, customTo } = usePeriodStore()
  const { formatCurrency } = useFormatters()
  const { openModal } = useUIStore()
  const { t } = useTranslation()
  const { isCapturing, shareSnapshot } = useShareSnapshot()

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
        <div className="mt-1 flex shrink-0 items-center gap-2">
          <button
            onClick={shareSnapshot}
            disabled={isCapturing}
            className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2 text-xs font-semibold text-foreground-secondary transition-all hover:bg-surface hover:text-foreground active:scale-95 disabled:opacity-50"
          >
            <Share2 className="h-3.5 w-3.5" />
            {isCapturing ? t('snapshot.downloading') : t('snapshot.share')}
          </button>
          <PeriodSelector />
        </div>
      </div>

      <div className="space-y-4">
        {/* Main 2-column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT — balance + summary */}
          <div className="space-y-3">
            <BalanceHero summary={{ totalIncome, totalExpense, balance, savingsRate }} />

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
          </div>

          {/* RIGHT — chart + recent transactions */}
          <div className="space-y-3">
            {categoryTotals.length > 0 && (
              <Card>
                <CardBody className="p-4">
                  <p className="mb-3 text-sm font-semibold text-foreground">{t('dashboard.expenses_by_category')}</p>
                  <ExpensePieChart data={categoryTotals} />
                </CardBody>
              </Card>
            )}
            <RecentTransactions transactions={periodTx} />
          </div>
        </div>

        {/* Pro upgrade section — prominent, full width */}
        <div
          className="overflow-hidden rounded-3xl border border-primary/20"
          style={{ boxShadow: '0 0 40px 0 rgba(99,102,241,0.12)' }}
        >
          {/* Gradient header */}
          <div className="bg-gradient-primary p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/20">
                <Crown className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary-foreground">Moniv Pro</p>
                <p className="text-xs text-primary-foreground/70">Análise financeira avançada</p>
              </div>
              <div className="ml-auto">
                <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-bold text-primary-foreground">
                  a partir de €6/mês
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-surface p-5">
            {/* Benefits grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {PRO_BENEFITS.map((b) => (
                <div key={b.label} className="flex items-center gap-2.5 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2.5">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    {b.icon}
                  </span>
                  <p className="text-xs font-medium text-foreground leading-tight">{b.label}</p>
                </div>
              ))}
            </div>

            {/* Blurred chart preview */}
            <div className="relative overflow-hidden rounded-2xl border border-surface-border mb-4">
              <div className="pointer-events-none flex h-28 select-none items-end justify-around gap-1 px-4 pt-4 opacity-20 blur-sm">
                {[40, 80, 55, 100, 60, 120, 70, 90, 45, 110, 65, 95].map((bh, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{
                      height: `${bh * 0.75}px`,
                      background: i % 2 === 0
                        ? 'linear-gradient(to top, #10b981, #34d399)'
                        : 'linear-gradient(to top, #6366f1, #818cf8)',
                    }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface/90 backdrop-blur-sm p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow-primary">
                  <Lock className="h-4 w-4 text-primary-foreground" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">Gráficos de tendência e evolução bloqueados</p>
              </div>
            </div>

            {/* CTA */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => openModal('upgrade')}
              className="gap-2 shadow-glow-primary"
            >
              <Crown className="h-4 w-4" />
              Fazer Upgrade para Pro
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Cancele a qualquer momento · Sem contratos
            </p>
          </div>
        </div>

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
