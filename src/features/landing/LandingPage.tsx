import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart2, Shield, Zap, TrendingUp, Target,
  CreditCard, ArrowRight, Crown, ArrowUpRight, ArrowDownLeft,
  Check, FileDown, Brain,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from '@/hooks/useTranslation'
import { LanguageSelector } from '@/components/selectors/LanguageSelector'

// ── Splash loader ──────────────────────────────────────────────────────────────
function SplashLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <img src="/logo.png" alt="Moniv" className="h-12 w-12 rounded-2xl animate-pulse-slow shadow-glow-primary" />
    </div>
  )
}

// ── Feature pill ───────────────────────────────────────────────────────────────
function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-surface-border bg-surface/60 px-3.5 py-2 text-xs font-medium text-foreground backdrop-blur-sm">
      <span className="text-primary">{icon}</span>
      {label}
    </div>
  )
}

// ── Value card ─────────────────────────────────────────────────────────────────
function ValueCard({
  icon,
  title,
  desc,
  accent,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface/50 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-surface-elevated">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  )
}

// ── Static trend line chart (SVG) ─────────────────────────────────────────────
function TrendChartMock() {
  // 6-month mock data points (normalized to SVG viewport 0-70 height, lower Y = higher value)
  const incomePoints = '12,42 52,32 92,36 132,18 172,26 212,12'
  const expensePoints = '12,58 52,52 92,55 132,48 172,51 212,49'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

  return (
    <div className="px-4 pt-3 pb-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Trend
        </p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[9px] font-medium text-accent">
            <span className="h-1.5 w-3 rounded-full bg-accent inline-block" /> Income
          </span>
          <span className="flex items-center gap-1 text-[9px] font-medium text-danger">
            <span className="h-1.5 w-3 rounded-full bg-danger inline-block" /> Expenses
          </span>
        </div>
      </div>
      <svg viewBox="0 0 224 72" className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[18, 36, 54].map((y) => (
          <line key={y} x1="0" y1={y} x2="224" y2={y} stroke="currentColor" strokeWidth="0.4" className="text-surface-border/60" />
        ))}
        {/* Income fill */}
        <polygon
          points={`12,42 52,32 92,36 132,18 172,26 212,12 212,68 12,68`}
          fill="url(#incomeGrad)"
        />
        {/* Expense fill */}
        <polygon
          points={`12,58 52,52 92,55 132,48 172,51 212,49 212,68 12,68`}
          fill="url(#expenseGrad)"
        />
        {/* Income line */}
        <polyline
          points={incomePoints}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Expense line */}
        <polyline
          points={expensePoints}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Income dots */}
        {[[12,42],[52,32],[92,36],[132,18],[172,26],[212,12]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="#10b981" />
        ))}
        {/* Expense dots */}
        {[[12,58],[52,52],[92,55],[132,48],[172,51],[212,49]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="#ef4444" />
        ))}
      </svg>
      {/* Month labels */}
      <div className="flex justify-between mt-0.5 px-1">
        {months.map((m) => (
          <span key={m} className="text-[8px] text-muted-foreground">{m}</span>
        ))}
      </div>
    </div>
  )
}

