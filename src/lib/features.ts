import type { Plan } from '@/types/plan'

// ─── Feature registry ─────────────────────────────────────────────────────────

export const FEATURES = {
  BUDGETS:       'budgets',
  GOALS:         'goals',
  EXPORT:        'export',
  INSTALLMENTS:  'installments',
  RECURRING:     'recurring',
  MULTI_WALLETS: 'multi_wallets',
} as const

export type Feature = typeof FEATURES[keyof typeof FEATURES]

// ─── Role type (prepared for future expansion) ────────────────────────────────
// Not in use yet — add role column to user_plans when needed.
export type Role = 'admin' | 'user'

// ─── Admin access ─────────────────────────────────────────────────────────────
// Add emails here to grant full Pro access regardless of plan.
// Admins never see locked features or upgrade prompts.

const ADMIN_EMAILS: string[] = [
  'elispethke@gmail.com',
]

/**
 * Returns true if the email belongs to an internal admin.
 * Admins always have full access — they never pay, never see FeatureLocked.
 *
 * Centralized here — never replicate this check elsewhere in the codebase.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const normalized = email.toLowerCase()
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized)
}

/** @deprecated Use isAdmin() instead */
export const isOwner = isAdmin

// ─── PRO feature set ──────────────────────────────────────────────────────────

const PRO_FEATURES = new Set<Feature>([
  FEATURES.BUDGETS,
  FEATURES.GOALS,
  FEATURES.EXPORT,
  FEATURES.INSTALLMENTS,
  FEATURES.RECURRING,
  FEATURES.MULTI_WALLETS,
])

// ─── Access control ───────────────────────────────────────────────────────────

/**
 * Central access-control function.
 * Precedence: admin > pro plan > free plan.
 * All feature gating flows through here — never check plan or email inline.
 */
export function hasFeatureAccess(
  feature: Feature,
  plan: Plan,
  userEmail?: string | null
): boolean {
  if (isAdmin(userEmail)) return true
  if (plan === 'pro') return true
  return !PRO_FEATURES.has(feature)
}
