
// Threshold Service Worker
const CACHE_NAME = 'threshold-v1';

// Install — cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/threshold/',
        '/threshold/index.html',
        '/threshold/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Handle timer messages from the main app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TIMER_HALFWAY') {
    self.registration.showNotification('Threshold', {
      body: 'Half your time has passed. Are you still here with purpose?',
      icon: '/threshold/icon-192.png',
      badge: '/threshold/icon-192.png',
      tag: 'threshold-checkin',
      renotify: true,
      requireInteraction: true
    });
  }

  if (event.data && event.data.type === 'TIMER_COMPLETE') {
    self.registration.showNotification('Threshold', {
      body: event.data.message || 'Your time is complete. Step back across.',
      icon: '/threshold/icon-192.png',
      badge: '/threshold/icon-192.png',
      tag: 'threshold-complete',
      renotify: true,
      requireInteraction: true
    });
  }
});

// Notification click — open the app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/threshold') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/threshold/');
      }
    })
  );
});
