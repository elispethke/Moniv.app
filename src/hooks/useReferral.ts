import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { referralService } from '@/services/referralService'
import { analytics } from '@/utils/analytics'

const APP_URL = 'https://moniv.app'
const LS_KEY = 'referral_ref'

export function useReferral() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [referralCount, setReferralCount] = useState(0)

  // Generate the shareable invite link for this user
  const referralLink = user ? `${APP_URL}/invite?ref=${user.id}` : null

  // Capture incoming ?ref= param from any page and persist to localStorage.
  // This ensures the referral is preserved even if the user navigates before signing up.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const refId = params.get('ref')
      if (refId) {
        localStorage.setItem(LS_KEY, refId)
      }
    } catch {
      // localStorage unavailable (private browsing, etc.)
    }
  }, [])

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
          text: 'Controle suas finanças com o Moniv. Cadastre-se grátis! 📊',
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
