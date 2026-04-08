import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const OWNER_EMAILS = ['elispethke@gmail.com']

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // ── Auth: verify caller is authenticated ──────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Unauthorized' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Use the service-role client to verify the caller's JWT directly.
  // This is more reliable than creating a user-scoped client, especially
  // with newer Supabase key formats (sb_publishable_...).
  const adminClient = createClient(supabaseUrl, serviceKey)
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const { data: { user: caller }, error: authErr } = await adminClient.auth.getUser(token)
  if (authErr || !caller) return json({ error: 'Unauthorized' }, 401)

  // ── Admin check: must be owner email OR have role=admin in DB ─────────────
  const isOwnerEmail = OWNER_EMAILS.some(
    (e) => e.toLowerCase() === (caller.email ?? '').toLowerCase()
  )

  if (!isOwnerEmail) {
    const { data: callerPlan } = await adminClient
      .from('user_plans')
      .select('role')
      .eq('user_id', caller.id)
      .maybeSingle()
    if (!callerPlan || callerPlan.role !== 'admin') {
      return json({ error: 'Forbidden' }, 403)
    }
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { action, userId, email, role, redirectTo } = body as {
    action?: string
    userId?: string
    email?: string
    role?: string
    redirectTo?: string
  }

  // ── Route the action ──────────────────────────────────────────────────────
  switch (action) {
    // List all users with their plan + role
    case 'list-users': {
      const { data: usersData, error: usersErr } = await adminClient.auth.admin.listUsers()
      if (usersErr) return json({ error: usersErr.message }, 500)

      const { data: plans } = await adminClient
        .from('user_plans')
        .select('user_id, plan, role')

      const plansMap = new Map(
        (plans ?? []).map((p: { user_id: string; plan: string; role: string }) => [p.user_id, p])
      )

      const users = usersData.users.map((u) => {
        const p = plansMap.get(u.id) as { user_id: string; plan: string; role: string } | undefined
        return {
          id:        u.id,
          email:     u.email ?? '',
          plan:      p?.plan ?? 'free',
          role:      p?.role ?? 'user',
          createdAt: u.created_at,
        }
      })
      return json({ users })
    }

    // Grant or remove Pro plan
    case 'grant-pro':
    case 'remove-pro': {
      if (!userId) return json({ error: 'userId required' }, 400)
      const newPlan = action === 'grant-pro' ? 'pro' : 'free'
      const { error: upsertErr } = await adminClient
        .from('user_plans')
        .upsert({ user_id: userId, plan: newPlan }, { onConflict: 'user_id' })
      if (upsertErr) return json({ error: upsertErr.message }, 500)
      return json({ success: true, plan: newPlan })
    }

    // Set role (admin | user)
    case 'set-role': {
      if (!userId || !role) return json({ error: 'userId and role required' }, 400)
      if (!['admin', 'user'].includes(role)) return json({ error: 'Invalid role' }, 400)
      const { error: roleErr } = await adminClient
        .from('user_plans')
        .upsert({ user_id: userId, role }, { onConflict: 'user_id' })
      if (roleErr) return json({ error: roleErr.message }, 500)
      return json({ success: true, role })
    }

    // Invite a user by email (sends invite link)
    case 'invite-user': {
      if (!email) return json({ error: 'email required' }, 400)
      // Use the provided redirectTo, or fall back to APP_URL secret
      const inviteRedirect = redirectTo || Deno.env.get('APP_URL') || undefined
      const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
        email,
        inviteRedirect ? { redirectTo: inviteRedirect } : undefined
      )
      if (inviteErr) return json({ error: inviteErr.message }, 500)

      // Grant 30 days Pro to the invited user (profile row may already exist
      // via trigger; non-fatal if it doesn't yet exist)
      const invitedUserId = inviteData.user.id
      const proExpiry = new Date()
      proExpiry.setDate(proExpiry.getDate() + 30)
      await adminClient
        .from('profiles')
        .update({ pro_expires_at: proExpiry.toISOString() })
        .eq('id', invitedUserId)

      return json({ success: true, userId: invitedUserId })
    }

    // Delete a user completely (auth + user_plans)
    case 'delete-user': {
      if (!userId) return json({ error: 'userId required' }, 400)
      if (userId === caller.id) return json({ error: 'Não é possível deletar sua própria conta' }, 400)
      // Remove from user_plans first (ignore error — row may not exist)
      await adminClient.from('user_plans').delete().eq('user_id', userId)
      // Remove from auth
      const { error: deleteErr } = await adminClient.auth.admin.deleteUser(userId)
      if (deleteErr) return json({ error: deleteErr.message }, 500)
      return json({ success: true })
    }

    // Grant Pro by email
    case 'grant-pro-by-email': {
      if (!email) return json({ error: 'email required' }, 400)
      const { data: usersData2 } = await adminClient.auth.admin.listUsers()
      const target = usersData2?.users.find(
        (u) => u.email?.toLowerCase() === (email as string).toLowerCase()
      )
      if (!target) return json({ error: 'User not found' }, 404)
      const { error: upsertErr2 } = await adminClient
        .from('user_plans')
        .upsert({ user_id: target.id, plan: 'pro' }, { onConflict: 'user_id' })
      if (upsertErr2) return json({ error: upsertErr2.message }, 500)
      return json({ success: true, userId: target.id })
    }

    default:
      return json({ error: `Unknown action: ${action}` }, 400)
  }
})
