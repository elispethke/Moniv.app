/**
 * Maps raw Supabase AuthError messages to i18n keys.
 * Accepts a translator function so error messages are always in the user's language.
 */
const ERROR_KEY_MAP: [string, string][] = [
  ['Invalid login credentials',                           'auth.errors.invalid_credentials'],
  ['Email not confirmed',                                  'auth.errors.email_not_confirmed'],
  ['User already registered',                              'auth.errors.already_registered'],
  ['Password should be at least 6 characters',            'auth.errors.weak_password'],
  ['Unable to validate email address: invalid format',    'auth.errors.invalid_email'],
  ['signup_disabled',                                     'auth.errors.signup_disabled'],
  ['over_email_send_rate_limit',                          'auth.errors.rate_limit'],
  ['email_address_not_authorized',                        'auth.errors.email_not_authorized'],
  ['weak_password',                                       'auth.errors.weak_password'],
  ['Email rate limit exceeded',                           'auth.errors.rate_limit'],
]

type Translator = (key: string) => string

export function mapAuthError(error: unknown, t: Translator): string {
  const message = error instanceof Error ? error.message : String(error)
  for (const [pattern, key] of ERROR_KEY_MAP) {
    if (message.includes(pattern)) return t(key)
  }
  return t('auth.errors.unexpected')
}
