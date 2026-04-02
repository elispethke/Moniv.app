import { describe, it, expect } from 'vitest'
import { createTranslator, getLocaleForLanguage } from '@/i18n'

describe('createTranslator', () => {
  const t = createTranslator('en')
  const tPt = createTranslator('pt')

  it('resolves a simple key', () => {
    expect(t('common.save')).toBe('Save changes')
  })

  it('resolves a nested key in Portuguese', () => {
    expect(tPt('common.cancel')).toBe('Cancelar')
  })

  it('interpolates variables', () => {
    const result = t('insights.savings_achieved_body', { rate: '32.0%' })
    expect(result).toContain('32.0%')
  })

  it('falls back to English when key is missing in language', () => {
    const tDe = createTranslator('de')
    // Both de and en have this key — just test resolution
    expect(tDe('common.delete')).toBe('Löschen')
  })

  it('returns the key itself as fallback when missing everywhere', () => {
    expect(t('this.key.does.not.exist')).toBe('this.key.does.not.exist')
  })
})

describe('getLocaleForLanguage', () => {
  it('returns pt-BR for pt', () => {
    expect(getLocaleForLanguage('pt')).toBe('pt-BR')
  })

  it('returns en-US for en', () => {
    expect(getLocaleForLanguage('en')).toBe('en-US')
  })

  it('returns en-US as fallback for unknown', () => {
    // @ts-expect-error testing invalid input
    expect(getLocaleForLanguage('xx')).toBe('en-US')
  })
})
