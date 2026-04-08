import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'

/**
 * Handles Supabase email invite and magic-link callbacks.
 *
 * Supabase appends ?token_hash=XXX&type=invite (or type=magiclink) to the
 * redirectTo URL. We call verifyOtp to exchange the token for a session,
 * then send the user to /dashboard.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type') as 'invite' | 'magiclink' | 'recovery' | null

      if (tokenHash && type) {
        const { error: verifyErr } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (verifyErr) {
          setError(verifyErr.message)
          return
        }
      }

      // Session is now active — redirect to onboarding for new invites,
      // dashboard for returning users. Supabase will have set the session cookie.
      navigate('/dashboard', { replace: true })
    }

    handleCallback()
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
      <div className="text-sm text-muted-foreground">A verificar o link…</div>
    </div>
  )
}
