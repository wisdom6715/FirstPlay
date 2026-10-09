'use client';

import { useEffect } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  X
} from 'lucide-react';
import type { Listing } from '@/lib/discover';
import { artStyle, initials } from '@/lib/discover';

export function GameModal({
  game,
  relatedGames,
  onClose,
  onSelectGame,
  onLaunchFullscreen
}: {
  game: Listing | null;
  relatedGames: Listing[];
  onClose: () => void;
  onSelectGame: (game: Listing) => void;
  onLaunchFullscreen?: (game: Listing) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (game) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [game, onClose]);

  if (!game) return null;

  const cover =
    game.coverImage ||
    game.image ||
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80';
  const plays = game.plays || '18.4k';
  const rating = game.rating || 4.8;
  const rank = game.rank || 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-game-title"
    >
      {/* Frosted backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog with Soft Border and Light Theme */}
      <div
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] sm:rounded-[36px] border border-slate-200 bg-white/95 p-5 sm:p-8 shadow-2xl backdrop-blur-3xl text-slate-900 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white hover:scale-105"
        >
          <X size={18} />
        </button>

        {/* Hero Artwork Banner */}
        <div className="relative -mx-5 -mt-5 sm:-mx-8 sm:-mt-8 mb-6 h-52 sm:h-64 overflow-hidden rounded-t-[28px] sm:rounded-t-[36px] bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover brightness-[0.92] transition duration-700 hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/90 via-black/25 to-transparent" />

          {/* Click to play button directly on cover banner */}
          <a
            href={game.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition duration-300"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xl">
              <ExternalLink size={16} />
              {game.category === 'product' ? 'View Product' : 'Play on Official Website ↗'}
            </span>
          </a>

          <div className="absolute bottom-4 left-5 sm:left-7 flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
              <Trophy size={13} className="text-amber-500" />
              Rank #{rank} on FirstPlay
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
              <Star size={13} className="fill-amber-400 text-amber-500" />
              {rating} / 5.0
            </span>
          </div>
        </div>

        {/* Title & Action Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5 sm:gap-4">
            {game.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={game.image}
                alt=""
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-[22.5%] object-cover shadow-sm ring-1 ring-slate-200"
              />
            ) : (
              <div
                style={artStyle(game.name)}
                className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-[22.5%] text-2xl font-black text-white shadow-md"
              >
                {initials(game.name)}
              </div>
            )}
            <div className="min-w-0">
              <h2 id="modal-game-title" className="text-xl sm:text-2xl font-black tracking-tight truncate text-slate-900">
                {game.name}
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                <span className="truncate">{game.studio}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-600 shrink-0">
                  <ShieldCheck size={14} /> Verified Studio
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={game.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm sm:text-base font-extrabold text-white shadow-md transition hover:bg-blue-700 hover:scale-105 active:scale-95"
            >
              <ExternalLink size={18} />
              {game.category === 'product'
                ? 'Visit Product Store ↗'
                : game.category === 'app'
                ? 'Open App ↗'
                : 'Play on Official Website ↗'}
            </a>
          </div>
        </div>

        {/* Live Traffic & Social Proof Bar */}
        <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 sm:p-3.5 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-1.5 font-medium text-slate-900">
            <Users size={16} className="text-blue-600" />
            <strong className="font-bold">{plays}</strong> active players this week
          </div>
          <span className="hidden sm:inline opacity-30">|</span>
          <div className="flex items-center gap-1.5">
            <Sparkles size={15} className="text-purple-600" />
            Cross-promoted across <strong>FirstPlay Network</strong>
          </div>
        </div>

        {/* Game Description */}
        <div className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600">
          <p>
            {game.description ||
              `Jump directly into ${game.name}. Hosted and shared through FirstPlay's cross-promotion network, driving player discovery without annoying interstitial ads.`}
          </p>
        </div>

        {/* Tags */}
        {game.tags && game.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-0.5 text-[11px] font-semibold text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Cross-Promotion Section - The Core Purpose */}
        {relatedGames.length > 0 && (
          <div className="mt-6 border-t border-slate-200/80 pt-5">
            <div className="mb-3">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                Players of {game.name} also love
              </h3>
              <p className="text-[11px] text-slate-500">
                Cross-traffic network: discover more games from indie developers
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              {relatedGames.slice(0, 3).map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onSelectGame(rel)}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white shadow-sm"
                >
                  {rel.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={rel.image}
                      alt=""
                      className="h-10 w-10 rounded-[22.5%] object-cover shadow-sm ring-1 ring-slate-200"
                    />
                  ) : (
                    <div
                      style={artStyle(rel.name)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-[22.5%] text-xs font-bold text-white shadow-sm"
                    >
                      {initials(rel.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-slate-900 group-hover:text-blue-600">
                      {rel.name}
                    </span>
                    <span className="block truncate text-[11px] text-slate-500">
                      {rel.plays || '1.2k'} plays
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
