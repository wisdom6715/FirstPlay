import React, { useState, useEffect } from 'react';
import AppRowItem from '../components/AppRowItem';
import { Search, X } from 'lucide-react';

export default function SearchView({ 
  listings, 
  onPlay, 
  initialQuery = '',
  favorites = [],
  onToggleFavorite
}) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [results, setResults] = useState(listings);

  const isFav = (id) => favorites?.some(f => f.id === id);

  const SHOW_OTHER_CATEGORIES = false;

  // Dynamically hide any category pill that has no items in listings (Games only online for now)
  const categoryPills = [
    { id: 'all', label: 'All Results' },
    { id: 'game', label: 'Games' },
    ...(SHOW_OTHER_CATEGORIES ? [
      { id: 'app', label: 'Apps' },
      { id: 'product', label: 'Products' }
    ] : [])
  ].filter(pill => {
    if (pill.id === 'all') return true;
    return listings.some(item => item.category === pill.id);
  });

  const activeCategoryFilter = categoryPills.some(p => p.id === categoryFilter) ? categoryFilter : 'all';

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    const filtered = listings.filter(item => {
      if (!SHOW_OTHER_CATEGORIES && item.category !== 'game') return false;
      const matchCat = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
      if (!matchCat) return false;
      if (!term) return true;

      const inName = item.name?.toLowerCase().includes(term);
      const inFullName = item.full_name?.toLowerCase().includes(term);
      const inDesc = item.description?.toLowerCase().includes(term);
      const inCreator = item.creator?.toLowerCase().includes(term);
      const inOrigin = item.origin?.toLowerCase().includes(term);
      const inTags = item.tags?.some(t => t.toLowerCase().includes(term));

      return inName || inFullName || inDesc || inCreator || inOrigin || inTags;
    });

    setResults(filtered);
  }, [searchTerm, activeCategoryFilter, listings]);

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Search
        </h1>
      </div>

      {/* Apple Styled Search Input */}
      <div className="space-y-3">
        <div className="relative max-w-xl">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Games, web apps, creators, keywords..."
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-white/[0.07] border border-white/[0.08] focus:border-white/20 focus:outline-none text-xs text-white placeholder-zinc-500 transition-colors"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills - Hidden if category has no content */}
        {categoryPills.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 scrollbar-none">
            {categoryPills.map(pill => (
              <button
                key={pill.id}
                onClick={() => setCategoryFilter(pill.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  activeCategoryFilter === pill.id
                    ? 'bg-white text-black'
                    : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs text-zinc-400">
          <span>{results.length} Results</span>
          {searchTerm && <span>for "{searchTerm}"</span>}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pb-10">
            {results.map((item, idx) => (
              <AppRowItem
                key={`search-${item.id}`}
                item={item}
                rank={idx + 1}
                onPlay={onPlay}
                isFavorited={isFav(item.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2 text-zinc-400 text-xs">
            <p className="font-semibold text-white">No results found.</p>
            <p>Try searching for "Danfo", "Lagos", "Runner", or "Life".</p>
          </div>
        )}
      </div>

    </div>
  );
}
