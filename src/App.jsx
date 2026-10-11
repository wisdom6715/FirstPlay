import React, { useState, useEffect } from 'react';
import HeaderTitlebar from './components/HeaderTitlebar';
import Sidebar from './components/Sidebar';
import PlayerView from './components/PlayerView';
import DiscoverView from './views/DiscoverView';
import SearchView from './views/SearchView';
import CategoriesView from './views/CategoriesView';
import FavouritesView from './views/FavouritesView';
import LibraryView from './views/LibraryView';
import SettingsView from './views/SettingsView';
import PromoteView from './views/PromoteView';
import { catalogService } from './services/catalogService';
import { preloadService, PreloadState } from './services/preloadService';
import { isLagosLife, openGameInNewTab } from './utils/gameUtils';
import { triggerPwaInstall, detectUserOS } from './utils/pwaUtils';
import PwaDownloadNotification from './components/PwaDownloadNotification';
import LegalModal from './components/LegalModal';
import { Minimize2, X, Check, Download, Info } from 'lucide-react';

// URL Route Synchronization Helpers
function getTabFromPath(pathname) {
  const clean = (pathname || '').toLowerCase().replace(/^\/+|\/+$/g, '');
  if (clean === 'promote') return 'promote';
  if (clean === 'settings') return 'settings';
  if (clean === 'search') return 'search';
  if (clean === 'category' || clean === 'categories') return 'category';
  if (clean === 'favourite' || clean === 'favourites' || clean === 'favorites') return 'favourite';
  return 'discover';
}

