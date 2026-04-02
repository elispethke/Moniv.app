import type { ReactNode } from 'react'
interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 overflow-hidden">
      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-secondary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
      />

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3 animate-fade-in">
        <img src="/logo.png" alt="Moniv" className="h-14 w-14 rounded-2xl object-cover shadow-glow-primary" />
        <span className="text-2xl font-extrabold tracking-tight text-foreground">
          Mon<span className="text-primary">iv</span>
        </span>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="rounded-3xl border border-surface-border bg-surface/80 backdrop-blur-md p-8 shadow-glass">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
