import { usePlanStore } from '@/store/usePlanStore'
import { supabase } from '@/services/supabase'
import { isAdmin as checkIsAdmin } from '@/lib/features'
import { useEffect, useState } from 'react'

export function useUserPlan() {
  const { plan, role } = usePlanStore()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user.email ?? null)
    })
  }, [])

  const isAdmin = role === 'admin' || checkIsAdmin(email)
  const isPro = plan === 'pro' || isAdmin

  return { plan, role, isPro, isAdmin }
}
