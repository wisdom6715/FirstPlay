'use client';

import { Crown, Play, Sparkles } from 'lucide-react';
import type { Listing } from '@/lib/discover';
import { artStyle, initials } from '@/lib/discover';

export function TopGamesSection({
  games,
  onPlayGame,
  onSeeAll
}: {
  games: Listing[];
  onPlayGame: (game: Listing) => void;
  onSeeAll?: () => void;
}) {
  const topList = games.slice(0, 8);

  return (
    <section id="top-games" className="mt-10 sm:mt-14" aria-labelledby="top-games-heading">
      <div className="mb-4 flex items-baseline justify-between border-b border-slate-200/80 pb-3">
        <div>
          <h2 id="top-games-heading" className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-[-0.03em] text-slate-900">
            Top FirstPlay Games
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Ranked by cross-network player sessions and retention this week
          </p>
        </div>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs sm:text-sm font-bold text-blue-600 transition hover:opacity-80"
          >
            See all ›
          </button>
        )}
      </div>

      {topList.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200/90 bg-white/90 p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-700">No games listed yet in this section.</p>
          <p className="mt-1 text-xs text-slate-500">Be among the first studios to publish on FirstPlay!</p>
          <a
            href="/promote"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Promote Your Game (7 Days Free) ↗
          </a>
        </div>
      ) : (
        /* Grid of Ranked Games - fully mobile responsive with soft borders */
        <div className="grid gap-2.5 sm:gap-3.5 grid-cols-1 sm:grid-cols-2">
          {topList.map((game, index) => {
            const rank = index + 1;
            const isTop1 = rank === 1;
            const isTop2 = rank === 2;
            const isTop3 = rank === 3;

            return (
              <div
                key={game.id}
                onClick={() => onPlayGame(game)}
                className="group relative flex cursor-pointer items-center gap-3 sm:gap-4 rounded-[22px] sm:rounded-[26px] border border-slate-200/90 bg-white/90 p-3 sm:p-3.5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:border-blue-300 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)]"
              >
                {/* Game Icon */}
                <div className="relative shrink-0">
                  {game.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={game.image}
                      alt={game.name}
                      className="h-12 w-12 sm:h-14 sm:w-14 rounded-[22.5%] object-cover shadow-[0_4px_12px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 transition group-hover:scale-105"
                    />
                  ) : (
                    <div
                      style={artStyle(game.name)}
                      className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-[22.5%] text-lg sm:text-xl font-black text-white shadow-md"
                    >
                      {initials(game.name)}
                    </div>
                  )}

                  {/* Top 3 rank crown indicator */}
                  {isTop1 && (
                    <span className="absolute -left-1 -top-1 grid h-4.5 w-4.5 place-items-center rounded-full bg-yellow-400 text-black shadow">
                      <Crown size={11} className="fill-black" />
                    </span>
                  )}
                </div>

                {/* Rank Number */}
                <div className="flex shrink-0 w-5 sm:w-6 items-center justify-center">
                  <span
                    className={`text-base sm:text-xl font-black ${
                      isTop1
                        ? 'text-yellow-500'
                        : isTop2
                        ? 'text-slate-400'
                        : isTop3
                        ? 'text-amber-600'
                        : 'text-slate-300'
                    }`}
                  >
                    {rank}
                  </span>
                </div>

                {/* Game Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h3 className="truncate text-sm sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                      {game.name}
                    </h3>
                    {isTop1 && (
                      <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-600">
                        <Sparkles size={9} /> #1
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    {game.description ? game.description : `${game.studio} • ${game.plays || '1.2k'} plays`}
                  </p>
                </div>

                {/* Action Pill [Play] button - redirects directly to the official game website */}
                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="shrink-0 inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
                >
                  Play ↗
                </a>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
