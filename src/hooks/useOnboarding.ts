import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '@/store/useSettingsStore'

export function useOnboarding() {
  const navigate = useNavigate()
  const { hasOnboarded, setHasOnboarded } = useSettingsStore()

  function completeOnboarding() {
    setHasOnboarded(true)
    navigate('/transactions', { replace: true })
  }

  function skipOnboarding() {
    setHasOnboarded(true)
    navigate('/transactions', { replace: true })
  }

  return { hasOnboarded, completeOnboarding, skipOnboarding }
}
