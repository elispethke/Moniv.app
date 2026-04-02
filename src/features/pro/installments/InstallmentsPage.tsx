import { useState } from 'react'
import { Plus, TrendingDown } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { FeatureLocked } from '@/components/ui/FeatureLocked'
import { InstallmentCard } from './components/InstallmentCard'
import { AddInstallmentModal } from './components/AddInstallmentModal'
import { useTranslation } from '@/hooks/useTranslation'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { useInstallments } from '@/hooks/useInstallments'
import { useFormatters } from '@/hooks/useFormatters'
import { FEATURES } from '@/lib/features'

export function InstallmentsPage() {
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  const canAccess = useFeatureAccess(FEATURES.INSTALLMENTS)
  const { installments, isLoading, getSchedule, getCurrentInstallment, getTotalFutureCommitment, addInstallment, removeInstallment } = useInstallments()
  const [modalOpen, setModalOpen] = useState(false)

  if (!canAccess) {
    return (
      <PageLayout title={t('pro.installments')} subtitle={t('pro.installments_subtitle')}>
        <FeatureLocked feature={t('pro.installments')} />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={t('pro.installments')}
      subtitle={t('pro.installments_subtitle')}
      action={
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('pro.add_installment')}
        </Button>
      }
    >
      {/* Future commitment summary */}
      {installments.length > 0 && (
        <Card className="mb-4 bg-primary/5 border-primary/20">
          <CardBody className="p-4 flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{t('pro.future_commitment')}</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(getTotalFutureCommitment())}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-elevated" />)}
        </div>
      )}

      {!isLoading && installments.length === 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface p-10 text-center">
          <p className="text-sm font-medium text-foreground mb-1">{t('pro.installments_empty')}</p>
          <p className="text-xs text-muted-foreground">{t('pro.installments_empty_hint')}</p>
        </div>
      )}

      <div className="space-y-3">
        {installments.map((inst) => (
          <InstallmentCard
            key={inst.id}
            installment={inst}
            currentInstallment={getCurrentInstallment(inst)}
            schedule={getSchedule(inst)}
            onDelete={() => removeInstallment(inst.id)}
          />
        ))}
      </div>

      <AddInstallmentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={addInstallment} />
    </PageLayout>
  )
}
