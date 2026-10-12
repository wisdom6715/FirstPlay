// FirstPlay Progressive Web App Service Worker
const CACHE_NAME = 'firstplay-pwa-v3';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  '/icon-48.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('[PWA SW] Precache skipped for:', asset, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // 1. Completely bypass service worker in local dev environments (localhost / 127.0.0.1)
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    return;
  }

  // 2. Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 3. Explicitly NEVER intercept Firestore, Auth, Analytics, or any streaming/API connections
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('analytics.google.com') ||
    url.pathname.includes('/Listen/') ||
    url.pathname.includes('channel')
  ) {
    return;
  }

  // 4. Same-origin static assets: Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 5. Cross-origin static assets ONLY: Google Fonts & Firebase Storage images
  const isGoogleFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  const isFirebaseImage = url.hostname === 'firebasestorage.googleapis.com' && 
    (event.request.destination === 'image' || url.pathname.includes('/o/promotions') || url.pathname.includes('/FirstPlay/'));

  if (isGoogleFont || isFirebaseImage) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Never return null to respondWith!
            return new Response('', { status: 408, statusText: 'Request Timeout' });
          });
      })
    );
  }
});
