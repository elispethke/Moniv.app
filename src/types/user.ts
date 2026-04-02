import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

/**
 * Re-exports Supabase's native types so the rest of the app
 * never imports directly from @supabase/supabase-js — only from here.
 */
export type { SupabaseUser as AuthUser, Session as AuthSession }

/** App-level profile data (preferences, locale, currency, etc.) */
export interface UserProfile {
  id: string
  email: string
  fullName: string
  currency: string
  locale: string
  avatarUrl?: string
}

/**
 * Derives a display-friendly UserProfile from a Supabase User.
 * Falls back gracefully when metadata is absent.
 */
export function toUserProfile(user: SupabaseUser): UserProfile {
  return {
    id: user.id,
    email: user.email ?? '',
    fullName: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Usuário',
    currency: (user.user_metadata?.currency as string | undefined) ?? 'BRL',
    locale: (user.user_metadata?.locale as string | undefined) ?? 'pt-BR',
    avatarUrl: user.user_metadata?.avatar_url as string | undefined,
  }
}

/** Extracts initials (up to 2 chars) from a display name or email. */
export function getInitials(nameOrEmail: string): string {
  const parts = nameOrEmail.split(/[\s@]/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}
