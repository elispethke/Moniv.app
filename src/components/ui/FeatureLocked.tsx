import { Lock, Sparkles } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/utils/cn'
import { useTranslation } from '@/hooks/useTranslation'
import { useUIStore } from '@/store/useUIStore'

interface FeatureLockedProps {
  feature?: string
  className?: string
  compact?: boolean
}

export function FeatureLocked({ feature, className, compact = false }: FeatureLockedProps) {
  const { openModal } = useUIStore()
  const { t } = useTranslation()

  if (compact) {
    return (
      <button
        onClick={() => openModal('upgrade')}
        className={cn(
          'flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all hover:bg-primary/20',
          className
        )}
      >
        <Lock className="h-3 w-3" />
        {t('pro.unlock_pro')}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow-primary">
        <Lock className="h-6 w-6 text-primary-foreground" />
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">
          {feature ? `${feature} — ` : ''}{t('pro.feature_pro_only')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t('pro.feature_locked_desc')}</p>
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={() => openModal('upgrade')}
        className="gap-2"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {t('pro.upgrade_cta')}
      </Button>
    </div>
  )
}
