import { useState, type ReactNode } from 'react'
import {
  Sparkles, Check, BarChart2, Target, Download,
  CreditCard, RefreshCw, Wallet, ArrowLeft, AlertCircle, Crown,
  Settings2, LifeBuoy,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { ProBadge } from '@/components/ui/ProBadge'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlanStore } from '@/store/usePlanStore'
import { useCheckout } from '@/hooks/useCheckout'
import { useBillingPortal } from '@/hooks/useBillingPortal'
import { cn } from '@/utils/cn'

interface BenefitItem {
  icon: ReactNode
  titleKey: string
  descKey: string
}

const BENEFITS: BenefitItem[] = [
  { icon: <BarChart2 className="h-5 w-5" />,  titleKey: 'pro.benefit_budgets',      descKey: 'pro.benefit_budgets_desc' },
  { icon: <Target className="h-5 w-5" />,      titleKey: 'pro.benefit_goals',        descKey: 'pro.benefit_goals_desc' },
  { icon: <Download className="h-5 w-5" />,    titleKey: 'pro.benefit_export',       descKey: 'pro.benefit_export_desc' },
  { icon: <CreditCard className="h-5 w-5" />,  titleKey: 'pro.benefit_installments', descKey: 'pro.benefit_installments_desc' },
  { icon: <RefreshCw className="h-5 w-5" />,   titleKey: 'pro.benefit_recurring',    descKey: 'pro.benefit_recurring_desc' },
  { icon: <Wallet className="h-5 w-5" />,      titleKey: 'pro.benefit_wallets',      descKey: 'pro.benefit_wallets_desc' },
]

export function UpgradePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { plan } = usePlanStore()
  const { startCheckout, loadingPlan, error } = useCheckout()
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('yearly')

  const { openBillingPortal, isLoading: isPortalLoading, error: portalError } = useBillingPortal()

  const isAlreadyPro = plan === 'pro'
  // ?canceled=true is appended by the Stripe redirect on cancel
  const paymentCancelled = searchParams.get('canceled') === 'true'

  return (
    <PageLayout title="" subtitle="">
      <div className="space-y-6 pb-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>

        {/* Banners */}
        {paymentCancelled && (
          <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface px-4 py-3 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <span className="text-foreground">{t('pro.payment_cancelled')}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger" />
            <span className="text-foreground">{error}</span>
          </div>
        )}

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-6 shadow-glow-primary text-center">
          <div className="pointer-events-none absolute -top-12 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/20">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-primary-foreground">{t('pro.plan_name')}</h1>
              <ProBadge size="md" className="opacity-80" />
            </div>
            <p className="text-sm text-primary-foreground/70">{t('pro.upgrade_hero_sub')}</p>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Monthly */}
          <button
            type="button"
            onClick={() => setSelected('monthly')}
            className={cn(
              'relative rounded-2xl border p-4 text-left transition-all',
              selected === 'monthly'
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-surface-border bg-surface hover:border-primary/40'
            )}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Mensal</p>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-foreground">€6</span>
              <span className="text-xs text-muted-foreground mb-1">/mês</span>
            </div>
            {selected === 'monthly' && (
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
          </button>

          {/* Yearly */}
          <button
            type="button"
            onClick={() => setSelected('yearly')}
            className={cn(
              'relative rounded-2xl border p-4 text-left transition-all',
              selected === 'yearly'
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-surface-border bg-surface hover:border-primary/40'
            )}
          >
            <div className="flex items-center gap-1 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anual</p>
              <span className="rounded-full bg-accent/20 text-accent px-1.5 py-0.5 text-[9px] font-bold uppercase">
                Melhor valor
              </span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-foreground">€55</span>
              <span className="text-xs text-muted-foreground mb-1">/ano</span>
            </div>
            <p className="text-[10px] text-accent font-medium mt-1">Poupa €17/ano</p>
            {selected === 'yearly' && (
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
          </button>
        </div>

        {/* Benefits list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">{t('pro.whats_included')}</h2>
          {BENEFITS.map((b) => (
            <Card key={b.titleKey}>
              <CardBody className="flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  {b.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t(b.titleKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(b.descKey)}</p>
                </div>
                <Check className="ml-auto h-4 w-4 flex-shrink-0 text-accent" />
              </CardBody>
            </Card>
          ))}
        </div>

        {/* CTA */}
        {isAlreadyPro ? (
          <div className="space-y-3">
            {/* Already Pro confirmation */}
            <div className="rounded-2xl border border-accent/30 bg-success/10 p-4 text-center">
              <Check className="mx-auto mb-2 h-6 w-6 text-accent" />
              <p className="text-sm font-semibold text-foreground">{t('pro.already_pro')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('pro.already_pro_desc')}</p>
            </div>

            {/* Portal error */}
            {portalError && (
              <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger" />
                <span className="text-foreground">{portalError}</span>
              </div>
            )}

            {/* Manage / Cancel subscription */}
            <Button
              variant="outline"
              fullWidth
              size="md"
              isLoading={isPortalLoading}
              onClick={openBillingPortal}
              className="gap-2"
            >
              <Settings2 className="h-4 w-4" />
              {t('pro.manage_subscription')}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              {t('pro.billing_portal_desc')}
            </p>

            {/* Support */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t('pro.support_title')}{' '}
                <a
                  href="mailto:support@moniv.app"
                  className="font-medium text-primary hover:underline"
                >
                  support@moniv.app
                </a>
              </span>
            </div>

            {/* Legal */}
            <p className="text-center text-[11px] text-muted-foreground">
              {t('pro.cancel_anytime_legal')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              isLoading={loadingPlan !== null}
              onClick={() => startCheckout(selected)}
              className="gap-2"
            >
              <Crown className="h-4 w-4" />
              Assinar — {selected === 'yearly' ? '€55/ano' : '€6/mês'}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              {t('pro.upgrade_disclaimer')}
            </p>

            {/* Support link for non-Pro users too */}
            <div className="flex items-center justify-center gap-2">
              <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground" />
              <a
                href="mailto:support@moniv.app"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                support@moniv.app
              </a>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
