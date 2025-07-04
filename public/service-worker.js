// Service Worker for Side by Side Project Visualizer
// This will cache the app shell and audio files for offline use

const CACHE_NAME = 'side-by-side-cache-v1';
const urlsToCache = [
  '/',
  '/audio/ZAO MiDiPunkz MIDI VERSION MIX1.mp3',
  '/audio/ZAO MiDiPunkz ZAO VERSION MIX2.mp3',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - respond with cached assets or fetch new ones
self.addEventListener('fetch', (event) => {
  // For audio file, use cache-first strategy
  if (event.request.url.includes('/audio/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            // Cache the fetched response
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          });
        })
    );
  } else {
    // For other assets, use network-first strategy
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
