import { Component, type ReactNode, type ErrorInfo } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  /**
   * Fallback customizado. Se não fornecido, usa o UI padrão.
   */
  fallback?: ReactNode
  /**
   * Identificador da feature (ex: "dashboard", "transactions") para o log.
   */
  feature?: string
}

interface State {
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary de classe React.
 * Captura qualquer erro não tratado na sub-árvore e exibe um fallback elegante
 * em vez de deixar o app inteiro em branco.
 *
 * Uso:
 *   <ErrorBoundary feature="dashboard">
 *     <DashboardPage />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    const feature = this.props.feature ?? 'unknown'

    // Log estruturado — em produção, integrar com Sentry/LogFlare
    console.error(`[ErrorBoundary:${feature}]`, error, errorInfo)

    // TODO (Fase 2): Sentry.captureException(error, { extra: { feature, ...errorInfo } })
  }

  private handleReset = () => {
    this.setState({ error: null, errorInfo: null })
  }

  render() {
    const { error } = this.state
    const { children, fallback } = this.props

    if (error) {
      if (fallback) return fallback

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/15">
            <AlertTriangle className="h-7 w-7 text-danger" />
          </div>

          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Algo correu mal
          </h2>
          <p className="mb-6 max-w-sm text-sm text-foreground-muted">
            Ocorreu um erro inesperado nesta secção. Os seus dados estão seguros.
          </p>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.97]"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      )
    }

    return children
  }
}
