// sw.js - Enhanced PWA service worker with better caching strategy
const CACHE_NAME = "mochi-v3";
const STATIC_CACHE = "mochi-static-v3";
const RUNTIME_CACHE = "mochi-runtime-v3";

// Files to cache statically
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/mochi-192.svg",
  "/mochi-512.svg",
  "/sw.js",
  "/cameras.csv"
];

// Install event - cache static assets
self.addEventListener("install", event => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Immediately take control
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", event => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE)
          .map(cacheName => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => self.clients.claim()) // Take control of all clients
  );
});

// Fetch event - handle requests with cache-first strategy
self.addEventListener("fetch", event => {
  // Skip non-GET requests and requests to other origins
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For HTML requests, try network first, then cache
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the new version
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(response => response || caches.match('/index.html'));
        })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Otherwise, fetch from network
        return fetch(event.request).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response to store in cache
          const responseToCache = response.clone();

          caches.open(RUNTIME_CACHE)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Listen for push notifications
self.addEventListener('push', event => {
  console.log('Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Mochi is here!',
    icon: 'mochi-192.svg',
    badge: 'mochi-192.svg',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('Dasai Mochi', options)
  );
});

// Listen for notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});