// ── Static category donut + legend ─────────────────────────────────────────────
function CategoryChartMock() {
  // Donut chart: r=28, circumference=175.9
  // Segments: Food 36%, Transport 22%, Housing 26%, Other 16%
  const C = 175.9
  const segments = [
    { label: 'Food',      pct: '36%', len: C * 0.36, color: '#ef4444', bg: 'bg-danger' },
    { label: 'Transport', pct: '22%', len: C * 0.22, color: '#6366f1', bg: 'bg-primary' },
    { label: 'Housing',   pct: '26%', len: C * 0.26, color: '#8b5cf6', bg: 'bg-secondary' },
    { label: 'Other',     pct: '16%', len: C * 0.16, color: '#10b981', bg: 'bg-accent' },
  ]

  let offset = 0
  const arcs = segments.map((s) => {
    const arc = { ...s, offset: -(offset) }
    offset += s.len
    return arc
  })

  return (
    <div className="px-4 py-3 flex items-center gap-4 border-t border-surface-border/50">
      {/* Donut */}
      <div className="flex-shrink-0">
        <svg viewBox="0 0 64 64" className="w-14 h-14">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-border/40" />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx="32" cy="32" r="28"
              fill="none"
              stroke={a.color}
              strokeWidth="6"
              strokeDasharray={`${a.len} ${C - a.len}`}
              strokeDashoffset={a.offset}
              transform="rotate(-90 32 32)"
            />
          ))}
          {/* Center label */}
          <text x="32" y="35" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" className="text-foreground">
            4 cats
          </text>
        </svg>
      </div>
      {/* Legend */}
      <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${s.bg}`} />
            <span className="text-[9px] text-muted-foreground truncate">{s.label}</span>
            <span className="text-[9px] font-bold text-foreground ml-auto">{s.pct}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Mock app preview (hero right panel) ───────────────────────────────────────
function AppPreview() {
  const { t } = useTranslation()

  const rows = [
    { label: 'Salary',      amount: '+€2.800', type: 'income',  cat: t('categories.salary') },
    { label: 'Supermarket', amount: '-€134',   type: 'expense', cat: t('categories.food') },
    { label: 'Freelance',   amount: '+€650',   type: 'income',  cat: t('categories.freelance') },
    { label: 'Fuel',        amount: '-€62',    type: 'expense', cat: t('categories.transport') },
  ]

  return (
    <div className="relative w-full max-w-sm lg:max-w-none">
      {/* Outer glow ring */}
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 blur-2xl" />

      <div className="relative rounded-3xl border border-surface-border bg-surface/80 backdrop-blur-xl shadow-2xl overflow-hidden">

        {/* ── 1. Balance header ─────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-primary to-secondary p-5">
          <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">
            {t('landing.preview_balance_label')}
          </p>
          <p className="mt-1 text-3xl font-extrabold text-primary-foreground">
            €3.239<span className="text-lg">,00</span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-primary-foreground/10 px-3 py-2">
              <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wide">{t('dashboard.income')}</p>
              <p className="text-sm font-bold text-primary-foreground">€3.450</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 px-3 py-2">
              <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wide">{t('dashboard.expenses')}</p>
              <p className="text-sm font-bold text-primary-foreground">€211</p>
            </div>
          </div>
        </div>

        {/* ── 2. Pro badge ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/8 border-b border-surface-border/50">
          <Crown className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Pro Analytics</span>
        </div>

        {/* ── 3. Trend line chart ───────────────────────────────────────── */}
        <TrendChartMock />

        {/* ── 4. Category donut ─────────────────────────────────────────── */}
        <CategoryChartMock />

        {/* ── 5. Recent transactions ───────────────────────────────────── */}
        <div className="px-4 pt-3 pb-2 border-t border-surface-border/50 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t('landing.preview_recent')}
          </p>
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-2.5">
              <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                r.type === 'income' ? 'bg-accent/15' : 'bg-danger/15'
              }`}>
                {r.type === 'income'
                  ? <ArrowUpRight className="h-3 w-3 text-accent" />
                  : <ArrowDownLeft className="h-3 w-3 text-danger" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground truncate">{r.label}</p>
                <p className="text-[9px] text-muted-foreground">{r.cat}</p>
              </div>
              <p className={`text-[11px] font-bold flex-shrink-0 ${
                r.type === 'income' ? 'text-accent' : 'text-danger'
              }`}>{r.amount}</p>
            </div>
          ))}
        </div>

        {/* ── 6. Footer strip ───────────────────────────────────────────── */}
        <div className="border-t border-surface-border px-4 py-2.5 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-1.5">
            <Crown className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">Moniv Pro</span>
          </div>
          <span className="text-[9px] text-muted-foreground">{t('landing.preview_pro_active')}</span>
        </div>
      </div>
    </div>
  )
}

