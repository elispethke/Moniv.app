import { Copy, Check, Share2, Users, X, Gift } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useReferral } from '@/hooks/useReferral'
import { useTranslation } from '@/hooks/useTranslation'

interface Props {
  onClose: () => void
}

export function ReferralModal({ onClose }: Props) {
  const { referralLink, copyLink, shareLink, copied } = useReferral()
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-sm rounded-3xl border border-surface-border bg-surface p-6 shadow-glass animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

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
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
          <Gift className="h-6 w-6 flex-shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t('referral.reward_title')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('referral.reward_desc')}
            </p>
          </div>
        </div>

        {/* Link box */}
        {referralLink && (
          <div className="mb-4 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2.5">
            <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {t('referral.your_link')}
            </p>
            <p className="truncate text-xs font-mono text-foreground">
              {referralLink}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={copyLink}
            className="gap-2"
          >
            {copied
              ? <Check className="h-4 w-4 text-accent" />
              : <Copy className="h-4 w-4" />
            }
            {copied ? t('referral.copied') : t('referral.copy')}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={shareLink}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            {t('referral.share')}
          </Button>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          {t('referral.terms')}
        </p>
      </div>
    </div>
  )
}
