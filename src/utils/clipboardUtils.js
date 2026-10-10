/**
 * Resilient multi-layer clipboard copy utility
 * Layer 1: Native Electron Win32 clipboard API (instant, synchronous, 100% reliable)
 * Layer 2: Modern Browser Navigator Clipboard API
 * Layer 3: Legacy document.execCommand fallback with offscreen textarea
 */
export async function copyToClipboard(text) {
  const content = String(text || '');
  if (!content) return false;

  // 1. Native Electron clipboard API (Most reliable in desktop environment)
  try {
    if (typeof window !== 'undefined' && window.firstPlayAPI?.copyText) {
      window.firstPlayAPI.copyText(content);
      return true;
    }
  } catch (e) {
    console.warn('[FirstPlay] Native clipboard write error:', e);
  }

  // 2. Standard navigator.clipboard API
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }
  } catch (e) {
    console.warn('[FirstPlay] Navigator clipboard write error:', e);
  }

  // 3. Legacy DOM execCommand fallback
  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (e) {
    console.warn('[FirstPlay] execCommand fallback error:', e);
  }

  return false;
}
