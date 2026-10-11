import React, { useState, useEffect } from 'react';
import { Settings, HardDrive, Cpu, Globe, RefreshCw, CheckCircle2, Palette, Moon, Sun, Laptop } from 'lucide-react';
import { isFirebaseLive } from '../services/firebaseConfig';

export default function SettingsView({ currentTheme = 'dark', onThemeChange }) {
  const [appInfo, setAppInfo] = useState({
    version: '1.0.0',
    electron: '35.0.0',
    chrome: '134.0.0',
    platform: 'darwin'
  });
  const [isClearing, setIsClearing] = useState(false);
  const [clearedStatus, setClearedStatus] = useState(null);
  const [hardwareAccel, setHardwareAccel] = useState(true);

  useEffect(() => {
    if (window.firstPlayAPI?.getAppInfo) {
      window.firstPlayAPI.getAppInfo().then(info => {
        if (info) setAppInfo(info);
      });
    }
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    setClearedStatus(null);
    try {
      if (window.firstPlayAPI?.clearCache) {
        await window.firstPlayAPI.clearCache();
      }
      sessionStorage.clear();
      setClearedStatus('Storage and web cache cleared successfully.');
    } catch (err) {
      setClearedStatus('Failed to clear cache: ' + err.message);
    } finally {
      setIsClearing(false);
      setTimeout(() => setClearedStatus(null), 4000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-6 sm:space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Preferences for desktop appearance, hardware acceleration, storage isolation, and network mode.
        </p>
      </div>

      <div className="max-w-2xl space-y-5 pb-12">

        {/* Appearance & Theme Section */}
        <div className="bg-[#1c1c1e]/80 border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <Palette size={15} className="text-[#0a84ff]" />
            <h2 className="text-sm font-semibold text-white">
              Appearance & Theme
            </h2>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-zinc-400">
              Choose your interface color scheme or synchronize with your operating system.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Dark Option */}
              <button
                type="button"
                onClick={() => onThemeChange?.('dark')}
                className={`flex flex-row sm:flex-col items-center gap-3 sm:gap-2.5 p-3 sm:p-3.5 rounded-xl border transition-all text-left sm:text-center cursor-pointer ${
                  currentTheme === 'dark'
                    ? 'bg-white/[0.12] border-[#0a84ff] shadow-lg ring-1 ring-[#0a84ff]'
                    : 'bg-black/20 border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className="w-14 sm:w-full h-12 rounded-lg bg-[#121214] border border-white/10 flex items-center justify-center p-1.5 shadow-inner shrink-0">
                  <div className="w-full h-full rounded bg-[#1c1c1e] flex items-center justify-center text-zinc-400">
                    <Moon size={16} className={currentTheme === 'dark' ? 'text-[#0a84ff]' : 'text-zinc-400'} />
                  </div>
                </div>
                <div className="space-y-0.5 flex-1 sm:flex-initial">
                  <span className="text-xs font-semibold text-white block">Dark</span>
                  <span className="text-[10px] text-zinc-400 block">Apple Glass Dark</span>
                </div>
              </button>

              {/* Light Option */}
              <button
                type="button"
                onClick={() => onThemeChange?.('light')}
                className={`flex flex-row sm:flex-col items-center gap-3 sm:gap-2.5 p-3 sm:p-3.5 rounded-xl border transition-all text-left sm:text-center cursor-pointer ${
                  currentTheme === 'light'
                    ? 'bg-white/[0.12] border-[#0a84ff] shadow-lg ring-1 ring-[#0a84ff]'
                    : 'bg-black/20 border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className="w-14 sm:w-full h-12 rounded-lg bg-[#f5f5f7] border border-black/10 flex items-center justify-center p-1.5 shadow-inner shrink-0">
                  <div className="w-full h-full rounded bg-white flex items-center justify-center text-amber-500 shadow-sm">
                    <Sun size={16} className="text-amber-500" />
                  </div>
                </div>
                <div className="space-y-0.5 flex-1 sm:flex-initial">
                  <span className="text-xs font-semibold text-white block">Light</span>
                  <span className="text-[10px] text-zinc-400 block">Apple Clean Light</span>
                </div>
              </button>

              {/* System Option */}
              <button
                type="button"
                onClick={() => onThemeChange?.('system')}
                className={`flex flex-row sm:flex-col items-center gap-3 sm:gap-2.5 p-3 sm:p-3.5 rounded-xl border transition-all text-left sm:text-center cursor-pointer ${
                  currentTheme === 'system'
                    ? 'bg-white/[0.12] border-[#0a84ff] shadow-lg ring-1 ring-[#0a84ff]'
                    : 'bg-black/20 border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className="w-14 sm:w-full h-12 rounded-lg bg-gradient-to-r from-[#121214] to-[#f5f5f7] border border-white/10 flex items-center justify-center p-1.5 shadow-inner shrink-0">
                  <div className="w-full h-full rounded bg-gradient-to-r from-[#1c1c1e] to-white flex items-center justify-center text-zinc-300">
                    <Laptop size={16} className={currentTheme === 'system' ? 'text-[#0a84ff]' : 'text-zinc-400'} />
                  </div>
                </div>
                <div className="space-y-0.5 flex-1 sm:flex-initial">
                  <span className="text-xs font-semibold text-white block">Auto</span>
                  <span className="text-[10px] text-zinc-400 block">Match System</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Performance & GPU */}
        <div className="bg-[#1c1c1e]/80 border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <Cpu size={15} className="text-[#0a84ff]" />
            <h2 className="text-sm font-semibold text-white">
              Performance & Graphics
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Hardware Acceleration</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Utilize Apple Metal / GPU rendering for 60fps WebGL browser games.
                </p>
              </div>
              <button
                onClick={() => setHardwareAccel(!hardwareAccel)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  hardwareAccel ? 'bg-[#34c759]' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  hardwareAccel ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
              <div>
                <p className="font-semibold text-white">Background Process Throttling</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Auto-suspends heavy browser sessions when navigating between store tabs.
                </p>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Cache & Privacy */}
        <div className="bg-[#1c1c1e]/80 border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <HardDrive size={15} className="text-[#0a84ff]" />
            <h2 className="text-sm font-semibold text-white">
              Storage & Cache
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">Clear Web App Data & Cache</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Wipes cookies, textures, and IndexedDB files created by third-party games.
                </p>
              </div>
              <button
                onClick={handleClearCache}
                disabled={isClearing}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw size={12} className={isClearing ? 'animate-spin text-white' : ''} />
                <span>{isClearing ? 'Clearing...' : 'Clear Now'}</span>
              </button>
            </div>

            {clearedStatus && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{clearedStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* System & Distribution */}
        <div className="bg-[#1c1c1e]/80 border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <Globe size={15} className="text-[#0a84ff]" />
            <h2 className="text-sm font-semibold text-white">
              System Environment
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04]">
              <span className="text-zinc-500 text-[10px] block">Sync Mode</span>
              <span className="font-medium text-emerald-400 block mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {isFirebaseLive ? 'Cloud Synced' : 'Local Cache'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04]">
              <span className="text-zinc-500 text-[10px] block">Web Engine</span>
              <span className="font-medium text-white block mt-0.5">Vite 6 + React 19</span>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04]">
              <span className="text-zinc-500 text-[10px] block">Platform</span>
              <span className="font-medium text-white block mt-0.5">HTML5 Web / WebGL</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