// ── Pro analytics mock (right panel of Pro section) ──────────────────────────
function ProAnalyticsMock() {
  const bars = [
    { label: 'Jan', income: 65, expense: 42 },
    { label: 'Fev', income: 78, expense: 55 },
    { label: 'Mar', income: 60, expense: 38 },
    { label: 'Abr', income: 90, expense: 61 },
    { label: 'Mai', income: 85, expense: 48 },
    { label: 'Jun', income: 100, expense: 52 },
  ]

  return (
    <div className="relative w-full max-w-sm lg:max-w-none">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/15 via-secondary/8 to-accent/8 blur-2xl" />
      <div className="relative rounded-3xl border border-surface-border bg-surface/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* PDF Header */}
        <div className="bg-gradient-to-r from-primary to-secondary px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">Relatório PDF</p>
              <p className="text-sm font-bold text-primary-foreground">Junho 2024</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-foreground/20">
              <FileDown className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-primary-foreground/10 px-2 py-1.5 text-center">
              <p className="text-[9px] text-primary-foreground/60 uppercase">Receita</p>
              <p className="text-xs font-bold text-primary-foreground">€3.450</p>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 px-2 py-1.5 text-center">
              <p className="text-[9px] text-primary-foreground/60 uppercase">Despesa</p>
              <p className="text-xs font-bold text-primary-foreground">€1.790</p>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 px-2 py-1.5 text-center">
              <p className="text-[9px] text-primary-foreground/60 uppercase">Poupança</p>
              <p className="text-xs font-bold text-accent-light">48%</p>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Evolução Mensal</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] text-accent"><span className="h-1.5 w-2.5 rounded-full bg-accent inline-block" /> Receita</span>
              <span className="flex items-center gap-1 text-[9px] text-danger"><span className="h-1.5 w-2.5 rounded-full bg-danger inline-block" /> Despesa</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-20">
            {bars.map((b) => (
              <div key={b.label} className="flex-1 flex items-end gap-0.5">
                <div className="flex-1 rounded-t bg-accent/70 transition-all" style={{ height: `${b.income * 0.8}%` }} />
                <div className="flex-1 rounded-t bg-danger/60 transition-all" style={{ height: `${b.expense * 0.8}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            {bars.map((b) => <span key={b.label} className="flex-1 text-center text-[8px] text-muted-foreground">{b.label}</span>)}
          </div>
        </div>

        {/* AI insight strip */}
        <div className="border-t border-surface-border/60 px-4 py-3 bg-primary/5">
          <div className="flex items-center gap-2">
            <Brain className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <p className="text-[10px] font-semibold text-foreground">
              Você poupou <span className="text-accent">€1.660</span> este mês — acima da média em 18%
            </p>
          </div>
        </div>

        {/* Pro footer */}
        <div className="border-t border-surface-border px-4 py-2.5 flex items-center justify-between bg-surface-elevated/60">
          <div className="flex items-center gap-1.5">
            <Crown className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">Moniv Pro</span>
          </div>
          <span className="text-[9px] text-muted-foreground">Acesso completo ativo</span>
        </div>
      </div>
    </div>
  )
}

// ── Landing Page ───────────────────────────────────────────────────────────────
export function LandingPage() {
  const { isAuthenticated, isInitialized } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (!isInitialized) return <SplashLoader />
  if (isAuthenticated) return <Navigate to={`/dashboard${location.search}`} replace />

  const pricingFeatures = [
    t('landing.pricing_feat_1'),
    t('landing.pricing_feat_2'),
    t('landing.pricing_feat_3'),
    t('landing.pricing_feat_4'),
    t('landing.pricing_feat_5'),
    t('landing.pricing_feat_6'),
  ]

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-accent/6 blur-3xl" />

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full border-b border-surface-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-6 lg:px-16 xl:px-24">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Moniv" className="h-8 w-8 rounded-xl object-cover shadow-glow-primary" />
            <span className="text-lg font-extrabold text-foreground tracking-tight">
              Mon<span className="text-primary">iv</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">{t('landing.nav_features')}</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">{t('landing.nav_pricing')}</a>
          </nav>

          {/* Right side: language selector + auth */}
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('entry.cta_login')}
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow-primary transition-all hover:opacity-90 active:scale-95"
            >
              {t('landing.cta_primary')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 w-full px-6 lg:px-16 xl:px-24 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20 xl:gap-28">

          {/* Left — text content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-1">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
              <Crown className="h-3 w-3" />
              {t('landing.badge')}
            </div>

            {/* Headline */}
            <h1 className="text-[2.5rem] sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              <span className="gradient-text-animated">{t('landing.hero_title_1')}</span>
              <br className="hidden sm:block" />{' '}
              {t('landing.hero_title_2')}{' '}
              {t('landing.hero_title_accent')}
            </h1>

            <p className="mt-5 text-base lg:text-lg leading-relaxed text-muted-foreground max-w-md">
              {t('landing.hero_subtitle')}
            </p>

            {/* Feature pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <FeaturePill icon={<BarChart2 className="h-3.5 w-3.5" />} label={t('landing.pill_charts')} />
              <FeaturePill icon={<Target className="h-3.5 w-3.5" />} label={t('landing.pill_goals')} />
              <FeaturePill icon={<Shield className="h-3.5 w-3.5" />} label={t('landing.pill_secure')} />
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-8 py-4 text-base font-bold text-primary-foreground shadow-glow-primary transition-all hover:opacity-90 active:scale-[0.98]"
              >
                {t('landing.cta_primary')}
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center rounded-2xl border border-surface-border bg-surface/60 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-surface-elevated active:scale-[0.98]"
              >
                {t('entry.cta_login')}
              </button>
            </div>

            {/* Social proof */}
            <p className="mt-4 text-[11px] text-muted-foreground">{t('landing.social_proof')}</p>
          </div>

          {/* Right — app preview */}
          <div className="w-full max-w-xs sm:max-w-sm lg:flex-1 lg:max-w-lg xl:max-w-xl">
            <AppPreview />
          </div>
        </div>
      </section>

      {/* ── Pro section ──────────────────────────────────────────────────── */}
      <section className="relative z-10 w-full px-6 lg:px-16 xl:px-24 pb-20 lg:pb-28">
        <div
          className="rounded-3xl border border-primary/20 overflow-hidden"
          style={{ boxShadow: '0 0 60px 0 rgba(99,102,241,0.1)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* LEFT — copy */}
            <div className="p-8 lg:p-12 bg-gradient-to-br from-primary/8 via-surface to-surface">
              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                <Crown className="h-3 w-3" />
                Moniv Pro
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-3">
                Controle total das suas finanças
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Melhores insights, decisões mais inteligentes e visibilidade total do seu patrimônio —
                tudo num único painel.
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {[
                  { icon: <BarChart2 className="h-3.5 w-3.5" />, text: 'Análises avançadas e gráficos de evolução' },
                  { icon: <Target className="h-3.5 w-3.5" />, text: 'Metas e orçamentos com progresso automático' },
                  { icon: <CreditCard className="h-3.5 w-3.5" />, text: 'Parcelamentos e recorrências controlados' },
                  { icon: <Brain className="h-3.5 w-3.5" />, text: 'Insights inteligentes sobre seus hábitos (em breve)' },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      {icon}
                    </span>
                    <span className="text-xs text-foreground leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>

              {/* PDF highlight */}
              <div className="mb-6 rounded-xl border border-accent/25 bg-accent/8 p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <FileDown className="h-4 w-4 text-accent flex-shrink-0" />
                  <p className="text-xs font-bold text-foreground">Exporte seus dados como PDF profissional</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Relatórios completos com gráficos, categorias e resumo financeiro do período.
                  Ideal para acompanhar seu progresso ou partilhar com um consultor.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow-primary transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <Crown className="h-4 w-4" />
                  Assinar Pro — €6/mês
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center justify-center rounded-2xl border border-surface-border bg-surface/60 px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-surface-elevated active:scale-[0.98]"
                >
                  Começar grátis
                </button>
              </div>
              <p className="mt-2.5 text-[11px] text-muted-foreground">
                {t('landing.social_proof')}
              </p>
            </div>

            {/* RIGHT — visual */}
            <div className="flex items-center justify-center p-6 lg:p-10 bg-gradient-to-bl from-primary/6 to-transparent border-t lg:border-t-0 lg:border-l border-primary/15">
              <ProAnalyticsMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 w-full px-6 lg:px-16 xl:px-24 pb-20 lg:pb-32">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t('landing.features_eyebrow')}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t('landing.features_title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          <ValueCard
            icon={<TrendingUp className="h-5 w-5 text-primary-foreground" />}
            accent="bg-gradient-primary"
            title={t('landing.feat1_title')}
            desc={t('landing.feat1_desc')}
          />
          <ValueCard
            icon={<Target className="h-5 w-5 text-primary-foreground" />}
            accent="bg-gradient-accent"
            title={t('landing.feat2_title')}
            desc={t('landing.feat2_desc')}
          />
          <ValueCard
            icon={<CreditCard className="h-5 w-5 text-white" />}
            accent="bg-gradient-to-br from-secondary to-primary"
            title={t('landing.feat3_title')}
            desc={t('landing.feat3_desc')}
          />
          <ValueCard
            icon={<Zap className="h-5 w-5 text-white" />}
            accent="bg-gradient-to-br from-accent to-secondary"
            title={t('landing.feat4_title')}
            desc={t('landing.feat4_desc')}
          />
        </div>
      </section>

      {/* ── Pricing teaser ────────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 w-full px-6 lg:px-16 xl:px-24 pb-24 lg:pb-32">
        <div className="rounded-3xl border border-surface-border bg-surface/50 backdrop-blur-sm p-8 lg:p-12">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                <Crown className="h-3 w-3" />
                {t('landing.pricing_badge')}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {t('landing.pricing_title')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {t('landing.pricing_subtitle')}
              </p>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {pricingFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-foreground">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing cards */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto lg:w-56">
              <div className="flex-1 lg:flex-none rounded-2xl border-2 border-primary bg-primary/10 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1">{t('landing.plan_monthly')}</p>
                <p className="text-3xl font-extrabold text-foreground">€6</p>
                <p className="text-xs text-muted-foreground">/ {t('pro.per_month')}</p>
              </div>
              <div className="flex-1 lg:flex-none relative rounded-2xl border-2 border-accent bg-accent/10 p-4 text-center">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  {t('landing.plan_badge')}
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-accent mb-1 mt-1">{t('landing.plan_yearly')}</p>
                <p className="text-3xl font-extrabold text-foreground">€55</p>
                <p className="text-xs text-muted-foreground">/ {t('pro.per_year')}</p>
                <p className="text-[10px] font-semibold text-accent mt-1">{t('landing.plan_savings')}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-8 py-4 text-base font-bold text-primary-foreground shadow-glow-primary transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {t('landing.cta_final')}
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="flex items-center justify-center text-xs text-muted-foreground">
              {t('landing.social_proof')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-surface-border/50">
        <div className="flex w-full items-center justify-between px-6 lg:px-16 xl:px-24 py-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Moniv" className="h-5 w-5 rounded-lg object-cover" />
            <span className="font-semibold">Mon<span className="text-primary">iv</span></span>
          </div>
          <p>{t('landing.footer_copy', { year: String(new Date().getFullYear()) })}</p>
        </div>
      </footer>
    </div>
  )
}
