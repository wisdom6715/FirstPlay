'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
import { artStyle, type Listing } from '@/lib/discover';
import { Cover, Icon } from './Art';

export type Slide = {
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  url: string;
  image?: string;
  listing?: Listing;
};

export function HeroCarousel({
  slides,
  onPlayGame
}: {
  slides: Slide[];
  onPlayGame?: (game: Listing) => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => setIndex(0), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(t);
  }, [count, paused]);

  if (!count) return null;

  return (
    <div
      className="relative overflow-hidden rounded-[24px] sm:rounded-[34px] shadow-[0_12px_36px_rgba(15,23,42,0.08)] border border-slate-200/90"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Games"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-[650ms] ease-[cubic-bezier(0.2,0.9,0.3,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => {
          const isCenteredStyle = i % 2 === 1 && !s.listing;
          return (
            <article
              key={s.key}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
              className="relative min-h-[380px] sm:min-h-[420px] shrink-0 basis-full overflow-hidden sm:aspect-[16/7] flex items-end bg-slate-900"
              style={{ ...artStyle(s.title), background: 'var(--g)' }}
            >
              {/* Cinematic Background Art */}
              {s.image && (
                <Cover
                  src={s.image}
                  className="absolute inset-0 h-full w-full object-cover brightness-[0.8] transition-transform duration-1000 scale-[1.01]"
                />
              )}

              {/* Subdued Gradient Scrims: pure dark depth */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />

              {/* Floating Game Icon (Desktop only, never overlaps text on mobile) */}
              {s.listing && (
                <div className="hidden sm:block absolute right-[6%] top-1/2 -translate-y-1/2 z-[1] w-[22%] max-w-[240px] -rotate-[5deg] pointer-events-none transition-transform duration-500 hover:rotate-0">
                  {s.listing.image ? (
                    <Icon
                      item={s.listing}
                      className="w-full shadow-[0_24px_60px_rgba(0,0,0,0.7)] ring-2 ring-white/10"
                    />
                  ) : null}
                </div>
              )}

              {/* Floating Frosted Glass Card */}
              {!isCenteredStyle ? (
                <div
                  className="relative z-[2] m-3 sm:m-7 max-w-[480px] rounded-[20px] sm:rounded-[26px] border border-white/20 bg-slate-900/85 p-4 sm:p-6 text-white backdrop-blur-2xl shadow-2xl"
                >
                  {s.badge && (
                    <div className="mb-2 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                        <Sparkles size={11} className="text-amber-300" />
                        {s.badge}
                      </span>
                    </div>
                  )}

                  <h2 className="text-xl sm:text-3xl font-black leading-tight tracking-[-0.03em] drop-shadow-sm">
                    {s.title}
                  </h2>

                  {s.subtitle && (
                    <p className="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed text-white/85 line-clamp-2">
                      {s.subtitle}
                    </p>
                  )}

                  <div className="mt-3.5 flex items-center gap-3">
                    {s.listing ? (
                      <a
                        href={s.listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={i === index ? 0 : -1}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-extrabold text-black shadow-md transition hover:scale-105 active:scale-95"
                      >
                        <Play size={14} className="fill-black" />
                        Play Game ›
                      </a>
                    ) : s.url?.startsWith('#') ? (
                      <a
                        href={s.url}
                        tabIndex={i === index ? 0 : -1}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-extrabold text-black shadow-md transition hover:scale-105 active:scale-95"
                      >
                        <Play size={14} className="fill-black" />
                        Explore Games ›
                      </a>
                    ) : s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={i === index ? 0 : -1}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-extrabold text-black shadow-md transition hover:scale-105 active:scale-95"
                      >
                        <Play size={14} className="fill-black" />
                        Play Now ›
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : (
                /* Centered Hero Banner (Image 2 Style) */
                <div className="relative z-[2] mx-auto mb-8 sm:mb-10 w-full max-w-xl px-4 sm:px-6 text-center text-white">
                  <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider backdrop-blur-md">
                    FirstPlay Arcade Network
                  </div>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-[-0.035em]">
                    No In-App Purchases. No Ads. Just Fun.
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm font-medium text-white/80">
                    The cross-promotion discovery hub connecting indie game studios and sharing players without algorithm gates.
                  </p>
                  <div className="mt-4">
                    <a
                      href="#top-games"
                      className="inline-flex items-center gap-2 rounded-full bg-fp-accent px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg transition hover:scale-105 active:scale-95"
                    >
                      <Play size={15} className="fill-white" />
                      Start Playing Now
                    </a>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Glass Navigation Controls */}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-3.5 top-1/2 z-[3] hidden h-12 w-10 -translate-y-1/2 place-items-center rounded-2xl border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 sm:grid"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-3.5 top-1/2 z-[3] hidden h-12 w-10 -translate-y-1/2 place-items-center rounded-2xl border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 sm:grid"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
          <div className="absolute bottom-3.5 right-4 sm:bottom-4 sm:right-6 z-[3] flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 backdrop-blur-md">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
