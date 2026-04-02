import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Supabase envs missing')
      return json({ error: 'Server misconfigured (Supabase)' }, 500)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ Auth failed:', authError?.message)
      return json({ error: 'Unauthorized' }, 401)
    }

    console.log('✅ User authenticated:', user.id)

    // ── Parse body ──────────────────────────────────────────────────────────
    let plan: 'monthly' | 'yearly'

    try {
      const body = await req.json()
      plan = body?.plan
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    if (plan !== 'monthly' && plan !== 'yearly') {
      return json({ error: 'plan must be "monthly" or "yearly"' }, 400)
    }

    // ── Load Stripe Price IDs ───────────────────────────────────────────────
    const priceIdMonthly = Deno.env.get('STRIPE_PRICE_MONTHLY')
    const priceIdYearly  = Deno.env.get('STRIPE_PRICE_YEARLY')

    if (!priceIdMonthly || !priceIdYearly) {
      console.error('❌ Missing Stripe price envs')
      return json({ error: 'Stripe price IDs not configured' }, 500)
    }

    const priceId = plan === 'monthly' ? priceIdMonthly : priceIdYearly

    console.log('🧾 Using priceId:', priceId)

    // ── Stripe Setup ────────────────────────────────────────────────────────
    const secretKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!secretKey) {
      console.error('❌ Missing STRIPE_SECRET_KEY')
      return json({ error: 'Stripe not configured' }, 500)
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-04-10',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // ── App URL ─────────────────────────────────────────────────────────────
    const appUrl =
      Deno.env.get('APP_URL') ||
      req.headers.get('origin') ||
      'http://localhost:5173'

    console.log('🌍 App URL:', appUrl)

    // ── Create Checkout Session ─────────────────────────────────────────────
    console.log('🛒 Creating checkout — plan:', plan)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        plan,
      },
      customer_email: user.email ?? undefined,
      success_url: `${appUrl}/?upgrade=success`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
    })

    if (!session.url) {
      console.error('❌ No session URL returned')
      return json({ error: 'Failed to create checkout session' }, 500)
    }

    console.log('✅ Checkout created:', session.id)

    return json({ url: session.url }, 200)

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('💥 Error:', message)
    return json({ error: message }, 500)
  }
})