'use client';

import { useState } from 'react';
import { triggerMacDownload, triggerWindowsDownload, useDevice } from '@/lib/device';
import type { Listing } from '@/lib/discover';

type MockGame = {
  id: string;
  name: string;
  subtitle: string;
  genre: string;
  tag: string;
  tagOverlay?: boolean;
  image: string;
  url?: string;
};

const DISPLAY_GAMES: MockGame[] = [
  {
    id: 'lagos-life',
    name: 'Lagos Life',
    subtitle: 'Urban Simulator',
    genre: 'Simulation',
    tag: 'Simulation',
    image: '/images/games/lagos-life.png',
    url: 'https://lagoslife.app'
  },
  {
    id: 'monkey-post',
    name: 'Monkey Post',
    subtitle: 'Street Football',
    genre: 'Casual',
    tag: 'Casual',
    tagOverlay: true,
    image: '/images/games/monkey-post.png',
    url: 'https://deadshot.io'
  },
  {
    id: 'lagos-danfo',
    name: 'Lagos Danfo',
    subtitle: 'Desert Mech',
    genre: 'Arcade',
    tag: 'Arcade',
    image: '/images/games/lagos-danfo.png',
    url: 'https://slopegame.online'
  },
  {
    id: 'kite-runner',
    name: 'Kite Runner',
    subtitle: 'Sky Glide',
    genre: 'Indie',
    tag: 'Indie',
    image: '/images/games/kite-runner.png',
    url: 'https://play2048.co'
  },
  {
    id: 'relay-grid',
    name: 'Relay Grid',
    subtitle: 'Logic Circuit',
    genre: 'Multiplayer',
    tag: 'Multiplayer',
    image: '/images/games/relay-grid.png',
    url: 'https://paper-io.com'
  },
  {
    id: 'solfeggio-drift',
    name: 'Solfeggio Drift',
    subtitle: 'Audio Journey',
    genre: 'Indie',
    tag: 'Experimental',
    image: '/images/games/solfeggio-drift.png',
    url: 'https://slither.io'
  }
];

const CATEGORIES = [
  'All',
  'Trending',
  'New',
  'Casual',
  'Arcade',
  'Simulation',
  'Indie'
];

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.firstplay.launcher';
const APP_STORE_URL = 'https://apps.apple.com/app/firstplay/id6449123456';

