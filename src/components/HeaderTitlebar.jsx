import React, { useState, useEffect } from 'react';
import { PanelLeft, Settings, Sun, Moon, Download, Monitor, Apple, Menu, Megaphone, Check } from 'lucide-react';
import appLogo from '../assets/icon.png';
import { detectUserOS, getInstallButtonLabel, isPwaInstalled } from '../utils/pwaUtils';

export default function HeaderTitlebar({ 
  currentTab, 
  isSidebarOpen = true, 
  onToggleSidebar, 
  currentTheme = 'dark', 
  onToggleTheme, 
  onNavigateSettings,
  onNavigatePromote,
  onInstallClick,
  onDownloadClick
}) {
  const os = detectUserOS();
  const [isInstalled, setIsInstalled] = useState(() => isPwaInstalled());

  useEffect(() => {
    const checkState = () => setIsInstalled(isPwaInstalled());
    window.addEventListener('firstplay:pwa-installed-detected', checkState);
    window.addEventListener('firstplay:pwa-prompt-available', checkState);
    window.addEventListener('appinstalled', checkState);
    return () => {
      window.removeEventListener('firstplay:pwa-installed-detected', checkState);
      window.removeEventListener('firstplay:pwa-prompt-available', checkState);
      window.removeEventListener('appinstalled', checkState);
    };
  }, []);

  const installLabel = isInstalled ? 'Installed' : getInstallButtonLabel();

  const tabTitles = {
    discover: 'Discover',
    category: 'Category',
    categories: 'Category',
    favourite: 'Favourite',
    search: 'Search',
    settings: 'Settings',
    promote: 'Promote'
  };

  const currentTitle = tabTitles[currentTab] || currentTab || 'FirstPlay';

  return (
    <header className="h-12 w-full bg-[#18181b]/85 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between select-none z-50 shrink-0 relative px-3 sm:px-4">
      {/* LEFT SECTION: Brand indicator & Sidebar toggle (Hamburger on mobile, PanelLeft on desktop) */}
      <div className="flex items-center gap-2 sm:gap-2.5 select-none">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Menu size={18} className="md:hidden text-zinc-300" />
            <PanelLeft size={15} className="hidden md:block" />
          </button>
        )}
        <div className="flex items-center gap-2 select-none">
          <img 
            src={appLogo} 
            alt="FirstPlay" 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-contain shadow-md border border-white/15" 
          />
          <span className="text-xs font-bold tracking-wider text-white hidden sm:inline">
            FIRSTPLAY
          </span>
        </div>
      </div>

      {/* CENTER: Window Title */}
      <div className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-zinc-300 tracking-tight pointer-events-none hidden md:block">
        {currentTitle}
      </div>

      {/* RIGHT SECTION: Install Button & Controls (Desktop only - removed in mobile view) */}
      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        {/* Promote Button with Ads Icon */}
        {onNavigatePromote && (
          <button
            type="button"
            onClick={onNavigatePromote}
            title="Promote Game, App, or Product"
            className={`h-8 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer border ${
              currentTab === 'promote'
                ? 'bg-[#0071e3]/20 text-blue-300 border-blue-400/40'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border-white/10'
            }`}
          >
            <Megaphone size={13} className="text-[#0a84ff] shrink-0" />
            <span className="hidden sm:inline">Promote</span>
          </button>
        )}

        {/* OS Specific Install Button at Top Right Corner - Visible on desktop only */}
        {(onInstallClick || onDownloadClick) && (
          <button
            type="button"
            onClick={onInstallClick || onDownloadClick}
            title={installLabel}
            data-keep-white="true"
            className="h-8 px-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white hidden md:flex items-center gap-1.5 text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer border border-blue-400/25 shrink-0"
          >
            {isInstalled ? (
              <Check size={13} className="shrink-0 text-white" />
            ) : os === 'windows' ? (
              <Monitor size={13} className="shrink-0 text-white" />
            ) : os === 'mac' ? (
              <Apple size={13} className="shrink-0 text-white" />
            ) : (
              <Download size={13} className="shrink-0 text-white" />
            )}
            <span className="truncate text-white">{installLabel}</span>
          </button>
        )}

        {/* Quick Theme Toggle - Desktop only, removed in mobile view */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            title={currentTheme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="w-8 h-8 rounded-lg hidden md:flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {currentTheme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-blue-400" />}
          </button>
        )}

        {/* Quick Settings Button - Desktop only, removed in mobile view */}
        {onNavigateSettings && (
          <button
            type="button"
            onClick={onNavigateSettings}
            title="Settings"
            className={`w-8 h-8 rounded-lg hidden md:flex items-center justify-center transition-colors cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-white/15 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Settings size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
