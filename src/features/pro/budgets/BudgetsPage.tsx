import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/Button'
import { FeatureLocked } from '@/components/ui/FeatureLocked'
import { BudgetCard } from './components/BudgetCard'
import { AddBudgetModal } from './components/AddBudgetModal'
import { useTranslation } from '@/hooks/useTranslation'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { useBudgets } from '@/hooks/useBudgets'
import { useTransactions } from '@/hooks/useTransactions'
import { FEATURES } from '@/lib/features'

export function BudgetsPage() {
  const { t } = useTranslation()
  const canAccess = useFeatureAccess(FEATURES.BUDGETS)
  const { transactions } = useTransactions()
  const { budgets, isLoading, getSpent, getProgress, getStatus, addBudget, removeBudget } = useBudgets(transactions)
  const [modalOpen, setModalOpen] = useState(false)

  if (!canAccess) {
    return (
      <PageLayout title={t('pro.budgets')} subtitle={t('pro.budgets_subtitle')}>
        <FeatureLocked feature={t('pro.budgets')} />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={t('pro.budgets')}
      subtitle={t('pro.budgets_subtitle')}
      action={
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('pro.add_budget')}
        </Button>
      }
    >
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-elevated" />
          ))}
        </div>
      )}

      {!isLoading && budgets.length === 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface p-10 text-center">
          <p className="text-sm font-medium text-foreground mb-1">{t('pro.budgets_empty')}</p>
          <p className="text-xs text-muted-foreground">{t('pro.budgets_empty_hint')}</p>
        </div>
      )}

      <div className="space-y-3">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            spent={getSpent(budget)}
            progress={getProgress(budget)}
            status={getStatus(budget)}
            onDelete={() => removeBudget(budget.id)}
          />
        ))}
      </div>

      <AddBudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addBudget}
      />
    </PageLayout>
  )
}
