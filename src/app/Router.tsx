import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { LandingPage } from '@/features/landing/LandingPage'
import { EntryScreen } from '@/features/entry/EntryScreen'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { TransactionsPage } from '@/features/transactions/TransactionsPage'
import { InsightsPage } from '@/features/insights/InsightsPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { BudgetsPage } from '@/features/pro/budgets/BudgetsPage'
import { GoalsPage } from '@/features/pro/goals/GoalsPage'
import { InstallmentsPage } from '@/features/pro/installments/InstallmentsPage'
import { RecurringPage } from '@/features/pro/recurring/RecurringPage'
import { WalletsPage } from '@/features/pro/wallets/WalletsPage'
import { UpgradePage } from '@/features/pro/UpgradePage'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { AdminPage } from '@/features/admin/AdminPage'
import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'

/** Captures ?ref= param, writes to localStorage, then redirects to /signup */
function InviteRedirect() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const ref = params.get('ref')
  if (ref) {
    try { localStorage.setItem('referral_ref', ref) } catch { /* ignore */ }
  }
  return <Navigate to={ref ? `/signup?ref=${ref}` : '/signup'} replace />
}

function AppShell() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/transactions"     element={<TransactionsPage />} />
        <Route path="/insights"         element={<InsightsPage />} />
        <Route path="/dashboard"        element={<DashboardPage />} />
        {/* Pro features */}
        <Route path="/pro/budgets"      element={<BudgetsPage />} />
        <Route path="/pro/goals"        element={<GoalsPage />} />
        <Route path="/pro/installments" element={<InstallmentsPage />} />
        <Route path="/pro/recurring"    element={<RecurringPage />} />
        <Route path="/pro/wallets"      element={<WalletsPage />} />
        <Route path="/pro/upgrade"      element={<UpgradePage />} />
        <Route path="/pricing"          element={<UpgradePage />} />
        <Route path="*"                 element={<Navigate to="/transactions" replace />} />
      </Routes>
      <BottomNav />
    </>
  )
}

export function AppRouter() {
  return (
    <Routes>
      {/* "/" = public landing. Auth check + /dashboard redirect handled inside */}
      <Route path="/" element={<LandingPage />} />

      {/* Legacy entry/onboarding screen */}
      <Route path="/entry" element={<EntryScreen />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/signup"           element={<SignupPage />} />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Referral invite link — captures ?ref= and redirects to /signup */}
      <Route path="/invite" element={<InviteRedirect />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="/*" element={<AppShell />} />
      </Route>
    </Routes>
  )
}
