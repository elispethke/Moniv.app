import { Wallet, Trash2 } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useFormatters } from '@/hooks/useFormatters'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'
import type { Wallet as WalletType } from '@/types/wallet'

interface WalletCardProps {
  wallet: WalletType
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}

export function WalletCard({ wallet, isActive, onSelect, onDelete }: WalletCardProps) {
  const { formatCurrency } = useFormatters()
  const { t } = useTranslation()
  const isPositive = wallet.balance >= 0

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        isActive ? 'border-primary/50 bg-primary/5 shadow-glow-primary' : 'hover:border-surface-elevated'
      )}
      onClick={onSelect}
    >
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', isActive ? 'bg-gradient-primary shadow-glow-primary' : 'bg-surface-elevated')}>
              <Wallet className={cn('h-5 w-5', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{wallet.name}</p>
              <p className={cn('text-lg font-bold', isPositive ? 'text-accent' : 'text-danger')}>
                {formatCurrency(wallet.balance)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-danger"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            aria-label={t('common.delete')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
