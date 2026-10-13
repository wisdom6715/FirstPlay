'use client';

import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';

export default function FirstPlayClientProvider({ children }) {
  useEffect(() => {
    // 1. Web Compatibility Adapter for Browser Environment
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
          platform: 'Next.js Edition',
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

    // 2. PWA install prompt handler
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.__firstplay_deferred_prompt = e;
      window.dispatchEvent(new CustomEvent('firstplay:pwa-prompt-available', { detail: e }));
      console.info('[FirstPlay PWA] Native install prompt captured and ready.');
    };

    const handleAppInstalled = () => {
      window.__firstplay_deferred_prompt = null;
      console.info('[FirstPlay PWA] Application was successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. Register Service Worker
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.info('[FirstPlay PWA] Service Worker active:', reg.scope);
        })
        .catch((err) => {
          console.warn('[FirstPlay PWA] Service Worker registration failed:', err);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
