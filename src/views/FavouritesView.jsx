import React, { useState } from 'react';
import AppRowItem from '../components/AppRowItem';
import { Heart, Clock, Trash2, ArrowRight } from 'lucide-react';

export default function FavouritesView({ 
  favorites = [], 
  recentlyPlayed = [],
  onPlay, 
  onToggleFavorite, 
  onClearHistory,
  onNavigateDiscover 
}) {
  const [filter, setFilter] = useState('all');

  const filteredFavorites = favorites.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-6 sm:space-y-9">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Favourites & Library
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your pinned games, apps, and recent play sessions stored locally on this device.
        </p>
      </div>

      {/* 1. RECENT PLAYS SECTION: per user prompt "and recent plays are shown here too" */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#0a84ff]" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Recent Plays
            </h2>
            <span className="text-xs font-mono text-zinc-400">({recentlyPlayed.length})</span>
          </div>

          {recentlyPlayed.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs font-medium text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {recentlyPlayed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {recentlyPlayed.slice(0, 6).map((item) => (
              <AppRowItem
                key={`recent-${item.id}`}
                item={item}
                onPlay={onPlay}
                isFavorited={favorites.some(f => f.id === item.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#1c1c1e]/60 border border-white/[0.06] text-center space-y-2">
            <p className="text-xs font-medium text-zinc-300">No recent play activity.</p>
            <p className="text-[11px] text-zinc-500">
              Browser games and web tools launched inside FirstPlay will appear here for instant return.
            </p>
          </div>
        )}
      </section>

      {/* 2. SAVED FAVOURITES SECTION: per user prompt "the favorite screen allows to manage favorite app/games" */}
      <section className="space-y-3 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-500 fill-rose-500/20" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Saved Favourites
            </h2>
            <span className="text-xs font-mono text-zinc-400">({filteredFavorites.length})</span>
          </div>

          {favorites.length > 0 && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'game', label: 'Games' },
                { id: 'app', label: 'Apps' },
                { id: 'product', label: 'Products' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    filter === f.id
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/[0.06] text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {filteredFavorites.map((item) => (
              <AppRowItem
                key={`fav-${item.id}`}
                item={item}
                onPlay={onPlay}
                isFavorited={true}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 rounded-2xl bg-[#1c1c1e]/60 border border-white/[0.06] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No Favourites Added</p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                Hover over any game or app in Discover or Categories and click the heart icon to save it here.
              </p>
            </div>
            <button
              onClick={onNavigateDiscover}
              className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs tracking-wide hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Discover Experiences
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
