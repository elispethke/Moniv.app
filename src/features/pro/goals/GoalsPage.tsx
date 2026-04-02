import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/Button'
import { FeatureLocked } from '@/components/ui/FeatureLocked'
import { GoalCard } from './components/GoalCard'
import { AddGoalModal } from './components/AddGoalModal'
import { DepositModal } from './components/DepositModal'
import { useTranslation } from '@/hooks/useTranslation'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { useGoals } from '@/hooks/useGoals'
import { FEATURES } from '@/lib/features'
import type { Goal } from '@/types/goal'

export function GoalsPage() {
  const { t } = useTranslation()
  const canAccess = useFeatureAccess(FEATURES.GOALS)
  const { goals, isLoading, getProgress, getMonthlyNeeded, isOverdue, addGoal, updateGoal, removeGoal } = useGoals()

  const [addOpen, setAddOpen] = useState(false)
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null)

  if (!canAccess) {
    return (
      <PageLayout title={t('pro.goals')} subtitle={t('pro.goals_subtitle')}>
        <FeatureLocked feature={t('pro.goals')} />
      </PageLayout>
    )
  }

  async function handleDeposit(goalId: string, amount: number) {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    await updateGoal(goalId, { currentAmount: goal.currentAmount + amount })
  }

  return (
    <PageLayout
      title={t('pro.goals')}
      subtitle={t('pro.goals_subtitle')}
      action={
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('pro.add_goal')}
        </Button>
      }
    >
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-elevated" />
          ))}
        </div>
      )}

      {!isLoading && goals.length === 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface p-10 text-center">
          <p className="text-sm font-medium text-foreground mb-1">{t('pro.goals_empty')}</p>
          <p className="text-xs text-muted-foreground">{t('pro.goals_empty_hint')}</p>
        </div>
      )}

      <div className="space-y-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            progress={getProgress(goal)}
            monthlyNeeded={getMonthlyNeeded(goal)}
            isOverdue={isOverdue(goal)}
            onDelete={() => removeGoal(goal.id)}
            onAddDeposit={() => setDepositGoal(goal)}
          />
        ))}
      </div>

      <AddGoalModal isOpen={addOpen} onClose={() => setAddOpen(false)} onAdd={addGoal} />
      <DepositModal
        isOpen={!!depositGoal}
        goal={depositGoal}
        onClose={() => setDepositGoal(null)}
        onDeposit={handleDeposit}
      />
    </PageLayout>
  )
}
