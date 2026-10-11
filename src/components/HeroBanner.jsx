import React, { useState, useEffect } from 'react';
import { Play, ChevronRight, ChevronLeft, Star, ExternalLink } from 'lucide-react';
import { isLagosLife } from '../utils/gameUtils';

export default function HeroBanner({ 
  banners = [], 
  items = [], 
  item, 
  activeItem,
  activeIndex,
  onPlay, 
  onNext,
  onPrev,
  onSelectIndex,
  secondaryItems = [],
  showSecondary = true,
  autoScrollSeconds = 7,
  isStatic = false
}) {
  // Normalize banner list (support banners array, items array, or single item)
  const bannerList = banners.length > 0 
    ? banners 
    : items.length > 0 
      ? items 
      : item 
        ? [item] 
        : [];

  const isControlled = activeItem !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [slideKey, setSlideKey] = useState(0);

  const currentIndex = isStatic
    ? 0
    : isControlled 
      ? (typeof activeIndex === 'number' && activeIndex >= 0 
          ? activeIndex 
          : (activeItem ? bannerList.findIndex(b => (b.id || b.name) === (activeItem.id || activeItem.name)) : 0))
      : internalIndex;

  const currentItem = isStatic
    ? (item || activeItem || bannerList[0] || null)
    : (isControlled 
        ? (activeItem || bannerList[currentIndex] || bannerList[0])
        : (bannerList[currentIndex] || bannerList[0]));

  // Keep internal index bounded if not controlled and not static
  useEffect(() => {
    if (!isStatic && !isControlled && internalIndex >= bannerList.length && bannerList.length > 0) {
      setInternalIndex(0);
    }
  }, [bannerList.length, internalIndex, isControlled, isStatic]);

  // When active item changes, update slideKey to restart progress bar animation
  useEffect(() => {
    if (currentItem && !isStatic) {
      setSlideKey((k) => k + 1);
    }
  }, [currentItem?.id, currentItem?.name, isStatic]);

  // Auto-scrolling carousel timer (only runs when NOT static)
  useEffect(() => {
    if (isStatic || bannerList.length <= 1 || isHovered) return;

    const intervalMs = autoScrollSeconds * 1000;
    const timer = setInterval(() => {
      if (isControlled && onNext) {
        onNext();
      } else {
        setInternalIndex((prev) => (prev + 1) % bannerList.length);
      }
      setSlideKey((k) => k + 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [bannerList.length, isHovered, autoScrollSeconds, isControlled, onNext, isStatic]);

  if (!currentItem) return null;

  const isLagos = isLagosLife(currentItem);
  const isExternal = isLagos || currentItem.open_in_app === false;
  const actionLabel = isExternal
    ? 'Play in New Tab'
    : currentItem.category === 'game' 
      ? 'Play' 
      : currentItem.category === 'app' 
        ? 'Get' 
        : 'Visit';

  const handleNext = (e) => {
    e?.stopPropagation?.();
    if (isControlled && onNext) {
      onNext();
    } else {
      setInternalIndex((prev) => (prev + 1) % bannerList.length);
    }
    setSlideKey((k) => k + 1);
  };

  const handlePrev = (e) => {
    e?.stopPropagation?.();
    if (isControlled && onPrev) {
      onPrev();
    } else {
      setInternalIndex((prev) => (prev - 1 + bannerList.length) % bannerList.length);
    }
    setSlideKey((k) => k + 1);
  };


  return (
    <div className="space-y-4">
      {/* Primary Landscape Hero Banner */}
      <div 
        onClick={() => onPlay(currentItem)}
        onMouseEnter={() => !isStatic && setIsHovered(true)}
        onMouseLeave={() => !isStatic && setIsHovered(false)}
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[400px] border border-white/[0.18] shadow-2xl shadow-black/50 cursor-pointer group transition-all duration-300 liquid-glass-frame select-none"
        style={{
          isolation: 'isolate',
          contain: 'paint',
          clipPath: 'inset(0 round 1.5rem)',
          WebkitClipPath: 'inset(0 round 1.5rem)'
        }}
      >
        {/* Layer 0: Full-bleed landscape artwork covering the entire banner box */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-[#0a0a0f] rounded-2xl sm:rounded-3xl"
          style={{
            isolation: 'isolate',
            contain: 'paint',
            clipPath: 'inset(0 round 1.5rem)',
            WebkitClipPath: 'inset(0 round 1.5rem)',
            WebkitMaskImage: '-webkit-radial-gradient(white, black)'
          }}
        >
          <img
            key={`img-${currentItem.id || currentItem.name || currentIndex}`}
            src={currentItem.banner_url || currentItem.logo_url}
            alt={currentItem.name}
            className="w-full h-full object-cover object-center rounded-2xl sm:rounded-3xl group-hover:scale-[1.025] transition-transform duration-700 ease-out animate-in fade-in duration-500 will-change-transform"
            style={{
              clipPath: 'inset(0 round 1.5rem)',
              WebkitClipPath: 'inset(0 round 1.5rem)',
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
            loading="eager"
          />
        </div>

        {/* Layer 1: Ultra-light ambient vignette (keeps 100% of banner artwork bright, vivid, and colorful) */}
        <div 
          className="absolute inset-0 z-10 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none rounded-2xl sm:rounded-3xl"
          style={{ clipPath: 'inset(0 round 1.5rem)', WebkitClipPath: 'inset(0 round 1.5rem)' }}
        />

        {/* Layer 2: Editorial Content inside an Apple-style Liquid Glass Card (covers ~half width on mobile so game snippet image shines through) */}
        <div className="relative z-20 w-full h-full p-2.5 sm:p-5 md:p-8 flex flex-col justify-end min-h-[300px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[400px] pointer-events-none">
          <div 
            key={`content-${currentItem.id || currentItem.name || currentIndex}`}
            className="w-[54%] sm:w-[50%] md:max-w-md lg:max-w-xl pointer-events-auto p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-3xl bg-black/30 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-1.5 sm:space-y-2.5 md:space-y-3 hero-banner-content animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all group-hover:border-white/30 group-hover:bg-black/35"
            style={{
              backdropFilter: 'blur(20px) saturate(170%)',
              WebkitBackdropFilter: 'blur(20px) saturate(170%)',
              boxShadow: '0 20px 45px -12px rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.22)'
            }}
          >
            {/* Category / Editorial Tag with rotation pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-white shadow-sm truncate max-w-full">
                {currentItem.badge_text || (currentItem.category === 'game' ? 'GAMES WE LOVE' : 'FEATURED PROMOTION')}
              </span>

              {currentItem.requires_fullscreen && (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-blue-500/25 backdrop-blur-md border border-blue-400/40 text-[9px] sm:text-[10px] font-semibold text-blue-200">
                  Auto-Fullscreen
                </span>
              )}
            </div>

            {/* Prominent Title */}
            <h2 className="text-base sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-sm truncate">
              {currentItem.name}
            </h2>

            {/* Metadata Line */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs font-medium text-zinc-200 flex-wrap pt-0.5">
              <span className="font-semibold text-white uppercase tracking-wider">{currentItem.category}</span>
              <span className="text-white/40">•</span>
              <span className="hidden xs:inline">Instant WebGL</span>
              <span className="text-white/40 hidden xs:inline">•</span>
              <span className="truncate">Zero Install</span>
              {currentItem.rating && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-amber-300 font-bold flex items-center gap-0.5">
                    <Star size={10} fill="currentColor" />
                    <span>{currentItem.rating.toFixed(1)}</span>
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-[10px] sm:text-xs md:text-sm text-zinc-100/95 line-clamp-2 sm:line-clamp-3 font-normal leading-relaxed drop-shadow-sm">
              {currentItem.description}
            </p>

            {/* Studio / Creator line */}
            <div className="text-[9px] sm:text-[11px] text-zinc-300 font-normal truncate">
              <span>Studio: </span>
              <span className="text-white font-semibold">{currentItem.creator || 'FirstPlay Independent Studio'}</span>
            </div>

            {/* Primary Action Button */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {currentItem.url && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(currentItem);
                  }}
                  className="px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-full bg-white text-black font-bold text-[10px] sm:text-xs tracking-wide hover:bg-zinc-100 transition-all active:scale-95 shadow-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {isExternal ? (
                    <>
                      <span>Play in New Tab</span>
                      <ExternalLink size={11} />
                    </>
                  ) : (
                    <>
                      <Play size={11} fill="currentColor" />
                      <span>{actionLabel}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center/Top-Right Game Play Badge if game */}
        {currentItem.category === 'game' && (
          <div className="absolute right-14 top-8 hidden md:flex items-center justify-center pointer-events-none z-10">
            <div className="w-12 h-12 rounded-full bg-black/45 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
              <Play size={18} fill="currentColor" className="ml-0.5" />
            </div>
          </div>
        )}

        {/* Carousel Navigation: Left & Right Chevrons (Only if not static and multiple banners) */}
        {!isStatic && bannerList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              title="Previous Ad"
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer shadow-xl z-30 opacity-70 hover:opacity-100 hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              title="Next Ad"
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer shadow-xl z-30 opacity-70 hover:opacity-100 hover:scale-105 active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Two Side-by-Side Featured Cards below hero (optional for main hero) */}
      {showSecondary && secondaryItems.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {secondaryItems.slice(0, 2).map((subItem, idx) => (
            <div
              key={subItem.id || subItem.name || idx}
              onClick={() => onPlay(subItem)}
              className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card cursor-pointer flex flex-col justify-between gap-4 group transition-all duration-300"
            >
              <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-zinc-400">
                <span className="uppercase text-zinc-300">{idx === 0 ? 'GAMES WE LOVE' : 'FEATURED APP'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/90">
                  {(subItem.category || 'GAME').toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white tracking-tight truncate group-hover:text-blue-300 transition-colors">
                    {subItem.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {subItem.tagline || subItem.description}
                  </p>
                </div>

                <img
                  src={subItem.logo_url}
                  alt={subItem.name}
                  className="w-16 h-16 rounded-[20px] object-cover shrink-0 shadow-lg border border-white/15 group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.08] text-[11px] text-zinc-400">
                <span className="truncate">{subItem.creator || 'FirstPlay Independent'}</span>
                <span className="text-white font-medium group-hover:text-blue-300 transition-colors flex items-center gap-1">
                  <span>Play</span>
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