function getPathFromTab(tab) {
  if (tab === 'discover') return '/';
  return `/${tab}`;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'discover';
  });

  const navigateToTab = (tab, push = true) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      const targetPath = getPathFromTab(tab);
      if (window.location.pathname !== targetPath) {
        if (push) {
          window.history.pushState({ tab }, '', targetPath);
        } else {
          window.history.replaceState({ tab }, '', targetPath);
        }
      }
    }
  };

  // Synchronize browser back/forward buttons with active view
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPath(window.location.pathname);
      setCurrentTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [targetSection, setTargetSection] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [listings, setListings] = useState([]);
  const [heroItem, setHeroItem] = useState(null);
  const [heroBanners, setHeroBanners] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activePlayingItem, setActivePlayingItem] = useState(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [installToast, setInstallToast] = useState(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState('privacy');
  const [theme, setTheme] = useState(() => {
    const version = typeof window !== 'undefined' ? localStorage.getItem('firstplay_theme_ver') : null;
    if (version !== 'v2_light') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('firstplay_theme_ver', 'v2_light');
        localStorage.setItem('firstplay_theme', 'light');
      }
      return 'light';
    }
    return (typeof window !== 'undefined' ? localStorage.getItem('firstplay_theme') : null) || 'light';
  });

  // Synchronize and apply theme mode
  useEffect(() => {
    const applyTheme = (targetTheme) => {
      let resolved = targetTheme;
      if (targetTheme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      localStorage.setItem('firstplay_theme', targetTheme);
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Load catalog data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoadingCatalog(true);
      try {
        const items = await catalogService.getListings();
        setListings(items);
        const hero = await catalogService.getPromotedHero();
        setHeroItem(hero);
        const banners = await catalogService.getAllAdBanners();
        setHeroBanners(banners);
        const recents = catalogService.getRecentlyPlayed();
        setRecentlyPlayed(recents);
        const favs = catalogService.getFavorites();
        setFavorites(favs);
      } catch (err) {
        console.error('Failed to load catalog data:', err);
      } finally {
        setIsLoadingCatalog(false);
      }
    }
    loadData();

    // Revalidate and sync with Firebase as soon as network connection is restored
    const handleOnline = async () => {
      console.log('[FirstPlay] Network restored. Syncing catalog with Firebase...');
      try {
        const items = await catalogService.getListings();
        setListings(items);
        const hero = await catalogService.getPromotedHero();
        setHeroItem(hero);
        const banners = await catalogService.getAllAdBanners();
        setHeroBanners(banners);
      } catch (err) {
        console.warn('[FirstPlay] Background sync failed:', err);
      }
    };

    window.addEventListener('online', handleOnline);

    // Listen to window fullscreen changes
    const cleanupFullscreen = window.firstPlayAPI?.onFullscreenChanged?.((state) => {
      setIsFullscreen(Boolean(state.isFullscreen));
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      cleanupFullscreen?.();
    };
  }, []);

  // Global keyboard shortcuts (Ctrl+K, /, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setCurrentTab('search');
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          // Exit fullscreen if active, preserving the running experience
          window.firstPlayAPI?.setFullscreen?.(false);
          setIsFullscreen(false);
        }
        // NOTE: We intentionally do NOT exit activePlayingItem on Escape!
        // Web games (e.g. Deadshot.io) rely on Escape for pointer unlocking, pause menus, and settings.
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Manage responsive sidebar auto-collapse on mobile
  useEffect(() => {
    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // If crossing from desktop to mobile, automatically collapse sidebar
      if (prevWidth >= 768 && currentWidth < 768) {
        setIsSidebarOpen(false);
      } else if (prevWidth < 768 && currentWidth >= 768) {
        setIsSidebarOpen(true);
      }
      prevWidth = currentWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handlePlay = (item) => {
    const updated = catalogService.recordPlay(item);
    setRecentlyPlayed(updated);

    // If Lagos Life OR configured with open_in_app: false, redirect / open in new tab
    if (isLagosLife(item) || item?.open_in_app === false) {
      openGameInNewTab(item);
      return;
    }

    // Exact logging and state tracking for game opening
    preloadService.logGameOpen(item);

    if (item?.category === 'game') {
      preloadService.setActiveGame(item.id);
      // If not already in pool, add to pool so it benefits from LRU cache on return
      if (preloadService.getPreloadState(item.id) === PreloadState.NOT_PRELOADED) {
        preloadService.preloadGame(item);
      }
    }

    setActivePlayingItem(item);

    // When clicking play on ANY game, automatically toggle fullscreen on!
    const isGame = item?.category === 'game' || Boolean(
      item?.requires_fullscreen ||
      item?.auto_fullscreen
    );

    if (isGame) {
      setIsFullscreen(true);
      window.firstPlayAPI?.setFullscreen?.(true);
      // Fallback for browser environment
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
  };

  const handleToggleFavorite = (item) => {
    const { favorites: updated } = catalogService.toggleFavorite(item);
    setFavorites(updated);
  };

  const handleNavigateCategory = (cat) => {
    if (cat === 'library') {
      navigateToTab('favourite');
    } else {
      setCategoryFilter(cat);
      navigateToTab('category');
    }
  };

  const handleNavigateSection = (sectionId) => {
    if (currentTab !== 'discover') {
      setTargetSection(sectionId);
      navigateToTab('discover');
    } else {
      const el = document.getElementById(sectionId) ||
                 (sectionId === 'trending-section' ? document.getElementById('trending') : null) ||
                 (sectionId === 'new-games-section' ? document.getElementById('new-games') : null);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const container = document.querySelector('.overflow-y-auto');
        container?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleClearHistory = () => {
    catalogService.clearRecentlyPlayed();
    setRecentlyPlayed([]);
  };

  const handleInstallClick = async () => {
    const outcome = await triggerPwaInstall();
    const os = detectUserOS();
    const isApple = os === 'ios' || os === 'mac';

    if (outcome === 'accepted') {
      setInstallToast({
        type: 'success',
        message: 'Installing FirstPlay! Opening directly as a standalone app.'
      });
      setTimeout(() => setInstallToast(null), 4000);
      return;
    }

    if (outcome === 'already_installed') {
      setInstallToast({
        type: 'info',
        message: os === 'windows'
          ? 'FirstPlay is already installed on your PC! Launch it directly from your Start Menu, Chrome Apps, or desktop.'
          : os === 'android'
          ? 'FirstPlay is already installed on your device! Check your home screen or app drawer.'
          : 'FirstPlay is already installed on your device! You can launch it directly from your apps.'
      });
      setTimeout(() => setInstallToast(null), 5000);
      return;
    }

    if (outcome === 'dismissed') {
      return;
    }

    // outcome === 'not_supported'
    // NOTE: NEVER show "Tap browser menu" on Windows and Android!
    if (isApple) {
      setInstallToast({
        type: 'hint',
        message: os === 'ios'
          ? 'To install on iOS: Tap Share (square with arrow) and select "Add to Home Screen".'
          : 'To install on Mac Safari: Select File > "Add to Dock" to install FirstPlay.'
      });
    } else {
      // On Windows / Android, if Chrome didn't prompt, the app is already installed in the browser profile
      setInstallToast({
        type: 'info',
        message: os === 'windows'
          ? 'FirstPlay is already installed on your Windows PC! Look for FirstPlay in your Start Menu or Chrome Apps (chrome://apps).'
          : 'FirstPlay is already installed on this device! Look for FirstPlay on your home screen or apps.'
      });
    }
    setTimeout(() => setInstallToast(null), 5000);
  };

  const handleOpenPrivacyPolicy = () => {
    setLegalDocType('privacy');
    setIsLegalModalOpen(true);
  };

  const handleOpenTerms = () => {
    setLegalDocType('terms');
    setIsLegalModalOpen(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden relative app-root-container transition-colors duration-200">
      {/* Dynamic Ambient Illumination (Dark vs Light - No purple background) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none">
        <div className="absolute -top-36 -left-36 w-[34rem] h-[34rem] rounded-full bg-blue-600/10 blur-[140px] ambient-glow-primary" />
        <div className="absolute top-1/4 -right-36 w-[38rem] h-[38rem] rounded-full bg-slate-500/10 blur-[150px] ambient-glow-secondary" />
      </div>

      {/* SVG Liquid Refraction Displacement Filter for realistic fluid distortions */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
        <defs>
          <filter id="liquid-refraction" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Native Desktop Titlebar (Hidden during immersive Fullscreen) */}
      {!isFullscreen && (
        <HeaderTitlebar
          currentTab={activePlayingItem ? activePlayingItem.name : currentTab}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          currentTheme={theme}
          onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          onNavigateSettings={() => navigateToTab('settings')}
          onNavigatePromote={() => navigateToTab('promote')}
          onInstallClick={handleInstallClick}
          onOpenSearch={() => {
            setSearchInitialQuery('');
            navigateToTab('search');
          }}
        />
      )}

      {/* Workspace Area: Persistent Storefront & Persistent PlayerView Webview Pool */}
      <div className="relative flex-1 w-full overflow-hidden z-10">
        {/* Mobile Sidebar Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Storefront (Visible when browsing; hidden when actively playing) */}
        <div className={`w-full h-full flex overflow-hidden ${activePlayingItem ? 'hidden' : 'flex'}`}>
          {/* Responsive Sidebar: In-line on desktop, fixed overlay drawer on mobile */}
          {isSidebarOpen && (
            <div className="fixed inset-y-0 left-0 z-50 md:relative md:inset-auto md:z-auto h-full animate-in slide-in-from-left duration-200">
              <Sidebar
                currentTab={currentTab}
                setTab={(tab) => {
                  navigateToTab(tab);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                onSearchClick={() => {
                  setSearchInitialQuery('');
                  navigateToTab('search');
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                favoritesCount={favorites.length}
                currentTheme={theme}
                onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                onClose={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                onInstallDirect={handleInstallClick}
              />
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col bg-transparent overflow-hidden relative min-w-0">
            {isLoadingCatalog ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono text-zinc-400">Loading FirstPlay...</p>
              </div>
            ) : (
              <>
                {currentTab === 'discover' && (
                  <DiscoverView
                    listings={listings}
                    heroItem={heroItem}
                    heroBanners={heroBanners}
                    recentlyPlayed={recentlyPlayed}
                    onPlay={handlePlay}
                    onNavigateCategory={handleNavigateCategory}
                    onNavigateTab={navigateToTab}
                    onNavigateSection={handleNavigateSection}
                    targetSection={targetSection}
                    onClearTargetSection={() => setTargetSection(null)}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
                    onOpenTerms={handleOpenTerms}
                  />
                )}

                {currentTab === 'favourite' && (
                  <FavouritesView
                    favorites={favorites}
                    recentlyPlayed={recentlyPlayed}
                    onPlay={handlePlay}
                    onToggleFavorite={handleToggleFavorite}
                    onClearHistory={handleClearHistory}
                    onNavigateDiscover={() => navigateToTab('discover')}
                  />
                )}

                {(currentTab === 'category' || currentTab === 'categories') && (
                  <CategoriesView
                    listings={listings}
                    heroBanners={heroBanners}
                    selectedCategory={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                    onPlay={handlePlay}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
                    onOpenTerms={handleOpenTerms}
                    onNavigateTab={navigateToTab}
                    onNavigateSection={handleNavigateSection}
                  />
                )}

                {currentTab === 'search' && (
                  <SearchView
                    listings={listings}
                    onPlay={handlePlay}
                    initialQuery={searchInitialQuery}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}

                {currentTab === 'settings' && (
                  <SettingsView
                    currentTheme={theme}
                    onThemeChange={setTheme}
                  />
                )}

                {currentTab === 'promote' && (
                  <PromoteView
                    currentTheme={theme}
                    onNavigateDiscover={() => navigateToTab('discover')}
                    onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
                    onOpenTerms={handleOpenTerms}
                    onNavigateTab={navigateToTab}
                  />
                )}
              </>
            )}
          </main>
        </div>

        {/* Active Game Player Workspace (Destroyed immediately on exit to stop all background audio) */}
        {activePlayingItem && (
          <PlayerView
            activeItem={activePlayingItem}
            allItems={listings}
            onSwitchGame={handlePlay}
            onExit={() => {
              if (isFullscreen) {
                window.firstPlayAPI?.setFullscreen?.(false);
                setIsFullscreen(false);
              }
              preloadService.setActiveGame(null);
              setActivePlayingItem(null);
            }}
            isFullscreen={isFullscreen}
            onToggleFullscreen={(val) => {
              const next = typeof val === 'boolean' ? val : !isFullscreen;
              setIsFullscreen(next);
              window.firstPlayAPI?.setFullscreen?.(next);
            }}
          />
        )}
      </div>

      {/* PWA Install Notification (Theme-aware direct install banner) */}
      <PwaDownloadNotification onInstallClick={handleInstallClick} />

      {/* Floating Install Toast (High-contrast, crystal-clear readability, theme-aware) */}
      {installToast && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[calc(100vw-2rem)] sm:w-auto px-4 py-3 rounded-2xl bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white text-xs font-semibold shadow-2xl border border-black/10 dark:border-white/15 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200 select-none"
        >
          {installToast.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={14} className="stroke-[2.5]" />
            </div>
          ) : installToast.type === 'info' ? (
            <div className="w-6 h-6 rounded-full bg-[#0071e3]/15 text-[#0071e3] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Check size={14} className="stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-500/15 text-[#0071e3] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Info size={14} className="stroke-[2.5]" />
            </div>
          )}
          <span className="flex-1 text-[#1d1d1f] dark:text-zinc-100 font-semibold leading-relaxed">
            {installToast.message}
          </span>
          <button 
            type="button" 
            onClick={() => setInstallToast(null)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-1 cursor-pointer shrink-0"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Legal Privacy Policy & Terms of Service Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        currentTheme={theme}
        initialDoc={legalDocType}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}
