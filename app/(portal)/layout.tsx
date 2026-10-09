import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-fp-bg font-display text-fp-text transition-colors duration-300">
      <header className="sticky top-0 z-40 border-b border-fp-line bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/firstplay-logo.png"
                alt="FirstPlay Logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-[22.5%] shadow-md transition group-hover:scale-105"
              />
              <span className="text-lg font-black tracking-tight text-fp-text">FirstPlay</span>
            </Link>
            <span className="hidden sm:inline text-xs text-fp-muted">/ Advertiser Portal</span>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4 text-xs font-bold">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-fp-border bg-fp-glass px-3.5 py-1.5 text-fp-text backdrop-blur-md transition hover:bg-fp-glass-hover"
            >
              <ArrowLeft size={14} /> Back to Discovery
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-[1360px] px-4 py-8 sm:px-8 border-t border-fp-line text-xs text-fp-muted flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>FirstPlay Advertiser & Promotion Operations • Cloud Firebase Backed</span>
        <span>All campaigns subject to verification before catalog dispatch</span>
      </footer>
    </div>
  );
}
