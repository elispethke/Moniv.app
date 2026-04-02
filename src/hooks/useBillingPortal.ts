import { useState } from 'react'
import { supabase } from '@/services/supabase'

export function useBillingPortal() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openBillingPortal = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: anonKey,
            'Content-Type': 'application/json',
          },
        },
      )

      let body: { url?: string; error?: string } = {}
      try {
        body = await response.json()
      } catch {
        throw new Error(`Invalid server response (HTTP ${response.status})`)
      }

      if (!response.ok) {
        throw new Error(body.error ?? `HTTP ${response.status}`)
      }

      if (body.url) {
        window.location.href = body.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal')
    } finally {
      setIsLoading(false)
    }
  }

  return { openBillingPortal, isLoading, error }
}
