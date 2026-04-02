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
    // ── Auth ─────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const secretKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Server misconfigured (Supabase)' }, 500)
    }
    if (!secretKey) {
      return json({ error: 'Stripe not configured' }, 500)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token)

    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    // ── Stripe setup ─────────────────────────────────────────────────────────
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-04-10',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const appUrl =
      Deno.env.get('APP_URL') ||
      req.headers.get('origin') ||
      'http://localhost:5173'

    // ── Find Stripe customer by email ─────────────────────────────────────────
    const email = user.email
    if (!email) return json({ error: 'User email not found' }, 400)

    const customers = await stripe.customers.list({ email, limit: 1 })

    if (customers.data.length === 0) {
      // No Stripe customer means user never subscribed — send to upgrade page
      return json({ url: `${appUrl}/pro/upgrade` })
    }

    const customerId = customers.data[0].id

    // ── Create billing portal session ─────────────────────────────────────────
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/pro/upgrade`,
    })

    console.log('✅ Billing portal session created for:', user.id)

    return json({ url: session.url })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('💥 Portal session error:', message)
    return json({ error: message }, 500)
  }
})
