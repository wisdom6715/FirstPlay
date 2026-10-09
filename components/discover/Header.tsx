'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Menu, X } from 'lucide-react';
import { useDevice } from '@/lib/device';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const device = useDevice();

  const onDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById('find-games-download');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.location.hash = '#find-games-download';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#1422b8] text-white shadow-sm transition group-hover:scale-105">
            <Gamepad2 size={20} className="stroke-[2.2]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            FirstPlay
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a
            href="#games"
            className="hover:text-slate-900 transition-colors duration-150"
          >
            Games
          </a>
          <a
            href="#how-it-works"
            className="hover:text-slate-900 transition-colors duration-150"
          >
            How it works
          </a>
          <a
            href="#about"
            className="hover:text-slate-900 transition-colors duration-150"
          >
            About
          </a>
        </nav>

        {/* CTA Button: Get FirstPlay (Promote removed per user instruction) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={onDownloadClick}
            className="inline-flex items-center justify-center rounded-xl bg-[#1422b8] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            Get FirstPlay
          </button>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={onDownloadClick}
            className="rounded-lg bg-[#1422b8] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
          >
            Get FirstPlay
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 py-4 space-y-3 shadow-lg">
          <a
            href="#games"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-blue-600 py-1"
          >
            Games
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-blue-600 py-1"
          >
            How it works
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-blue-600 py-1"
          >
            About
          </a>
        </div>
      )}
    </header>
  );
}
