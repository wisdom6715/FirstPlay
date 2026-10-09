'use client';

import React from 'react';

/**
 * Rich, pixel-faithful illustration components matching the exact visual artwork
 * seen in the FirstPlay mockups (Lagos Life, Monkey Post, Lagos Danfo, Kite Runner, Relay Grid, Solfeggio Drift).
 */

export function LagosLifeHeroArt({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full aspect-[16/10] bg-[#8ec47d] overflow-hidden select-none ${className}`}>
      {/* Background Map Geography */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 320" preserveAspectRatio="none">
        {/* Mainland Landmass */}
        <path d="M0,0 L500,0 L500,320 L0,320 Z" fill="#9ecf8e" />
        {/* Lagoon Waters */}
        <path
          d="M0,110 C120,95 240,140 340,115 C420,95 460,110 500,120 L500,210 C440,200 370,225 290,205 C180,180 80,220 0,210 Z"
          fill="#6bb5da"
        />
        {/* Highway Bridges */}
        <path d="M0,155 L500,155" stroke="#ffffff" strokeWidth="8" strokeOpacity="0.85" />
        <path d="M0,155 L500,155" stroke="#f6c344" strokeWidth="2" strokeDasharray="6 6" />
        <path d="M160,0 L160,320" stroke="#ffffff" strokeWidth="7" strokeOpacity="0.75" />
        <path d="M380,0 L380,320" stroke="#ffffff" strokeWidth="7" strokeOpacity="0.75" />
        {/* Water ripples */}
        <path d="M120,135 Q140,130 160,135" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
        <path d="M220,180 Q240,175 260,180" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
        <path d="M380,140 Q400,135 420,140" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
      </svg>

      {/* Top Map Label */}
      <div className="absolute top-2 left-6 text-[10px] font-black tracking-widest text-[#5a8050] uppercase opacity-75">
        MAINLAND
      </div>

      {/* Map Landmark Pins */}
      {/* Afrika Shrine */}
      <div className="absolute top-4 left-3 sm:left-4 z-10 flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 shadow-sm text-[10px] font-bold text-slate-800 border border-slate-100">
        <span className="text-amber-500">✓</span> Afrika Shrine
      </div>

      {/* Amala Shitta */}
      <div className="absolute top-8 left-[36%] z-10 flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 shadow-sm text-[10px] font-bold text-slate-800 border border-slate-100">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Amala Shitta
      </div>

      {/* CcHub */}
      <div className="absolute top-6 right-8 sm:right-10 z-10 flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 shadow-sm text-[10px] font-bold text-slate-800 border border-slate-100">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> CcHub
      </div>

      {/* Quilox */}
      <div className="absolute top-[48%] right-5 sm:right-6 z-10 flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 shadow-sm text-[10px] font-bold text-slate-800 border border-slate-100">
        <span className="text-amber-500">💡</span> Quilox
      </div>

      {/* The Palm */}
      <div className="absolute bottom-16 right-2 sm:right-4 z-10 flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 shadow-sm text-[10px] font-bold text-slate-800 border border-slate-100">
        <span className="text-rose-500">📍</span> The Palm
      </div>

      {/* Elegushi */}
      <div className="absolute bottom-6 right-10 sm:right-14 z-10 flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 shadow-sm text-[10px] font-bold text-slate-800 border border-slate-100">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Elegushi
      </div>

      {/* Balogun */}
      <div className="absolute top-[52%] left-3 sm:left-4 z-10 flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 shadow-sm text-[10px] font-bold text-slate-800 border border-slate-100">
        <span className="text-red-500">📍</span> Balogun
      </div>

      {/* Freedom Park */}
      <div className="absolute bottom-10 left-4 sm:left-6 z-10 flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 shadow-sm text-[10px] font-bold text-slate-800 border border-slate-100">
        <span className="text-emerald-500">🌱</span> Freedom Park
      </div>

      {/* Center Lagos Life Brand Card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[68%] max-w-[240px] bg-white/98 rounded-2xl p-3 sm:p-4 text-center shadow-xl border border-white">
        <div className="mx-auto flex items-center justify-center text-amber-500 text-xl sm:text-2xl drop-shadow-sm">
          👑
        </div>
        <h3 className="text-base sm:text-xl font-black tracking-tight text-slate-900 mt-0.5">
          Lagos Life
        </h3>
        <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
          Live your Lagos story.
        </p>
        <div className="mt-2 inline-flex items-center rounded-full bg-[#10b981] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-sm">
          lagoslife.app
        </div>
      </div>
    </div>
  );
}

export function LagosLifeSpotlightArt({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full aspect-[16/10] bg-[#114b3f] overflow-hidden select-none ${className}`}>
      {/* Twilight Skyline Art with Third Mainland Bridge & Danfo */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 375" preserveAspectRatio="none">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b382f" />
            <stop offset="60%" stopColor="#145547" />
            <stop offset="100%" stopColor="#1b6b59" />
          </linearGradient>
          <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a2c25" />
            <stop offset="100%" stopColor="#061c17" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="600" height="375" fill="url(#skyGrad)" />

        {/* Sunset Sun */}
        <circle cx="510" cy="275" r="42" fill="url(#sunGrad)" opacity="0.9" />

        {/* City Skyline Silhouette */}
        <path
          d="M0,285 L40,285 L40,255 L65,255 L65,285 L110,285 L110,230 L135,230 L135,285 L180,285 L180,240 L210,240 L210,285 L280,285 L320,285 L320,220 L350,220 L350,285 L400,285 L450,285 L490,285 L600,285 L600,375 L0,375 Z"
          fill="#06221c"
          opacity="0.85"
        />

        {/* Third Mainland Bridge Silhouette */}
        <path
          d="M120,320 L600,280"
          stroke="#093128"
          strokeWidth="6"
        />
        {/* Bridge Pillars */}
        <line x1="220" y1="310" x2="220" y2="350" stroke="#093128" strokeWidth="4" />
        <line x1="330" y1="300" x2="330" y2="350" stroke="#093128" strokeWidth="4" />
        <line x1="440" y1="290" x2="440" y2="350" stroke="#093128" strokeWidth="4" />
        <line x1="530" y1="285" x2="530" y2="350" stroke="#093128" strokeWidth="4" />
        {/* Suspension Cables */}
        <path d="M220,310 Q275,285 330,300" stroke="#0e4438" strokeWidth="2" fill="none" />
        <path d="M330,300 Q385,275 440,290" stroke="#0e4438" strokeWidth="2" fill="none" />
        <path d="M440,290 Q485,270 530,285" stroke="#0e4438" strokeWidth="2" fill="none" />

        {/* Palm Tree Silhouettes */}
        <g fill="#072b23">
          {/* Palm 1 */}
          <path d="M40,320 Q48,270 50,230 C30,225 15,245 10,250 C20,235 38,220 50,230 C58,215 75,220 90,230 C75,230 60,235 50,230 C55,245 60,260 65,270 C55,255 52,240 50,230 Z" />
          {/* Palm 2 */}
          <path d="M90,330 Q96,285 100,250 C80,245 70,260 65,265 C75,252 88,240 100,250 C108,238 122,242 135,250 C122,250 110,255 100,250 C104,262 108,275 110,285 Z" />
        </g>

        {/* Lagoon Water Base */}
        <rect y="325" width="600" height="50" fill="url(#waterGrad)" />

        {/* Small Yellow Danfo Bus on Bridge */}
        <g transform="translate(370, 275) scale(0.65)">
          <rect x="0" y="0" width="36" height="18" rx="3" fill="#facc15" />
          <rect x="4" y="3" width="7" height="6" fill="#1e293b" />
          <rect x="14" y="3" width="7" height="6" fill="#1e293b" />
          <rect x="24" y="3" width="8" height="6" fill="#1e293b" />
          {/* Danfo black stripe */}
          <rect x="0" y="11" width="36" height="2" fill="#0f172a" />
          {/* Wheels */}
          <circle cx="8" cy="18" r="4" fill="#0f172a" />
          <circle cx="28" cy="18" r="4" fill="#0f172a" />
        </g>
      </svg>

      {/* Center Big Bold LAGOS LIFE Logo & Crown */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="text-3xl sm:text-4xl drop-shadow-lg mb-1">
          👑
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-[#facc15] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] uppercase">
          LAGOS LIFE
        </h2>
      </div>
    </div>
  );
}

export function MonkeyPostArt({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full aspect-[16/10] bg-[#eef2f6] overflow-hidden select-none ${className}`}>
      {/* Background Court / Pitch */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mpBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>
        <rect width="500" height="320" fill="url(#mpBg)" />
        {/* Street Soccer Pitch Ellipses */}
        <ellipse cx="140" cy="240" rx="45" ry="14" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" opacity="0.8" />
        <ellipse cx="260" cy="245" rx="50" ry="15" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" opacity="0.8" />
        <ellipse cx="370" cy="240" rx="45" ry="14" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" opacity="0.8" />
        {/* Background wall line */}
        <line x1="0" y1="180" x2="500" y2="180" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {/* Top Left Title Stamp */}
      <div className="absolute top-3 left-4 z-10">
        <div className="text-xs sm:text-sm font-black tracking-tighter text-slate-900 leading-none">
          MONKEY
        </div>
        <div className="text-xs sm:text-sm font-black tracking-tighter text-slate-900 leading-none">
          POST
        </div>
        <div className="mt-1 bg-amber-400 text-slate-900 text-[8px] font-black uppercase px-1 py-0.5 rounded tracking-wider inline-block">
          AN OUR STREET, OUR GAME
        </div>
      </div>

      {/* 3 Street Players on Podiums */}
      <div className="absolute bottom-4 left-0 right-0 flex items-end justify-center gap-6 sm:gap-10 z-10">
        {/* Player 1 (Blue/White Kit) */}
        <div className="flex flex-col items-center">
          <div className="h-24 sm:h-28 w-10 sm:w-12 relative flex flex-col items-center">
            {/* Head */}
            <div className="h-5 w-5 rounded-full bg-[#8d5b4c] shadow-sm" />
            {/* Body / Jersey */}
            <div className="w-8 h-12 bg-sky-500 rounded-t-md mt-0.5 border-t-2 border-white flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">10</span>
            </div>
            {/* Shorts */}
            <div className="w-7 h-6 bg-white rounded-b-sm" />
            {/* Legs */}
            <div className="w-5 flex justify-between">
              <div className="w-1.5 h-6 bg-[#8d5b4c]" />
              <div className="w-1.5 h-6 bg-[#8d5b4c]" />
            </div>
          </div>
        </div>

        {/* Player 2 (Green/Yellow Kit) */}
        <div className="flex flex-col items-center">
          <div className="h-28 sm:h-32 w-10 sm:w-12 relative flex flex-col items-center">
            {/* Head */}
            <div className="h-5 w-5 rounded-full bg-[#5c3a21] shadow-sm" />
            {/* Jersey */}
            <div className="w-8 h-14 bg-emerald-500 rounded-t-md mt-0.5 border-l-4 border-yellow-400 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">7</span>
            </div>
            {/* Shorts */}
            <div className="w-7 h-6 bg-emerald-700 rounded-b-sm" />
            {/* Legs */}
            <div className="w-5 flex justify-between">
              <div className="w-1.5 h-7 bg-[#5c3a21]" />
              <div className="w-1.5 h-7 bg-[#5c3a21]" />
            </div>
          </div>
        </div>

        {/* Player 3 (Red/Black Stripes) */}
        <div className="flex flex-col items-center">
          <div className="h-24 sm:h-28 w-10 sm:w-12 relative flex flex-col items-center">
            {/* Head */}
            <div className="h-5 w-5 rounded-full bg-[#784635] shadow-sm" />
            {/* Jersey */}
            <div className="w-8 h-12 bg-red-600 rounded-t-md mt-0.5 border-x-4 border-black flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">9</span>
            </div>
            {/* Shorts */}
            <div className="w-7 h-6 bg-black rounded-b-sm" />
            {/* Legs */}
            <div className="w-5 flex justify-between">
              <div className="w-1.5 h-6 bg-[#784635]" />
              <div className="w-1.5 h-6 bg-[#784635]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LagosDanfoArt({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full aspect-[16/10] bg-[#eab308] overflow-hidden select-none ${className}`}>
      {/* Cartoon Danfo Bus Action Scene */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="danfoSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
        </defs>
        <rect width="500" height="320" fill="url(#danfoSky)" />
        {/* Dusty Lagos Road */}
        <polygon points="0,320 180,190 320,190 500,320" fill="#78350f" opacity="0.6" />
        <polygon points="40,320 210,190 290,190 460,320" fill="#92400e" opacity="0.8" />
        {/* Road center dash */}
        <polygon points="245,190 255,190 260,320 240,320" fill="#fef08a" opacity="0.7" />
        {/* Distant palm trees */}
        <path d="M40,190 Q44,165 45,145 C35,142 25,152 20,155 C28,145 38,138 45,145 C50,135 62,138 70,145 Z" fill="#451a03" />
        <path d="M440,190 Q444,165 445,145 C435,142 425,152 420,155 C428,145 438,138 445,145 C450,135 462,138 470,145 Z" fill="#451a03" />
      </svg>

      {/* Top Banner Tag */}
      <div className="absolute top-3 left-3 z-10">
        <div className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
          LAGOS RUN
        </div>
        <div className="text-[10px] font-bold text-amber-200 drop-shadow">
          Keep the danfo moving
        </div>
      </div>

      {/* Front-Facing Isometric Danfo Bus Illustration */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pt-6">
        <div className="relative w-44 sm:w-52 h-32 sm:h-36 bg-amber-400 rounded-2xl border-4 border-amber-500 shadow-2xl flex flex-col justify-between p-2">
          {/* Danfo Windshield */}
          <div className="w-full h-14 bg-sky-200/90 rounded-lg border-2 border-amber-600 flex items-center justify-around px-2 relative overflow-hidden">
            <div className="w-12 h-8 rounded-full bg-slate-800 self-end -mb-2" />
            <div className="w-12 h-8 rounded-full bg-slate-800 self-end -mb-2" />
            {/* Mirror glare */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />
          </div>

          {/* Danfo Signature Black Stripes */}
          <div className="w-full h-3 bg-slate-900 rounded my-1 flex items-center justify-center">
            <span className="text-[7px] font-black text-amber-400 uppercase tracking-widest">OSHODI // CMS</span>
          </div>

          {/* Grille and Headlights */}
          <div className="flex items-center justify-between px-1">
            <div className="w-6 h-6 rounded-full bg-white border-2 border-amber-500 shadow-inner flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-300" />
            </div>
            <div className="h-5 flex-1 mx-2 bg-slate-800 rounded border border-slate-700 flex flex-col justify-around py-0.5 px-1">
              <div className="h-0.5 bg-slate-600 w-full" />
              <div className="h-0.5 bg-slate-600 w-full" />
              <div className="h-0.5 bg-slate-600 w-full" />
            </div>
            <div className="w-6 h-6 rounded-full bg-white border-2 border-amber-500 shadow-inner flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-300" />
            </div>
          </div>

          {/* Wheels */}
          <div className="absolute -bottom-3 left-4 w-9 h-7 bg-slate-900 rounded-md border-2 border-slate-800 shadow-lg" />
          <div className="absolute -bottom-3 right-4 w-9 h-7 bg-slate-900 rounded-md border-2 border-slate-800 shadow-lg" />
        </div>
      </div>
    </div>
  );
}

export function KiteRunnerArt({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full aspect-[16/10] bg-[#38bdf8] overflow-hidden select-none ${className}`}>
      {/* Seaside Cliffs and Flying Kites Scene */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="krSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="50%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>
        <rect width="500" height="320" fill="url(#krSky)" />
        {/* Ocean on Right */}
        <path d="M260,160 L500,160 L500,320 L260,320 Z" fill="url(#seaGrad)" />
        {/* Rolling Hills Cliffs on Left */}
        <path
          d="M0,130 C120,110 210,140 260,180 C290,200 310,240 330,320 L0,320 Z"
          fill="#4ade80"
        />
        <path
          d="M0,170 C100,150 180,180 230,230 C260,260 270,300 280,320 L0,320 Z"
          fill="#22c55e"
        />
        {/* Cliff Rock Edge */}
        <path d="M260,180 L280,240 L310,270 L330,320 L280,320 Z" fill="#854d0e" opacity="0.6" />
      </svg>

      {/* Floating Kites */}
      <div className="absolute top-5 right-20 sm:right-28 animate-pulse">
        {/* Kite 1 */}
        <div className="relative w-7 h-7 bg-rose-500 rotate-45 shadow-md flex items-center justify-center">
          <div className="w-full h-0.5 bg-white/70 absolute" />
          <div className="h-full w-0.5 bg-white/70 absolute" />
        </div>
      </div>
      <div className="absolute top-12 right-10">
        {/* Kite 2 */}
        <div className="relative w-5 h-5 bg-amber-400 rotate-45 shadow-sm">
          <div className="w-full h-0.5 bg-white/70 absolute top-1/2" />
        </div>
      </div>
      <div className="absolute top-16 right-36">
        {/* Kite 3 */}
        <div className="relative w-4 h-4 bg-purple-500 rotate-45 shadow-sm" />
      </div>
    </div>
  );
}

export function RelayGridArt({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full aspect-[16/10] bg-[#0c1222] overflow-hidden select-none ${className}`}>
      {/* 3D Isometric Neon Circuit Board Scene */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="neonCyan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="neonPurple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Ambient Dark Grid Background */}
        <rect width="500" height="320" fill="#090d1a" />

        {/* Isometric Board */}
        <g transform="translate(250, 160) scale(1.1)">
          {/* Base Isometric Plate */}
          <polygon
            points="0,-60 140,20 0,100 -140,20"
            fill="#111827"
            stroke="#1e293b"
            strokeWidth="3"
          />

          {/* Circuit Tracks */}
          <path
            d="M-80,0 L0,-40 L80,0 L0,40 Z"
            fill="none"
            stroke="url(#neonCyan)"
            strokeWidth="3"
          />
          <path
            d="M-50,15 L0,-10 L50,15 L0,40 Z"
            fill="none"
            stroke="url(#neonPurple)"
            strokeWidth="2.5"
          />

          {/* Central Cube / Node */}
          <polygon points="0,-10 20,2 0,14 -20,2" fill="#06b6d4" opacity="0.9" />
          <polygon points="0,14 20,2 20,18 0,30" fill="#0891b2" />
          <polygon points="0,14 -20,2 -20,18 0,30" fill="#0e7490" />

          {/* Light Pillars */}
          <line x1="0" y1="-10" x2="0" y2="-45" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
        </g>
      </svg>

      {/* Brand Header Label */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 text-center text-white z-10">
        <span className="text-[10px] font-bold text-slate-300">
          FirstPlay — Discover and Play Web Games
        </span>
      </div>
    </div>
  );
}

export function SolfeggioDriftArt({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full aspect-[16/10] bg-[#1a0f2e] overflow-hidden select-none ${className}`}>
      {/* Harmonic Wave Audio Visualizer Scene */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wavePink" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="bgGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e1065" />
            <stop offset="60%" stopColor="#3b0764" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>

        <rect width="500" height="320" fill="url(#bgGlow)" />

        {/* Ambient Ring Glow */}
        <circle cx="250" cy="160" r="85" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeOpacity="0.4" />
        <circle cx="250" cy="160" r="115" fill="none" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.3" />

        {/* Sine Waves */}
        <path
          d="M0,160 Q70,90 140,160 T280,160 T420,160 T500,160"
          fill="none"
          stroke="url(#wavePink)"
          strokeWidth="3.5"
        />
        <path
          d="M0,160 Q60,210 130,160 T270,160 T400,160 T500,160"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeOpacity="0.8"
        />
      </svg>

      {/* Center Track Title */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="text-sm sm:text-base font-black tracking-widest text-white uppercase drop-shadow">
          ECHO // PULSE
        </div>
      </div>
    </div>
  );
}
