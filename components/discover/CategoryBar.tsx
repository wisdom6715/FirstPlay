'use client';

import {
  AppWindow,
  Compass,
  Dices,
  Flag,
  Gamepad2,
  Ghost,
  LayoutGrid,
  Package,
  Puzzle,
  Sparkles,
  Trophy,
  Users
} from 'lucide-react';
import type { GameGenre } from '@/lib/discover';

export type CategoryChip = {
  id: GameGenre;
  label: string;
  icon: React.ReactNode;
};

export const CATEGORIES: CategoryChip[] = [
  { id: 'all', label: 'All Catalog', icon: <LayoutGrid size={16} className="text-blue-500" /> },
  { id: 'game', label: 'Games', icon: <Gamepad2 size={16} className="text-emerald-500" /> },
  { id: 'app', label: 'Web Apps', icon: <AppWindow size={16} className="text-indigo-500" /> },
  { id: 'product', label: 'Products', icon: <Package size={16} className="text-purple-500" /> },
  { id: 'action', label: 'Action', icon: <Sparkles size={16} className="text-amber-500" /> },
  { id: 'adventure', label: 'Adventure', icon: <Compass size={16} className="text-teal-500" /> },
  { id: 'casual', label: 'Casual', icon: <Ghost size={16} className="text-cyan-500" /> },
  { id: 'multiplayer', label: 'Multiplayer', icon: <Users size={16} className="text-violet-500" /> },
  { id: 'puzzle', label: 'Puzzle', icon: <Puzzle size={16} className="text-pink-500" /> },
  { id: 'racing', label: 'Racing', icon: <Flag size={16} className="text-rose-500" /> },
  { id: 'retro', label: 'Retro', icon: <Gamepad2 size={16} className="text-blue-400" /> }
];

export function CategoryBar({
  selected,
  onSelect
}: {
  selected: GameGenre;
  onSelect: (genre: GameGenre) => void;
}) {
  return (
    <div
      className="fp-scroll mt-5 sm:mt-7 flex gap-2 sm:gap-2.5 overflow-x-auto px-0.5 pb-2 pt-1"
      role="group"
      aria-label="Filter games by category"
    >
      {CATEGORIES.map((c) => {
        const isActive = selected === c.id;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(c.id)}
            className={`flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-full py-2 sm:py-2.5 pl-3.5 pr-4 sm:pl-4 sm:pr-5 text-xs sm:text-sm font-bold transition duration-200 active:scale-95 ${
              isActive
                ? 'bg-fp-accent text-white shadow-[0_6px_20px_var(--fp-accent-glow)] ring-1 ring-white/20 [&_svg]:!text-white'
                : 'fp-glass text-fp-text hover:bg-[var(--fp-glass-hover)] hover:scale-[1.02]'
            }`}
          >
            {c.icon}
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
