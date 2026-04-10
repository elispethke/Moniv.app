import { useEffect } from 'react'
import { Copy, Check, Share2, Users, X, Gift, TrendingUp, MessageCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useReferral } from '@/hooks/useReferral'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'

const PROGRESS_DOTS = 5

interface Props {
  onClose: () => void
}

export function ReferralModal({ onClose }: Props) {
  const { referralLink, copyLink, shareLink, shareWhatsApp, shareEmail, copied, referralCount } = useReferral()
  const { t } = useTranslation()

  // Fechar ao pressionar ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop — onClick para funcionar em mobile */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card — max-h para não ultrapassar a tela em mobile */}
      <div
        className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl border border-surface-border bg-surface shadow-glass animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Handle bar mobile */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-border sm:hidden" />

          {/* Header */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow-primary">
              <Users className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground">
              {t('referral.title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('referral.subtitle')}
            </p>
          </div>

          {/* Reward badge */}
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
            <Gift className="h-6 w-6 flex-shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {t('referral.reward_title')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('referral.reward_desc')}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-4 rounded-2xl border border-surface-border bg-surface-elevated px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-xs font-medium text-foreground-secondary">
                  {t('referral.progress_label')}
                </span>
              </div>
              <span className="text-sm font-bold text-foreground">{referralCount}</span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: PROGRESS_DOTS }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-all duration-500',
                    i < referralCount ? 'bg-primary' : 'bg-surface-border',
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {referralCount === 0
                ? t('referral.count_zero')
                : t('referral.count', { count: referralCount })}
            </p>
          </div>

          {/* Link box */}
          {referralLink && (
            <div className="mb-4 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2.5">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('referral.your_link')}
              </p>
              <p className="truncate font-mono text-xs text-foreground">
                {referralLink}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button variant="primary" size="md" onClick={shareWhatsApp} className="gap-2 w-full">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="md" onClick={copyLink} className="gap-1.5">
                {copied
                  ? <Check className="h-4 w-4 text-accent" />
                  : <Copy className="h-4 w-4" />}
                {copied ? t('referral.copied') : t('referral.copy')}
              </Button>
              <Button variant="outline" size="md" onClick={shareEmail} className="gap-1.5">
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" size="md" onClick={shareLink} className="gap-1.5">
                <Share2 className="h-4 w-4" />
                {t('referral.share')}
              </Button>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {t('referral.terms')}
          </p>
        </div>
      </div>
    </div>
  )
}
