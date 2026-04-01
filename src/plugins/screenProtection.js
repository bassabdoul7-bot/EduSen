// Screen Protection Plugin for Capacitor
// On Android: uses FLAG_SECURE to block screenshots
// On iOS: uses UIScreen notification to detect screenshots
// On Web: falls back to blur overlay (handled in SecurePDFViewer)

import { Capacitor, registerPlugin } from '@capacitor/core'

const ScreenProtection = registerPlugin('ScreenProtection', {
  web: () => ({
    enable: () => {
      console.log('ScreenProtection: web fallback - using blur overlay')
    },
    disable: () => {
      console.log('ScreenProtection: web fallback disabled')
    }
  })
})

export const enableScreenProtection = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await ScreenProtection.enable()
    } catch (e) {
      console.log('ScreenProtection not available:', e)
    }
  }
}

export const disableScreenProtection = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await ScreenProtection.disable()
    } catch (e) {
      console.log('ScreenProtection not available:', e)
    }
  }
}

export default ScreenProtection
