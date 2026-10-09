'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BarChart3, RefreshCw, Shield, Sparkles, Users, Zap } from 'lucide-react';
import type { Listing } from '@/lib/discover';

export function CrossTrafficBanner({
  games = [],
  onOpenJoinModal
}: {
  games?: Listing[];
  onOpenJoinModal?: () => void;
}) {
  const [tickerIndex, setTickerIndex] = useState(0);

  const liveEvents = useMemo(() => {
    if (games.length >= 2) {
      return games.map((g, i) => {
        const nextGame = games[(i + 1) % games.length];
        return {
          from: g.name,
          to: nextGame.name,
          count: 85 + ((i * 47) % 120)
        };
      });
    }
    if (games.length === 1) {
      return [{ from: 'FirstPlay Rail', to: games[0].name, count: 184 }];
    }
    return [{ from: 'FirstPlay Network', to: 'Live Catalog', count: 120 }];
  }, [games]);

  useEffect(() => {
    if (liveEvents.length <= 1) return;
    const t = setInterval(() => {
      setTickerIndex((i) => (i + 1) % liveEvents.length);
    }, 3800);
    return () => clearInterval(t);
  }, [liveEvents.length]);

  const event = liveEvents[tickerIndex % liveEvents.length];

  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="traffic-engine-heading">
      <div
        className="relative overflow-hidden rounded-[26px] sm:rounded-[34px] border border-indigo-100/90 bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/50 p-5 sm:p-9 shadow-[0_12px_36px_rgba(37,99,235,0.06)]"
      >
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700">
              <RefreshCw size={12} className="animate-spin text-blue-700" style={{ animationDuration: '6s' }} />
              Active Cross-Traffic Engine
            </div>

            <h2 id="traffic-engine-heading" className="mt-2.5 text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              When One Game Plays, Every Game Wins
            </h2>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Indie games usually struggle with isolated discovery. FirstPlay unifies titles under a shared discovery rail — passing engaged players between games whenever games need traffic.
            </p>

            {/* Live Ticker Bar */}
            {event && (
              <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-slate-800 shadow-sm backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">
                  Live Flow: <strong className="text-blue-600">+{event.count} players</strong> hopped from{' '}
                  <span className="underline decoration-blue-400 font-semibold">{event.from}</span> to{' '}
                  <span className="underline decoration-emerald-500 font-semibold">{event.to}</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col lg:items-end">
            <Link
              href="/promote"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:bg-blue-700 hover:scale-105 active:scale-95"
            >
              <Sparkles size={15} />
              List Your Game For Free
              <ArrowUpRight size={15} />
            </Link>
            <span className="text-center text-[11px] text-slate-500">
              Zero ad networks. Pure player-to-player discovery.
            </span>
          </div>
        </div>

        {/* 4 Feature Badges */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-slate-200/80 pt-5">
          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 p-3 sm:p-3.5 shadow-sm">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
            <div>
              <b className="block text-sm sm:text-base font-black text-slate-900">148k+</b>
              <span className="text-[10px] sm:text-[11px] text-slate-500">Active Players</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 p-3 sm:p-3.5 shadow-sm">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <BarChart3 size={18} />
            </div>
            <div>
              <b className="block text-sm sm:text-base font-black text-slate-900">3.2M+</b>
              <span className="text-[10px] sm:text-[11px] text-slate-500">Cross Impressions</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 p-3 sm:p-3.5 shadow-sm">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Zap size={18} />
            </div>
            <div>
              <b className="block text-sm sm:text-base font-black text-slate-900">0 Sec</b>
              <span className="text-[10px] sm:text-[11px] text-slate-500">Instant Web Play</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 p-3 sm:p-3.5 shadow-sm">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Shield size={18} />
            </div>
            <div>
              <b className="block text-sm sm:text-base font-black text-slate-900">100%</b>
              <span className="text-[10px] sm:text-[11px] text-slate-500">Ad-Free Gaming</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
