import { ArrowUpCircle, ArrowDownCircle, Sparkles, Crown, FileDown, TrendingUp, TrendingDown, Minus, Share2, Brain, AlertTriangle, Zap } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { BalanceHero } from './BalanceHero'
import { RecentTransactions } from './RecentTransactions'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { MonthlyBarChart } from '@/components/charts/MonthlyBarChart'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { CategoryBreakdown } from '@/components/charts/CategoryBreakdown'
import { SparklineCard } from '@/components/charts/SparklineCard'
import { BalanceLineChart } from '@/components/charts/BalanceLineChart'
import { DailySpendingChart } from '@/components/charts/DailySpendingChart'
import { PeriodSelector } from '@/components/ui/PeriodSelector'
import { Card, CardBody } from '@/components/ui/Card'
import { useTransactions } from '@/hooks/useTransactions'
import { useFormatters } from '@/hooks/useFormatters'
import { usePdfExport } from '@/hooks/usePdfExport'
import { useShareSnapshot } from '@/hooks/useShareSnapshot'
import { usePeriodStore } from '@/store/usePeriodStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from '@/hooks/useTranslation'
import { toUserProfile } from '@/types/user'
import { filterByPeriod, calculateCategoryTotals, getMonthlyData, getBalanceHistory } from '@/utils/calculations'
import type { Transaction } from '@/types/transaction'
import { cn } from '@/utils/cn'

interface Props {
  showSuccessBanner: boolean
}

function getDailySeries(txs: Transaction[], type: 'income' | 'expense'): number[] {
  const map = new Map<string, number>()
  for (const t of txs) {
    if (t.type === type) map.set(t.date, (map.get(t.date) ?? 0) + t.amount)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => v)
}

// ── Insight metric card ────────────────────────────────────────────────────────
function InsightCard({
  label,
  value,
  trend,
  trendInverse = false,
  accent,
}: {
  label: string
  value: string
  trend: number | null
  trendInverse?: boolean
  accent: string
}) {
  const isPositive = trend !== null ? (trendInverse ? trend < 0 : trend > 0) : null
  return (
    <div className={cn('rounded-2xl border p-4', accent)}>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-extrabold text-foreground">{value}</p>
      {trend !== null && (
        <div className={cn(
          'mt-1.5 flex items-center gap-1 text-[11px] font-semibold',
          isPositive ? 'text-accent' : 'text-danger'
        )}>
          {isPositive
            ? <TrendingUp className="h-3 w-3" />
            : trend === 0
            ? <Minus className="h-3 w-3 text-muted-foreground" />
            : <TrendingDown className="h-3 w-3" />
          }
          {Math.abs(trend).toFixed(1)}% vs mês anterior
        </div>
      )}
    </div>
  )
}

// ── Chart section wrapper ──────────────────────────────────────────────────────
function ChartSection({
  title,
  sub,
  glow,
  children,
}: {
  title: string
  sub?: string
  glow?: boolean
  children: React.ReactNode
}) {
  return (
    <Card
      glow={glow ? 'primary' : 'none'}
      className="overflow-hidden"
    >
      <div className="px-4 pt-4 pb-3 border-b border-surface-border/50 bg-gradient-to-b from-surface-elevated/60 to-transparent">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-full w-1 flex-shrink-0 rounded-full self-stretch min-h-[2rem] bg-gradient-primary" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-primary">
                <Crown className="h-2.5 w-2.5" /> Pro
              </span>
            </div>
            {sub && <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{sub}</p>}
          </div>
        </div>
      </div>
      <CardBody className="p-4">{children}</CardBody>
    </Card>
  )
}

