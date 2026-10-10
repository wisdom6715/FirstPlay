import React from 'react';
import ContentCard from '../components/ContentCard';
import { PlayCircle, Trash2, Clock, Gamepad2, ArrowRight } from 'lucide-react';

export default function LibraryView({ 
  recentlyPlayed, 
  onPlay, 
  onClearHistory, 
  onNavigateDiscover 
}) {
  return (
    <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6 space-y-8">
      
      {/* Play Area Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2232] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <PlayCircle size={20} className="text-[#e58b20]" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">Play Area & Local Library</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fast access to your recently launched games, tools, and experiences. Stored securely on your device.
          </p>
        </div>

        {recentlyPlayed && recentlyPlayed.length > 0 && (
          <button
            onClick={onClearHistory}
            className="h-8 px-3 rounded-lg bg-[#181d2a] hover:bg-rose-950/40 border border-[#273042] hover:border-rose-800/60 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Clear Play History</span>
          </button>
        )}
      </div>

      {/* Grid of recently played items or empty state */}
      {recentlyPlayed && recentlyPlayed.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{recentlyPlayed.length} Recent {recentlyPlayed.length === 1 ? 'Launch' : 'Launches'}</span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#e58b20]" />
              Persistent offline session cache
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
            {recentlyPlayed.map((item) => (
              <ContentCard
                key={`lib-${item.id}`}
                item={item}
                onPlay={onPlay}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#141824] border border-[#242c3e] flex items-center justify-center text-[#e58b20]">
            <Gamepad2 size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Your Play Library is Empty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Games and web apps you launch will appear here for fast re-entry without logging into an account.
            </p>
          </div>
          <button
            onClick={onNavigateDiscover}
            className="h-10 px-6 rounded-lg bg-[#e58b20] hover:bg-[#f59e0b] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <span>Explore Discover Store</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

    </div>
  );
}
