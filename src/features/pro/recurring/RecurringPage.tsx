import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { FeatureLocked } from '@/components/ui/FeatureLocked'
import { RecurringItem } from './components/RecurringItem'
import { AddRecurringModal } from './components/AddRecurringModal'
import { useTranslation } from '@/hooks/useTranslation'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { useRecurring } from '@/hooks/useRecurring'
import { FEATURES } from '@/lib/features'

export function RecurringPage() {
  const { t } = useTranslation()
  const canAccess = useFeatureAccess(FEATURES.RECURRING)
  const { recurring, isLoading, getUpcoming, addRecurring, removeRecurring } = useRecurring()
  const [modalOpen, setModalOpen] = useState(false)

  if (!canAccess) {
    return (
      <PageLayout title={t('pro.recurring')} subtitle={t('pro.recurring_subtitle')}>
        <FeatureLocked feature={t('pro.recurring')} />
      </PageLayout>
    )
  }

  const upcoming = getUpcoming(30)

  return (
    <PageLayout
      title={t('pro.recurring')}
      subtitle={t('pro.recurring_subtitle')}
      action={
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('pro.add_recurring')}
        </Button>
      }
    >
      {upcoming.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t('pro.upcoming_30_days')}
          </h3>
          <Card>
            <CardBody className="p-2">
              {upcoming.map((item) => (
                <RecurringItem key={item.id} item={item} onDelete={() => removeRecurring(item.id)} />
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {t('pro.all_recurring')}
      </h3>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-elevated" />)}
        </div>
      )}

      {!isLoading && recurring.length === 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface p-10 text-center">
          <p className="text-sm font-medium text-foreground mb-1">{t('pro.recurring_empty')}</p>
          <p className="text-xs text-muted-foreground">{t('pro.recurring_empty_hint')}</p>
        </div>
      )}

      <Card>
        <CardBody className="p-2">
          {recurring.map((item) => (
            <RecurringItem key={item.id} item={item} onDelete={() => removeRecurring(item.id)} />
          ))}
        </CardBody>
      </Card>

      <AddRecurringModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={addRecurring} />
    </PageLayout>
  )
}
