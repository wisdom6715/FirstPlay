'use client';

import { useState } from 'react';
import { Award, ChevronRight, Play, Share2, Sparkles } from 'lucide-react';
import type { Listing } from '@/lib/discover';

export function BreakoutPlaySection({
  games,
  onPlayGame
}: {
  games: Listing[];
  onPlayGame: (game: Listing) => void;
}) {
  const [fannedHover, setFannedHover] = useState(false);
  const featuredDeck = games.slice(0, 5);

  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="play-section-title">
      <div className="mb-4 flex items-baseline justify-between border-b border-slate-200/80 pb-3">
        <div>
          <h2 id="play-section-title" className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-[-0.03em] text-slate-900">
            Play
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Breakout games sharing players across the FirstPlay indie discovery collective
          </p>
        </div>
      </div>

      {/* Top Wide Spotlight Card */}
      <div
        className="group relative min-h-[320px] sm:min-h-[360px] overflow-hidden rounded-[26px] sm:rounded-[34px] border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/90 to-blue-50/40 p-5 sm:p-9 shadow-[0_12px_36px_rgba(15,23,42,0.05)] flex flex-col justify-between"
        onMouseEnter={() => setFannedHover(true)}
        onMouseLeave={() => setFannedHover(false)}
      >
        <div className="relative z-10 max-w-md text-slate-900">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200/70 bg-pink-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-pink-600">
            <Sparkles size={12} className="text-pink-600" />
            Cross-Play Spotlight
          </span>
          <h3 className="mt-3.5 text-2xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900">
            Play these breakout games
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            See how indie studios cross-promote and share players so no game gets left behind in obscurity.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <a
              href={featuredDeck[0]?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:bg-slate-800 hover:scale-105 active:scale-95"
            >
              <Play size={15} className="fill-white" />
              Start With {featuredDeck[0]?.name || 'Top Game'} ↗
            </a>
          </div>
        </div>

        {/* 3D Fanned Game Deck on Right Side - Fully Mobile Responsive */}
        {featuredDeck.length > 0 && (
          <div className="relative z-10 mt-6 sm:mt-0 sm:absolute sm:right-10 sm:top-1/2 sm:-translate-y-1/2 flex items-center justify-center">
            <div className="relative h-36 w-64 sm:h-52 sm:w-80 scale-[0.82] xs:scale-90 sm:scale-100 origin-center">
              {featuredDeck.map((game, i) => {
                const centerIdx = (featuredDeck.length - 1) / 2;
                const angle = (i - centerIdx) * (fannedHover ? 11 : 7);
                const xOffset = (i - centerIdx) * (fannedHover ? 44 : 32);
                const yOffset = Math.abs(i - centerIdx) * (fannedHover ? 5 : 7);
                const zIndex = 10 - Math.abs(Math.round(i - centerIdx));

                return (
                  <a
                    key={game.id}
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      transform: `translate(${xOffset}px, ${yOffset}px) rotate(${angle}deg)`,
                      zIndex
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 sm:h-34 sm:w-34 cursor-pointer rounded-[20px] sm:rounded-[24px] border border-slate-200/90 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.14)] transition-all duration-300 hover:scale-110 hover:border-blue-400 hover:shadow-xl hover:z-30 block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={game.image || game.coverImage}
                      alt={game.name}
                      className="h-full w-full rounded-[18px] sm:rounded-[22px] object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-[18px] sm:rounded-[22px] bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate text-[9px] sm:text-[11px] font-bold text-white text-center drop-shadow">
                      {game.name}
                    </span>
                  </a>
                );
              })}
            </div>

            {featuredDeck[1] && (
              <a
                aria-label="Next featured games"
                href={featuredDeck[1]?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:grid ml-4 h-11 w-11 place-items-center rounded-full border border-slate-200/90 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white hover:text-blue-600 hover:scale-105"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Bottom 2-Column Split Cards */}
      <div className="mt-5 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        {/* Card 1: 2x2 Game Icon Cluster */}
        <div
          className="relative min-h-[190px] overflow-hidden rounded-[24px] sm:rounded-[28px] border border-slate-200/90 bg-white/90 p-5 sm:p-7 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-md hover:border-blue-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="max-w-[70%]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                Cross-Traffic Ecosystem
              </span>
              <h4 className="mt-1.5 text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Shared Player Audiences
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                When one game peaks, traffic circulates into sister games so every studio stays visible.
              </p>
            </div>

            {/* Cluster of Game Icons from real Firebase games */}
            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 p-1.5 shrink-0">
              {games.slice(0, 4).map((g) => (
                <a
                  key={g.id}
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-[20%] ring-1 ring-slate-200 transition hover:scale-105 block"
                  title={g.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.image} alt={g.name} className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs font-bold text-blue-600">
            <Share2 size={13} />
            <span>48,000+ daily cross-game player swaps</span>
          </div>
        </div>

        {/* Card 2: Minimalist Awards Card */}
        <div
          className="relative min-h-[190px] overflow-hidden rounded-[24px] sm:rounded-[28px] border border-slate-200/90 bg-white/90 p-5 sm:p-7 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-md hover:border-amber-200 flex items-center justify-between gap-3"
        >
          <div className="max-w-[70%]">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
              FirstPlay Choice
            </span>
            <h4 className="mt-1.5 text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Player Honors & Awards
            </h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Curated recognition for games with the highest retention and cross-community ratings.
            </p>
            {games[0] && (
              <a
                href={games[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 hover:text-blue-600 transition"
              >
                Play This Month&apos;s Winner ↗
              </a>
            )}
          </div>

          <div className="grid h-18 w-18 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-full border border-amber-200/60 bg-amber-50 shadow-inner">
            <Award size={38} className="text-amber-500 drop-shadow-sm" />
          </div>
        </div>
      </div>
    </section>
  );
}
