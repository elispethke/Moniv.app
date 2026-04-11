import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface Section {
  title: string
  content: ReactNode
}

interface LegalPageProps {
  title: string
  subtitle: string
  lastUpdated: string
  sections: Section[]
}

function SectionBlock({ title, content }: Section) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="text-sm text-foreground-muted leading-relaxed space-y-2">{content}</div>
    </section>
  )
}

export function LegalPage({ title, subtitle, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Ambient blob */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-2xl px-5 py-10 sm:py-16">
        {/* Back button */}
        <Link
          to="/"
          className={cn(
            'mb-8 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
            'text-foreground-muted hover:text-foreground hover:bg-surface-elevated',
            'transition-colors',
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à página inicial
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Legal
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">{subtitle}</p>
          <p className="mt-1 text-xs text-foreground-muted/60">
            Última actualização: {lastUpdated}
          </p>
        </div>

        {/* Divider */}
        <div className="mb-8 h-px bg-surface-border" />

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((s) => (
            <SectionBlock key={s.title} {...s} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-surface-border pt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/logo.webp" alt="Moniv" className="h-6 w-6" style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.6))' }} />
            <span className="font-semibold text-foreground">
              Mon<span className="text-primary">iv</span>
            </span>
          </div>
          <p className="text-xs text-foreground-muted">
            © {new Date().getFullYear()} Moniv. Todos os direitos reservados.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs">
            <Link to="/privacy" className="text-foreground-muted hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            <span className="text-surface-border">·</span>
            <Link to="/terms" className="text-foreground-muted hover:text-primary transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
