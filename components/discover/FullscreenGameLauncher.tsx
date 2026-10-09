'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Expand,
  ExternalLink,
  Loader2,
  Minimize2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
  X
} from 'lucide-react';
import { isFrameRestricted, type Listing } from '@/lib/discover';

export function enterFullscreen(element: HTMLElement = document.documentElement) {
  try {
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(() => {});
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  } catch (err) {
    console.warn('Fullscreen request failed:', err);
  }
}

export function exitFullscreen() {
  try {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  } catch (err) {
    console.warn('Exit fullscreen failed:', err);
  }
}

export function FullscreenGameLauncher({
  games,
  activeGame,
  relatedGames,
  onClose,
  onSwitchGame
}: {
  games: Listing[];
  activeGame: Listing | null;
  relatedGames: Listing[];
  onClose: () => void;
  onSwitchGame: (nextGame: Listing) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [showNetworkBar, setShowNetworkBar] = useState(false);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preload manager state
  const [preloadedIds, setPreloadedIds] = useState<string[]>([]);
  const [loadedGameIds, setLoadedGameIds] = useState<Record<string, boolean>>({});
  const [failedGameIds, setFailedGameIds] = useState<Record<string, boolean>>({});
  const [reloadKeys, setReloadKeys] = useState<Record<string, number>>({});

  // 1. Initial preload: preload top 1-2 eligible games in background on mount
  useEffect(() => {
    if (!games || games.length === 0) return;

    // Filter to eligible candidates: must have valid HTTPS URL and not be frame-restricted
    const eligible = games.filter(
      (g) => g.url && g.url.startsWith('https://') && !isFrameRestricted(g.url)
    );

    // Initial batch: 2 games
    const topCandidates = eligible.slice(0, 2);
    if (topCandidates.length > 0) {
      setPreloadedIds((prev) => {
        const next = new Set(prev);
        topCandidates.forEach((c) => next.add(c.id));
        return Array.from(next);
      });
    }
  }, [games]);

  // 2. On-demand preload: when user selects a game to play, ensure it is added to preloadedIds
  useEffect(() => {
    if (!activeGame) return;

    // If active game is not yet preloaded, add it immediately
    setPreloadedIds((prev) => (prev.includes(activeGame.id) ? prev : [...prev, activeGame.id]));

    // Attempt browser fullscreen for F11 experience
    if (containerRef.current) {
      enterFullscreen(containerRef.current);
    } else {
      enterFullscreen(document.documentElement);
    }

    const handleFsChange = () => {
      const active = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(active);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        handleExit();
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleKeyDown);

    // Reset HUD timer
    setShowHud(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = setTimeout(() => {
      setShowHud(false);
    }, 4500);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    };
  }, [activeGame]);

  const handleExit = () => {
    exitFullscreen();
    onClose();
  };

  const toggleNativeFs = () => {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      exitFullscreen();
    } else if (containerRef.current) {
      enterFullscreen(containerRef.current);
    }
  };

  const handleUserActivity = () => {
    setShowHud(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = setTimeout(() => {
      if (!showNetworkBar) {
        setShowHud(false);
      }
    }, 4000);
  };

  const handleRestartActive = () => {
    if (!activeGame) return;
    setLoadedGameIds((prev) => ({ ...prev, [activeGame.id]: false }));
    setReloadKeys((prev) => ({ ...prev, [activeGame.id]: (prev[activeGame.id] || 0) + 1 }));
  };

  // Get full listing objects for all preloaded games
  const preloadedGames = games.filter((g) => preloadedIds.includes(g.id));

  const isActiveLoading = activeGame ? !loadedGameIds[activeGame.id] : false;
  const isActiveRestricted = activeGame ? isFrameRestricted(activeGame.url) : false;
  const isPreloadedAndReady = activeGame ? loadedGameIds[activeGame.id] : false;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      className={
        activeGame
          ? 'fixed inset-0 z-[9999] flex h-screen w-screen flex-col bg-black text-white overflow-hidden select-none'
          : 'fixed left-0 top-0 -z-50 h-px w-px overflow-hidden opacity-0 pointer-events-none'
      }
    >
      {activeGame && (
        <>
          {/* Top Floating Glass HUD */}
          <div
            className={`absolute top-0 inset-x-0 z-50 transition-all duration-300 ${
              showHud ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
            }`}
          >
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
              {/* Brand & Active Game Info */}
              <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/65 px-4 py-2 backdrop-blur-2xl shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/firstplay-logo.png" alt="FirstPlay" className="h-6 w-6 rounded-[22%]" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                    {activeGame.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/60">
                    <span>FirstPlay Launcher</span>
                    {isPreloadedAndReady && !isActiveRestricted && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 py-0.2 font-semibold text-emerald-400">
                        <Zap size={10} className="fill-emerald-400" />
                        Preloaded
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Cross-Traffic Switcher Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNetworkBar(!showNetworkBar)}
                  className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/65 px-4 py-2 text-xs font-bold text-white backdrop-blur-2xl hover:bg-black/85 transition"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Switch Game (Instant)</span>
                  <ChevronDown
                    size={14}
                    className={`transition ${showNetworkBar ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Network Games Deck */}
                {showNetworkBar && (
                  <div className="absolute right-0 top-12 w-72 rounded-2xl border border-white/20 bg-black/90 p-3 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95">
                    <span className="block px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Network Games (No Reload)
                    </span>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {relatedGames.map((rel) => {
                        const isPreloaded = loadedGameIds[rel.id];
                        return (
                          <button
                            key={rel.id}
                            type="button"
                            onClick={() => {
                              setShowNetworkBar(false);
                              onSwitchGame(rel);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left hover:bg-white/10 transition"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={rel.image}
                              alt=""
                              className="h-8 w-8 rounded-[22%] object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <b className="block truncate text-xs text-white">{rel.name}</b>
                              <span className="block truncate text-[10px] text-white/60">
                                {isPreloaded ? '⚡ Preloaded & Ready' : `${rel.plays || '15k'} plays`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* HUD Action Controls */}
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/65 p-1.5 backdrop-blur-2xl shadow-lg">
                <button
                  type="button"
                  onClick={toggleNativeFs}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  title="Toggle Fullscreen"
                  className="grid h-8 w-8 place-items-center rounded-full text-white/80 hover:bg-white/15 transition"
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Expand size={16} />}
                </button>

                <button
                  type="button"
                  onClick={handleRestartActive}
                  aria-label="Restart Game"
                  title="Restart Game"
                  className="grid h-8 w-8 place-items-center rounded-full text-white/80 hover:bg-white/15 transition"
                >
                  <RotateCcw size={15} />
                </button>

                <button
                  type="button"
                  onClick={handleExit}
                  aria-label="Exit Game"
                  title="Close & Return to Discovery (ESC)"
                  className="grid h-8 w-8 place-items-center rounded-full bg-red-600/80 text-white hover:bg-red-600 transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Mouse trigger strip when HUD is auto-hidden */}
          {!showHud && (
            <div
              onMouseEnter={() => setShowHud(true)}
              className="absolute top-0 inset-x-0 h-10 z-40 cursor-pointer"
              title="Move cursor here or tap to reveal controls"
            />
          )}
        </>
      )}

      {/* Main Game Stage Area: Hosts preloaded & active iframes */}
      <div className="relative h-full w-full flex-1 bg-black">
        {/* Loading overlay for non-preloaded games */}
        {activeGame && isActiveLoading && !isActiveRestricted && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 text-center p-6">
            <Loader2 size={40} className="animate-spin text-fp-accent mb-4" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Connecting to {activeGame.name}...
            </h3>
            <p className="text-xs text-white/50 mt-1 max-w-sm">
              Loading live web game into FirstPlay launcher. Zero install or external redirection required.
            </p>
          </div>
        )}

        {/* Fallback card for titles requiring dedicated tab (e.g. X-Frame-Options: SAMEORIGIN) */}
        {activeGame && isActiveRestricted && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/95 p-6 text-center">
            <div className="max-w-md rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/20 text-amber-400">
                <ShieldAlert size={28} />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeGame.name}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed">
                This game’s host server requires direct standalone browser playback (<code>X-Frame-Options: SAMEORIGIN</code>).
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    window.open(activeGame.url, '_blank', 'noopener,noreferrer');
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-fp-accent px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg transition hover:scale-105 active:scale-95"
                >
                  <ExternalLink size={16} />
                  Launch in Dedicated Tab ↗
                </button>

                <button
                  type="button"
                  onClick={handleExit}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
                >
                  Back to Discovery
                </button>
              </div>
            </div>
          </div>
        )}

        {/*
          Keep preloaded iframes mounted in individual positioned containers.
          Only the active game has opacity-100 and pointer-events-auto.
          Inactive preloaded iframes remain warm in DOM memory with opacity-0 and pointer-events-none.
        */}
        {preloadedGames.map((game) => {
          const isRestricted = isFrameRestricted(game.url);
          if (isRestricted) return null;

          const isActive = activeGame?.id === game.id;
          const reloadKey = reloadKeys[game.id] || 0;

          return (
            <div
              key={`${game.id}-${reloadKey}`}
              className={`absolute inset-0 transition-opacity duration-200 ${
                isActive && !isActiveRestricted
                  ? 'opacity-100 z-10 pointer-events-auto'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <iframe
                ref={(node) => {
                  iframeRefs.current[game.id] = node;
                }}
                src={game.url}
                title={game.name}
                allow="fullscreen; autoplay; gamepad; accelerometer; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => {
                  setLoadedGameIds((prev) => ({ ...prev, [game.id]: true }));
                }}
                onError={() => {
                  setFailedGameIds((prev) => ({ ...prev, [game.id]: true }));
                }}
                className="h-full w-full border-0"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
