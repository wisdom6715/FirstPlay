'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white pt-14 pb-12 sm:pb-16 text-slate-600">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand Info (takes 2 cols on md) */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-8 w-8 overflow-hidden rounded-xl shadow-sm transition group-hover:scale-105">
                <Image
                  src="/icon.png"
                  alt="FirstPlay Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                FirstPlay
              </span>
            </Link>
            <p className="mt-3 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              FIRSTPLAY — Discover and play web games in one place.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 mb-3.5">
              PLATFORM
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <a href="#games" className="hover:text-slate-900 transition">
                  Games
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-slate-900 transition">
                  About
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-slate-900 transition">
                  How it works
                </a>
              </li>
              <li>
                <Link href="/promote" className="hover:text-slate-900 transition">
                  Submit a Game
                </Link>
              </li>
            </ul>
          </div>

          {/* Download Links */}
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 mb-3.5">
              DOWNLOAD
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <a href="#download" className="hover:text-slate-900 transition">
                  App Store
                </a>
              </li>
              <li>
                <a href="#download" className="hover:text-slate-900 transition">
                  Google Play
                </a>
              </li>
              <li>
                <a href="#download" className="hover:text-slate-900 transition">
                  Windows
                </a>
              </li>
              <li>
                <a href="#download" className="hover:text-slate-900 transition">
                  macOS
                </a>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 mb-3.5">
              COMMUNITY
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition"
                >
                  X
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition"
                >
                  Tiktok
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>© 2026 FirstPlay. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-600 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-600 transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
