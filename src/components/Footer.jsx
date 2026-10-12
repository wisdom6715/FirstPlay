import React, { useState } from 'react';
import { Gamepad2, X, HelpCircle, Info, ExternalLink } from 'lucide-react';

export default function Footer({ 
  onOpenPrivacyPolicy, 
  onOpenTerms, 
  onNavigateTab,
  onNavigateCategory,
  onNavigateSection
}) {
  const [infoModal, setInfoModal] = useState(null); // 'about' | 'how-it-works' | null

  const handleDiscoverClick = () => {
    if (onNavigateSection) {
      onNavigateSection('discover-section');
    } else {
      onNavigateTab?.('discover');
      setTimeout(() => {
        const el = document.getElementById('discover-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const container = document.querySelector('.overflow-y-auto');
          container?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    }
  };

  const handleTrendingClick = () => {
    if (onNavigateSection) {
      onNavigateSection('trending-section');
    } else {
      onNavigateTab?.('discover');
      setTimeout(() => {
        const el = document.getElementById('trending-section') || document.getElementById('trending');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleNewGamesClick = () => {
    if (onNavigateSection) {
      onNavigateSection('new-games-section');
    } else {
      onNavigateTab?.('discover');
      setTimeout(() => {
        const el = document.getElementById('new-games-section') || document.getElementById('new-games');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleCategoryClick = () => {
    if (onNavigateCategory) {
      onNavigateCategory('All');
    }
    onNavigateTab?.('category');
  };

  return (
    <footer className="w-full mt-12 pt-10 pb-12 border-t border-white/[0.08] text-zinc-400 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Grid: Brand & Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Brand Info (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0a84ff] flex items-center justify-center text-white shadow-lg shadow-[#0a84ff]/25 shrink-0">
                <Gamepad2 size={20} />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                FirstPlay
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed max-w-sm">
              FIRSTPLAY — Discover and play web games in one place.
            </p>
          </div>

          {/* Column 1: PLATFORM */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={handleDiscoverClick}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Discover
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleTrendingClick}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Trending
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleNewGamesClick}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  New Games
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleCategoryClick}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Category
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab?.('promote');
                    const container = document.querySelector('.overflow-y-auto');
                    container?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Submit a Game</span>
                  <ExternalLink size={10} className="text-zinc-500" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: COMMUNITY */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Community
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <a
                  href="https://x.com/wisdomDev67"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors text-left inline-flex items-center gap-1.5"
                >
                  <span>X (@wisdomDev67)</span>
                  <ExternalLink size={10} className="text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.08]" />

        {/* Bottom Bar: Copyright & Legal Policies */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-zinc-500 font-normal order-2 sm:order-1">
            © 2026 FirstPlay. All rights reserved.
          </p>

          <div className="flex items-center gap-6 order-1 sm:order-2">
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab?.('admin-dashboard')}
              className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>

      </div>

      {/* Lightweight Info Modal (About / How it works) */}
      {infoModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 text-zinc-200"
          onClick={() => setInfoModal(null)}
        >
          <div 
            className="relative w-full max-w-lg rounded-2xl bg-[#14141a] border border-white/15 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                {infoModal === 'about' ? <Info size={16} className="text-[#0a84ff]" /> : <HelpCircle size={16} className="text-[#0a84ff]" />}
                <span>{infoModal === 'about' ? 'About FirstPlay' : 'How FirstPlay Works'}</span>
              </div>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {infoModal === 'about' ? (
              <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
                <p>
                  <strong>FirstPlay</strong> is a curated discovery and instant launcher platform for HTML5 web games, modern web applications, and digital products.
                </p>
                <p>
                  Engineered with zero-install technology, FirstPlay delivers high-performance WebGL gaming and responsive tools directly in your browser without requiring account creation or large storage downloads.
                </p>
                <p className="text-zinc-400">
                  Official Website: <a href="https://firstplay.fun" target="_blank" rel="noreferrer" className="text-[#0a84ff] hover:underline">https://firstplay.fun</a>
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
                <div className="space-y-1.5">
                  <h5 className="font-semibold text-white">1. Instant Zero-Install Play</h5>
                  <p>Browse curated titles and click Play. Games run immediately in secure, high-frame-rate sandboxed environments.</p>
                </div>
                <div className="space-y-1.5">
                  <h5 className="font-semibold text-white">2. Privacy First</h5>
                  <p>No login or registration required. Your favorites and recent games are preserved securely on your local device.</p>
                </div>
                <div className="space-y-1.5">
                  <h5 className="font-semibold text-white">3. Multi-Device Compatibility</h5>
                  <p>Play on desktop, tablet, or smartphone. Install as a Progressive Web App (PWA) for a native fullscreen experience.</p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
