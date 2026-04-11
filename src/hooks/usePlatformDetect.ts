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
  /**
   * true on ANY iOS device (iPhone/iPad/iPod), regardless of browser.
   * Use this to show the iOS install guide even when the user is on Chrome/Firefox for iOS.
   */
  isIOSDevice: boolean
  /**
   * true only on iOS Safari (where "Add to Home Screen" works directly).
   * false on Chrome/Firefox for iOS — those are WebKit wrappers with no install API.
   */
  isIOSSafari: boolean
}

export function usePlatformDetect(): PlatformInfo {
  if (typeof window === 'undefined') {
    return { platform: 'unknown', isStandalone: false, isMobile: false, isIOSDevice: false, isIOSSafari: false }
  }

  const ua = navigator.userAgent

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true

  // Any iOS device — iPadOS 13+ reports as desktop UA, check maxTouchPoints as fallback
  const isIOSDevice =
    /iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)

  // iOS Safari specifically: iOS device but NOT Chrome/Firefox wrapper
  const isIOSSafari = isIOSDevice && !/crios|fxios|chrome|chromium/i.test(ua)

  const isAndroid = /android/i.test(ua)
  const isMobile = isIOSDevice || isAndroid || /mobile/i.test(ua)

  let platform: InstallPlatform = 'unknown'
  if (isIOSSafari) platform = 'ios'
  else if (isAndroid) platform = 'android'
  else if (!isMobile) platform = 'desktop'

  return { platform, isStandalone, isMobile, isIOSDevice, isIOSSafari }
}
