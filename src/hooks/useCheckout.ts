import { useState } from 'react'
import { supabase } from '@/services/supabase'

export function useCheckout() {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(plan: 'monthly' | 'yearly') {
    setLoadingPlan(plan)
    setError(null)

    try {
      // 🔴 FIX CRÍTICO:
      // Força a atualização da sessão antes de chamar a edge function.
      // Isso garante que o access_token não esteja expirado,
      // evitando o erro HTTP 401 (Unauthorized).
      await supabase.auth.refreshSession()

      // Obtém a sessão atual já atualizada
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      // Extrai o token de acesso
      const token = sessionData.session?.access_token

      // Validação obrigatória da sessão
      if (sessionError || !token) {
        throw new Error('Sessão inválida ou expirada — faça login novamente.')
      }

      // Chamada da edge function do Supabase
      // supabase.functions.invoke injeta automaticamente o Authorization header
      // com base na sessão ativa (desde que o token seja válido)
      const { data, error: fnError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: { plan },
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (fnError) {
        // FunctionsHttpError pode conter a resposta da API no campo .context
        let msg = fnError.message
        try {
          const ctx = (fnError as { context?: Response }).context
          if (ctx) {
            const body = await ctx.json() as { error?: string }
            if (body?.error) msg = body.error
          }
        } catch {
          // Ignora erro de parsing da resposta
        }
        throw new Error(msg)
      }

      const body = data as { url?: string; error?: string }

      // Caso a função retorne erro explícito
      if (body?.error) throw new Error(body.error)

      // Validação crítica: Stripe precisa retornar URL de checkout
      if (!body?.url) {
        throw new Error('URL do Stripe não retornada. Verifique STRIPE_SECRET_KEY no Supabase.')
      }

      // Redireciona o usuário para o checkout do Stripe
      window.location.href = body.url

    } catch (err) {
      console.error('[useCheckout] error:', err)

      // Define erro para exibição na UI
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento.')

      // Reseta estado de loading
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