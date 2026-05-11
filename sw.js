// FullTime PWA Service Worker v1.0
const CACHE_NAME = 'fulltime-v1';
const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700;900&family=Barlow:wght@300;400;500;600&display=swap'
];

// =====================================================
// INSTALL — Cache static assets
// =====================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Some assets may fail — that's ok
        return Promise.resolve();
      });
    }).then(() => self.skipWaiting())
  );
});

// =====================================================
// ACTIVATE — Clean old caches
// =====================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// =====================================================
// FETCH — Network first, cache fallback
// =====================================================
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin API calls (Firebase, Paystack, Anthropic)
  if (event.request.method !== 'GET') return;
  if (url.hostname.includes('firestore.googleapis.com')) return;
  if (url.hostname.includes('paystack.com')) return;
  if (url.hostname.includes('anthropic.com')) return;
  if (url.hostname.includes('api.sofascore.com')) return;

  // For HTML pages — network first, fallback to cache
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // For everything else — cache first, then network
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => null);
      return cached || networkFetch;
    })
  );
});

// =====================================================
// PUSH NOTIFICATIONS — Goal alerts
// =====================================================
self.addEventListener('push', event => {
  let data = { title: 'FullTime', body: 'Match update!', icon: '/icons/icon-192.png' };
  try { data = event.data.json(); } catch(e) {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'FullTime', {
      body: data.body || 'Match update!',
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'fulltime-update',
      renotify: true,
      data: { url: data.url || '/index.html' },
      actions: [
        { action: 'view', title: 'Watch Now' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data?.url || '/index.html');
    })
  );
});

// =====================================================
// BACKGROUND SYNC — Retry failed requests
// =====================================================
self.addEventListener('sync', event => {
  if (event.tag === 'sync-matches') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SYNC_MATCHES' }));
      })
    );
  }
});
