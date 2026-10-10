/**
 * Game Utility Functions
 */

/**
 * Checks if a catalog item is Lagos Life.
 * Strictly checks name, domain URL, or seed ID.
 */
export function isLagosLife(item) {
  if (!item) return false;
  const name = String(item.name || '').toLowerCase();
  const url = String(item.url || '').toLowerCase();
  const id = String(item.id || '');
  return (
    name.includes('lagos life') ||
    url.includes('lagoslife.app') ||
    id === '9ITCaLkofj1QqZzCneYN'
  );
}

/**
 * Opens game in a new browser tab safely with noopener/noreferrer.
 */
export function openGameInNewTab(item) {
  const targetUrl = item?.url || 'https://lagoslife.app';
  if (typeof window !== 'undefined') {
    if (window.firstPlayAPI?.openExternal) {
      window.firstPlayAPI.openExternal(targetUrl);
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
