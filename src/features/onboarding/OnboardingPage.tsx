import { useState } from 'react'
import { ChevronRight, BarChart2, TrendingDown, Sparkles, Target, ShieldCheck, Crown } from 'lucide-react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { cn } from '@/utils/cn'

const SCREENS = [
  {
    icon: <BarChart2 className="h-10 w-10 text-primary-foreground" />,
    title: 'Adicione receitas e despesas',
    description:
      'Registe cada entrada e saída de dinheiro em segundos. Categorize automaticamente e tenha o histórico completo das suas finanças.',
  },
  {
    icon: <TrendingDown className="h-10 w-10 text-primary-foreground" />,
    title: 'Acompanhe os seus gastos',
    description:
      'Veja exactamente onde o seu dinheiro vai. Gráficos detalhados por categoria revelam padrões de consumo que passavam despercebidos.',
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary-foreground" />,
    title: 'Veja insights detalhados',
    description:
      'O Moniv analisa os seus dados e apresenta relatórios mensais inteligentes — para que tome decisões com clareza e confiança.',
  },
  {
    icon: <Target className="h-10 w-10 text-primary-foreground" />,
    title: 'Defina metas financeiras',
    description:
      'Poupança para férias, fundo de emergência ou entrada de casa. Crie metas, acompanhe o progresso e celebre cada conquista.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary-foreground" />,
    title: 'Mantenha o controlo total',
    description:
      'Orçamentos por categoria, parcelas e despesas recorrentes. O Moniv mantém-no sempre a par — sem surpresas no fim do mês.',
  },
  {
    icon: <Crown className="h-10 w-10 text-primary-foreground" />,
    title: 'Upgrade para Pro',
    description:
      'Desbloqueie orçamentos, metas, exportação de dados, carteiras múltiplas e muito mais. Comece gratuitamente — evolua quando quiser.',
  },
]

export function OnboardingPage() {
  const [step, setStep] = useState(0)
  const { completeOnboarding, skipOnboarding } = useOnboarding()

  const screen = SCREENS[step]
  const isLast = step === SCREENS.length - 1

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-background px-6 overflow-hidden">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex w-full max-w-sm items-center justify-between pt-12">
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {step + 1}&nbsp;/&nbsp;{SCREENS.length}
        </span>
        <button
          onClick={skipOnboarding}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Saltar
        </button>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 flex w-full max-w-sm gap-1.5 mt-4">
        {SCREENS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= step ? 'bg-primary' : 'bg-surface-elevated'
            )}
          />
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 text-center py-8 animate-fade-in">
        {/* Icon */}
        <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-primary shadow-glow-primary">
          {screen.icon}
        </div>

        {/* Text */}
        <div className="max-w-xs space-y-3">
          <h2 className="text-2xl font-extrabold leading-snug text-foreground">
            {screen.title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {screen.description}
          </p>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm pb-10 animate-slide-up">
        <button
          onClick={isLast ? completeOnboarding : () => setStep((s) => s + 1)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-4 text-base font-bold text-primary-foreground shadow-glow-primary transition-all active:scale-[0.98]"
        >
          {isLast ? 'Começar' : 'Próximo'}
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
