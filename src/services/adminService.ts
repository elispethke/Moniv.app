import { supabase } from './supabase'
import type { Plan, Role } from '@/types/plan'

export interface AdminUser {
  id: string
  email: string
  plan: Plan
  role: Role
  createdAt: string
}

/**
 * Calls the admin-api edge function and returns the parsed response data.
 *
 * supabase.functions.invoke sets `error` for non-2xx responses but ALSO
 * populates `data` with the response body. We check `data.error` first so
 * the user sees the meaningful message from the function ("Forbidden", etc.)
 * rather than the generic FunctionsHttpError wrapper.
 */
async function invokeAdmin(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('admin-api', { body })

  // Prefer the structured error message from the function body
  if (data?.error) throw new Error(data.error as string)
  if (error) {
    // Extract the actual error from the response body (FunctionsHttpError.context)
    let msg = ''
    try {
      const errBody = await (error as { context?: Response }).context?.json()
      msg = (errBody as { error?: string })?.error ?? ''
    } catch { /* ignore */ }
    throw new Error(msg || (error as { message?: string }).message || 'Admin API error')
  }

  return data
}

export const adminService = {
  async listUsers(): Promise<AdminUser[]> {
    const data = await invokeAdmin({ action: 'list-users' })
    return (data.users as Array<{
      id: string
      email: string
      plan: string
      role: string
      createdAt: string
    }>).map((row) => ({
      id:        row.id,
      email:     row.email ?? '(no email)',
      plan:      (row.plan  ?? 'free') as Plan,
      role:      (row.role  ?? 'user') as Role,
      createdAt: row.createdAt,
    }))
  },

  async grantPro(userId: string): Promise<void> {
    await invokeAdmin({ action: 'grant-pro', userId })
  },

  async removePro(userId: string): Promise<void> {
    await invokeAdmin({ action: 'remove-pro', userId })
  },

  async setRole(userId: string, role: Role): Promise<void> {
    await invokeAdmin({ action: 'set-role', userId, role })
  },

  async inviteUser(email: string): Promise<void> {
    await invokeAdmin({ action: 'invite-user', email, redirectTo: window.location.origin })
  },

  async deleteUser(userId: string): Promise<void> {
    await invokeAdmin({ action: 'delete-user', userId })
  },
}
