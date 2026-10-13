import React, { useState, useEffect } from 'react';
import { Download, X, Monitor, Apple } from 'lucide-react';
import { detectUserOS, isPwaInstalled } from '../utils/pwaUtils';
import appLogo from '../assets/icon.png';

export default function PwaDownloadNotification({ onInstallClick, onDownloadClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const os = detectUserOS();
  const isWindows = os === 'windows';
  const isMac = os === 'mac';

  useEffect(() => {
    // If already installed as PWA or user dismissed in this session, do not show
    if (isPwaInstalled()) return;
    const dismissed = sessionStorage.getItem('firstplay_pwa_banner_dismissed');
    if (dismissed) return;

    // Show notification across desktop and mobile browsers where PWA is available
    const timer = setTimeout(() => {
      if (!isPwaInstalled()) {
        setIsVisible(true);
      }
    }, 2000);

    const onInstalled = () => setIsVisible(false);
    window.addEventListener('firstplay:pwa-installed-detected', onInstalled);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('firstplay:pwa-installed-detected', onInstalled);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [os]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('firstplay_pwa_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  const installLabel = isWindows ? 'Install on Windows' : isMac ? 'Install on Mac' : 'Install App';
  const handleTrigger = onInstallClick || onDownloadClick;

  return (
    <aside 
      aria-label="Install FirstPlay app"
      className="fixed bottom-5 right-5 z-40 max-w-sm w-[calc(100vw-2.5rem)] rounded-2xl bg-white dark:bg-[#14151a]/95 backdrop-blur-2xl border border-black/10 dark:border-white/20 shadow-2xl p-4 animate-in slide-in-from-bottom-5 fade-in duration-300 select-none text-left"
    >
      <div className="flex items-start gap-3">
        <img
          src={appLogo?.src || '/icon.png'}
          alt="FirstPlay"
          className="w-11 h-11 rounded-xl object-contain border border-black/10 dark:border-white/15 shadow-md shrink-0"
        />
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5">
            {isWindows ? (
              <Monitor size={12} className="text-[#0a84ff]" />
            ) : isMac ? (
              <Apple size={12} className="text-zinc-600 dark:text-zinc-300" />
            ) : (
              <Download size={12} className="text-[#0a84ff]" />
            )}
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">
              Install FirstPlay App
            </h4>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
            Install FirstPlay to launch directly as a standalone app on your {isWindows ? 'Windows PC' : isMac ? 'Mac' : 'device'} with instant gameplay.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          title="Dismiss"
          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 pt-1 border-t border-black/5 dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => {
            handleTrigger?.();
            handleDismiss();
          }}
          data-keep-white="true"
          className="flex-1 h-8 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Download size={12} className="text-white" />
          <span className="text-white">{installLabel}</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="h-8 px-3 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          Later
        </button>
      </div>
    </aside>
  );
}
