import { useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { FeatureLocked } from '@/components/ui/FeatureLocked'
import { WalletCard } from './components/WalletCard'
import { AddWalletModal } from './components/AddWalletModal'
import { useTranslation } from '@/hooks/useTranslation'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { useWallets } from '@/hooks/useWallets'
import { useFormatters } from '@/hooks/useFormatters'
import { FEATURES } from '@/lib/features'

export function WalletsPage() {
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  const canAccess = useFeatureAccess(FEATURES.MULTI_WALLETS)
  const { wallets, activeWalletId, isLoading, totalBalance, setActiveWallet, addWallet, removeWallet } = useWallets()
  const [modalOpen, setModalOpen] = useState(false)

  if (!canAccess) {
    return (
      <PageLayout title={t('pro.wallets')} subtitle={t('pro.wallets_subtitle')}>
        <FeatureLocked feature={t('pro.wallets')} />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={t('pro.wallets')}
      subtitle={t('pro.wallets_subtitle')}
      action={
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('pro.add_wallet')}
        </Button>
      }
    >
      {/* Total balance */}
      <Card className="mb-4 bg-gradient-primary">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">{t('pro.total_balance')}</p>
              <p className="text-2xl font-extrabold text-primary-foreground">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-elevated" />)}
        </div>
      )}

      {!isLoading && wallets.length === 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface p-10 text-center">
          <p className="text-sm font-medium text-foreground mb-1">{t('pro.wallets_empty')}</p>
          <p className="text-xs text-muted-foreground">{t('pro.wallets_empty_hint')}</p>
        </div>
      )}

      <div className="space-y-3">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            isActive={wallet.id === activeWalletId}
            onSelect={() => setActiveWallet(wallet.id === activeWalletId ? null : wallet.id)}
            onDelete={() => removeWallet(wallet.id)}
          />
        ))}
      </div>

      <AddWalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={addWallet} />
    </PageLayout>
  )
}
