import React, { useState, useEffect, useMemo } from 'react';
import HeroBanner from '../components/HeroBanner';
import AppRowItem from '../components/AppRowItem';
import Footer from '../components/Footer';
import { Sparkles } from 'lucide-react';
import { getUniqueBannerPool } from '../hooks/useBannerCoordinator';

export default function DiscoverView({ 
  listings = [], 
  heroItem, 
  heroBanners = [],
  onPlay, 
  onNavigateCategory,
  onNavigateTab,
  onNavigateSection,
  targetSection,
  onClearTargetSection,
  favorites = [],
  onToggleFavorite,
  onOpenPrivacyPolicy,
  onOpenTerms
}) {
  const isFav = (id) => favorites?.some(f => f.id === id);

  const games = useMemo(() => listings.filter(item => item.category === 'game'), [listings]);

  // 1. Top Games: Sorted by plays_count (desc), then rating (desc)
  const topGames = useMemo(() => {
    return [...games].sort((a, b) => {
      const playsA = a.plays_count || 0;
      const playsB = b.plays_count || 0;
      if (playsB !== playsA) return playsB - playsA;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [games]);

  // 2. New Games: Sorted by created_at (newest first)
  const newGames = useMemo(() => {
    return [...games].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [games]);

  // Unified banner candidate pool from authentic Firebase listings
  const bannerPool = useMemo(() => {
    return getUniqueBannerPool(heroBanners, listings, heroItem);
  }, [heroBanners, listings, heroItem]);

  const poolKey = useMemo(() => {
    return bannerPool.map(i => i.id || i.name).join('|');
  }, [bannerPool]);

  // The two static banners pick random items from the array, displaying separate images
  const [staticBannerItems, setStaticBannerItems] = useState({ item1: null, item2: null });

  useEffect(() => {
    if (bannerPool.length === 0) {
      setStaticBannerItems({ item1: null, item2: null });
      return;
    }
    if (bannerPool.length === 1) {
      setStaticBannerItems({ item1: bannerPool[0], item2: bannerPool[0] });
      return;
    }

    // Pick two random distinct items such that the two static banners display separate images
    const indices = bannerPool.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    setStaticBannerItems({
      item1: bannerPool[indices[0]],
      item2: bannerPool[indices[1]]
    });
  }, [poolKey]);

  useEffect(() => {
    if (targetSection) {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetSection) ||
                   (targetSection === 'trending-section' ? document.getElementById('trending') : null) ||
                   (targetSection === 'new-games-section' ? document.getElementById('new-games') : null);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (targetSection === 'discover-section') {
          const container = document.querySelector('.overflow-y-auto');
          container?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        onClearTargetSection?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [targetSection, onClearTargetSection]);

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-6 sm:space-y-10">
      
      {/* Screen Title */}
      <div id="discover-section" className="scroll-mt-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Discover
        </h1>
      </div>

      {listings.length === 0 ? (
        <div className="p-6 sm:p-12 rounded-2xl bg-[#1c1c1e]/60 border border-white/[0.08] text-center max-w-lg mx-auto space-y-4 my-8 sm:my-12 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#0a84ff]">
            <Sparkles size={22} />
          </div>
          <h3 className="text-base font-bold text-white">No Experiences Available</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Check back soon for new games, web apps, and featured experiences.
          </p>
        </div>
      ) : (
        <>
          {/* Top Banner (Only the top banner is a carousel, duration: 7s) */}
          {bannerPool.length > 0 && (
            <section>
              <HeroBanner 
                banners={bannerPool}
                onPlay={onPlay}
                showSecondary={false}
                autoScrollSeconds={7}
                isStatic={false}
              />
            </section>
          )}

          {/* Section 1: Top Games */}
          {topGames.length > 0 && (
            <section id="trending-section" className="space-y-3 scroll-mt-6">
              <div id="trending" className="sr-only" />
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏆</span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Top Games
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateCategory('Top Games')}
                  className="text-xs font-semibold text-[#0a84ff] hover:text-[#409cff] transition-colors cursor-pointer"
                >
                  See All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                {topGames.slice(0, 6).map((item, idx) => (
                  <AppRowItem
                    key={`top-${item.id}`}
                    item={item}
                    rank={idx + 1}
                    onPlay={onPlay}
                    isFavorited={isFav(item.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Static Banner 1 displayed after Top Games (Static, picks a random item displaying a separate image) */}
          {staticBannerItems.item1 && (
            <section className="pt-2">
              <HeroBanner 
                item={staticBannerItems.item1}
                onPlay={onPlay}
                showSecondary={false}
                isStatic={true}
              />
            </section>
          )}

          {/* Section 2: New Games */}
          {newGames.length > 0 && (
            <section id="new-games-section" className="space-y-3 scroll-mt-6">
              <div id="new-games" className="sr-only" />
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">✨</span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    New Games
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateCategory('New Games')}
                  className="text-xs font-semibold text-[#0a84ff] hover:text-[#409cff] transition-colors cursor-pointer"
                >
                  See All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                {newGames.slice(0, 6).map((item, idx) => (
                  <AppRowItem
                    key={`new-${item.id}`}
                    item={item}
                    rank={idx + 1}
                    onPlay={onPlay}
                    isFavorited={isFav(item.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Static Banner 2 displayed after New Games (Static, picks a separate image from static banner 1) */}
          {staticBannerItems.item2 && (
            <section className="pt-2">
              <HeroBanner 
                item={staticBannerItems.item2}
                onPlay={onPlay}
                showSecondary={false}
                isStatic={true}
              />
            </section>
          )}

          {/* Platform Footer */}
          <Footer
            onOpenPrivacyPolicy={onOpenPrivacyPolicy}
            onOpenTerms={onOpenTerms}
            onNavigateTab={onNavigateTab}
            onNavigateCategory={onNavigateCategory}
            onNavigateSection={onNavigateSection}
          />
        </>
      )}
    </div>
  );
}
