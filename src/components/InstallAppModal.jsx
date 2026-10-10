import React from 'react';
import { X, Download, Monitor, Apple, Check, Laptop } from 'lucide-react';
import { detectUserOS } from '../utils/pwaUtils';
import appLogo from '../assets/icon.png';

export default function InstallAppModal({ isOpen, onClose, onInstallDirect }) {
  if (!isOpen) return null;

  const os = detectUserOS();
  const isWindows = os === 'windows';
  const isMac = os === 'mac';
  const isAndroid = os === 'android';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#16171d]/95 backdrop-blur-3xl border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl text-left space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Header with App Logo & Title */}
        <div className="flex items-center gap-3.5">
          <img
            src={appLogo}
            alt="FirstPlay"
            className="w-12 h-12 rounded-2xl object-contain border border-white/15 shadow-md shrink-0"
          />
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isAndroid ? 'Install FirstPlay for Android' : isWindows ? 'Install FirstPlay for Windows' : isMac ? 'Install FirstPlay for MacOS' : 'Install FirstPlay App'}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAndroid ? 'Instant launch • Add to Home Screen • Zero wait' : 'Zero install wait • Offline storage • Instant launch'}
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-2.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-xs">
          <div className="flex items-center gap-2.5 text-zinc-200">
            <Check size={14} className="text-emerald-400 shrink-0" />
            <span>{isAndroid ? 'Adds directly to your Android home screen & app drawer' : 'Dedicated desktop window with zero browser tab clutter'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-200">
            <Check size={14} className="text-emerald-400 shrink-0" />
            <span>{isAndroid ? 'Immersive full-screen gameplay without browser URL bar' : 'Instant full-screen gameplay & keyboard game shortcuts'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-200">
            <Check size={14} className="text-emerald-400 shrink-0" />
            <span>{isAndroid ? 'Offline caching & high performance WebGL gaming' : 'Faster caching for web games & African digital experiences'}</span>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="space-y-2 text-xs text-zinc-300">
          <p className="font-semibold text-white">How to install on your device:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 pl-1">
            {isAndroid ? (
              <>
                <li>Tap <strong className="text-white">"Install on Android"</strong> below for 1-tap installation.</li>
                <li>Or tap your browser's menu (<strong className="text-white">⋮</strong>) and select <strong className="text-white">"Add to Home screen"</strong> or <strong className="text-white">"Install app"</strong>.</li>
                <li>FirstPlay will appear directly on your home screen.</li>
              </>
            ) : (
              <>
                <li>Look for the <strong className="text-white">Install (⊕)</strong> icon on the right side of your address bar.</li>
                <li>Or click your browser's menu (<strong className="text-white">⋮</strong>) and select <strong className="text-white">"Install FirstPlay"</strong>.</li>
                <li>FirstPlay will appear directly on your desktop and taskbar.</li>
              </>
            )}
          </ol>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              if (onInstallDirect) {
                const res = await onInstallDirect();
                if (res === 'accepted') {
                  onClose();
                }
              }
            }}
            className="flex-1 h-10 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Download size={14} />
            <span>{isAndroid ? 'Install on Android' : isWindows ? 'Install on Windows' : isMac ? 'Install on MacOS' : 'Install App'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-full bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
