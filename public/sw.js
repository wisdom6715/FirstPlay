// FirstPlay PWA Service Worker - Game Launcher Offline Shell
const CACHE_NAME = 'firstplay-pwa-v1';
const PRECACHE_ASSETS = ['/', '/firstplay-logo.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Let network requests pass through, fallback to cache if offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
