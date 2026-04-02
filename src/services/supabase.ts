import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Whether the env vars contain real values (not placeholders).
 * When false the app runs in offline/localStorage mode.
 */
export const isSupabaseConfigured =
  !!rawUrl &&
  rawUrl !== 'YOUR_PROJECT_URL' &&
  rawUrl.startsWith('https://')

if (!isSupabaseConfigured) {
  console.warn(
    '[Moniv] Supabase is not configured. ' +
      'Set VITE_SUPABASE_URL in your .env file. ' +
      'The app will run in offline mode until then.'
  )
}

// createClient requires a syntactically valid URL — always provide one.
// When not configured we use a harmless placeholder; all requests will
// fail gracefully and be caught upstream rather than crashing at import time.
const supabaseUrl = isSupabaseConfigured ? rawUrl! : 'https://placeholder.supabase.co'
const supabaseKey = rawKey ?? 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Verifies that Supabase is reachable and credentials are valid.
 * Never throws — safe to call at app startup.
 */
export async function checkSupabaseConnection(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'VITE_SUPABASE_URL is not configured.' }
  }
  try {
    const { error } = await supabase.auth.getSession()
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
