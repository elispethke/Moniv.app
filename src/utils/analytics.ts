/**
 * Lightweight structured event logger.
 *
 * Emits structured `[analytics]` console events during development.
 * In production, swap the `emit` body to forward to PostHog / Mixpanel / GA4
 * by replacing the TODO below with your SDK call.
 *
 * Usage:
 *   analytics.track('referral_shared', { method: 'copy' })
 *   analytics.track('snapshot_downloaded')
 */

type Properties = Record<string, string | number | boolean | null | undefined>

function emit(event: string, properties?: Properties) {
  if (import.meta.env.DEV) {
    console.info('[analytics]', event, properties ?? {})
  }
  // TODO: forward to analytics provider in production
  // e.g.: posthog.capture(event, properties)
}

export const analytics = {
  /** User shared their referral link. */
  referralShared(method: 'copy' | 'native_share' | 'whatsapp' | 'email') {
    emit('referral_shared', { method })
  },

  /** A new user signed up via a referral link. */
  referralRecorded(success: boolean) {
    emit('referral_recorded', { success })
  },

  /** User opened the referral modal. */
  referralModalOpened() {
    emit('referral_modal_opened')
  },

  /** User generated/shared a financial snapshot. */
  snapshotShared(method: 'download' | 'native_share') {
    emit('snapshot_shared', { method })
  },

  /** User started a Stripe checkout flow. */
  checkoutStarted(plan: 'monthly' | 'yearly') {
    emit('checkout_started', { plan })
  },

  /** User opened the billing portal. */
  billingPortalOpened() {
    emit('billing_portal_opened')
  },
}
