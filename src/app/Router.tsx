import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton'
import { TransactionsSkeleton } from '@/components/skeletons/TransactionsSkeleton'
import { InsightsSkeleton } from '@/components/skeletons/InsightsSkeleton'
import { ProFeatureSkeleton } from '@/components/skeletons/ProFeatureSkeleton'
import { AppDownloadSection } from '@/components/pwa/AppDownloadSection'

// ── Lazy imports ─────────────────────────────────────────────────────────────
// Páginas públicas (carregam rápido — não há motivo para lazy, mas isolamos
// o AdminPage e as Pro features que são pesadas)
import { LandingPage }        from '@/features/landing/LandingPage'
import { EntryScreen }        from '@/features/entry/EntryScreen'
import { LoginPage }          from '@/features/auth/LoginPage'
import { SignupPage }         from '@/features/auth/SignupPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { ResetPasswordPage }  from '@/features/auth/ResetPasswordPage'
import { AuthCallbackPage }   from '@/features/auth/AuthCallbackPage'
import { PrivacyPage }        from '@/features/legal/PrivacyPage'
import { TermsPage }          from '@/features/legal/TermsPage'

// Páginas do app shell — lazy (reduzem bundle inicial significativamente)
const DashboardPage     = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const TransactionsPage  = lazy(() => import('@/features/transactions/TransactionsPage').then(m => ({ default: m.TransactionsPage })))
const InsightsPage      = lazy(() => import('@/features/insights/InsightsPage').then(m => ({ default: m.InsightsPage })))
const OnboardingPage    = lazy(() => import('@/features/onboarding/OnboardingPage').then(m => ({ default: m.OnboardingPage })))

// Pro features — lazy (só carregam para utilizadores Pro)
const BudgetsPage       = lazy(() => import('@/features/pro/budgets/BudgetsPage').then(m => ({ default: m.BudgetsPage })))
const GoalsPage         = lazy(() => import('@/features/pro/goals/GoalsPage').then(m => ({ default: m.GoalsPage })))
const InstallmentsPage  = lazy(() => import('@/features/pro/installments/InstallmentsPage').then(m => ({ default: m.InstallmentsPage })))
const RecurringPage     = lazy(() => import('@/features/pro/recurring/RecurringPage').then(m => ({ default: m.RecurringPage })))
const WalletsPage       = lazy(() => import('@/features/pro/wallets/WalletsPage').then(m => ({ default: m.WalletsPage })))
const UpgradePage       = lazy(() => import('@/features/pro/UpgradePage').then(m => ({ default: m.UpgradePage })))
const AdminPage         = lazy(() => import('@/features/admin/AdminPage').then(m => ({ default: m.AdminPage })))

// ── Page skeleton — fallback enquanto o chunk carrega ────────────────────────
function PageSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <img
          src="/logo.webp"
          alt=""
          aria-hidden
          className="h-10 w-10 animate-pulse-slow opacity-70"
          style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }}
        />
        <div className="h-1 w-24 rounded-full bg-primary/20 animate-pulse" />
      </div>
    </div>
  )
}

/** Captura ?ref= param, escreve em localStorage e redireciona para /signup */
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* flex-1 so the content grows; bottom padding clears the fixed BottomNav (h-16 + pb-safe ≤ 98px) */}
      <main className="flex-1" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}>
      <Routes>
        <Route
          path="/transactions"
          element={
            <ErrorBoundary feature="transactions">
              <Suspense fallback={<TransactionsSkeleton />}>
                <TransactionsPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/insights"
          element={
            <ErrorBoundary feature="insights">
              <Suspense fallback={<InsightsSkeleton />}>
                <InsightsPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ErrorBoundary feature="dashboard">
              <Suspense fallback={<DashboardSkeleton />}>
                <DashboardPage />
              </Suspense>
            </ErrorBoundary>
          }
        />

        {/* Pro features */}
        <Route
          path="/pro/budgets"
          element={
            <ErrorBoundary feature="budgets">
              <Suspense fallback={<ProFeatureSkeleton />}>
                <BudgetsPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/pro/goals"
          element={
            <ErrorBoundary feature="goals">
              <Suspense fallback={<ProFeatureSkeleton />}>
                <GoalsPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/pro/installments"
          element={
            <ErrorBoundary feature="installments">
              <Suspense fallback={<ProFeatureSkeleton />}>
                <InstallmentsPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/pro/recurring"
          element={
            <ErrorBoundary feature="recurring">
              <Suspense fallback={<ProFeatureSkeleton />}>
                <RecurringPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/pro/wallets"
          element={
            <ErrorBoundary feature="wallets">
              <Suspense fallback={<ProFeatureSkeleton />}>
                <WalletsPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/pro/upgrade"
          element={
            <ErrorBoundary feature="upgrade">
              <Suspense fallback={<PageSkeleton />}>
                <UpgradePage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/pricing"
          element={
            <ErrorBoundary feature="upgrade">
              <Suspense fallback={<PageSkeleton />}>
                <UpgradePage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route path="*" element={<Navigate to="/transactions" replace />} />
      </Routes>

      {/* App download section — inline card visible on all authenticated pages */}
      <div className="mx-auto max-w-6xl xl:max-w-7xl px-4 xl:px-6">
        <AppDownloadSection variant="inline" />
      </div>
      </main>

      <BottomNav />
    </div>
  )
}

export function AppRouter() {
  return (
    <Routes>
      {/* Página inicial pública */}
      <Route path="/" element={<LandingPage />} />

      {/* Páginas legais — sempre públicas */}
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms"   element={<TermsPage />} />

      {/* Ecrã legacy */}
      <Route path="/entry" element={<EntryScreen />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/signup"          element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Auth callback — Supabase email invite e magic-link */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Referral — captura ?ref= e redireciona para /signup */}
      <Route path="/invite" element={<InviteRedirect />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/onboarding"
          element={
            <ErrorBoundary feature="onboarding">
              <Suspense fallback={<PageSkeleton />}>
                <OnboardingPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={
              <ErrorBoundary feature="admin">
                <Suspense fallback={<PageSkeleton />}>
                  <AdminPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Route>
        <Route path="/*" element={<AppShell />} />
      </Route>
    </Routes>
  )
}
