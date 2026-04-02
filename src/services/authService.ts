import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

/**
 * Thin wrapper around Supabase Auth.
 * All methods return the raw Supabase response so callers can
 * inspect AuthError details and decide how to handle them.
 */
export const authService = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUp: (email: string, password: string, fullName?: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: fullName ? { full_name: fullName } : undefined,
      },
    }),

  signOut: () => supabase.auth.signOut(),

  resetPasswordForEmail: (email: string) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    }),

  updatePassword: (newPassword: string) =>
    supabase.auth.updateUser({ password: newPassword }),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) => supabase.auth.onAuthStateChange(callback),
}
