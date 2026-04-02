// Supabase Edge Function — stripe-webhook
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
//
// Register this URL in Stripe dashboard → Webhooks:
//   https://ebifkobcwppwcavaosun.supabase.co/functions/v1/stripe-webhook
//
// Required Supabase secrets:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET   — from Stripe dashboard → Webhooks → your endpoint
//
// Listens for: checkout.session.completed → activates Pro plan

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Service-role client — bypasses RLS to write user_plans
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const secretKey     = Deno.env.get('STRIPE_SECRET_KEY')

  if (!secretKey) {
    console.error('[stripe-webhook] STRIPE_SECRET_KEY not configured')
    return new Response('STRIPE_SECRET_KEY not configured', { status: 500 })
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-04-10',
    httpClient: Stripe.createFetchHttpClient(),
  })

  // ── Read body first (needed for both signed and unsigned paths) ──────────
  const body = await req.text()

  let event: Stripe.Event

  if (webhookSecret) {
    // ── Validate Stripe signature ──────────────────────────────────────────
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 })
    }
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err) {
      console.error('[stripe-webhook] signature validation failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }
  } else {
    // Webhook secret not configured — parse without verification.
    // Set STRIPE_WEBHOOK_SECRET in Supabase secrets to enable signature validation.
    console.warn('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature check')
    try {
      event = JSON.parse(body) as Stripe.Event
    } catch {
      return new Response('Invalid JSON body', { status: 400 })
    }
  }

  // ── Handle events ─────────────────────────────────────────────────────────
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutCompleted(session)
    }
    // Add more event types here as needed:
    // customer.subscription.deleted → downgrade to free
  } catch (err) {
    console.error('[stripe-webhook] handler error:', err)
    return new Response('Handler error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  if (!userId) {
    console.error('[stripe-webhook] checkout.session.completed missing user_id in metadata', session.id)
    return
  }

  const { error } = await supabaseAdmin
    .from('user_plans')
    .upsert(
      { user_id: userId, plan: 'pro', updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('[stripe-webhook] failed to activate Pro for', userId, error)
    throw error
  }

  console.info('[stripe-webhook] Pro activated for user', userId)
}
