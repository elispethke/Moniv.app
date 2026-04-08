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

  // Gera o link de convite com o ID do utilizador como referência
  const referralLink = user?.id
    ? `${APP_URL}/invite?ref=${user.id}`
    : null

  // Captura o parâmetro ?ref= da URL e salva no localStorage
  // Isso garante que o referral não seja perdido mesmo que o usuário navegue antes de se cadastrar
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

  // Busca a quantidade de referrals uma vez por sessão do usuário
  useEffect(() => {
    if (!user?.id) return
    referralService
      .getReferralCount(user.id)
      .then(setReferralCount)
      .catch(() => { /* erro não bloqueante */ })
  }, [user?.id])

  const copyLink = async () => {
    if (!referralLink) return

    try {
      await navigator.clipboard.writeText(referralLink)
    } catch {
      // Fallback para navegadores sem suporte à Clipboard API
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

    // IMPORTANTE: não definir destinatário automaticamente
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
      } catch {
        // Usuário cancelou ou falhou — fallback para copiar link
      }
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