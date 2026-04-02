import { useState } from 'react'
import { supabase } from '@/services/supabase'

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout() {
    setIsLoading(true)
    setError(null)

    try {
      // Get the current session — access_token is the Bearer token for the Edge Function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Você precisa estar logado para fazer o upgrade.')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const anonKey     = import.meta.env.VITE_SUPABASE_ANON_KEY as string

      // Use raw fetch so we always get the response body — supabase.functions.invoke
      // sets data=null on non-2xx, making it impossible to read the real error message.
      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
          },
        }
      )

      let body: { url?: string; error?: string } = {}
      try {
        body = await response.json()
      } catch {
        throw new Error(`Servidor retornou resposta inválida (HTTP ${response.status})`)
      }

      if (!response.ok) {
        // body.error contains the real message from the Edge Function
        throw new Error(body.error || `Erro HTTP ${response.status}`)
      }

      if (!body.url) {
        throw new Error(
          'URL do Stripe não retornada. Verifique se STRIPE_SECRET_KEY e STRIPE_PRICE_ID estão configurados no Supabase.'
        )
      }

      // ✅ Redirect to Stripe Checkout
      window.location.href = body.url

    } catch (err) {
      console.error('[useCheckout] error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento.')
      setIsLoading(false)
    }
  }

  return { startCheckout, isLoading, error }
}
