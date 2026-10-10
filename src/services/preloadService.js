/**
 * Game WebView Preloading Service
 * 
 * Manages background preloading of game web views to enable instantaneous
 * launching when the user taps "Play".
 * 
 * Invariants:
 * - Preloads the game's initial homepage and resources only.
 * - Does NOT click Play or simulate gameplay/multiplayer.
 * - Maintains a bounded LRU pool (MAX_PRELOADED_GAMES = 2).
 * - Tracks state per game: not_preloaded | preloading | ready | failed.
 */

export const PreloadState = {
  NOT_PRELOADED: 'not_preloaded',
  PRELOADING: 'preloading',
  READY: 'ready',
  FAILED: 'failed'
};

export const MAX_PRELOADED_GAMES = 2; // Configurable limit (2-3)

class PreloadService {
  constructor() {
    this.pool = new Map(); // id -> { item, state, lastAccessed, error }
    this.listeners = new Set();
    this.activeGameId = null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const items = this.getPoolItems();
    for (const listener of this.listeners) {
      try {
        listener(items);
      } catch (err) {
        console.error('Error in preload subscriber:', err);
      }
    }
  }

  getPoolItems() {
    return Array.from(this.pool.values());
  }

  setActiveGame(itemId) {
    this.activeGameId = itemId;
    if (itemId && this.pool.has(itemId)) {
      this.touchGame(itemId);
    }
  }

  getActiveGame() {
    return this.activeGameId;
  }

  getPreloadState(itemId) {
    const entry = this.pool.get(itemId);
    return entry ? entry.state : PreloadState.NOT_PRELOADED;
  }

  isPreloaded(itemId) {
    const entry = this.pool.get(itemId);
    return entry && entry.state === PreloadState.READY;
  }

  /**
   * Log the exact format required when opening an experience
   */
  logGameOpen(item) {
    if (!item) return;
    const state = this.getPreloadState(item.id);
    if (state === PreloadState.READY) {
      console.log(`[GAME OPEN] Using preloaded WebView: ${item.name}`);
    } else if (state === PreloadState.PRELOADING) {
      console.log(`[GAME OPEN] Preload not ready: ${item.name}`);
    } else {
      console.log(`[GAME OPEN] Creating fallback WebView: ${item.name}`);
    }
  }

  /**
   * Preload a game into the pool in the background
   */
  preloadGame(item) {
    if (!item || !item.url || item.category !== 'game') {
      return;
    }

    // Already in pool
    if (this.pool.has(item.id)) {
      const entry = this.pool.get(item.id);
      entry.lastAccessed = Date.now();
      return;
    }

    // Enforce pool limit: evict least recently used if needed
    if (this.pool.size >= MAX_PRELOADED_GAMES) {
      this.evictLru(new Set([item.id, this.activeGameId]));
    }

    console.log(`[GAME PRELOAD] Starting: ${item.name}`);
    console.log(`[GAME PRELOAD] Loading URL: ${item.url}`);

    this.pool.set(item.id, {
      item,
      state: PreloadState.PRELOADING,
      lastAccessed: Date.now(),
      error: null
    });

    this.notify();
  }

  markReady(itemId) {
    const entry = this.pool.get(itemId);
    if (entry && entry.state !== PreloadState.READY) {
      entry.state = PreloadState.READY;
      console.log(`[GAME PRELOAD] Ready: ${entry.item.name}`);
      this.notify();
    }
  }

  markFailed(itemId, errorDescription = '') {
    const entry = this.pool.get(itemId);
    if (entry && entry.state !== PreloadState.FAILED) {
      entry.state = PreloadState.FAILED;
      entry.error = errorDescription;
      console.log(`[GAME PRELOAD] Failed: ${entry.item.name}`);
      this.notify();
    }
  }

  touchGame(itemId) {
    const entry = this.pool.get(itemId);
    if (entry) {
      entry.lastAccessed = Date.now();
    }
  }

  evictLru(exclude = null) {
    const excludeSet = exclude instanceof Set ? exclude : new Set(exclude ? [exclude] : []);
    if (this.activeGameId) {
      excludeSet.add(this.activeGameId);
    }

    let oldestId = null;
    let oldestTime = Infinity;

    for (const [id, entry] of this.pool.entries()) {
      if (excludeSet.has(id)) continue;
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestId = id;
      }
    }

    if (oldestId) {
      const evicted = this.pool.get(oldestId);
      console.log(`[GAME PRELOAD] Evicting LRU: ${evicted?.item?.name}`);
      this.pool.delete(oldestId);
      this.notify();
    }
  }
}

export const preloadService = new PreloadService();
