import React, { useState } from 'react';
import { Play, ExternalLink, Star, Heart } from 'lucide-react';
import { isLagosLife } from '../utils/gameUtils';

export default function ContentCard({ 
  item, 
  onPlay, 
  isFavorited = false, 
  onToggleFavorite 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isLagos = isLagosLife(item);
  const isExternal = isLagos || item.open_in_app === false;

  const actionLabel = isExternal
    ? 'NEW TAB'
    : item.category === 'game' 
      ? 'PLAY' 
      : item.category === 'app' 
        ? 'OPEN' 
        : 'VIEW';

  const categoryBadgeColors = {
    game: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    app: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    product: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay?.(item)}
      className="relative flex flex-col bg-[#131722] hover:bg-[#181d2a] rounded-xl border border-[#202737] hover:border-[#333d54] transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-lg group"
    >
      {/* Artwork container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0d1017]">
        <img
          src={item.logo_url}
          alt={item.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-transparent opacity-60"></div>
        
        {/* Category & Origin tags */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border backdrop-blur-sm ${categoryBadgeColors[item.category] || 'bg-slate-800 text-slate-300'}`}>
            {item.category.toUpperCase()}
          </span>
          {item.is_new && (
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#e58b20] text-black">
              NEW
            </span>
          )}
        </div>

        {/* Top right badges: Rating and Favorite */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          {item.rating && (
            <div className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-1 text-[10px] text-amber-400 font-mono">
              <Star size={10} fill="currentColor" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          )}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item);
              }}
              title={isFavorited ? "Remove from favourites" : "Save to favourites"}
              className={`w-6 h-6 rounded-md backdrop-blur-sm flex items-center justify-center transition-colors border cursor-pointer ${
                isFavorited
                  ? 'bg-rose-500/30 text-rose-400 border-rose-500/50'
                  : 'bg-black/50 text-slate-300 hover:text-rose-400 border-white/10 hover:border-rose-400/30'
              }`}
            >
              <Heart size={12} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* Primary Card Information */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-100 transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-medium">
            {item.tagline || item.creator}
          </p>
        </div>

        {/* Origin / Developer */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-[#1e2433] pt-2">
          <span className="truncate max-w-[120px]">{item.creator}</span>
          <span className="text-slate-400">{item.origin?.split(',')[0]}</span>
        </div>
      </div>

      {/* Hover Preview Reveal Overlay - PRD Section 10 */}
      {isHovered && (
        <div className="absolute inset-0 bg-[#141824]/95 backdrop-blur-[2px] p-4 flex flex-col justify-between animate-fadeIn z-20 border border-[#e58b20]/40 rounded-xl">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${categoryBadgeColors[item.category]}`}>
                {item.category.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {item.creator}
              </span>
            </div>
            
            <h4 className="text-sm font-bold text-white line-clamp-1">
              {item.name}
            </h4>
            
            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            {item.url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(item);
                }}
                className="flex-1 h-8 rounded-lg bg-[#e58b20] hover:bg-[#f59e0b] text-black font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm cursor-pointer"
              >
                {isExternal ? <ExternalLink size={12} /> : <Play size={12} fill="currentColor" />}
                <span>{actionLabel}</span>
              </button>
            )}

            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item);
                }}
                title={isFavorited ? "Remove from favourites" : "Save to favourites"}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors border cursor-pointer ${
                  isFavorited
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-[#1e2536] text-slate-300 hover:text-rose-400 border-[#2b354c]'
                }`}
              >
                <Heart size={13} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
