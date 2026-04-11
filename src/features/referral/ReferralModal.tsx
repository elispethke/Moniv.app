import { Copy, Check, Share2, Gift, TrendingUp, MessageCircle, Mail } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
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

  return (
    <Modal isOpen onClose={onClose} title={t('referral.title')} size="sm">
      <div className="space-y-3">

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground text-center -mt-1">
          {t('referral.subtitle')}
        </p>

        {/* Reward badge */}
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
          <Gift className="h-5 w-5 flex-shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {t('referral.reward_title')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('referral.reward_desc')}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border border-surface-border bg-surface-elevated px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
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
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {referralCount === 0
              ? t('referral.count_zero')
              : t('referral.count', { count: referralCount })}
          </p>
        </div>

        {/* Link box */}
        {referralLink && (
          <div className="rounded-xl border border-surface-border bg-surface-elevated px-3 py-2.5">
            <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {t('referral.your_link')}
            </p>
            <p className="truncate font-mono text-xs text-foreground">{referralLink}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <Button variant="primary" size="md" onClick={shareWhatsApp} className="gap-2 w-full">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-1">
              {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? t('referral.copied') : t('referral.copy')}
            </Button>
            <Button variant="outline" size="sm" onClick={shareEmail} className="gap-1">
              <Mail className="h-3.5 w-3.5" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={shareLink} className="gap-1">
              <Share2 className="h-3.5 w-3.5" />
              {t('referral.share')}
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          {t('referral.terms')}
        </p>

      </div>
    </Modal>
  )
}
