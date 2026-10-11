import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCw, Maximize2, Minimize2, ExternalLink, X, ShieldAlert, ChevronDown, Gamepad2 } from 'lucide-react';
import { preloadService, PreloadState } from '../services/preloadService';
import { isLagosLife, openGameInNewTab } from '../utils/gameUtils';

/**
 * Dropdown menu listing available games for instant switching
 */
function GameSwitcherMenu({
  availableGames = [],
  activeItem,
  onSwitchGame,
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 w-72 sm:w-84 rounded-2xl bg-[#14151a]/95 backdrop-blur-2xl border border-white/20 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 select-none text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-white/[0.08] flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Gamepad2 size={13} className="text-[#0071e3]" />
          <span>Available Games</span>
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">
          {availableGames.length} titles
        </span>
      </div>

      <div className="max-h-64 overflow-y-auto py-1 space-y-1 scrollbar-none">
        {availableGames.map((game) => {
          const isCurrent = game.id === activeItem?.id;
          const isLagos = isLagosLife(game);
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                if (isLagos) {
                  openGameInNewTab(game);
                } else if (!isCurrent) {
                  onSwitchGame?.(game);
                }
                onClose();
              }}
              disabled={isCurrent}
              className={`w-full p-2 rounded-xl flex items-center justify-between gap-3 transition-all text-left ${
                isCurrent
                  ? 'bg-white/[0.08] cursor-default border border-white/10'
                  : 'hover:bg-white/15 cursor-pointer active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={game.logo_url}
                  alt={game.name}
                  className="w-9 h-9 rounded-xl object-cover shrink-0 border border-white/15 shadow-sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {game.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {game.tagline || game.creator || 'Instant Web Game'}
                  </p>
                </div>
              </div>

              {isCurrent ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wide uppercase border border-emerald-500/30 shrink-0">
                  Playing
                </span>
              ) : isLagos ? (
                <span className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white text-[11px] font-semibold tracking-wide shrink-0 transition-colors shadow-sm flex items-center gap-1 border border-white/15">
                  <span>New Tab</span>
                  <ExternalLink size={10} />
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-semibold tracking-wide shrink-0 transition-colors shadow-sm">
                  Switch
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PlayerView({
  activeItem,
  allItems = [],
  onSwitchGame,
  onExit,
  isFullscreen: propIsFullscreen,
  onToggleFullscreen
}) {
  if (!activeItem) return null;

  const [localFullscreen, setLocalFullscreen] = useState(Boolean(propIsFullscreen));
  const [certWarning, setCertWarning] = useState(null);
  const [showHud, setShowHud] = useState(true);
  const [isTopBarVisible, setIsTopBarVisible] = useState(false);
  const [isBarHovered, setIsBarHovered] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isWindowedSwitcherOpen, setIsWindowedSwitcherOpen] = useState(false);
  
  // Game loading and process state
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [gameLoadError, setGameLoadError] = useState(null);

  const iframeRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const switcherRef = useRef(null);
  const windowedSwitcherRef = useRef(null);

  const isFullscreen = typeof propIsFullscreen === 'boolean' ? propIsFullscreen : localFullscreen;
  const isElectron = Boolean(window.firstPlayAPI && !window.firstPlayAPI.isWeb);

  // Available games in catalog for switching
  const availableGames = (allItems || []).filter(i => 
    i && 
    i.category === 'game' && 
    i.url
  );

  // Safety guard: Always open Lagos Life in another tab. Just Lagos Life.
  useEffect(() => {
    if (activeItem && isLagosLife(activeItem)) {
      openGameInNewTab(activeItem);
      onExit?.();
    }
  }, [activeItem?.id]);

  // Reset loading state when game changes and provide fallback timer to clear splash
  useEffect(() => {
    setIsGameLoading(true);
    setGameLoadError(null);

    // Fallback: dismiss loading splash after 2.2s even if onLoad is delayed by web asset streams
    const fallbackTimer = setTimeout(() => {
      setIsGameLoading(false);
    }, 2200);

    return () => clearTimeout(fallbackTimer);
  }, [activeItem?.id]);

  // Clean destruction on unmount: immediately blank the iframe to stop all Web Audio and game loops
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        try {
          iframeRef.current.src = 'about:blank';
        } catch (e) {}
      }
    };
  }, []);

  // Close switcher dropdowns on outside click or Escape key
  useEffect(() => {
    if (!isSwitcherOpen && !isWindowedSwitcherOpen) return;
    const handleClickOutside = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setIsSwitcherOpen(false);
      }
      if (windowedSwitcherRef.current && !windowedSwitcherRef.current.contains(e.target)) {
        setIsWindowedSwitcherOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSwitcherOpen(false);
        setIsWindowedSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSwitcherOpen, isWindowedSwitcherOpen]);

  // In-Game Top Bar mouse hover to top edge & cursor proximity tracking
  useEffect(() => {
    if (!activeItem) {
      setIsTopBarVisible(false);
      return;
    }

    const handleMouseMove = (e) => {
      // If cursor is within top 35px, drop down the top bar
      if (e.clientY <= 35) {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        setIsTopBarVisible(true);
      } else if (!isBarHovered && !isSwitcherOpen) {
        // Debounced smooth auto-hide when moving away
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
          setIsTopBarVisible(false);
        }, 500);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [activeItem?.id, isBarHovered, isSwitcherOpen]);

  // Clean Exit with Audio Termination
  const handleExit = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.src = 'about:blank';
      } catch (e) {}
    }
    onExit?.();
  };

  // Clean Switch Game with Audio Termination of previous game
  const handleSwitchGame = (game) => {
    if (isLagosLife(game)) {
      openGameInNewTab(game);
      return;
    }
    if (iframeRef.current) {
      try {
        iframeRef.current.src = 'about:blank';
      } catch (e) {}
    }
    onSwitchGame?.(game);
  };

  const handleReload = () => {
    setIsGameLoading(true);
    setGameLoadError(null);
    if (iframeRef.current) {
      iframeRef.current.src = activeItem.url;
    }
  };

  const handleToggleFullscreen = () => {
    const next = !isFullscreen;
    setLocalFullscreen(next);
    if (onToggleFullscreen) {
      onToggleFullscreen(next);
    } else if (window.firstPlayAPI?.toggleFullscreen) {
      window.firstPlayAPI.toggleFullscreen();
    }
  };

  const handleOpenExternal = () => {
    if (activeItem?.url) {
      window.firstPlayAPI?.openExternal?.(activeItem.url);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#121214] select-none overflow-hidden animate-in fade-in duration-150">
      {/* Top Edge Hover Sensor Strip across entire width */}
      <div
        className="absolute top-0 left-0 right-0 h-4 z-40 pointer-events-auto"
        onMouseEnter={() => {
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
          setIsTopBarVisible(true);
        }}
      />

      {/* Floating Trigger Tab for mobile / click to show */}
      <button
        type="button"
        onClick={() => setIsTopBarVisible(prev => !prev)}
        title="Toggle Game Controls"
        className={`absolute top-0 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-b-xl bg-[#14151a]/85 hover:bg-[#14151a] backdrop-blur-xl border-b border-x border-white/20 text-[10px] font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 shadow-xl transition-all duration-300 cursor-pointer pointer-events-auto ${
          isTopBarVisible || isBarHovered || isSwitcherOpen ? 'translate-y-11 opacity-90' : 'translate-y-0 opacity-40 hover:opacity-100'
        }`}
      >
        <Gamepad2 size={11} className="text-[#0071e3]" />
        <span>Controls</span>
        <ChevronDown size={11} className={`transition-transform duration-200 ${isTopBarVisible || isBarHovered || isSwitcherOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Unified In-Game Interactive Top Bar (Reveals on top edge hover or click) */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-3 md:px-5 py-2 bg-[#121318]/95 backdrop-blur-2xl border-b border-white/[0.12] shadow-2xl transition-all duration-300 ease-out select-none ${
          isTopBarVisible || isBarHovered || isSwitcherOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        onMouseEnter={() => {
          setIsBarHovered(true);
          setIsTopBarVisible(true);
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        }}
        onMouseLeave={() => {
          setIsBarHovered(false);
          if (!isSwitcherOpen) {
            hideTimeoutRef.current = setTimeout(() => {
              setIsTopBarVisible(false);
            }, 600);
          }
        }}
      >
        {/* Left: Exit to Storefront & Active Game Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExit}
            title="Exit to Storefront"
            className="h-7 sm:h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer border border-white/15 backdrop-blur-md active:scale-95 shadow-sm"
          >
            <ArrowLeft size={13} />
            <span>Store</span>
          </button>

          <div className="h-4 w-[1px] bg-white/15 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-white tracking-tight truncate max-w-[100px] sm:max-w-[200px]">
              {activeItem.name}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase hidden md:inline font-mono">
              [{activeItem.category}]
            </span>
          </div>
        </div>

        {/* Center: In-Game Switch Game Dropdown Selector & Fullscreen */}
        <div className="flex items-center gap-2">
          {availableGames.length > 0 && (
            <div className="relative" ref={switcherRef}>
              <button
                type="button"
                onClick={() => setIsSwitcherOpen(prev => !prev)}
                title="List Available Games to Switch"
                className={`h-7 sm:h-8 px-2.5 sm:px-3.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs font-semibold active:scale-95 shadow-sm ${
                  isSwitcherOpen
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                }`}
              >
                <Gamepad2 size={13} />
                <span className="hidden sm:inline">Switch Game</span>
                <span className="sm:hidden text-[11px]">Switch</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${isSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>

              <GameSwitcherMenu
                availableGames={availableGames}
                activeItem={activeItem}
                onSwitchGame={handleSwitchGame}
                isOpen={isSwitcherOpen}
                onClose={() => setIsSwitcherOpen(false)}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Play in Fullscreen"}
            className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>

          <span className="hidden xl:inline-block px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.06] text-[11px] text-zinc-400">
            Sandboxed Process
          </span>
        </div>

        {/* Right: Window & Session Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleReload}
            title="Reload Experience"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 active:scale-95"
          >
            <RotateCw size={13} className={isGameLoading ? 'animate-spin text-white' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenExternal}
            title="Open Game in New Window"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 active:scale-95"
          >
            <ExternalLink size={13} />
          </button>

          <button
            type="button"
            onClick={handleExit}
            title="Exit Game and destroy process"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-rose-500/25 text-zinc-300 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer border border-rose-500/20 ml-1 active:scale-95"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Embedded Web Workspace Container */}
      <div className="relative flex-1 w-full h-full bg-black overflow-hidden">
        
        {/* First-Screen Splash Screen (Cached visual appearance while fresh process spins up) */}
        {isGameLoading && (
          <div className="absolute inset-0 z-20 bg-[#0a0a0e] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden animate-in fade-in duration-200">
            {/* Background artwork blur */}
            {activeItem.banner_url && (
              <div 
                className="absolute inset-0 bg-cover bg-center blur-3xl opacity-25 scale-105 pointer-events-none"
                style={{ backgroundImage: `url(${activeItem.banner_url})` }}
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center max-w-sm space-y-4">
              <img
                src={activeItem.logo_url}
                alt={activeItem.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200"
              />

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeItem.name}
                </h2>
                <p className="text-xs text-zinc-400 font-medium">
                  {activeItem.tagline || activeItem.creator || 'Sandboxed Web Game'}
                </p>
              </div>

              {/* Shimmering Loading Progress Indicator */}
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden relative mt-2">
                <div className="absolute inset-0 bg-[#0071e3] rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error Fallback Overlay */}
        {gameLoadError && (
          <div className="absolute inset-0 z-25 bg-[#0b0d13] flex flex-col items-center justify-center p-6 text-center">
            <ShieldAlert size={44} className="text-rose-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Could not launch experience</h3>
            <p className="text-xs text-zinc-400 max-w-md mb-5 leading-relaxed">
              {gameLoadError || "We couldn't connect to this web experience. Check your internet connection or launch it in your browser."}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReload}
                className="px-4 py-2 rounded-lg bg-[#0071e3] text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={handleOpenExternal}
                className="px-4 py-2 rounded-lg bg-[#181d2a] text-zinc-300 font-semibold text-xs border border-[#2b354c] cursor-pointer"
              >
                Open in Browser
              </button>
            </div>
          </div>
        )}

        {/* Dedicated Single Active Game Process: Destroyed completely on close or switch */}
        <iframe
          ref={iframeRef}
          key={activeItem.id}
          src={activeItem.url}
          title={activeItem.name}
          className="w-full h-full border-0 bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; gamepad; pointer-lock"
          allowFullScreen={true}
          onLoad={() => {
            setIsGameLoading(false);
            preloadService.markReady(activeItem.id);
          }}
          onError={() => {
            setIsGameLoading(false);
            setGameLoadError('Unable to load experience host.');
          }}
        />

      </div>
    </div>
  );
}
