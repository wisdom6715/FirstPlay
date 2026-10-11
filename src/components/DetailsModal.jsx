import React from 'react';
import { X, Play, ExternalLink, Heart, Globe, Calendar, User, Tag } from 'lucide-react';
import AppRowItem from './AppRowItem';
import { isLagosLife } from '../utils/gameUtils';

export default function DetailsModal({ 
  item, 
  onClose, 
  onPlay, 
  allItems = [], 
  isFavorited = false, 
  onToggleFavorite 
}) {
  if (!item) return null;

  const isLagos = isLagosLife(item);
  const isExternal = isLagos || item.open_in_app === false;
  const isFree = item.category === 'game' || !item.price || item.price === 0;
  const actionLabel = isExternal ? 'Play in New Tab' : item.category === 'game' ? 'Play' : isFree ? 'Get' : `₦${item.price?.toLocaleString() || '10,000'}`;

  const related = allItems
    .filter(other => other.id !== item.id && other.category === item.category)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#18181c]/85 backdrop-blur-3xl border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
      >
        {/* Top Right: Apple Circular Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-6">
          
          {/* Header Block: Squircle Icon + Name + Category + Action Pill Button */}
          <div className="flex items-start gap-3 sm:gap-4">
            <img
              src={item.logo_url}
              alt={item.name}
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[22px] object-cover shadow-xl border border-white/10 shrink-0"
            />
            
            <div className="flex-1 min-w-0 pr-6 sm:pr-8">
              <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {item.name}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                {item.creator}
              </p>
              <div className="text-xs text-zinc-500 mt-1 capitalize font-medium flex items-center gap-2 flex-wrap">
                <span>{item.category} • {item.origin || 'Nigeria'}</span>
                {(item.category === 'game' || item.requires_fullscreen || item.auto_fullscreen) && (
                  <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium normal-case">
                    Auto-Fullscreen
                  </span>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 sm:gap-2.5 mt-3 sm:mt-4 flex-wrap">
                {item.url && (
                  <button
                    onClick={() => {
                      onClose();
                      onPlay(item);
                    }}
                    className="px-6 py-1.5 rounded-full bg-white text-black font-semibold text-xs tracking-wide hover:bg-zinc-200 transition-all active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    {isExternal ? <ExternalLink size={12} /> : <Play size={12} fill="currentColor" />}
                    <span>{actionLabel}</span>
                  </button>
                )}

                {item.url && (
                  <button
                    onClick={() => window.firstPlayAPI?.openExternal?.(item.url)}
                    title="Open in default browser"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}

                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(item)}
                    title={isFavorited ? "Remove from favourites" : "Add to favourites"}
                    className={`h-8 px-3.5 rounded-full border flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      isFavorited
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-rose-400 border-white/10'
                    }`}
                  >
                    <Heart size={13} fill={isFavorited ? 'currentColor' : 'none'} />
                    <span>{isFavorited ? 'Saved' : 'Favourite'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Screenshot / Landscape Preview Banner */}
          {item.banner_url && (
            <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-black/40 border border-white/[0.08] shadow-md">
              <img
                src={item.banner_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2 border-t border-white/[0.08] pt-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              About
            </h3>
            <p className="text-sm text-zinc-200 leading-relaxed font-normal">
              {item.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/[0.08] pt-4 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-[10px] text-zinc-500 block">Developer</span>
              <span className="font-medium text-white truncate block mt-0.5">{item.creator}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-[10px] text-zinc-500 block">Category</span>
              <span className="font-medium text-white capitalize block mt-0.5">{item.category}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-[10px] text-zinc-500 block">Origin</span>
              <span className="font-medium text-white truncate block mt-0.5">{item.origin || 'Nigeria'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-[10px] text-zinc-500 block">Runtime</span>
              <span className="font-medium text-white block mt-0.5">Sandboxed Web</span>
            </div>
          </div>

          {/* Related Items Section */}
          {related.length > 0 && (
            <div className="space-y-3 border-t border-white/[0.08] pt-4">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                You Might Also Like
              </h4>
              <div className="space-y-1">
                {related.map(rel => (
                  <AppRowItem
                    key={`rel-${rel.id}`}
                    item={rel}
                    onPlay={onPlay}
                    onSelectDetails={onClose}
                    isFavorited={isFavorited}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
