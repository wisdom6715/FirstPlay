/**
 * PWA & Platform Detection Utilities
 */

let _isDetectedInstalled = false;

// Listen for native install event
if (typeof window !== 'undefined') {
  window.addEventListener('appinstalled', () => {
    _isDetectedInstalled = true;
    window.__firstplay_deferred_prompt = null;
    window.dispatchEvent(new CustomEvent('firstplay:pwa-installed-detected'));
  });

  // Query modern Chromium getInstalledRelatedApps API
  if ('getInstalledRelatedApps' in navigator) {
    navigator.getInstalledRelatedApps().then((apps) => {
      if (apps && apps.length > 0) {
        _isDetectedInstalled = true;
        window.dispatchEvent(new CustomEvent('firstplay:pwa-installed-detected'));
      }
    }).catch(() => {});
  }
}

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
  if (_isDetectedInstalled) return true;
  return Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export function getInstallButtonLabel() {
  if (isPwaInstalled()) {
    return 'Installed';
  }
  const os = detectUserOS();
  if (os === 'windows') return 'Install on Windows';
  if (os === 'android') return 'Install on Android';
  if (os === 'mac') return 'Install on Mac';
  return 'Install App';
}

// Fallback alias for existing references
export function getDownloadButtonLabel() {
  return getInstallButtonLabel();
}

/**
 * Trigger native PWA installation prompt directly in Chrome without any custom modal.
 * Calls Chrome's built-in deferredPrompt.prompt() synchronously on the user's click gesture.
 * Returns: 'accepted' | 'dismissed' | 'already_installed' | 'not_supported'
 */
export async function triggerPwaInstall() {
  if (typeof window === 'undefined') return 'not_supported';

  // 1. Direct synchronous trigger if prompt is ready, or brief 300ms window if firing
  let deferredPrompt = window.__firstplay_deferred_prompt;
  if (!deferredPrompt && !isPwaInstalled()) {
    deferredPrompt = await new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(window.__firstplay_deferred_prompt || null);
        }
      }, 300);

      const onPrompt = (e) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(window.__firstplay_deferred_prompt || e?.detail);
        }
      };

      window.addEventListener('firstplay:pwa-prompt-available', onPrompt, { once: true });
    });
  }

  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.info('[FirstPlay PWA] Native install prompt outcome:', choice);
      if (choice?.outcome === 'accepted') {
        window.__firstplay_deferred_prompt = null;
        _isDetectedInstalled = true;
        return 'accepted';
      }
      return 'dismissed';
    } catch (e) {
      console.warn('[FirstPlay PWA] Prompt invocation error:', e);
    }
  }

  // 2. Check if the app is already installed
  if (isPwaInstalled()) {
    console.info('[FirstPlay PWA] App is already installed and running.');
    return 'already_installed';
  }

  // 3. Check getInstalledRelatedApps asynchronously if supported
  if ('getInstalledRelatedApps' in navigator) {
    try {
      const apps = await navigator.getInstalledRelatedApps();
      if (apps && apps.length > 0) {
        _isDetectedInstalled = true;
        return 'already_installed';
      }
    } catch (e) {}
  }

  return 'not_supported';
}

export function hasDeferredPrompt() {
  return typeof window !== 'undefined' && Boolean(window.__firstplay_deferred_prompt);
}
