'use client';

import Link from 'next/link';
import { Megaphone, Search, X } from 'lucide-react';
import type { Listing } from '@/lib/discover';

export function HeaderBar({
  query,
  onQueryChange,
  tickerGames,
  onPlayGame
}: {
  query: string;
  onQueryChange: (q: string) => void;
  tickerGames: Listing[];
  onPlayGame: (game: Listing) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-2xl transition-colors duration-300 shadow-sm">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-2.5 px-3 py-2.5 sm:gap-5 sm:px-8 sm:py-3.5">
        {/* Brand Logo & Title */}
        <Link href="/" aria-label="FirstPlay home" className="group flex items-center gap-2.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/firstplay-logo.png"
            alt="FirstPlay Logo"
            width={38}
            height={38}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-[22.5%] shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-black tracking-tight text-slate-900">
              FirstPlay
            </span>
            <span className="hidden sm:inline text-[10px] font-semibold text-slate-500 -mt-0.5">
              Arcade Discovery
            </span>
          </div>
        </Link>

        {/* Quick-Play Ticker (Hidden on smaller screens to maintain clean mobile UI) */}
        {tickerGames.length > 0 && (
          <div className="hidden xl:flex items-center gap-4 rounded-full border border-slate-200/80 bg-slate-50/80 px-4 py-1.5 shadow-sm backdrop-blur-md">
            {tickerGames.slice(0, 2).map((game) => (
              <div key={game.id} className="flex items-center gap-2.5">
                {game.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={game.image}
                    alt=""
                    className="h-7 w-7 rounded-[22%] object-cover ring-1 ring-slate-200"
                  />
                ) : null}
                <div className="flex flex-col leading-tight max-w-[140px]">
                  <span className="truncate text-xs font-bold text-slate-900">{game.name}</span>
                  <span className="truncate text-[10px] text-slate-500">Instant Play</span>
                </div>
                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                >
                  Play ↗
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Search Bar with Glassy Pill Styling */}
        <div className="flex flex-1 max-w-[220px] xs:max-w-[260px] sm:max-w-[360px] lg:max-w-[420px] items-center gap-2">
          <label className="flex h-9 sm:h-10 w-full items-center gap-2 rounded-full border border-slate-200/90 bg-slate-100/80 px-3 sm:px-3.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition shadow-inner">
            <Search size={15} className="shrink-0 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search games..."
              autoComplete="off"
              aria-label="Search games"
              className="h-full min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="grid h-4 w-4 place-items-center rounded-full text-slate-400 hover:text-slate-700"
              >
                <X size={12} />
              </button>
            )}
          </label>
        </div>

        {/* Action Button: Promote with Ads Icon */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/promote"
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 hover:scale-105 active:scale-95"
          >
            <Megaphone size={15} className="shrink-0 -rotate-12" />
            <span>Promote</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
