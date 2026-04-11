import { useEffect, useState } from 'react'
import { Sparkles, Check, X, AlertCircle, Zap, Crown } from 'lucide-react'
import { Button } from './Button'
import { useCheckout } from '@/hooks/useCheckout'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'

const BENEFITS = [
  'Orçamentos inteligentes',
  'Metas financeiras',
  'Exportação de dados',
  'Parcelamentos',
  'Recorrências automáticas',
  'Múltiplas carteiras',
]

interface ProModalProps {
  onClose: () => void
}

export function ProModal({ onClose }: ProModalProps) {
  const { t } = useTranslation()
  const { startCheckout, loadingPlan, error } = useCheckout()
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('yearly')

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const isLoadingMonthly = loadingPlan === 'monthly'
  const isLoadingYearly  = loadingPlan === 'yearly'
  const anyLoading       = isLoadingMonthly || isLoadingYearly

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-3xl border border-surface-border bg-background shadow-2xl overflow-hidden animate-scale-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-primary px-6 pt-8 pb-5 text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-extrabold text-primary-foreground">Moniv Pro</h2>
          <p className="mt-1 text-xs text-primary-foreground/70">Desbloqueie todos os recursos</p>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setSelected('monthly')}
              disabled={anyLoading}
              className={cn(
                'relative rounded-2xl border-2 p-3 text-left transition-all',
                selected === 'monthly'
                  ? 'border-primary bg-primary/10'
                  : 'border-surface-border bg-surface hover:border-primary/40'
              )}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Mensal</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">€6</p>
              <p className="text-[10px] text-muted-foreground">/ mês</p>
            </button>

            <button
              onClick={() => setSelected('yearly')}
              disabled={anyLoading}
              className={cn(
                'relative rounded-2xl border-2 p-3 text-left transition-all',
                selected === 'yearly'
                  ? 'border-primary bg-primary/10'
                  : 'border-surface-border bg-surface hover:border-primary/40'
              )}
            >
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                Melhor valor
              </div>
              <div className="flex items-center gap-1.5 mb-2 mt-1">
                <Crown className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Anual</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">€55</p>
              <p className="text-[10px] text-muted-foreground">/ ano</p>
              <p className="text-[10px] font-semibold text-accent mt-0.5">Poupa €17/ano</p>
            </button>
          </div>

          <div className="space-y-1.5">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <div className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-accent/20">
                  <Check className="h-2 w-2 text-accent" />
                </div>
                <span className="text-xs text-foreground-secondary">{b}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2 pt-1">
            {selected === 'monthly' ? (
              <Button
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoadingMonthly}
                disabled={anyLoading}
                onClick={() => startCheckout('monthly')}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Assinar Mensal — €6/mês
              </Button>
            ) : (
              <Button
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoadingYearly}
                disabled={anyLoading}
                onClick={() => startCheckout('yearly')}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Assinar Anual — €55/ano
              </Button>
            )}
            <p className="text-center text-[10px] text-muted-foreground">
              {t('pro.upgrade_disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
