import { Bot, Sparkles } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export function AIAssistant() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="flex items-center gap-2 w-full">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow-primary">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t('insights.ai_title')}</h3>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary-light" />
            {t('insights.ai_coming_soon')}
          </p>
        </div>
        <span className="ml-auto rounded-full bg-surface-elevated px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-surface-border">
          {t('insights.ai_coming_soon')}
        </span>
      </div>

      <div className="w-full rounded-2xl border border-dashed border-surface-border bg-surface-elevated/50 px-6 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary/20 mx-auto mb-3">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{t('insights.ai_coming_soon')}</p>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
          {t('insights.ai_coming_soon_desc')}
        </p>
      </div>
    </div>
  )
}
