import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Analytics } from '@vercel/analytics/react';

// Web Compatibility Adapter for Browser Environment
if (typeof window !== 'undefined' && !window.firstPlayAPI) {
  let isMax = false;
  const stateListeners = new Set();
  const fsListeners = new Set();

  document.addEventListener('fullscreenchange', () => {
    const isFs = Boolean(document.fullscreenElement);
    fsListeners.forEach((cb) => {
      try { cb({ isFullscreen: isFs }); } catch (e) {}
    });
  });

  window.firstPlayAPI = {
    platform: typeof navigator !== 'undefined' && navigator.userAgent?.includes('Mac') ? 'darwin' : 'win32',
    isWeb: true,
    openExternal: (url) => {
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    },
    copyText: async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        return false;
      }
    },
    close: () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      window.dispatchEvent(new CustomEvent('firstplay:close'));
    },
    minimize: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('firstplay:minimize'));
    },
    toggleMaximize: async () => {
      try {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
            isMax = true;
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
            isMax = false;
          }
        }
      } catch (e) {
        isMax = !isMax;
      }
      stateListeners.forEach((cb) => {
        try { cb({ isMaximized: isMax }); } catch (err) {}
      });
      return isMax;
    },
    isMaximized: async () => Boolean(document.fullscreenElement),
    setFullscreen: (val) => {
      if (val) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    },
    toggleFullscreen: () => {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    },
    onWindowStateChanged: (cb) => {
      stateListeners.add(cb);
      return () => stateListeners.delete(cb);
    },
    onFullscreenChanged: (cb) => {
      fsListeners.add(cb);
      return () => fsListeners.delete(cb);
    },
    getAppInfo: async () => ({
      name: 'FirstPlay Web',
      version: '1.0.0',
      platform: 'Web Edition (Vite + React)',
      environment: 'Browser Web'
    }),
    clearCache: async () => {
      try {
        localStorage.removeItem('firstplay_local_listings');
        localStorage.removeItem('firstplay_local_banners');
        sessionStorage.clear();
      } catch (e) {}
      return true;
    }
  };
}

// Register Progressive Web App Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[FirstPlay PWA] Service Worker registration failed:', err);
    });
  });
}

// Capture PWA deferred prompt globally
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__firstplay_deferred_prompt = e;
    window.dispatchEvent(new CustomEvent('firstplay:pwa-prompt-available', { detail: e }));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);