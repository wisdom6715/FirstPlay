'use client';

import { CheckCircle2, Gamepad2, Globe, MousePointerClick, SlidersHorizontal } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#f9fafc] py-16 sm:py-24 border-t border-b border-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-slate-900 tracking-tight font-normal">
            All your games, in one place.
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            FirstPlay makes it easier to discover interesting games from across the web. Browse,
            choose what looks fun, and start playing.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 01 - Discover */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-white p-7 sm:p-8 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <Globe size={24} className="stroke-[1.8]" />
                </div>
                <span className="text-xl font-bold text-slate-300">01</span>
              </div>
              <h3 className="mt-6 text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Discover
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Find interesting games without searching multiple websites or digging through broken forums.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
              <span>Curated shelf updates daily</span>
              <CheckCircle2 size={13} className="shrink-0" />
            </div>
          </div>

          {/* Card 02 - Choose */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-white p-7 sm:p-8 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                  <MousePointerClick size={24} className="stroke-[1.8]" />
                </div>
                <span className="text-xl font-bold text-slate-300">02</span>
              </div>
              <h3 className="mt-6 text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Choose
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Browse a simple collection and pick whatever you want to play with clear categories and honest artwork.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <span>Filtered by real gameplay mood</span>
              <SlidersHorizontal size={13} className="shrink-0" />
            </div>
          </div>

          {/* Card 03 - Play */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-white p-7 sm:p-8 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Gamepad2 size={24} className="stroke-[1.8]" />
                </div>
                <span className="text-xl font-bold text-slate-300">03</span>
              </div>
              <h3 className="mt-6 text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Play
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Open the game and start playing directly inside the canvas. No launchers, zero waiting, and no installs.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span>Instant HTML5 & WebGL execution</span>
              <CheckCircle2 size={13} className="shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
