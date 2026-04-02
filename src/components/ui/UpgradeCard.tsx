import { Sparkles, Check } from 'lucide-react'
import { Button } from './Button'
import { useTranslation } from '@/hooks/useTranslation'
import { useUIStore } from '@/store/useUIStore'
import { PRO_PLAN } from '@/types/plan'

const PRO_BENEFITS_KEYS = [
  'pro.benefit_budgets',
  'pro.benefit_goals',
  'pro.benefit_export',
  'pro.benefit_installments',
  'pro.benefit_recurring',
  'pro.benefit_wallets',
] as const

export function UpgradeCard() {
  const { openModal } = useUIStore()
  const { t } = useTranslation()

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-secondary/10 p-6">
      {/* Glow */}
      <div className="pointer-events-none absolute -top-12 right-0 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{t('pro.plan_name')}</h3>
            <p className="text-xs text-muted-foreground">
              <span className="text-xl font-extrabold text-primary">€{PRO_PLAN.price}</span>
              {' '}/{t('pro.per_year')}
            </p>
          </div>
        </div>

        {/* Benefits */}
        <ul className="mb-5 space-y-2">
          {PRO_BENEFITS_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2.5 text-sm text-foreground-secondary">
              <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-accent/20">
                <Check className="h-2.5 w-2.5 text-accent" />
              </div>
              {t(key)}
            </li>
          ))}
        </ul>

        <Button variant="primary" fullWidth onClick={() => openModal('upgrade')} className="gap-2">
          <Sparkles className="h-4 w-4" />
          {t('pro.upgrade_cta')}
        </Button>
      </div>
    </div>
  )
}
