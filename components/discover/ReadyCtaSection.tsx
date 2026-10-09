'use client';

import { Gamepad2 } from 'lucide-react';

export function ReadyCtaSection() {
  return (
    <section className="py-16 sm:py-20 bg-white text-center">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Gamepad Icon Badge */}
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#1422b8] text-white shadow-md">
          <Gamepad2 size={24} className="stroke-[2.2]" />
        </div>

        {/* Heading */}
        <h2 className="mt-5 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Ready to find something fun?
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-xs sm:text-sm text-slate-500 font-normal">
          Explore the FirstPlay collection and find your next game in seconds.
        </p>

        {/* Action Button */}
        <div className="mt-6 sm:mt-7">
          <a
            href="#games"
            className="inline-flex items-center justify-center rounded-xl bg-[#1422b8] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            Explore More Games
          </a>
        </div>
      </div>
    </section>
  );
}
