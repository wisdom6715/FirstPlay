'use client';

import { useMemo, useState } from 'react';
import { Gamepad2, X } from 'lucide-react';
import type { Banner, GameGenre, Listing } from '@/lib/discover';
import { AppsSection } from './AppsSection';
import { BreakoutPlaySection } from './BreakoutPlaySection';
import { CategoryBar } from './CategoryBar';
import { DiscoverSpotlightSection } from './DiscoverSpotlightSection';
import { GameModal } from './GameModal';
import { HeaderBar } from './HeaderBar';
import { HeroCarousel, type Slide } from './HeroCarousel';
import { ListingTile } from './ListingTile';
import { ProductsSection } from './ProductsSection';
import { TopGamesSection } from './TopGamesSection';

export function DiscoverClient({
  listings,
  banners,
  demo
}: {
  listings: Listing[];
  banners: Banner[];
  demo: boolean;
}) {
  const [selectedCategory, setSelectedCategory] = useState<GameGenre>('all');
  const [query, setQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Listing | null>(null);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // Separate listings by category
  const games = useMemo(() => listings.filter((l) => l.category === 'game'), [listings]);
  const apps = useMemo(() => listings.filter((l) => l.category === 'app'), [listings]);
  const products = useMemo(() => listings.filter((l) => l.category === 'product'), [listings]);

  // Items pool matching category and search filter
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      let matchCat = true;
      if (selectedCategory === 'game') {
        matchCat = l.category === 'game';
      } else if (selectedCategory === 'app') {
        matchCat = l.category === 'app';
      } else if (selectedCategory === 'product') {
        matchCat = l.category === 'product';
      } else if (selectedCategory !== 'all') {
        matchCat =
          l.genre === selectedCategory ||
          Boolean(l.tags && l.tags.some((t) => t.toLowerCase() === selectedCategory));
      }

      const matchQuery =
        !searching ||
        `${l.name} ${l.studio} ${l.description || ''} ${(l.tags || []).join(' ')}`
          .toLowerCase()
          .includes(q);

      return matchCat && matchQuery;
    });
  }, [listings, selectedCategory, searching, q]);

  // Slides for Hero Carousel (combines Firestore banners + top listings)
  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = [];

    // Prioritize promotional banners
    for (const b of banners) {
      const matchedListing = listings.find(
        (l) => l.url === b.url || l.name.toLowerCase() === b.title.toLowerCase()
      );
      list.push({
        key: b.id,
        title: b.title,
        subtitle: b.subtitle,
        badge: b.badge || 'FEATURED',
        url: b.url,
        image: b.image,
        listing: matchedListing
      });
    }

    // Add top featured listings
    for (const l of listings.slice(0, 3)) {
      list.push({
        key: `slide-${l.id}`,
        title: l.name,
        subtitle: l.description || `Spotlight title from ${l.studio}`,
        badge: l.category === 'app' ? 'WEB APP' : l.category === 'product' ? 'PRODUCT' : 'SPOTLIGHT GAME',
        url: l.url,
        image: l.coverImage || l.image,
        listing: l
      });
    }

    return list;
  }, [banners, listings]);

  const relatedGames = useMemo(() => {
    if (!selectedGame) return listings.slice(0, 3);
    return listings.filter((l) => l.id !== selectedGame.id).slice(0, 3);
  }, [listings, selectedGame]);

  const handleLaunchGame = (game: Listing) => {
    setSelectedGame(null);
    if (game.url) {
      window.open(game.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative min-h-screen bg-fp-bg font-display text-fp-text transition-colors duration-300">
      {/* Subdued Ambient Refraction Blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <i
          className="absolute -left-36 -top-32 h-[560px] w-[560px] rounded-full blur-[120px] opacity-25"
          style={{ background: 'var(--fp-blob-a)' }}
        />
        <i
          className="absolute -right-32 top-[24%] h-[520px] w-[520px] rounded-full blur-[130px] opacity-20"
          style={{ background: 'var(--fp-blob-b)' }}
        />
        <i
          className="absolute -bottom-52 left-[20%] h-[500px] w-[500px] rounded-full blur-[120px] opacity-18"
          style={{ background: 'var(--fp-blob-c)' }}
        />
      </div>

      {/* Top Header & Quick-Play Bar */}
      <HeaderBar
        query={query}
        onQueryChange={setQuery}
        tickerGames={listings}
        onPlayGame={(g) => setSelectedGame(g)}
      />

      {/* Main Discovery Container */}
      <main className="relative z-[1] mx-auto max-w-[1360px] px-3.5 sm:px-6 lg:px-8 pb-20 pt-3 sm:pt-5 sm:pb-24">
        {/* Page Section Title */}
        <div className="mb-3 sm:mb-4 mt-1 sm:mt-2 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-[-0.035em] text-fp-text">
              {searching
                ? 'Search Results'
                : selectedCategory === 'all'
                ? 'Discover'
                : selectedCategory === 'game'
                ? 'Games'
                : selectedCategory === 'app'
                ? 'Web Applications'
                : selectedCategory === 'product'
                ? 'Digital Products'
                : `${selectedCategory.toUpperCase()} Games`}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-fp-muted">
              {searching
                ? `Showing listings matching "${query}"`
                : selectedCategory === 'app'
                ? 'Discover productive web applications, SaaS platforms, and interactive web tools'
                : selectedCategory === 'product'
                ? 'Browse digital products, creator toolkits, and curated software'
                : 'Play instant web games • Explore apps and products featured across FirstPlay'}
            </p>
          </div>

          {(searching || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-fp-border bg-fp-glass px-3.5 py-1.5 text-xs font-bold text-fp-text backdrop-blur-md transition hover:bg-fp-glass-hover"
            >
              <X size={13} /> Reset Filters
            </button>
          )}
        </div>

        {/* Hero Banner Carousel */}
        {!searching && selectedCategory === 'all' && (
          <HeroCarousel slides={slides} onPlayGame={(g) => setSelectedGame(g)} />
        )}

        {/* Horizontal Category Filter Pills */}
        <CategoryBar selected={selectedCategory} onSelect={(c) => setSelectedCategory(c)} />

        {/* Filtered / Search Results View */}
        {searching || selectedCategory !== 'all' ? (
          <section className="mt-6 sm:mt-8">
            <div className="mb-4 flex items-center justify-between border-b border-fp-line pb-2.5">
              <span className="text-xs sm:text-sm font-bold text-fp-muted">
                {filteredListings.length} {filteredListings.length === 1 ? 'item' : 'items'} found
              </span>
            </div>

            {filteredListings.length === 0 ? (
              <div className="fp-glass mt-6 rounded-[28px] px-6 py-14 text-center">
                <Gamepad2 size={44} className="mx-auto text-fp-muted/40 mb-3" />
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-fp-text">No listings found</h3>
                <p className="mt-1.5 text-xs sm:text-sm text-fp-muted">
                  Try searching for a different category or reset your filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 rounded-full bg-fp-accent px-5 py-2 text-xs font-bold text-white transition hover:scale-105"
                >
                  View All Listings
                </button>
              </div>
            ) : (
              <div className="grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredListings.map((item) => (
                  <ListingTile key={item.id} item={item} onClick={(g) => setSelectedGame(g)} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Full Discovery Experience */
          <>
            {/* Section 1: Games under Games */}
            <TopGamesSection
              games={games}
              onPlayGame={(g) => setSelectedGame(g)}
              onSeeAll={() => setSelectedCategory('game')}
            />

            {/* Section 2: Apps under Apps */}
            <AppsSection
              apps={apps}
              onOpenModal={(a) => setSelectedGame(a)}
              onSeeAll={() => setSelectedCategory('app')}
            />

            {/* Section 3: Products under Products */}
            <ProductsSection
              products={products}
              onOpenModal={(p) => setSelectedGame(p)}
              onSeeAll={() => setSelectedCategory('product')}
            />

            {/* Section 4: "Play" Breakout Indie Titles + 3D Fanned Deck */}
            <BreakoutPlaySection
              games={games.length > 0 ? games : listings}
              onPlayGame={(g) => setSelectedGame(g)}
            />

            {/* Section 5: "Discover" Spotlight */}
            <DiscoverSpotlightSection
              games={listings}
              onPlayGame={(g) => setSelectedGame(g)}
            />
          </>
        )}
      </main>

      {/* Frosted Glass Footer */}
      <footer className="relative z-[1] mx-auto max-w-[1360px] px-4 pb-12 text-xs sm:text-sm text-slate-500 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 pt-8">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/firstplay-logo.png" alt="" width={24} height={24} className="h-6 w-6 rounded-[22%]" />
            <span className="font-extrabold text-slate-900">FirstPlay</span>
            <span className="text-[11px] sm:text-xs">
              • The unified web game launcher, app discovery & promotion portal.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="/promote" className="text-blue-600 hover:underline">
              Promote with Ads
            </a>
            <span>•</span>
            <a href="#top-games" className="hover:text-slate-900">
              Top Ranked Games
            </a>
            <span>•</span>
            <a href="#web-apps" className="hover:text-slate-900">
              Web Apps
            </a>
          </div>
        </div>
      </footer>

      {/* Modal Preview (Brought up by clicking any game) */}
      <GameModal
        game={selectedGame}
        relatedGames={relatedGames}
        onClose={() => setSelectedGame(null)}
        onSelectGame={(g) => setSelectedGame(g)}
        onLaunchFullscreen={(g) => handleLaunchGame(g)}
      />
    </div>
  );
}
