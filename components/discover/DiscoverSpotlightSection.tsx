'use client';

import { Award, ChevronRight, Play, Sparkles } from 'lucide-react';
import type { Listing } from '@/lib/discover';

export function DiscoverSpotlightSection({
  games,
  onPlayGame
}: {
  games: Listing[];
  onPlayGame: (game: Listing) => void;
}) {
  const spotlightGame = games[0] || null;
  const timeDriftGame = games[1] || games[0] || null;
  const editorsGame = games[2] || games[0] || null;

  if (!spotlightGame) return null;

  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="discover-spotlight-title">
      <div className="mb-4 flex items-baseline justify-between border-b border-slate-200/80 pb-3">
        <div>
          <h2 id="discover-spotlight-title" className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-[-0.03em] text-slate-900">
            Discover
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Curated spotlights handpicked for instant gameplay and community engagement
          </p>
        </div>
      </div>

      {/* Top Large Card */}
      <div
        className="group relative min-h-[300px] sm:min-h-[340px] overflow-hidden rounded-[26px] sm:rounded-[34px] border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/90 to-cyan-50/30 p-5 sm:p-9 shadow-[0_12px_36px_rgba(15,23,42,0.05)] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="relative z-10 max-w-lg text-slate-900">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/70 bg-cyan-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-cyan-700">
            <Sparkles size={12} className="text-cyan-700" />
            Games We Love
          </span>

          <h3 className="mt-3.5 text-2xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900">
            Find your groove with {spotlightGame.name}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {spotlightGame.description ||
              `Experience ${spotlightGame.name} direct from ${spotlightGame.studio}. Instant play without downloads.`}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <a
              href={spotlightGame.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:bg-slate-800 hover:scale-105 active:scale-95"
            >
              <Play size={15} className="fill-white" />
              Play Now ↗
            </a>
          </div>
        </div>

        {/* Right side artwork with circular Play button overlay - fully responsive */}
        <div className="relative z-10 flex items-center justify-center gap-4 shrink-0">
          <a
            href={spotlightGame.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/art relative h-44 w-full sm:h-56 sm:w-80 cursor-pointer overflow-hidden rounded-[22px] sm:rounded-[26px] border border-slate-200/90 shadow-md transition duration-500 hover:scale-[1.03] block bg-slate-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={spotlightGame.coverImage || spotlightGame.image}
              alt={spotlightGame.name}
              className="h-full w-full object-cover transition duration-700 group-hover/art:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/20 group-hover/art:bg-black/10 transition" />

            {/* Central Play Circle Overlay */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-blue-600 text-white shadow-lg transition duration-300 group-hover/art:scale-110 group-hover/art:bg-blue-700">
              <Play size={20} className="fill-white translate-x-0.5" />
            </div>
          </a>

          {timeDriftGame && timeDriftGame.id !== spotlightGame.id && (
            <a
              aria-label="Next featured game"
              href={timeDriftGame.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:grid h-11 w-11 place-items-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-blue-600 hover:scale-105"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </a>
          )}
        </div>
      </div>

      {/* Bottom 2-Column Split Cards */}
      <div className="mt-5 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        {/* Card 1: Character artwork cutout on right */}
        {timeDriftGame && (
          <a
            href={timeDriftGame.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative cursor-pointer min-h-[190px] overflow-hidden rounded-[24px] sm:rounded-[28px] border border-slate-200/90 bg-white/90 p-5 sm:p-7 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-md hover:border-cyan-300 flex items-center justify-between gap-3 block"
          >
            <div className="max-w-[65%]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-700">
                Games We Love
              </span>
              <h4 className="mt-1.5 text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition">
                Time is on your side in {timeDriftGame.name}
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                {timeDriftGame.description || 'Fast, responsive browser gaming on the FirstPlay platform.'}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-blue-600">
                Play Game ↗
              </span>
            </div>

            {/* Circular artwork cutout on right */}
            <div className="relative h-20 w-20 sm:h-22 sm:w-22 shrink-0 overflow-hidden rounded-full border border-slate-200 shadow ring-2 ring-slate-100 transition duration-500 group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={timeDriftGame.image || timeDriftGame.coverImage}
                alt={timeDriftGame.name}
                className="h-full w-full object-cover"
              />
            </div>
          </a>
        )}

        {/* Card 2: Editors' Choice Games + laurel medallion */}
        {editorsGame && (
          <a
            href={editorsGame.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative cursor-pointer min-h-[190px] overflow-hidden rounded-[24px] sm:rounded-[28px] border border-slate-200/90 bg-white/90 p-5 sm:p-7 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-md hover:border-purple-300 flex items-center justify-between gap-3 block"
          >
            <div className="max-w-[65%]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700">
                From The Editors
              </span>
              <h4 className="mt-1.5 text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-purple-700 transition">
                Editors&apos; Choice: {editorsGame.name}
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                {editorsGame.description || 'Top-shelf titles, tested and verified for instant friction-free play.'}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-purple-700">
                Play Featured Title ↗
              </span>
            </div>

            {/* Circular laurel medallion badge */}
            <div className="relative grid h-20 w-20 sm:h-22 sm:w-22 shrink-0 place-items-center rounded-full border border-purple-200/60 bg-purple-50 shadow-inner transition duration-500 group-hover:scale-105">
              <Award size={40} className="text-purple-600 drop-shadow-sm" />
            </div>
          </a>
        )}
      </div>
    </section>
  );
}
