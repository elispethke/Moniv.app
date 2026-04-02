import { useState } from 'react'
import { supabase } from '@/services/supabase'

export function useCheckout() {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(plan: 'monthly' | 'yearly') {
    setLoadingPlan(plan)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Você precisa estar logado para fazer o upgrade.')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const anonKey     = import.meta.env.VITE_SUPABASE_ANON_KEY as string

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan }),
        }
      )

      let body: { url?: string; error?: string } = {}
      try {
        body = await response.json()
      } catch {
        throw new Error(`Servidor retornou resposta inválida (HTTP ${response.status})`)
      }

      if (!response.ok) {
        throw new Error(body.error || `Erro HTTP ${response.status}`)
      }

      if (!body.url) {
        throw new Error('URL do Stripe não retornada. Verifique STRIPE_SECRET_KEY no Supabase.')
      }

      window.location.href = body.url

    } catch (err) {
      console.error('[useCheckout] error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento.')
      setLoadingPlan(null)
    }
  }

  return {
    startCheckout,
    isLoading: loadingPlan !== null,
    loadingPlan,
    error,
  }
}
