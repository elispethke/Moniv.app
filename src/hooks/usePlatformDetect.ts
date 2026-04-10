/**
 * Detects the current platform to show appropriate PWA install instructions.
 */
export type InstallPlatform = 'ios' | 'android' | 'desktop' | 'unknown'

interface PlatformInfo {
  platform: InstallPlatform
  /** true when running as an installed PWA (standalone mode) */
  isStandalone: boolean
  /** true on any touchscreen mobile device */
  isMobile: boolean
}

export function usePlatformDetect(): PlatformInfo {
  if (typeof window === 'undefined') {
    return { platform: 'unknown', isStandalone: false, isMobile: false }
  }

  const ua = navigator.userAgent

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true

  const isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua)
  const isAndroid = /android/i.test(ua)
  const isMobile = isIOS || isAndroid || /mobile/i.test(ua)

  let platform: InstallPlatform = 'unknown'
  if (isIOS) platform = 'ios'
  else if (isAndroid) platform = 'android'
  else if (!isMobile) platform = 'desktop'

  return { platform, isStandalone, isMobile }
}
