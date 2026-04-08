import { supabase } from './supabase'

/**
 * Calls the Supabase Edge Function to create a Stripe Checkout session,
 * then redirects the browser to the hosted Stripe payment page.
 *
 * Flow:
 *   1. upgradeToPro() → createCheckoutSession() → edge function
 *   2. Edge function creates a Stripe session (mode: subscription, €10/year)
 *   3. Browser redirects to Stripe's hosted checkout page
 *   4. After payment Stripe fires a webhook → stripe-webhook edge function
 *   5. Webhook upserts user_plans.plan = 'pro' in Supabase
 *   6. On next app load usePlanStore.loadPlan() picks up the new plan
 */
export const paymentService = {
  async createCheckoutSession(): Promise<{ url: string }> {
    await supabase.auth.refreshSession()
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session?.access_token) {
      throw new Error('Sessão inválida. Por favor, faça login novamente.')
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { plan: 'monthly' },
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    })

    if (error) throw new Error(error.message ?? 'Failed to create checkout session')
    if (!data?.url) throw new Error('No checkout URL returned')

    return { url: data.url as string }
  },

  async upgradeToPro(): Promise<void> {
    const { url } = await paymentService.createCheckoutSession()
    window.location.href = url
  },
}
