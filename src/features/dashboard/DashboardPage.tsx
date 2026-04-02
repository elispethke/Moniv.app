import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { usePlanStore } from '@/store/usePlanStore'
import { useUserPlan } from '@/hooks/useUserPlan'
import { FreeDashboard } from './components/FreeDashboard'
import { ProDashboard } from './components/ProDashboard'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { loadPlan } = usePlanStore()
  const { isPro, isAdmin } = useUserPlan()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stripe success polling — runs when /?upgrade=success lands here
  const upgradeSuccess = searchParams.get('upgrade') === 'success'
  useEffect(() => {
    if (!upgradeSuccess || !user?.id) return
    setSearchParams({}, { replace: true })
    setShowSuccessBanner(true)
    let attempts = 0
    const MAX = 5
    function scheduleNext() {
      if (attempts >= MAX) return
      pollTimerRef.current = setTimeout(async () => {
        attempts++
        await loadPlan(user!.id)
        if (usePlanStore.getState().plan !== 'pro' && attempts < MAX) scheduleNext()
      }, 2000)
    }
    loadPlan(user.id).then(() => {
      if (usePlanStore.getState().plan !== 'pro') scheduleNext()
    })
    return () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgradeSuccess, user?.id])

  const hasFullAccess = isPro || isAdmin

  return hasFullAccess
    ? <ProDashboard showSuccessBanner={showSuccessBanner} />
    : <FreeDashboard showSuccessBanner={showSuccessBanner} />
}