// ── Narrative insight block ────────────────────────────────────────────────────
function NarrativeInsight({
  icon,
  text,
  sub,
  variant = 'default',
}: {
  icon: React.ReactNode
  text: React.ReactNode
  sub?: string
  variant?: 'default' | 'positive' | 'warning'
}) {
  const cardCls = {
    default: 'border-surface-border bg-surface',
    positive: 'border-accent/20 bg-accent/5',
    warning:  'border-warning/20 bg-warning/5',
  }[variant]
  const iconCls = {
    default: 'bg-primary/15 text-primary',
    positive: 'bg-accent/15 text-accent',
    warning:  'bg-warning/15 text-warning',
  }[variant]
  return (
    <div className={cn('rounded-2xl border p-4', cardCls)}>
      <div className="flex items-start gap-3">
        <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl', iconCls)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-snug text-foreground">{text}</p>
          {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

// ── Pro Dashboard ──────────────────────────────────────────────────────────────
export function ProDashboard({ showSuccessBanner }: Props) {
  const { transactions } = useTransactions()
  const { user } = useAuthStore()
  const { preset, customFrom, customTo } = usePeriodStore()
  const { t } = useTranslation()
  const { formatCurrency, formatPercentage } = useFormatters()

  const profile = user ? toUserProfile(user) : null
  const h = new Date().getHours()
  const greeting =
    h < 12 ? t('dashboard.greeting_morning')
    : h < 18 ? t('dashboard.greeting_afternoon')
    : t('dashboard.greeting_evening')

  // ── Period data ─────────────────────────────────────────────────────────────
  const periodTx     = filterByPeriod(transactions, preset, customFrom, customTo)
  const totalIncome  = periodTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = periodTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  // ── Last month comparison ───────────────────────────────────────────────────
  const lastMonthTx      = filterByPeriod(transactions, 'last-month')
  const lastMonthIncome  = lastMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const lastMonthExpense = lastMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const showTrend        = preset === 'this-month'
  const incomeTrend  = showTrend && lastMonthIncome  > 0 ? ((totalIncome  - lastMonthIncome)  / lastMonthIncome)  * 100 : null
  const expenseTrend = showTrend && lastMonthExpense > 0 ? ((totalExpense - lastMonthExpense) / lastMonthExpense) * 100 : null
  const lastSavings  = lastMonthIncome > 0 ? ((lastMonthIncome - lastMonthExpense) / lastMonthIncome) * 100 : 0
  const savingsTrend = showTrend && lastMonthIncome > 0 ? savingsRate - lastSavings : null

  // ── Chart data ──────────────────────────────────────────────────────────────
  const categoryTotals = calculateCategoryTotals(periodTx)
  const monthlyData    = getMonthlyData(periodTx)

  // ── Sparklines ──────────────────────────────────────────────────────────────
  const incomeSparkData  = getDailySeries(periodTx, 'income')
  const expenseSparkData = getDailySeries(periodTx, 'expense')
  const savingsSparkData = monthlyData.map((d) =>
    d.income > 0 ? ((d.income - d.expense) / d.income) * 100 : 0
  )

  // ── Biggest expense category ────────────────────────────────────────────────
  const topCategory = categoryTotals[0]

  // ── Extended metrics ────────────────────────────────────────────────────────
  const balanceHistory  = getBalanceHistory(periodTx)
  const expenseDays     = new Set(periodTx.filter((t) => t.type === 'expense').map((t) => t.date)).size
  const avgDailySpend   = expenseDays > 0 ? totalExpense / expenseDays : 0
  const topTransaction  = [...periodTx]
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)[0]

  // ── Period label for PDF ────────────────────────────────────────────────────
  const MONTH_NAMES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const now = new Date()
  const periodLabelMap: Record<string, string> = {
    'this-month':    `${MONTH_NAMES_PT[now.getMonth()]} ${now.getFullYear()}`,
    'last-month':    (() => { const d = new Date(now.getFullYear(), now.getMonth() - 1, 1); return `${MONTH_NAMES_PT[d.getMonth()]} ${d.getFullYear()}` })(),
    'last-3-months': 'Últimos 3 meses',
    'this-year':     `${now.getFullYear()}`,
    'all-time':      'Todos os períodos',
    'custom':        customFrom && customTo ? `${customFrom} – ${customTo}` : 'Período personalizado',
  }
  const periodLabel = periodLabelMap[preset] ?? preset

  const { isCapturing, shareSnapshot } = useShareSnapshot()

  const { exportPdf, isExporting } = usePdfExport({
    periodLabel,
    transactions: periodTx,
    categoryTotals,
    totalIncome,
    totalExpense,
    balance,
    savingsRate,
  })

  return (
    <PageLayout>
      {/* Ambient glow decorators */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -left-16 h-56 w-56 rounded-full bg-accent/8 blur-3xl" />
      </div>

      {/* Success banner */}
      {showSuccessBanner && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm shadow-glow-accent">
          <Sparkles className="h-5 w-5 flex-shrink-0 text-accent" />
          <span className="font-medium text-foreground">{t('pro.payment_success')}</span>
        </div>
      )}

      {/* Pro indicator strip */}
      <div className="mb-5 flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-primary">
          <Crown className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-xs font-bold text-primary">Moniv Pro</span>
        <span className="text-xs text-muted-foreground">— Acesso completo ativo</span>
      </div>

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
          <button
            onClick={exportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95 disabled:opacity-50"
          >
            <FileDown className="h-3.5 w-3.5" />
            {isExporting ? 'A gerar…' : 'PDF'}
          </button>
          <PeriodSelector />
        </div>
      </div>

      <div className="space-y-4">
        {/* Row 1: 2-column on lg — hero/KPIs left, trend chart right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT — balance + sparklines */}
          <div className="space-y-3">
            <BalanceHero summary={{ totalIncome, totalExpense, balance, savingsRate }} />

            {/* KPI Sparkline row — 3-col grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <SparklineCard
                variant="income"
                label={t('dashboard.income')}
                value={formatCurrency(totalIncome)}
                icon={<ArrowUpCircle className="h-3.5 w-3.5" />}
                valueColor="text-accent"
                trend={incomeTrend}
                sparkData={incomeSparkData}
                sparkColor="#10b981"
              />
              <SparklineCard
                variant="expense"
                label={t('dashboard.expenses')}
                value={formatCurrency(totalExpense)}
                icon={<ArrowDownCircle className="h-3.5 w-3.5" />}
                valueColor="text-danger"
                trend={expenseTrend}
                trendInverse
                sparkData={expenseSparkData}
                sparkColor="#ef4444"
              />
              <SparklineCard
                variant="savings"
                label={t('dashboard.savings_rate')}
                value={formatPercentage(savingsRate, 0)}
                icon={<Sparkles className="h-3.5 w-3.5" />}
                valueColor="text-primary"
                trend={savingsTrend}
                sparkData={savingsSparkData}
                sparkColor="#6366f1"
              />
            </div>
          </div>

          {/* RIGHT — trend chart (primary analysis) */}
          <div>
            {monthlyData.length >= 2 ? (
              <ChartSection
                title="Receitas & Despesas"
                sub="Evolução mensal comparativa"
                glow
              >
                <TrendLineChart data={monthlyData} />
              </ChartSection>
            ) : (
              /* Fallback: insights panel when no trend data yet */
              showTrend && (incomeTrend !== null || expenseTrend !== null || savingsTrend !== null) ? (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Insights financeiros
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <InsightCard
                      label="Taxa de poupança"
                      value={formatPercentage(savingsRate, 1)}
                      trend={savingsTrend}
                      accent="border-primary/20 bg-primary/5"
                    />
                    <InsightCard
                      label="Despesas"
                      value={formatCurrency(totalExpense)}
                      trend={expenseTrend}
                      trendInverse
                      accent="border-danger/20 bg-danger/5"
                    />
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>

        {/* Financial insights panel — shown below when trend chart is visible */}
        {monthlyData.length >= 2 && showTrend && (incomeTrend !== null || expenseTrend !== null || savingsTrend !== null) && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Insights financeiros
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <InsightCard
                label="Taxa de poupança"
                value={formatPercentage(savingsRate, 1)}
                trend={savingsTrend}
                accent="border-primary/20 bg-primary/5"
              />
              <InsightCard
                label="Despesas"
                value={formatCurrency(totalExpense)}
                trend={expenseTrend}
                trendInverse
                accent="border-danger/20 bg-danger/5"
              />
              {topCategory && (
                <div className="col-span-2 rounded-2xl border border-surface-border bg-surface p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Maior categoria de despesa</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{t(`categories.${topCategory.category}`)}</p>
                    <p className="text-sm font-extrabold text-danger">{formatCurrency(topCategory.total)}</p>
                  </div>
                  {totalExpense > 0 && (
                    <div className="mt-2 h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-danger transition-all"
                        style={{ width: `${Math.min((topCategory.total / totalExpense) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Row 2: Analytics grid — 2-col on md+ */}
        {categoryTotals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartSection
              title={t('dashboard.expenses_by_category')}
              sub={`${categoryTotals.length} categorias · ${formatCurrency(totalExpense)}`}
            >
              <ExpensePieChart data={categoryTotals} />
            </ChartSection>

            <ChartSection
              title="Breakdown por Categoria"
              sub="Distribuição percentual das despesas"
            >
              <CategoryBreakdown data={categoryTotals} />
            </ChartSection>
          </div>
        )}

        {/* Row 3: Monthly bar chart — full width */}
        {monthlyData.length > 1 && (
          <ChartSection
            title={t('dashboard.monthly_evolution')}
            sub="Receitas vs despesas por mês"
            glow
          >
            <MonthlyBarChart data={monthlyData} />
          </ChartSection>
        )}

        {/* Row 4: Balance history + Daily spending — 2-col grid */}
        {(balanceHistory.length >= 2 || periodTx.filter((t) => t.type === 'expense').length >= 2) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {balanceHistory.length >= 2 && (
              <ChartSection
                title={t('dashboard.balance_over_time')}
                sub="Evolução acumulada do saldo"
                glow
              >
                <BalanceLineChart data={balanceHistory} />
              </ChartSection>
            )}
            {periodTx.filter((t) => t.type === 'expense').length >= 2 && (
              <ChartSection
                title="Padrão de Gastos Diários"
                sub="Pico e distribuição temporal das despesas"
              >
                <DailySpendingChart transactions={periodTx} />
              </ChartSection>
            )}
          </div>
        )}

        {/* Row 5: Extended KPI grid — 2-col → 4-col at xl */}
        {periodTx.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Métricas do período
            </p>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
              <InsightCard
                label="Gasto médio/dia"
                value={formatCurrency(avgDailySpend)}
                trend={null}
                accent="border-secondary/20 bg-secondary/5"
              />
              <InsightCard
                label="Saldo do período"
                value={formatCurrency(balance)}
                trend={null}
                accent={balance >= 0 ? 'border-accent/20 bg-accent/5' : 'border-danger/20 bg-danger/5'}
              />
              <InsightCard
                label="Transações"
                value={String(periodTx.length)}
                trend={null}
                accent="border-surface-border bg-surface"
              />
              <InsightCard
                label="Categorias"
                value={String(categoryTotals.length)}
                trend={null}
                accent="border-surface-border bg-surface"
              />
            </div>
          </div>
        )}

        {/* Row 6: Narrative insight blocks — 1→2→3 cols */}
        {periodTx.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Análise inteligente
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {savingsRate >= 20 && (
                <NarrativeInsight
                  icon={<Sparkles className="h-4 w-4" />}
                  text={`Taxa de poupança de ${formatPercentage(savingsRate, 0)} — acima dos 20% recomendados`}
                  sub="Excelente disciplina financeira"
                  variant="positive"
                />
              )}
              {savingsRate > 0 && savingsRate < 20 && (
                <NarrativeInsight
                  icon={<AlertTriangle className="h-4 w-4" />}
                  text={`Taxa de poupança de ${formatPercentage(savingsRate, 0)} — abaixo dos 20% recomendados`}
                  sub="Tente reduzir despesas variáveis para atingir a meta"
                  variant="warning"
                />
              )}
              {topCategory && (
                <NarrativeInsight
                  icon={<Brain className="h-4 w-4" />}
                  text={<>Maior categoria de gasto: <span className="font-bold text-foreground">{t(`categories.${topCategory.category}`)}</span> ({topCategory.percentage.toFixed(0)}%)</>}
                  sub="Monitorar esta categoria pode ajudar a equilibrar o orçamento"
                />
              )}
              {savingsTrend !== null && savingsTrend > 5 && (
                <NarrativeInsight
                  icon={<Zap className="h-4 w-4" />}
                  text={`Taxa de poupança melhorou ${Math.abs(savingsTrend).toFixed(1)}% vs mês anterior`}
                  sub="Continue assim — a tendência é positiva"
                  variant="positive"
                />
              )}
              {savingsTrend !== null && savingsTrend < -5 && (
                <NarrativeInsight
                  icon={<AlertTriangle className="h-4 w-4" />}
                  text={`Taxa de poupança caiu ${Math.abs(savingsTrend).toFixed(1)}% vs mês anterior`}
                  sub="Atenção: revise as despesas deste mês"
                  variant="warning"
                />
              )}
              {topTransaction && (
                <NarrativeInsight
                  icon={<Brain className="h-4 w-4" />}
                  text={<>Maior despesa: <span className="font-bold text-foreground">{topTransaction.description}</span> — {formatCurrency(topTransaction.amount)}</>}
                  sub={t(`categories.${topTransaction.category}`)}
                />
              )}
              {avgDailySpend > 0 && (
                <NarrativeInsight
                  icon={<Zap className="h-4 w-4" />}
                  text={`Gasto médio diário de ${formatCurrency(avgDailySpend)}`}
                  sub={`Com base em ${expenseDays} dia${expenseDays !== 1 ? 's' : ''} com despesas no período`}
                />
              )}
            </div>
          </div>
        )}

        {/* Recent transactions */}
        <RecentTransactions transactions={periodTx} />

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
