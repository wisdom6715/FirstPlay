'use client';

import { Info, Play } from 'lucide-react';
import Image from 'next/image';

export function FeaturedSpotlight({
  onPlayGame,
  onViewDetails
}: {
  onPlayGame?: (gameTitle: string) => void;
  onViewDetails?: (gameTitle: string) => void;
}) {
  return (
    <section className="bg-[#f9fafc] py-14 sm:py-20 border-t border-b border-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white p-5 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
          {/* Left Media Column */}
          <div className="relative w-full lg:w-1/2 aspect-[1024/582] overflow-hidden rounded-2xl border border-slate-200/80 shadow-md group bg-emerald-950">
            <Image
              src="/images/games/lagos-life-spotlight.png"
              alt="Lagos Life - Featured Spotlight"
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />

            {/* Top Right "W" Circle Badge */}
            <div className="absolute top-3.5 right-3.5 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white font-bold text-sm backdrop-blur-md border border-white/20 z-10">
              W
            </div>

            {/* Center Play Button Overlay */}
            <button
              type="button"
              onClick={() => onPlayGame?.('Lagos Life')}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-14 w-14 place-items-center rounded-full bg-white/30 text-white backdrop-blur-md border border-white/40 shadow-lg transition duration-200 group-hover:scale-110 group-hover:bg-white/40 z-10"
              aria-label="Play Lagos Life"
            >
              <Play size={24} className="fill-white translate-x-0.5" />
            </button>

            {/* Bottom Status Strip */}
            <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md px-4 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-700 border-t border-slate-100 z-10">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Canvas Ready • 60 FPS</span>
              </div>
              <div className="text-slate-500">
                Full Screen Supported
              </div>
            </div>
          </div>

          {/* Right Information Column */}
          <div className="w-full lg:w-1/2 text-left flex flex-col justify-between">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                FEATURED SPOTLIGHT
              </div>

              {/* Title & Subtitle */}
              <h3 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Lagos Life
              </h3>
              <p className="mt-1.5 text-sm sm:text-base font-semibold text-blue-600">
                One of the games you can discover through FirstPlay.
              </p>

              {/* Paragraph */}
              <p className="mt-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                From coordinating your route in iconic yellow danfo commuter buses to navigating
                bustling street markets, Lagos Life captures the rhythm and energy of Nigeria&apos;s
                largest metropolis right in your browser.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onPlayGame?.('Lagos Life')}
                  className="rounded-xl bg-[#1422b8] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                >
                  Play Lagos Life
                </button>
                <button
                  type="button"
                  onClick={() => onViewDetails?.('Lagos Life')}
                  className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 hover:text-blue-600 transition"
                >
                  View game details
                </button>
              </div>
            </div>

            {/* Disclaimer Box */}
            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex items-start gap-2.5 text-[11px] text-slate-500">
              <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
              <span>
                Game created by its original developer. FirstPlay connects players to web games and does not claim ownership of hosted titles.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
