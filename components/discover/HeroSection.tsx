'use client';

import { Download, Gamepad2, Lock, Play } from 'lucide-react';
import { handleGetFirstPlay, useDevice } from '@/lib/device';

export function HeroSection({
  onPlayGame
}: {
  onPlayGame?: (gameTitle: string) => void;
}) {
  const device = useDevice();

  const onDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('find-games-download');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.location.hash = '#find-games-download';
    }
  };

  return (
    <section className="relative overflow-x-clip pt-8 sm:pt-14 pb-12 sm:pb-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
        {/* Top Feature Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#0a1463] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#070e4a]">
          <span className="text-blue-400">✦</span>
          <span>Instant play in your browser • Zero installs required</span>
        </div>

        {/* Main Bold Headline */}
        <h1 className="mt-6 sm:mt-8 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 uppercase leading-[1.12]">
          ALL YOUR WEB GAME IS HERE.
        </h1>

        {/* Supporting Subtitle */}
        <p className="mt-3.5 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          Find games like Lagos Life, Monkey Post, and more without jumping from website to website.
        </p>

        {/* Action Button: Get FirstPlay */}
        <div className="mt-6 sm:mt-8 flex items-center justify-center">
          <button
            type="button"
            onClick={onDownloadClick}
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#1422b8] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
          >
            <Download size={18} />
            <span>Get FirstPlay</span>
          </button>
        </div>

        {/* Layered Showcase Cards Preview */}
        <div className="relative mt-12 sm:mt-16 mx-auto max-w-4xl py-6 sm:py-8 px-2 flex items-center justify-center">
          {/* Left Card: Monkey Post (Tilted behind) */}
          <div
            onClick={() => onPlayGame?.('Monkey Post')}
            className="hidden sm:block absolute left-4 md:left-12 top-10 w-60 md:w-72 -rotate-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:-rotate-3 hover:scale-105 z-10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/games/monkey-post.png"
              alt="Monkey Post"
              className="h-36 md:h-40 w-full object-cover"
            />
            <div className="p-3 text-left bg-white border-t border-slate-100">
              <h4 className="text-xs md:text-sm font-bold text-slate-900 leading-tight">Monkey Post</h4>
              <p className="text-[10px] text-slate-500">Canvas Physics</p>
            </div>
          </div>

          {/* Center Elevated Card: Lagos Life (Front & Center) */}
          <div className="relative z-20 w-full max-w-[460px] rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.01]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/games/lagos-life.png"
              alt="Lagos Life"
              className="h-52 sm:h-64 w-full object-cover"
            />

            {/* Bottom Control Strip */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2.5 sm:gap-3 text-left">
                <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Gamepad2 size={18} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Ready to Play</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500">No download needed • Click to launch</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onPlayGame?.('Lagos Life')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1422b8] px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 shrink-0"
              >
                <span>Play Now</span>
                <Play size={12} className="fill-white" />
              </button>
            </div>
          </div>

          {/* Right Card: Lagos Danfo (Tilted behind) */}
          <div
            onClick={() => onPlayGame?.('Lagos Danfo')}
            className="hidden sm:block absolute right-4 md:right-12 top-10 w-60 md:w-72 rotate-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:rotate-3 hover:scale-105 z-10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/games/lagos-danfo.png"
              alt="Lagos Danfo"
              className="h-36 md:h-40 w-full object-cover"
            />
            <div className="p-3 text-left bg-white border-t border-slate-100">
              <h4 className="text-xs md:text-sm font-bold text-slate-900 leading-tight">Lagos Danfo</h4>
              <p className="text-[10px] text-slate-500">Mech Expedition</p>
            </div>
          </div>
        </div>

        {/* Trust Badges Below Cards */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-600">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Play in 1-Click</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 shadow-sm">
            <Lock size={13} className="text-blue-600" />
            <span>No Sign-Up Needed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
