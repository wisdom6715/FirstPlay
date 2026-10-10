# FirstPlay Web

FirstPlay Web is the browser edition of FirstPlay — a curated marketplace and launcher for African web games, web applications, and digital products.

## Technology Stack
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 + Liquid Apple Glass Design System
- **Database & Services**: Firebase v11 (Firestore, Firebase Analytics, Firebase Storage)
- **Icons**: Lucide React
- **Player Runtime**: Sandboxed HTML5 Web Iframe with Pointer Lock, Fullscreen, and WebGL support

## Features & Screen Parity
1. **Discover**:
   - 15-second rotating ad banner with Danfo Run, Deadshot.io, and Lagos Life.
   - Dual featured cards: *Games We Love* (Lagos Life) and *Featured App* (Danfo Run).
   - Ranked game rails with See All: *Top Games*, *Trending*, and *New Games*.
2. **Categories**:
   - Featured Shooter carousel banner (Deadshot.io).
   - Category filter pills: All Categories, Top Games, Trending, New Games, Action & Shooters.
3. **Favourites & Library**:
   - Recent plays tracking with quick clear history.
   - Local saved favourites collection.
4. **Game Player (`PlayerView`)**:
   - Embedded sandboxed browser player supporting instant zero-install gameplay.
   - Fullscreen immersion mode, HUD controls (Back to Store, Reload, Fullscreen, External Tab).
5. **Details Modal (`DetailsModal`)**:
   - Extended game metadata: Developer, Category, Origin, Runtime (Sandboxed Web), About section, and action buttons.
6. **Live Firebase Sync**:
   - Direct real-time sync with `firstplay-7bd63` Firestore `apps`, `listings`, and `promotion_banner` collections.
   - Offline-resilient local cache fallback.

## Quick Start
```bash
# Install dependencies
npm install

# Start local web development server (http://localhost:3000)
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
