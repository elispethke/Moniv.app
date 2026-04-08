import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'

/**
 * Handles Supabase email invite and magic-link callbacks.
 *
 * Supabase can send tokens in two formats:
 * 1. PKCE: ?token_hash=XXX&type=invite (query params)
 * 2. Implicit: #access_token=XXX&type=invite (hash fragment — handled automatically by Supabase client)
 *
 * After verifying, invited users go to /onboarding so they can set a password.
 * Returning users (magiclink/recovery) go to /dashboard.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type') as 'invite' | 'magiclink' | 'recovery' | null

      // ── PKCE flow: token_hash in query params ────────────────────────────
      if (tokenHash && type) {
        const { error: verifyErr } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (verifyErr) {
          setError(verifyErr.message)
          return
        }
        // Invite = new user, send to onboarding. Others = dashboard.
        navigate(type === 'invite' ? '/onboarding' : '/dashboard', { replace: true })
        return
      }

      // ── Implicit flow: hash fragment auto-processed by Supabase client ───
      // getSession() picks up the session if the client already parsed the hash
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/dashboard', { replace: true })
        return
      }

      // Wait for onAuthStateChange — Supabase may still be parsing the hash
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
          subscription.unsubscribe()
          clearTimeout(timeoutId)
          navigate('/dashboard', { replace: true })
        }
      })

      // Timeout fallback — if nothing fires in 6s, show error
      timeoutId = setTimeout(() => {
        subscription.unsubscribe()
        setError('Link inválido ou expirado. Por favor, solicite um novo convite.')
      }, 6000)
    }

    handleCallback()

    return () => clearTimeout(timeoutId)
  }, [navigate])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-4">
          <p className="text-lg font-semibold text-foreground">Link inválido ou expirado</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <a href="/login" className="text-sm font-medium text-primary hover:underline">
            Ir para o login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">A verificar o link…</p>
      </div>
    </div>
  )
}
