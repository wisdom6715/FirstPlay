import React, { useState, useEffect, useMemo } from 'react';
import AppRowItem from '../components/AppRowItem';
import HeroBanner from '../components/HeroBanner';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';
import { getUniqueBannerPool } from '../hooks/useBannerCoordinator';

export default function CategoriesView({ 
  listings = [], 
  heroBanners = [],
  selectedCategory = 'All',
  onCategoryChange,
  onPlay, 
  favorites = [],
  onToggleFavorite,
  onOpenPrivacyPolicy,
  onOpenTerms,
  onNavigateTab,
  onNavigateSection
}) {
  const [selectedTag, setSelectedTag] = useState(selectedCategory || 'All');

  // Synchronize when parent passes a new category (e.g. from Discover "See All" clicks)
  useEffect(() => {
    if (selectedCategory) {
      setSelectedTag(selectedCategory);
    }
  }, [selectedCategory]);

  const handleSelectCategory = (tag) => {
    setSelectedTag(tag);
    onCategoryChange?.(tag);
  };

  const isFav = (id) => favorites?.some(f => f.id === id);

  // Separate games, apps, and products
  const games = useMemo(() => listings.filter(item => item.category === 'game'), [listings]);
  const apps = useMemo(() => listings.filter(item => item.category === 'app'), [listings]);
  const products = useMemo(() => listings.filter(item => item.category === 'product'), [listings]);

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

  // 3. Action & Shooters
  const actionGames = useMemo(() => {
    return games.filter(g => 
      g.tags?.some(t => ['action', 'shooter', 'fps', 'combat', 'arena'].includes(t.toLowerCase()))
    );
  }, [games]);

  // 4. Arcade & Casual
  const arcadeGames = useMemo(() => {
    return games.filter(g => 
      g.tags?.some(t => ['arcade', 'runner', 'casual', 'physics', 'puzzle', 'danfo'].includes(t.toLowerCase()))
    );
  }, [games]);

  // All Category Pills
  const allCategoryPills = [
    { id: 'All', label: 'All Categories' },
    { id: 'Top Games', label: '🏆 Top Games', count: topGames.length },
    { id: 'New Games', label: '✨ New Games', count: newGames.length },
    ...(actionGames.length > 0 ? [{ id: 'Action', label: '⚡ Action & Shooters', count: actionGames.length }] : []),
    ...(arcadeGames.length > 0 ? [{ id: 'Arcade', label: '🕹 Arcade & Casual', count: arcadeGames.length }] : []),
    ...(apps.length > 0 ? [{ id: 'Apps', label: '💼 Web Apps', count: apps.length }] : []),
    ...(products.length > 0 ? [{ id: 'Products', label: '📦 Digital Products', count: products.length }] : [])
  ];

  // Strictly hide any category pill that doesn't have content yet
  const categoryPills = allCategoryPills.filter(pill => {
    if (pill.id === 'All') return listings.length > 0;
    return (pill.count || 0) > 0;
  });

  const activeTag = categoryPills.some(p => p.id === selectedTag) ? selectedTag : 'All';

  // Get current active filtered items when a specific category is selected
  const activeFilteredItems = useMemo(() => {
    switch (activeTag) {
      case 'Top Games':
        return topGames;
      case 'New Games':
        return newGames;
      case 'Action':
        return actionGames;
      case 'Arcade':
        return arcadeGames;
      case 'Apps':
        return apps;
      case 'Products':
        return products;
      default:
        return listings;
    }
  }, [activeTag, topGames, newGames, actionGames, arcadeGames, apps, products, listings]);

  // Unified banner candidate pool from authentic Firebase listings
  const bannerPool = useMemo(() => {
    return getUniqueBannerPool(heroBanners, listings);
  }, [heroBanners, listings]);

  const poolKey = useMemo(() => {
    return bannerPool.map(i => i.id || i.name).join('|');
  }, [bannerPool]);

  // Static banners displayed after categories pick random items from the array, displaying separate images
  const [staticCategoryBanners, setStaticCategoryBanners] = useState({});

  useEffect(() => {
    if (bannerPool.length === 0) {
      setStaticCategoryBanners({});
      return;
    }

    const requiredSlots = ['cat-after-top', 'cat-after-new'];
    if (apps.length > 0) requiredSlots.push('cat-after-apps');
    if (products.length > 0) requiredSlots.push('cat-after-products');

    const result = {};
    if (bannerPool.length === 1) {
      requiredSlots.forEach(slot => { result[slot] = bannerPool[0]; });
    } else {
      // Shuffle pool indices so the static banners display separate images
      const indices = bannerPool.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      requiredSlots.forEach((slot, sIdx) => {
        result[slot] = bannerPool[indices[sIdx % indices.length]];
      });
    }

    setStaticCategoryBanners(result);
  }, [poolKey, apps.length, products.length]);

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-6 sm:space-y-9">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Categories
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Explore curated web games, trending releases, and web tools
          </p>
        </div>

        {activeTag !== 'All' && (
          <button
            type="button"
            onClick={() => handleSelectCategory('All')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer border border-white/10"
          >
            <ArrowLeft size={13} />
            <span>All Categories</span>
          </button>
        )}
      </div>

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

      {/* Filter Pills */}
      {categoryPills.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryPills.map(pill => (
            <button
              key={pill.id}
              type="button"
              onClick={() => handleSelectCategory(pill.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeTag === pill.id
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 border-white/[0.04]'
              }`}
            >
              <span>{pill.label}</span>
              {pill.count !== undefined && pill.id !== 'All' && (
                <span className={`ml-1.5 text-[10px] ${activeTag === pill.id ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  ({pill.count})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* CASE A: Specific Category Selected */}
      {activeTag !== 'All' ? (
        <section className="space-y-4 animate-in fade-in duration-200 pb-8">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{categoryPills.find(p => p.id === activeTag)?.label || activeTag}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Showing all {activeFilteredItems.length} titles
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSelectCategory('All')}
              className="text-xs font-semibold text-[#0a84ff] hover:text-[#409cff] transition-colors cursor-pointer"
            >
              Back to Overview
            </button>
          </div>

          {activeFilteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {activeFilteredItems.map((item, idx) => (
                <AppRowItem
                  key={`filter-${item.id}-${idx}`}
                  item={item}
                  rank={idx + 1}
                  onPlay={onPlay}
                  isFavorited={isFav(item.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400 italic">
              No experiences currently available in this category.
            </div>
          )}
        </section>
      ) : (
        /* CASE B: "All Categories" Overview with Scrolling Banners after each category */
        <div className="space-y-9 pb-8">
          
          {/* Section 1: TOP GAMES */}
          {topGames.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏆</span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Top Games
                  </h2>
                  <span className="text-xs font-mono text-zinc-400">({topGames.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('Top Games')}
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

          {/* Banner after Top Games (Slot 2: Static) */}
          {staticCategoryBanners['cat-after-top'] && (
            <section className="pt-2">
              <HeroBanner
                item={staticCategoryBanners['cat-after-top']}
                onPlay={onPlay}
                showSecondary={false}
                isStatic={true}
              />
            </section>
          )}

          {/* Section 2: NEW GAMES */}
          {newGames.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">✨</span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    New Games
                  </h2>
                  <span className="text-xs font-mono text-zinc-400">({newGames.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('New Games')}
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

          {/* Banner after New Games (Slot 3: Static, displays separate image) */}
          {staticCategoryBanners['cat-after-new'] && (
            <section className="pt-2">
              <HeroBanner
                item={staticCategoryBanners['cat-after-new']}
                onPlay={onPlay}
                showSecondary={false}
                isStatic={true}
              />
            </section>
          )}

          {/* Section 3: WEB APPLICATIONS */}
          {apps.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💼</span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Web Applications & Productivity
                  </h2>
                  <span className="text-xs font-mono text-zinc-400">({apps.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('Apps')}
                  className="text-xs font-semibold text-[#0a84ff] hover:text-[#409cff] transition-colors cursor-pointer"
                >
                  See All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                {apps.slice(0, 6).map((item, idx) => (
                  <AppRowItem
                    key={`app-${item.id}`}
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

          {/* Banner after Web Apps (Slot 4: Static, if apps exist) */}
          {staticCategoryBanners['cat-after-apps'] && (
            <section className="pt-2">
              <HeroBanner
                item={staticCategoryBanners['cat-after-apps']}
                onPlay={onPlay}
                showSecondary={false}
                isStatic={true}
              />
            </section>
          )}

          {/* Section 4: DIGITAL PRODUCTS */}
          {products.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📦</span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Digital Products & Developer Kits
                  </h2>
                  <span className="text-xs font-mono text-zinc-400">({products.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('Products')}
                  className="text-xs font-semibold text-[#0a84ff] hover:text-[#409cff] transition-colors cursor-pointer"
                >
                  See All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                {products.slice(0, 6).map((item, idx) => (
                  <AppRowItem
                    key={`prod-${item.id}`}
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

          {/* Banner after Products (Slot 5: Static, if products exist) */}
          {staticCategoryBanners['cat-after-products'] && (
            <section className="pt-2">
              <HeroBanner
                item={staticCategoryBanners['cat-after-products']}
                onPlay={onPlay}
                showSecondary={false}
                isStatic={true}
              />
            </section>
          )}

        </div>
      )}

      {/* Platform Footer */}
      <Footer
        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
        onOpenTerms={onOpenTerms}
        onNavigateTab={onNavigateTab}
        onNavigateCategory={handleSelectCategory}
        onNavigateSection={onNavigateSection}
      />

    </div>
  );
}
