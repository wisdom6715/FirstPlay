/**
 * PWA & Platform Detection Utilities
 */

export function detectUserOS() {
  if (typeof window === 'undefined') return 'windows';

  // 1. User Agent Client Hints (Modern Browsers)
  const platformHint = navigator.userAgentData?.platform?.toLowerCase() || '';
  if (platformHint) {
    if (platformHint.includes('win')) return 'windows';
    if (platformHint.includes('mac')) return 'mac';
    if (platformHint.includes('android')) return 'android';
  }

  // 2. Navigator Platform (Legacy)
  const platform = (navigator.platform || '').toLowerCase();
  if (platform.includes('win')) return 'windows';
  if (platform.includes('mac') || platform.includes('darwin')) return 'mac';
  if (platform.includes('iphone') || platform.includes('ipad') || platform.includes('ipod')) return 'ios';
  if (platform.includes('android')) return 'android';

  // 3. User Agent Fallback
  const ua = (navigator.userAgent || '').toLowerCase();
  if (ua.includes('windows') || ua.includes('win32') || ua.includes('win64')) return 'windows';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'mac';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
  if (ua.includes('android')) return 'android';

  return 'windows'; // Default fallback
}

export function isAndroidUser() {
  return detectUserOS() === 'android';
}

export function isPwaInstalled() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export function getDownloadButtonLabel() {
  const os = detectUserOS();
  if (os === 'windows') return 'Download for Windows';
  if (os === 'mac') return 'Download for MacOS';
  if (os === 'android') return 'Install for Android';
  return 'Download App';
}

/**
 * Trigger PWA installation prompt if available
 * Returns: 'accepted' | 'dismissed' | 'not_supported'
 */
export async function triggerPwaInstall() {
  if (typeof window === 'undefined') return 'not_supported';

  const deferredPrompt = window.__firstplay_deferred_prompt;
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        window.__firstplay_deferred_prompt = null;
        return 'accepted';
      }
      return 'dismissed';
    } catch (e) {
      console.warn('PWA prompt invocation error:', e);
    }
  }

  return 'not_supported';
}
