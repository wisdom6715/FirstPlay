import React, { useState, useEffect } from 'react';
import { Star, Heart, LayoutGrid, Search, Settings, Sun, Moon, X, Download, Megaphone, Check, Gift, Ticket, Trophy } from 'lucide-react';
import { detectUserOS, isPwaInstalled } from '../utils/pwaUtils';

export default function Sidebar({ 
  currentTab, 
  setTab, 
  onSearchClick, 
  favoritesCount = 0,
  currentTheme = 'dark',
  onToggleTheme,
  onClose,
  onInstallDirect,
  className = ''
}) {
  const isAndroid = detectUserOS() === 'android';
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
  const navItems = [
    { id: 'discover', label: 'Discover', icon: Star },
    { id: 'category', label: 'Category', icon: LayoutGrid },
    { id: 'favourite', label: 'Favourite', icon: Heart, count: favoritesCount },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'gifts', label: 'Rewards', icon: Gift },
    { id: 'redeem', label: 'Redeem', icon: Ticket },
    { id: 'promote', label: 'Promote', icon: Megaphone }
  ];

  const handleNavClick = (tabId) => {
    setTab(tabId);
    // On desktop, keep sidebar open! Only close drawer on mobile screens (< 768px)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose?.();
    }
  };

  const handleSearchClick = () => {
    onSearchClick?.();
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose?.();
    }
  };

  return (
    <aside className={`w-64 md:w-56 bg-[#16161b]/95 md:bg-[#16161b]/65 backdrop-blur-3xl border-r border-white/[0.08] flex flex-col justify-between py-3 px-3 select-none shrink-0 h-full shadow-2xl md:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.06)] z-50 ${className}`}>
      {/* Top Section: Navigation & Search */}
      <div className="space-y-2.5">
        {/* Mobile Drawer Close Button (No logo anywhere in sidebar) */}
        {onClose && (
          <div className="flex items-center justify-end md:hidden px-0.5">
            <button
              type="button"
              onClick={onClose}
              title="Close sidebar"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Apple Style Search Input Pill */}
        <div className="pt-0.5">
          <button
            onClick={handleSearchClick}
            className={`w-full h-8 px-2.5 rounded-xl text-xs flex items-center gap-2 transition-all text-left cursor-pointer border ${
              currentTab === 'search'
                ? 'bg-white/15 text-white border-white/20 shadow-sm backdrop-blur-md'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border-white/[0.06] backdrop-blur-md'
            }`}
          >
            <Search size={13} className={currentTab === 'search' ? 'text-white' : 'text-zinc-400'} />
            <span className="font-normal flex-1 truncate">Search</span>
          </button>
        </div>

        {/* Primary Navigation List: Discover, Favourite, Category */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'category' && currentTab === 'categories');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full h-8 px-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all text-left cursor-pointer border ${
                  isActive
                    ? 'bg-white/[0.12] text-white shadow-sm border-white/10 backdrop-blur-md'
                    : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon 
                    size={15} 
                    className={isActive ? 'text-[#0a84ff]' : 'text-[#0a84ff]/80'} 
                  />
                  <span className="tracking-tight">{item.label}</span>
                </div>

                {item.id === 'favourite' && item.count > 0 && (
                  <span className="text-[10px] font-semibold bg-white/10 text-rose-400 px-1.5 py-0.2 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Settings, Theme Toggle & Direct Install */}
      <div className="border-t border-white/[0.06] pt-3 space-y-1">
        {/* Direct Install App button: initiates native PWA installation directly without opening any modal */}
        {onInstallDirect && (
          <button
            type="button"
            onClick={() => {
              onInstallDirect();
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                onClose?.();
              }
            }}
            className="w-full h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer bg-[#0071e3]/15 hover:bg-[#0071e3]/25 text-[#0071e3] dark:text-blue-300 border border-[#0071e3]/30 mb-1"
          >
            {isInstalled ? (
              <Check size={14} className="text-[#0071e3] dark:text-blue-400" />
            ) : (
              <Download size={14} className="text-[#0071e3] dark:text-blue-400" />
            )}
            <span>{isInstalled ? 'Installed' : 'Install App'}</span>
          </button>
        )}

        <button
          onClick={() => handleNavClick('settings')}
          className={`w-full h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-all text-left cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-white/15 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Settings size={14} className="text-zinc-400" />
          <span>Settings</span>
        </button>

        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            title={currentTheme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            className="w-full h-8 px-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all text-left cursor-pointer text-zinc-400 hover:text-white hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-2.5">
              {currentTheme === 'dark' ? (
                <Sun size={14} className="text-amber-400" />
              ) : (
                <Moon size={14} className="text-blue-400" />
              )}
              <span>{currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">{currentTheme}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
