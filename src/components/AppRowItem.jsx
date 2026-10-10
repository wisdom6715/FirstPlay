import React from 'react';
import { Play, Heart } from 'lucide-react';
import { isLagosLife } from '../utils/gameUtils';

export default function AppRowItem({ 
  item, 
  rank, 
  onPlay, 
  isFavorited = false, 
  onToggleFavorite 
}) {
  const isLagos = isLagosLife(item);
  const isFree = item.category === 'game' || !item.price || item.price === 0;

  return (
    <div 
      onClick={() => onPlay?.(item)}
      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] backdrop-blur-md transition-all duration-200 cursor-pointer group"
    >
      {/* Left: Optional rank number + Squircle App Icon + Title & Category */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
        {rank !== undefined && (
          <span className="w-4 text-center text-sm font-semibold text-zinc-400 shrink-0">
            {rank}
          </span>
        )}

        <img
          src={item.logo_url}
          alt={item.name}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-[14px] sm:rounded-[15px] object-cover shrink-0 shadow-md border border-white/10 group-hover:scale-[1.02] transition-transform duration-200"
          loading="lazy"
        />

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white tracking-tight truncate group-hover:text-blue-300 transition-colors">
            {item.name}
          </h4>
          <p className="text-xs text-zinc-400 truncate mt-0.5 font-normal">
            {item.tagline || item.description?.slice(0, 45) || item.creator}
          </p>
        </div>
      </div>

      {/* Right: Pill Action Button & Favorite Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item);
            }}
            title={isFavorited ? "Remove from favourites" : "Add to favourites"}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              isFavorited 
                ? '!opacity-100 text-rose-500' 
                : 'text-zinc-400 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 hover:text-rose-400 hover:bg-white/10'
            }`}
          >
            <Heart size={14} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        )}

        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
            className={`px-3.5 sm:px-4 py-1 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shadow-sm ${
              isFree
                ? 'bg-white/95 hover:bg-white text-black'
                : 'bg-[#1c2c4c] hover:bg-[#253b66] text-[#4d97fe] border border-[#3e89f8]/20'
            }`}
          >
            {item.category === 'game' ? 'Play' : isFree ? 'Get' : `₦${item.price?.toLocaleString() || '10,000'}`}
          </button>
          <span className="text-[9px] text-zinc-500 mt-0.5 tracking-tight font-medium">
            {isLagos ? 'Opens in New Tab' : item.category === 'game' ? 'Free to Play' : 'In-App Web'}
          </span>
        </div>
      </div>
    </div>
  );
}
