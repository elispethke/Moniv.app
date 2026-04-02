import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Award,
  PiggyBank,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { InsightCard } from './components/InsightCard'
import { AIAssistant } from './components/AIAssistant'
import { Card, CardBody } from '@/components/ui/Card'
import { UpgradeCard } from '@/components/ui/UpgradeCard'
import { useTransactions } from '@/hooks/useTransactions'
import { useTranslation } from '@/hooks/useTranslation'
import { useFormatters } from '@/hooks/useFormatters'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { FEATURES } from '@/lib/features'
import { calculateCategoryTotals } from '@/utils/calculations'

export function InsightsPage() {
  const { transactions, summary } = useTransactions()
  const { t } = useTranslation()
  const { formatCurrency, formatPercentage } = useFormatters()
  const hasProAccess = useFeatureAccess(FEATURES.BUDGETS)

  const categoryTotals = calculateCategoryTotals(transactions)
  const topExpense = categoryTotals[0]

  const insights = []

  if (summary.savingsRate >= 20) {
    insights.push({
      icon: <Award className="h-5 w-5" />,
      title: t('insights.savings_achieved_title'),
      body: t('insights.savings_achieved_body', { rate: formatPercentage(summary.savingsRate) }),
      variant: 'success' as const,
      tag: t('insights.tags.goal'),
    })
  } else if (summary.totalIncome > 0) {
    insights.push({
      icon: <Target className="h-5 w-5" />,
      title: t('insights.savings_low_title'),
      body: t('insights.savings_low_body', { rate: formatPercentage(summary.savingsRate) }),
      variant: 'warning' as const,
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
      variant: 'info' as const,
      tag: t('insights.tags.analysis'),
    })
  }

  if (summary.balance < 0) {
    insights.push({
      icon: <AlertTriangle className="h-5 w-5" />,
      title: t('insights.negative_balance_title'),
      body: t('insights.negative_balance_body', { amount: formatCurrency(Math.abs(summary.balance)) }),
      variant: 'danger' as const,
      tag: t('insights.tags.alert'),
    })
  }

  if (summary.totalIncome > 0 && summary.balance > 0) {
    insights.push({
      icon: <PiggyBank className="h-5 w-5" />,
      title: t('insights.invest_title'),
      body: t('insights.invest_body', { amount: formatCurrency(summary.balance) }),
      variant: 'success' as const,
      tag: t('insights.tags.opportunity'),
    })
  }

  return (
    <PageLayout title={t('insights.title')} subtitle={t('insights.subtitle')}>
      <div className="space-y-5">
        <Card elevated>
          <CardBody className="p-5">
            <AIAssistant />
          </CardBody>
        </Card>

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

        {transactions.length === 0 && (
          <div className="rounded-2xl border border-surface-border bg-surface p-8 text-center">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">{t('insights.no_data')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('insights.no_data_hint')}</p>
          </div>
        )}

        {!hasProAccess && <UpgradeCard />}
      </div>
    </PageLayout>
  )
}
