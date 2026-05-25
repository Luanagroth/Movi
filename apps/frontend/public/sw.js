const STATIC_CACHE = 'cityline-static-v2';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/icons/cityline-icon-180.svg',
  '/icons/cityline-icon-192.svg',
  '/icons/cityline-icon-512.svg',
  '/icons/cityline-maskable-512.svg',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.filter((cacheName) => cacheName !== STATIC_CACHE).map((cacheName) => caches.delete(cacheName)))
      )
      .then(() => self.clients.claim())
  );
});

const isCacheableStaticAsset = (request, url) => {
  if (request.method !== 'GET') return false;
  if (url.origin !== self.location.origin) return false;

  return (
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.svg' ||
    url.pathname === '/favicon.ico' ||
    request.destination === 'font' ||
    request.destination === 'image'
  );
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  if (!isCacheableStaticAsset(request, url)) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || !networkResponse.ok) return networkResponse;

        const responseToCache = networkResponse.clone();
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
