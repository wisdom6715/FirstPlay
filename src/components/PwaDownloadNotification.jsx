import React, { useState, useEffect } from 'react';
import { Download, X, Monitor, Apple } from 'lucide-react';
import { detectUserOS, isPwaInstalled } from '../utils/pwaUtils';
import appLogo from '../assets/icon.png';

export default function PwaDownloadNotification({ onDownloadClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const os = detectUserOS();
  const isWindows = os === 'windows';
  const isMac = os === 'mac';

  useEffect(() => {
    // If already installed as PWA or user dismissed in this session, do not show
    if (isPwaInstalled()) return;
    const dismissed = sessionStorage.getItem('firstplay_pwa_banner_dismissed');
    if (dismissed) return;

    // Only show desktop notification on Windows and Mac (mobile/Android uses modal)
    if (os === 'android' || os === 'ios' || window.innerWidth < 768) return;

    // Show banner after 2.5 seconds of browsing so user discovers it smoothly
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [os]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('firstplay_pwa_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  const downloadLabel = isWindows ? 'Download for Windows' : isMac ? 'Download for MacOS' : 'Download App';

  return (
    <aside 
      aria-label="Download FirstPlay app"
      className="fixed bottom-5 right-5 z-40 max-w-sm w-[calc(100vw-2.5rem)] rounded-2xl bg-[#14151a]/95 backdrop-blur-2xl border border-white/20 shadow-2xl p-4 animate-in slide-in-from-bottom-5 fade-in duration-300 select-none text-left"
    >
      <div className="flex items-start gap-3">
        <img
          src={appLogo}
          alt="FirstPlay"
          className="w-11 h-11 rounded-xl object-contain border border-white/15 shadow-md shrink-0"
        />
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5">
            {isWindows ? (
              <Monitor size={12} className="text-[#0a84ff]" />
            ) : isMac ? (
              <Apple size={12} className="text-zinc-300" />
            ) : (
              <Download size={12} className="text-[#0a84ff]" />
            )}
            <h4 className="text-xs font-bold text-white tracking-tight">
              Get FirstPlay Desktop
            </h4>
          </div>
          <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
            Install FirstPlay for {isWindows ? 'Windows' : isMac ? 'MacOS' : 'Desktop'} with zero download wait time and instant gameplay.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          title="Dismiss"
          className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 pt-1 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={() => {
            onDownloadClick?.();
            handleDismiss();
          }}
          className="flex-1 h-8 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Download size={12} />
          <span>{downloadLabel}</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="h-8 px-3 rounded-full text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          Later
        </button>
      </div>
    </aside>
  );
}
