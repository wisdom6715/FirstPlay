'use client';

import { useMemo, useState } from 'react';
import type { Banner, Listing } from '@/lib/discover';
import { DownloadSection } from './DownloadSection';
import { FeaturedSpotlight } from './FeaturedSpotlight';
import { FindGamesSection } from './FindGamesSection';
import { Footer } from './Footer';
import { GameModal } from './GameModal';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { ReadyCtaSection } from './ReadyCtaSection';

const DEFAULT_GAMES: Listing[] = [
  {
    id: 'lagos-life',
    category: 'game',
    name: 'Lagos Life',
    studio: 'Lagos Life Studio',
    url: 'https://lagoslife.app',
    image: '/images/games/lagos-life.png',
    coverImage: '/images/games/lagos-life.png',
    description:
      "From coordinating your route in iconic yellow danfo commuter buses to navigating bustling street markets, Lagos Life captures the rhythm and energy of Nigeria's largest metropolis right in your browser.",
    plays: '48.2k',
    rating: 4.9,
    rank: 1,
    genre: 'simulation',
    createdAt: Date.now()
  },
  {
    id: 'monkey-post',
    category: 'game',
    name: 'Monkey Post',
    studio: 'Street Ballers Indie',
    url: 'https://deadshot.io',
    image: '/images/games/monkey-post.png',
    coverImage: '/images/games/monkey-post.png',
    description: 'Street football tournament with 3v3 canvas physics and authentic rules.',
    plays: '24.1k',
    rating: 4.8,
    rank: 2,
    genre: 'casual',
    createdAt: Date.now()
  },
  {
    id: 'lagos-danfo',
    category: 'game',
    name: 'Lagos Danfo',
    studio: 'Mech Expedition',
    url: 'https://slopegame.online',
    image: '/images/games/lagos-danfo.png',
    coverImage: '/images/games/lagos-danfo.png',
    description: 'Keep the iconic yellow danfo moving through chaotic highways and desert mech routes.',
    plays: '31.5k',
    rating: 4.7,
    rank: 3,
    genre: 'arcade',
    createdAt: Date.now()
  },
  {
    id: 'kite-runner',
    category: 'game',
    name: 'Kite Runner',
    studio: 'Sky Glide',
    url: 'https://play2048.co',
    image: '/images/games/kite-runner.png',
    coverImage: '/images/games/kite-runner.png',
    description: 'Glide your kite along windy coastal cliffs in an indie physics flyer.',
    plays: '16.7k',
    rating: 4.8,
    rank: 4,
    genre: 'casual',
    createdAt: Date.now()
  },
  {
    id: 'relay-grid',
    category: 'game',
    name: 'Relay Grid',
    studio: 'Logic Circuit',
    url: 'https://paper-io.com',
    image: '/images/games/relay-grid.png',
    coverImage: '/images/games/relay-grid.png',
    description: 'Fast-paced multiplayer logic circuit conquest.',
    plays: '28.3k',
    rating: 4.9,
    rank: 5,
    genre: 'multiplayer',
    createdAt: Date.now()
  },
  {
    id: 'solfeggio-drift',
    category: 'game',
    name: 'Solfeggio Drift',
    studio: 'Audio Journey',
    url: 'https://slither.io',
    image: '/images/games/solfeggio-drift.png',
    coverImage: '/images/games/solfeggio-drift.png',
    description: 'Immersive audio frequency drift and harmonic wave visualizer gameplay.',
    plays: '14.9k',
    rating: 4.6,
    rank: 6,
    genre: 'adventure',
    createdAt: Date.now()
  }
];

export function DiscoverClient({
  listings = [],
  banners = [],
  demo = false
}: {
  listings?: Listing[];
  banners?: Banner[];
  demo?: boolean;
}) {
  const [selectedGame, setSelectedGame] = useState<Listing | null>(null);

  // Combine Firestore listings with default showcase games
  const allListings = useMemo(() => {
    const list = [...DEFAULT_GAMES];
    for (const item of listings) {
      if (!list.some((g) => g.name.toLowerCase() === item.name.toLowerCase())) {
        list.push(item);
      }
    }
    return list;
  }, [listings]);

  const relatedGames = useMemo(() => {
    if (!selectedGame) return allListings.slice(0, 3);
    return allListings.filter((l) => l.id !== selectedGame.id).slice(0, 3);
  }, [allListings, selectedGame]);

  const handleLaunchGame = (game: Listing) => {
    setSelectedGame(null);
    if (game.url) {
      window.open(game.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSelectGame = (partial: Partial<Listing>) => {
    const matched = allListings.find(
      (g) => g.id === partial.id || g.name.toLowerCase() === partial.name?.toLowerCase()
    );
    if (matched) {
      setSelectedGame(matched);
    } else if (partial.name) {
      setSelectedGame({
        id: partial.id || 'game-custom',
        category: 'game',
        name: partial.name,
        studio: partial.studio || 'FirstPlay Indie',
        url: partial.url || 'https://lagoslife.app',
        image: '/firstplay-logo.png',
        coverImage: '/firstplay-logo.png',
        description: partial.description || `${partial.name} featured on FirstPlay.`,
        plays: partial.plays || '10.5k',
        rating: partial.rating || 4.8,
        createdAt: Date.now()
      });
    }
  };

  const handleLaunchByName = (name: string) => {
    const matched = allListings.find((g) => g.name.toLowerCase() === name.toLowerCase());
    if (matched) {
      setSelectedGame(matched);
    } else {
      setSelectedGame(DEFAULT_GAMES[0]);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Header / Navbar (Image 1 top) */}
      <Header />

      <main>
        {/* 2. Hero Section with 3D Layered Cards Showcase (Image 1 middle) */}
        <HeroSection onPlayGame={handleLaunchByName} />

        {/* 3. "All your games, in one place." How It Works (Image 1 bottom) */}
        <HowItWorksSection />

        {/* 4. "Find something to play." Games Grid with No Individual Play Buttons & Store Buttons (Image 2 top) */}
        <FindGamesSection onSelectGame={handleSelectGame} />

        {/* 5. "Featured Spotlight" Lagos Life (Image 2 bottom) */}
        <FeaturedSpotlight
          onPlayGame={handleLaunchByName}
          onViewDetails={handleLaunchByName}
        />

        {/* 6. "Take FirstPlay with you." Platform Downloads (Image 3 top) */}
        <DownloadSection />

        {/* 7. "Ready to find something fun?" CTA Banner (Image 3 middle) */}
        <ReadyCtaSection />
      </main>

      {/* 8. Footer with 4 Columns & Copyright (Image 3 bottom) */}
      <Footer />

      {/* Interactive Game Launcher Modal */}
      <GameModal
        game={selectedGame}
        relatedGames={relatedGames}
        onClose={() => setSelectedGame(null)}
        onSelectGame={(g) => setSelectedGame(g)}
        onLaunchFullscreen={(g) => handleLaunchGame(g)}
      />
    </div>
  );
}
