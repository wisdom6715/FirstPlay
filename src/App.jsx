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
import { triggerPwaInstall, detectUserOS, isPwaInstalled } from './utils/pwaUtils';
import PwaDownloadNotification from './components/PwaDownloadNotification';
import InstallAppModal from './components/InstallAppModal';
import LegalModal from './components/LegalModal';
import { Minimize2, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('discover');
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
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState('privacy');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('firstplay_theme') || 'dark';
  });

  // Synchronize and apply theme mode
  useEffect(() => {
    const applyTheme = (targetTheme) => {
      let resolved = targetTheme;
      if (targetTheme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
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

  // On Android: download button is changed to a pop up modal (only on Android)
  useEffect(() => {
    const os = detectUserOS();
    if (os !== 'android') return;
    if (isPwaInstalled()) return;
    const dismissed = sessionStorage.getItem('firstplay_android_modal_dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsInstallModalOpen(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const handlePlay = (item) => {
    const updated = catalogService.recordPlay(item);
    setRecentlyPlayed(updated);

    // Always open Lagos Life in another tab. Just Lagos Life.
    if (isLagosLife(item)) {
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
      setCurrentTab('favourite');
    } else {
      setCategoryFilter(cat);
      setCurrentTab('category');
    }
  };

  const handleNavigateSection = (sectionId) => {
    if (currentTab !== 'discover') {
      setTargetSection(sectionId);
      setCurrentTab('discover');
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

  const handleDownloadClick = async () => {
    const outcome = await triggerPwaInstall();
    if (outcome !== 'accepted') {
      setIsInstallModalOpen(true);
    }
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
          onNavigateSettings={() => setCurrentTab('settings')}
          onDownloadClick={handleDownloadClick}
          onOpenSearch={() => {
            setSearchInitialQuery('');
            setCurrentTab('search');
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
                  setCurrentTab(tab);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                onSearchClick={() => {
                  setSearchInitialQuery('');
                  setCurrentTab('search');
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
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
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
                    onNavigateTab={setCurrentTab}
                    onNavigateSection={handleNavigateSection}
                    targetSection={targetSection}
                    onClearTargetSection={() => setTargetSection(null)}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
                    onOpenTerms={handleOpenTerms}
                    onOpenInstallModal={() => setIsInstallModalOpen(true)}
                  />
                )}

                {currentTab === 'favourite' && (
                  <FavouritesView
                    favorites={favorites}
                    recentlyPlayed={recentlyPlayed}
                    onPlay={handlePlay}
                    onToggleFavorite={handleToggleFavorite}
                    onClearHistory={handleClearHistory}
                    onNavigateDiscover={() => setCurrentTab('discover')}
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
                    onNavigateTab={setCurrentTab}
                    onNavigateSection={handleNavigateSection}
                    onOpenInstallModal={() => setIsInstallModalOpen(true)}
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
                    onNavigateDiscover={() => setCurrentTab('discover')}
                    onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
                    onOpenTerms={handleOpenTerms}
                    onNavigateTab={setCurrentTab}
                    onOpenInstallModal={() => setIsInstallModalOpen(true)}
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

      {/* PWA Download Notification */}
      <PwaDownloadNotification onDownloadClick={handleDownloadClick} />

      {/* PWA / Desktop App Install Guidance Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => {
          sessionStorage.setItem('firstplay_android_modal_dismissed', 'true');
          setIsInstallModalOpen(false);
        }}
        onInstallDirect={triggerPwaInstall}
      />

      {/* Legal Privacy Policy & Terms of Service Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        initialDoc={legalDocType}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}
