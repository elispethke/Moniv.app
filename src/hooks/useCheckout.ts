import { useState } from 'react'
import { supabase } from '@/services/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export function useCheckout() {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(plan: 'monthly' | 'yearly') {
    setLoadingPlan(plan)
    setError(null)

    try {
      // 1. Força refresh da sessão para garantir token válido
      await supabase.auth.refreshSession()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (sessionError || !token) {
        throw new Error('Sessão inválida. Faça login novamente.')
      }

      // 2. Chama a edge function via fetch puro — sem abstração do SDK.
      //    Isso garante controle total dos headers e extração correta do erro.
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ plan }),
        },
      )

      // 3. Extrai o body mesmo em caso de erro para mostrar mensagem real
      let body: { url?: string; error?: string } = {}
      try {
        body = await res.json()
      } catch {
        // resposta sem body válido
      }

      if (!res.ok) {
        const msg = body?.error ?? `Erro ${res.status} na edge function`
        console.error('[useCheckout] edge function error:', res.status, body)
        throw new Error(msg)
      }

      if (body?.error) throw new Error(body.error)

      if (!body?.url) {
        throw new Error('URL do Stripe não retornada. Verifique as variáveis STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY e STRIPE_PRICE_YEARLY no Supabase.')
      }

      // 4. Redireciona para o checkout do Stripe
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
