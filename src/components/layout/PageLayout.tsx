import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageLayoutProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: ReactNode
}

export function PageLayout({ children, className, title, subtitle, action }: PageLayoutProps) {
  return (
    <main className={cn('mx-auto max-w-6xl px-4 pb-24 pt-6', className)}>
      {(title || action) && (
        <div className="mb-6 flex items-start justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </main>
  )
}