export function FindGamesSection({
  onSelectGame
}: {
  onSelectGame?: (game: Partial<Listing>) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const device = useDevice();

  // Filter games based on selected pill
  const filteredGames = DISPLAY_GAMES.filter((g) => {
    if (selectedCategory === 'All' || selectedCategory === 'Trending' || selectedCategory === 'New') {
      return true;
    }
    return (
      g.genre.toLowerCase() === selectedCategory.toLowerCase() ||
      g.tag.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  return (
    <section id="games" className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 tracking-tight font-normal">
              Find something to play.
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Explore games handpicked for FirstPlay.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-[#0a1463] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Game Cards Grid with Exact Uploaded Game Images */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredGames.map((game) => {
            return (
              <div
                key={game.id}
                onClick={() =>
                  onSelectGame?.({
                    id: game.id,
                    name: game.name,
                    studio: 'FirstPlay Indie',
                    description: `${game.subtitle} featured on FirstPlay.`,
                    url: game.url,
                    category: 'game',
                    rating: 4.9,
                    plays: '12.4k',
                    image: game.image,
                    coverImage: game.image
                  })
                }
                className="group cursor-pointer rounded-2xl bg-white transition duration-200 hover:-translate-y-1"
              >
                {/* Artwork Container */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm transition group-hover:shadow-md bg-slate-100 aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />

                  {/* Badge Pill for Monkey Post (others have badge embedded in image) */}
                  {game.tagOverlay && (
                    <div className="absolute top-3 right-3 z-10 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm border border-slate-100 backdrop-blur-md">
                      {game.tag}
                    </div>
                  )}
                </div>

                {/* Title & Subtitle Below Card (NO individual play button per instruction) */}
                <div className="mt-3 px-1 flex flex-col">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {game.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    {game.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Device-Aware Download Options Centered After the Find Something To Play Section */}
        <div
          id="find-games-download"
          className="mt-14 sm:mt-16 pt-10 border-t border-slate-100 flex flex-col items-center text-center scroll-mt-24"
        >
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-4">
            {device.isMobile
              ? 'Download the FirstPlay app for your mobile device.'
              : 'Download the FirstPlay desktop launcher for your laptop or PC.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Laptops / Desktops: Both Windows & macOS Options */}
            {!device.isMobile && (
              <>
                {/* Windows Download Option */}
                <button
                  type="button"
                  onClick={triggerWindowsDownload}
                  className="inline-flex items-center gap-3 rounded-xl bg-slate-950 px-5 py-2.5 text-white transition hover:bg-slate-800 active:scale-95 shadow-md border border-slate-800"
                  aria-label="Download for Windows"
                >
                  <svg className="h-6 w-6 fill-current text-[#00a4ef]" viewBox="0 0 24 24">
                    <path d="M0 3.449L9.75 2.1v9.451H0V3.449zm10.75-1.523L24 0v11.551H10.75V1.926zM0 12.551h9.75V22l-9.75-1.349V12.551zm10.75 0H24V24l-13.25-1.926V12.551z" />
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      DOWNLOAD FOR
                    </div>
                    <div className="text-sm font-bold tracking-tight text-white">
                      Windows PC
                    </div>
                  </div>
                </button>

                {/* macOS Download Option */}
                <button
                  type="button"
                  onClick={triggerMacDownload}
                  className="inline-flex items-center gap-3 rounded-xl bg-slate-950 px-5 py-2.5 text-white transition hover:bg-slate-800 active:scale-95 shadow-md border border-slate-800"
                  aria-label="Download for macOS"
                >
                  <svg className="h-6 w-6 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.87-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.76 1 .08 2.02-.49 2.64-1.24z" />
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      DOWNLOAD FOR
                    </div>
                    <div className="text-sm font-bold tracking-tight text-white">
                      macOS Universal
                    </div>
                  </div>
                </button>
              </>
            )}

            {/* Mobiles: Both Google Play Store & Apple App Store Options */}
            {device.isMobile && (
              <>
                {/* Google Play Store Button */}
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-xl bg-slate-950 px-5 py-2.5 text-white transition hover:bg-slate-800 active:scale-95 shadow-md border border-slate-800"
                  aria-label="Get it on Google Play"
                >
                  <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1 9.9-9.9v-.2L3.7 1.7l-.1.1z"
                      fill="#00E676"
                    />
                    <path
                      d="M16.9 15.6l-3.3-3.3v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.6 0 2.2l-3.9 2.2-.1.1z"
                      fill="#FFD600"
                    />
                    <path
                      d="M13.6 12.1L3.6 22.1c.4.4 1 .4 1.7 0l11.6-6.6-3.3-3.4z"
                      fill="#FF1744"
                    />
                    <path
                      d="M13.6 11.9l3.3-3.4L5.3 1.9C4.6 1.5 4 1.5 3.6 1.9l10 10z"
                      fill="#00B0FF"
                    />
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      GET IT ON
                    </div>
                    <div className="text-sm font-bold tracking-tight text-white">
                      Google Play
                    </div>
                  </div>
                </a>

                {/* Apple App Store Button */}
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-xl bg-slate-950 px-5 py-2.5 text-white transition hover:bg-slate-800 active:scale-95 shadow-md border border-slate-800"
                  aria-label="Download on the App Store"
                >
                  <svg className="h-6 w-6 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.87-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.76 1 .08 2.02-.49 2.64-1.24z" />
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Download on the
                    </div>
                    <div className="text-sm font-bold tracking-tight text-white">
                      App Store
                    </div>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
