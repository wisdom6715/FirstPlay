'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Clock, 
  Smartphone, 
  Download, 
  X, 
  Calendar, 
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { getTournaments } from '../services/tournamentService';
import Footer from '../components/Footer';

// Official Store URLs for FirstPlay Mobile App
const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.firstplay.app';
const APP_STORE_URL = 'https://apps.apple.com/app/firstplay/id6470000000';

/**
 * High-precision Google Play triangular vector icon
 */
function GooglePlayIcon({ className = "w-4 h-4 shrink-0" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a2.072 2.072 0 0 1-.22-.962V2.776c0-.36.08-.69.22-.962z" fill="#2196F3" />
      <path d="M17.432 8.36L5.342.3c-.562-.375-1.196-.4-1.733-.2L13.792 12l3.64-3.64z" fill="#4CAF50" />
      <path d="M13.792 12l-10.183 11.9c.537.2 1.17.175 1.733-.2l12.09-8.06-3.64-3.64z" fill="#F44336" />
      <path d="M21.708 11.23l-4.276-2.87-3.64 3.64 3.64 3.64 4.276-2.87c.78-.52 1.292-1.35 1.292-2.27s-.512-1.75-1.292-2.27z" fill="#FFEB3B" />
    </svg>
  );
}

/**
 * Authentic Apple silhouette icon
 */
function AppleIcon({ className = "w-4 h-4 shrink-0" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#ffffff" style={{ fill: '#ffffff' }} aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.9.04-2 .61-2.65 1.36-.58.65-1.08 1.71-.94 2.74 1.01.08 2.02-.54 2.58-1.23z" fill="#ffffff" />
    </svg>
  );
}

/**
 * Format remaining time in hours, minutes, seconds
 */
