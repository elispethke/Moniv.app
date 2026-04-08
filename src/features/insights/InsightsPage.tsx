import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Award,
  PiggyBank,
  Lock,
  Sparkles,
  Brain,
  Zap,
  ArrowUpCircle,
  ArrowDownCircle,
  Minus,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { InsightCard } from './components/InsightCard'
import { AIAssistant } from './components/AIAssistant'
import { Card, CardBody } from '@/components/ui/Card'
import { UpgradeCard } from '@/components/ui/UpgradeCard'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { MonthlyBarChart } from '@/components/charts/MonthlyBarChart'
import { BalanceLineChart } from '@/components/charts/BalanceLineChart'
import { PeriodSelector } from '@/components/ui/PeriodSelector'
import { useTransactions } from '@/hooks/useTransactions'
import { useTranslation } from '@/hooks/useTranslation'
import { useFormatters } from '@/hooks/useFormatters'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { useUIStore } from '@/store/useUIStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { FEATURES } from '@/lib/features'
import {
  filterByPeriod,
  calculateCategoryTotals,
  calculateIncomeCategoryTotals,
  getMonthlyData,
  getBalanceHistory,
} from '@/utils/calculations'
import { cn } from '@/utils/cn'

// ── KPI metric card ────────────────────────────────────────────────────────────
function KPICard({
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
      <p className="text-[11px] font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-extrabold text-foreground truncate">{value}</p>
      {trend !== null && (
        <div
          className={cn(
            'mt-1.5 flex items-center gap-1 text-[10px] font-semibold',
            isPositive ? 'text-accent' : 'text-danger'
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : trend === 0 ? (
            <Minus className="h-3 w-3 text-muted-foreground" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
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
  children,
}: {
  title: string
  sub?: string
  children: ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-surface-border/50 bg-gradient-to-b from-surface-elevated/60 to-transparent">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-1 flex-shrink-0 rounded-full self-stretch min-h-[2rem] bg-gradient-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
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
  icon: ReactNode
  text: ReactNode
  sub?: string
  variant?: 'default' | 'positive' | 'warning'
}) {
  const cardCls = {
    default: 'border-surface-border bg-surface',
    positive: 'border-accent/20 bg-accent/5',
    warning: 'border-warning/20 bg-warning/5',
  }[variant]
  const iconCls = {
    default: 'bg-primary/15 text-primary',
    positive: 'bg-accent/15 text-accent',
    warning: 'bg-warning/15 text-warning',
  }[variant]
  return (
    <div className={cn('rounded-2xl border p-4', cardCls)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl',
            iconCls
          )}
        >
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

// ── Locked chart preview for free users ───────────────────────────────────────
function LockedChartPreview() {
  const { openModal } = useUIStore()
  return (
    <div className="relative rounded-2xl border border-primary/20 bg-surface overflow-hidden">
      {/* Decorative mock bar chart */}
      <div
        className="h-56 pointer-events-none select-none flex items-end justify-center gap-2 px-8 pb-6 opacity-10"
        aria-hidden
      >
        {[35, 60, 45, 80, 55, 40, 70, 50, 65, 30, 75, 48].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-lg bg-gradient-primary"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      {/* Two mock donut circles */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-8 pointer-events-none select-none opacity-10"
        aria-hidden
      >
        {[80, 60].map((size, i) => (
          <div
            key={i}
            className="rounded-full border-8 border-primary"
            style={{ width: size, height: size }}
          />
        ))}
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/85 backdrop-blur-sm p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 mb-3">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground mb-1">Análise Avançada Pro</p>
        <p className="text-xs text-muted-foreground mb-5 text-center max-w-[260px]">
          Desbloqueie gráficos de distribuição de receitas e despesas, evolução mensal, tendências e inteligência financeira
        </p>
        <button
          onClick={() => openModal('upgrade')}
          className="flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow-primary hover:opacity-90 active:scale-95 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Conhecer o Pro
        </button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export function InsightsPage() {
  const { transactions } = useTransactions()
  const { t } = useTranslation()
  const { formatCurrency, formatPercentage } = useFormatters()
  const hasProAccess = useFeatureAccess(FEATURES.BUDGETS)
  const { preset, customFrom, customTo } = usePeriodStore()

  // Period-filtered transactions
  const periodTx    = filterByPeriod(transactions, preset, customFrom, customTo)
  const lastMonthTx = filterByPeriod(transactions, 'last-month')

  // Current period metrics
  const totalIncome  = periodTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = periodTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  // Last-month comparison (only shown when viewing this month)
  const showTrend    = preset === 'this-month'
  const lastInc      = lastMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const lastExp      = lastMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const incomeTrend  = showTrend && lastInc > 0 ? ((totalIncome  - lastInc) / lastInc)  * 100 : null
  const expenseTrend = showTrend && lastExp > 0 ? ((totalExpense - lastExp) / lastExp) * 100 : null
  const lastSavings  = lastInc > 0 ? ((lastInc - lastExp) / lastInc) * 100 : 0
  const savingsTrend = showTrend && lastInc > 0 ? savingsRate - lastSavings : null

  // Chart data
  const expenseTotals  = calculateCategoryTotals(periodTx)
  const incomeTotals   = calculateIncomeCategoryTotals(periodTx)
  const monthlyData    = getMonthlyData(transactions)
  const balanceHistory = getBalanceHistory(periodTx)

  const topExpense = expenseTotals[0]

  // ── Text insight cards (preserved from original) ───────────────────────────
  const insights: {
    icon: ReactNode
    title: string
    body: string
    variant: 'info' | 'success' | 'warning' | 'danger'
    tag: string
  }[] = []

  if (savingsRate >= 20) {
    insights.push({
      icon: <Award className="h-5 w-5" />,
      title: t('insights.savings_achieved_title'),
      body: t('insights.savings_achieved_body', { rate: formatPercentage(savingsRate) }),
      variant: 'success',
      tag: t('insights.tags.goal'),
    })
  } else if (totalIncome > 0) {
    insights.push({
      icon: <Target className="h-5 w-5" />,
      title: t('insights.savings_low_title'),
      body: t('insights.savings_low_body', { rate: formatPercentage(savingsRate) }),
      variant: 'warning',
      tag: t('insights.tags.tip'),
    })
  }
  if (topExpense) {
    insights.push({
      icon: <TrendingUp className="h-5 w-5" />,
      title: t('insights.top_expense_title'),
      body: t('insights.top_expense_body', {
        category: t(`categories.${topExpense.category}`),
        pct: formatPercentage(topExpense.percentage),
      }),
      variant: 'info',
      tag: t('insights.tags.analysis'),
    })
  }
  if (balance < 0) {
    insights.push({
      icon: <AlertTriangle className="h-5 w-5" />,
      title: t('insights.negative_balance_title'),
      body: t('insights.negative_balance_body', { amount: formatCurrency(Math.abs(balance)) }),
      variant: 'danger',
      tag: t('insights.tags.alert'),
    })
  }
  if (totalIncome > 0 && balance > 0) {
    insights.push({
      icon: <PiggyBank className="h-5 w-5" />,
      title: t('insights.invest_title'),
      body: t('insights.invest_body', { amount: formatCurrency(balance) }),
      variant: 'success',
      tag: t('insights.tags.opportunity'),
    })
  }

  return (
    <PageLayout
      title={t('insights.title')}
      subtitle={t('insights.subtitle')}
      action={hasProAccess ? <PeriodSelector /> : undefined}
    >
      <div className="space-y-5">

        {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
        {periodTx.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard
              label={t('dashboard.income')}
              value={formatCurrency(totalIncome)}
              trend={incomeTrend}
              accent="border-accent/20 bg-accent/5"
            />
            <KPICard
              label={t('dashboard.expenses')}
              value={formatCurrency(totalExpense)}
              trend={expenseTrend}
              trendInverse
              accent="border-danger/20 bg-danger/5"
            />
            <KPICard
              label="Saldo"
              value={formatCurrency(balance)}
              trend={null}
              accent={
                balance >= 0
                  ? 'border-accent/20 bg-accent/5'
                  : 'border-danger/20 bg-danger/5'
              }
            />
            <KPICard
              label={t('dashboard.savings_rate')}
              value={formatPercentage(savingsRate, 0)}
              trend={savingsTrend}
              accent="border-primary/20 bg-primary/5"
            />
          </div>
        )}

        {/* ── Pro section ───────────────────────────────────────────────────── */}
        {hasProAccess ? (
          <>
            {/* Row 1: Two donut charts */}
            {(incomeTotals.length > 0 || expenseTotals.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChartSection
                  title="Distribuição de Receitas"
                  sub={`${incomeTotals.length} categoria${incomeTotals.length !== 1 ? 's' : ''} · ${formatCurrency(totalIncome)}`}
                >
                  <ExpensePieChart
                    data={incomeTotals}
                    noDataMessage="Sem receitas no período"
                  />
                </ChartSection>
                <ChartSection
                  title="Distribuição de Despesas"
                  sub={`${expenseTotals.length} categoria${expenseTotals.length !== 1 ? 's' : ''} · ${formatCurrency(totalExpense)}`}
                >
                  <ExpensePieChart data={expenseTotals} />
                </ChartSection>
              </div>
            )}

            {/* Row 2: Trend line chart — income vs expenses */}
            {monthlyData.length >= 2 && (
              <ChartSection
                title="Receitas & Despesas"
                sub="Evolução mensal comparativa"
              >
                <TrendLineChart data={monthlyData} />
              </ChartSection>
            )}

            {/* Row 3: Monthly bar chart */}
            {monthlyData.length > 1 && (
              <ChartSection
                title={t('dashboard.monthly_evolution')}
                sub="Receitas vs despesas agrupadas por mês"
              >
                <MonthlyBarChart data={monthlyData} />
              </ChartSection>
            )}

            {/* Row 4: Balance evolution */}
            {balanceHistory.length >= 2 && (
              <ChartSection
                title={t('dashboard.balance_over_time')}
                sub="Evolução acumulada do saldo no período"
              >
                <BalanceLineChart data={balanceHistory} />
              </ChartSection>
            )}

            {/* Row 5: Narrative intelligence blocks */}
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
                      text={`Sua taxa de poupança de ${formatPercentage(savingsRate, 0)} está abaixo dos 20% recomendados`}
                      sub="Tente reduzir despesas variáveis para atingir a meta"
                      variant="warning"
                    />
                  )}
                  {topExpense && (
                    <NarrativeInsight
                      icon={<Brain className="h-4 w-4" />}
                      text={
                        <>
                          Você gastou mais em{' '}
                          <span className="font-bold text-foreground">
                            {t(`categories.${topExpense.category}`)}
                          </span>{' '}
                          este período ({topExpense.percentage.toFixed(0)}% das despesas)
                        </>
                      }
                      sub="Monitorar esta categoria pode ajudar a equilibrar o orçamento"
                    />
                  )}
                  {savingsTrend !== null && savingsTrend > 5 && (
                    <NarrativeInsight
                      icon={<Zap className="h-4 w-4" />}
                      text={`Sua taxa de poupança aumentou ${Math.abs(savingsTrend).toFixed(1)}% vs mês anterior`}
                      sub="Continue assim — a tendência é positiva"
                      variant="positive"
                    />
                  )}
                  {savingsTrend !== null && savingsTrend < -5 && (
                    <NarrativeInsight
                      icon={<AlertTriangle className="h-4 w-4" />}
                      text={`Despesas recorrentes estão crescendo — taxa de poupança caiu ${Math.abs(savingsTrend).toFixed(1)}%`}
                      sub="Atenção: revise as despesas deste mês"
                      variant="warning"
                    />
                  )}
                  {incomeTotals.length > 0 && (
                    <NarrativeInsight
                      icon={<ArrowUpCircle className="h-4 w-4" />}
                      text={`Receitas distribuídas em ${incomeTotals.length} categoria${incomeTotals.length > 1 ? 's' : ''}`}
                      sub={
                        incomeTotals[0]
                          ? `Maior fonte: ${t(`categories.${incomeTotals[0].category}`)} (${incomeTotals[0].percentage.toFixed(0)}%)`
                          : undefined
                      }
                      variant="positive"
                    />
                  )}
                  {expenseTotals.length > 0 && (
                    <NarrativeInsight
                      icon={<ArrowDownCircle className="h-4 w-4" />}
                      text={`Despesas distribuídas em ${expenseTotals.length} categoria${expenseTotals.length > 1 ? 's' : ''}`}
                      sub={
                        expenseTotals.length > 3
                          ? 'Alta diversificação — revise prioridades de gasto'
                          : 'Bom foco — poucas categorias de despesa'
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ── Locked preview for free users ── */
          <LockedChartPreview />
        )}

        {/* ── AI Assistant (always visible) ─────────────────────────────────── */}
        <Card elevated>
          <CardBody className="p-5">
            <AIAssistant />
          </CardBody>
        </Card>

        {/* ── Text insight cards (always visible) ───────────────────────────── */}
        {insights.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t('insights.section_title')}
            </h3>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <InsightCard key={i} {...insight} />
              ))}
            </div>
          </div>
        )}

        {/* ── Upgrade card for free users ───────────────────────────────────── */}
        {!hasProAccess && <UpgradeCard />}

        {/* ── Empty state ───────────────────────────────────────────────────── */}
        {transactions.length === 0 && (
          <div className="rounded-2xl border border-surface-border bg-surface p-8 text-center">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">{t('insights.no_data')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('insights.no_data_hint')}</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
