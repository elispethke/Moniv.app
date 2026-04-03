import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { referralService } from '@/services/referralService'
import { analytics } from '@/utils/analytics'

const APP_URL = 'https://moniv.app'

export function useReferral() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [referralCount, setReferralCount] = useState(0)

  const referralLink = user ? `${APP_URL}/signup?ref=${user.id}` : null

  // Fetch referral count once per user session
  useEffect(() => {
    if (!user?.id) return
    referralService
      .getReferralCount(user.id)
      .then(setReferralCount)
      .catch(() => { /* non-blocking */ })
  }, [user?.id])

  const copyLink = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('input')
      el.value = referralLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    analytics.referralShared('copy')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = async () => {
    if (!referralLink) return
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Moniv — Smart Personal Finance',
          text: 'Join me on Moniv and take control of your finances! 🚀',
          url: referralLink,
        })
        analytics.referralShared('native_share')
        return
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }
    await copyLink()
  }

  return { referralLink, copyLink, shareLink, copied, referralCount }
}