function formatCountdown(targetDate) {
  if (!targetDate) return '';
  const now = Date.now();
  const diff = targetDate.getTime() - now;
  if (diff <= 0) return 'Ended';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m ${seconds}s left`;
}

export default function TournamentsView({
  onNavigateDiscover,
  onNavigateCategory,
  onNavigateSection,
  onNavigateTab,
  onOpenPrivacyPolicy,
  onOpenTerms
}) {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'ongoing' | 'upcoming' | 'completed'
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tick, setTick] = useState(0);

  // 1-second interval for real-time countdown updates
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch tournaments from Firestore
  const loadTournaments = async () => {
    setIsLoading(true);
    try {
      const list = await getTournaments();
      setTournaments(list);
    } catch (err) {
      console.error('[TournamentsView] Failed to load tournaments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  // Filter tournaments
  const filteredTournaments = useMemo(() => {
    if (activeFilter === 'all') return tournaments;
    return tournaments.filter((t) => t.computedStatus === activeFilter);
  }, [tournaments, activeFilter]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: tournaments.length,
      ongoing: tournaments.filter((t) => t.computedStatus === 'ongoing').length,
      upcoming: tournaments.filter((t) => t.computedStatus === 'upcoming').length,
      completed: tournaments.filter((t) => t.computedStatus === 'completed').length
    };
  }, [tournaments]);

  return (
    <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-6 sm:space-y-8 text-left">
      
      {/* Hero Banner Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <Trophy size={14} className="shrink-0" />
          <span>24-Hour Competitive Tournaments</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Tournaments & Leaderboards
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Compete for high scores across top Nigerian games over 24 hours. The Top 5 players on the leaderboard win real cash prize pools.
            </p>
          </div>

          <button
            type="button"
            onClick={loadTournaments}
            disabled={isLoading}
            title="Refresh tournaments"
            className="self-start sm:self-auto px-3 py-2 rounded-xl bg-white dark:bg-[#1c1c1e] border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Mobile-Only Notice Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-[#0071e3]/10 to-amber-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Smartphone size={20} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              Tournaments Can Only Be Joined from the Mobile App
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Browse live matches below. Download FirstPlay on your phone or tablet to join, submit high scores, and win prizes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedTournament(tournaments[0] || { tournament_name: 'FirstPlay Tournament' })}
          className="self-start sm:self-auto shrink-0 px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Download size={14} />
          <span>Get Mobile App</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Tournaments', count: counts.all },
          { id: 'ongoing', label: 'Live Now', count: counts.ongoing, isLive: true },
          { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { id: 'completed', label: 'Past / Completed', count: counts.completed }
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/10'
              }`}
            >
              {tab.isLive && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                isActive 
                  ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900' 
                  : 'bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((n) => (
            <div 
              key={n} 
              className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#1c1c1e] p-4 space-y-3 animate-pulse"
            >
              <div className="w-full h-44 rounded-2xl bg-zinc-200 dark:bg-white/10" />
              <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-white/10" />
              <div className="h-10 w-full rounded-xl bg-zinc-200 dark:bg-white/10 mt-4" />
            </div>
          ))}
        </div>
      ) : filteredTournaments.length === 0 ? (
        /* Empty State */
        <div className="p-8 sm:p-14 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-zinc-200 dark:border-white/10 text-center max-w-md mx-auto space-y-4 my-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
            <Trophy size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-zinc-900 dark:text-white">
              {activeFilter === 'all' 
                ? 'No Tournaments Scheduled Yet'
                : `No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Tournaments`}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Tournaments run regularly with cash prize pools. Check back soon or download the FirstPlay mobile app to get notified.
            </p>
          </div>
          <button
            type="button"
            onClick={loadTournaments}
            className="px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-bold hover:bg-[#0077ed] transition cursor-pointer"
          >
            Check Again
          </button>
        </div>
      ) : (
        /* Tournament Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredTournaments.map((tourney) => {
            const isOngoing = tourney.computedStatus === 'ongoing';
            const isUpcoming = tourney.computedStatus === 'upcoming';
            const isCompleted = tourney.computedStatus === 'completed';

            const banner = tourney.tournament_img || tourney.game_logo || '/icon.png';
            const gameLogo = tourney.game_logo || '/icon.png';
            const poolText = tourney.prize_description || `₦${Number(tourney.prize_pool || 0).toLocaleString()} Prize Pool`;

            return (
              <div
                key={tourney.id}
                onClick={() => setSelectedTournament(tourney)}
                className="group relative rounded-3xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-[#1c1c1e] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#0071e3]/40 dark:hover:border-blue-500/40 transition-all duration-200 flex flex-col cursor-pointer"
              >
                {/* 16:9 Banner Cover */}
                <div className="w-full h-44 sm:h-48 relative overflow-hidden bg-zinc-900">
                  <img
                    src={banner}
                    alt={tourney.tournament_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = gameLogo;
                    }}
                  />
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                  {/* Status Pill on Banner Top Left */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {isOngoing && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>Live Now</span>
                      </span>
                    )}

                    {isUpcoming && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Calendar size={11} />
                        <span>Upcoming</span>
                      </span>
                    )}

                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-700/90 backdrop-blur-md text-zinc-200 text-[10px] font-bold uppercase tracking-wider shadow-md">
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Countdown Ticker on Banner Top Right */}
                  {isOngoing && tourney.endsAtDate && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-white/10">
                      <Clock size={11} />
                      <span>{formatCountdown(tourney.endsAtDate)}</span>
                    </div>
                  )}

                  {/* Prize Pool Badge on Banner Bottom Left */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white font-extrabold text-xs flex items-center gap-1.5 border border-amber-400/30">
                      <Trophy size={13} className="text-amber-400" />
                      <span>{poolText}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold">
                      24h Duration
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Tournament Title & Game Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={gameLogo}
                        alt={tourney.game_name || 'Game Logo'}
                        className="w-6 h-6 rounded-lg object-cover border border-zinc-200 dark:border-white/10"
                        onError={(e) => {
                          e.target.src = '/icon.png';
                        }}
                      />
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 truncate">
                        {tourney.game_name || 'FirstPlay Game'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white tracking-tight leading-snug line-clamp-1 group-hover:text-[#0071e3] dark:group-hover:text-blue-400 transition-colors">
                      {tourney.tournament_name}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {tourney.description || `Compete for the highest score in ${tourney.game_name || 'this game'} over 24 hours. The Top 5 players win cash prizes!`}
                    </p>
                  </div>

                  {/* Top 5 Prize Distribution Chips */}
                  {tourney.prize_distribution && (
                    <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                        <span>Top 5 Distribution</span>
                        <span className="text-amber-600 dark:text-amber-400 font-mono">1st: {tourney.prize_distribution['1'] || '40%'}</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
                        <div className="p-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20">
                          1st
                        </div>
                        <div className="p-1 rounded-md bg-zinc-200/60 dark:bg-white/5 text-zinc-700 dark:text-zinc-300">
                          2nd
                        </div>
                        <div className="p-1 rounded-md bg-zinc-200/60 dark:bg-white/5 text-zinc-700 dark:text-zinc-300">
                          3rd
                        </div>
                        <div className="p-1 rounded-md bg-zinc-200/60 dark:bg-white/5 text-zinc-700 dark:text-zinc-300">
                          4th
                        </div>
                        <div className="p-1 rounded-md bg-zinc-200/60 dark:bg-white/5 text-zinc-700 dark:text-zinc-300">
                          5th
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button: Opens Mobile App Modal */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTournament(tourney);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs group-hover:bg-[#0071e3] group-hover:text-white dark:group-hover:bg-[#0071e3] dark:group-hover:text-white"
                    >
                      <Smartphone size={14} />
                      <span>{isCompleted ? 'View Results (Mobile Only)' : 'Join Tournament (Mobile Only)'}</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MOBILE APP EXCLUSIVE DOWNLOAD PROMPT MODAL
          Directly satisfies: "when you click on it, it should tell you to download
          the mobile app. Tournaments can only be joined from the mobile app, not the web app."
          ========================================================================= */}
      {selectedTournament && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setSelectedTournament(null)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 dark:border-white/10 text-center space-y-5 animate-in zoom-in-95 duration-150 text-zinc-900 dark:text-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedTournament(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 flex items-center justify-center text-zinc-500 dark:text-zinc-300 transition cursor-pointer"
              title="Close modal"
            >
              <X size={16} />
            </button>

            {/* Header Badge */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
              <Trophy size={28} />
            </div>

            {/* Core Directives & Headline */}
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#0071e3]/15 text-[#0071e3] dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
                Mobile App Exclusive
              </span>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                Download the Mobile App
              </h2>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xs mx-auto">
                <strong>Tournaments can only be joined from the mobile app, not the web app.</strong>
              </p>
            </div>

            {/* Selected Tournament Summary Box */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-left flex items-center gap-3">
              <img
                src={selectedTournament.game_logo || selectedTournament.tournament_img || '/icon.png'}
                alt={selectedTournament.tournament_name}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-white/10"
                onError={(e) => {
                  e.target.src = '/icon.png';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {selectedTournament.tournament_name || 'FirstPlay Tournament'}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {selectedTournament.game_name || 'FirstPlay Game'}
                </p>
                <p className="text-[11px] font-black text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
                  {selectedTournament.prize_description || `₦${Number(selectedTournament.prize_pool || 0).toLocaleString()} Prize Pool`}
                </p>
              </div>
            </div>

            {/* Why Join from Mobile Feature List */}
            <div className="text-left space-y-2 text-xs text-zinc-600 dark:text-zinc-300 bg-blue-50/60 dark:bg-blue-500/5 border border-blue-200/60 dark:border-blue-500/10 p-3 rounded-2xl">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Live 24-hour leaderboard rankings</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Anti-cheat score validation for verified payouts</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Direct bank transfer prize redemptions for Top 5</span>
              </div>
            </div>

            {/* Store Download Buttons: Download on Playstore and Download on App Store */}
            <div className="space-y-2.5 pt-1">
              {/* Download on Playstore */}
              <a
                href={PLAYSTORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-keep-white="true"
                style={{ backgroundColor: '#000000', color: '#ffffff' }}
                className="store-badge w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-zinc-900 border border-white/15 text-white flex items-center justify-center gap-2.5 shadow-md shadow-black/20 cursor-pointer active:scale-[0.98] transition-all"
              >
                <GooglePlayIcon className="w-5 h-5 shrink-0" />
                <span data-keep-white="true" style={{ color: '#ffffff' }} className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Download on Playstore
                </span>
              </a>

              {/* Download on App Store */}
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-keep-white="true"
                style={{ backgroundColor: '#000000', color: '#ffffff' }}
                className="store-badge w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-zinc-900 border border-white/15 text-white flex items-center justify-center gap-2.5 shadow-md shadow-black/20 cursor-pointer active:scale-[0.98] transition-all"
              >
                <AppleIcon className="w-5 h-5 shrink-0" />
                <span data-keep-white="true" style={{ color: '#ffffff' }} className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Download on App Store
                </span>
              </a>
            </div>

            {/* Back Button */}
            <div>
              <button
                type="button"
                onClick={() => setSelectedTournament(null)}
                className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
              >
                Back to Tournaments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer
        onNavigateCategory={onNavigateCategory}
        onNavigateTab={onNavigateTab}
        onNavigateSection={onNavigateSection}
        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
        onOpenTerms={onOpenTerms}
      />
    </div>
  );
}
