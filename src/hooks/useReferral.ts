import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { referralService } from '@/services/referralService'
import { analytics } from '@/utils/analytics'
import { supabase } from '@/services/supabase' // ✅ CORREÇÃO

const APP_URL = 'https://moniv.app'
const LS_KEY = 'referral_ref'

export function useReferral() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [referralCount, setReferralCount] = useState(0)

  // Estado do código de referral vindo do banco
  const [referralCode, setReferralCode] = useState<string | null>(null)

  // Busca o referral_code no Supabase
  useEffect(() => {
    if (!user?.id) return

    const fetchReferralCode = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erro ao buscar referral_code:', error.message)
        return
      }

      setReferralCode(data?.referral_code ?? null)
    }

    fetchReferralCode()
  }, [user?.id])

  // Gera o link usando o referral_code (e não mais user.id)
  const referralLink = `${APP_URL}/invite?ref=${referralCode ?? user?.id ?? ''}`

  // Captura o parâmetro ?ref= da URL e salva no localStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const refId = params.get('ref')
      if (refId) {
        localStorage.setItem(LS_KEY, refId)
      }
    } catch {
      // localStorage pode não estar disponível (modo privado, etc.)
    }
  }, [])

  // Busca a quantidade de referrals
  useEffect(() => {
    if (!user?.id) return
    referralService
      .getReferralCount(user.id)
      .then(setReferralCount)
      .catch(() => {})
  }, [user?.id])

  const copyLink = async () => {
    if (!referralLink) return

    try {
      await navigator.clipboard.writeText(referralLink)
    } catch {
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

  const shareWhatsApp = () => {
    if (!referralLink) return

    const message = `Comece a usar o Moniv comigo: ${referralLink}`

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank'
    )

    analytics.referralShared('whatsapp')
  }

  const shareEmail = () => {
    if (!referralLink) return

    const subject = encodeURIComponent('Junte-se a mim no Moniv!')
    const body = encodeURIComponent(
      `Olá! Estou usando o Moniv para controlar as minhas finanças e adorei. Cadastra-te grátis com o meu link: ${referralLink}`
    )

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')

    analytics.referralShared('email')
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
      } catch {}
    }

    await copyLink()
  }

  return {
    referralLink,
    copyLink,
    shareLink,
    shareWhatsApp,
    shareEmail,
    copied,
    referralCount
  }
}