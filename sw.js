// sw.js - Super simple offline cache
const CACHE = "mochi-v1";

const FILES = [
  "/",
  "/index.html",
  "/mochi.js",
  "/manifest.json",
  "/mochi-192.svg",
  "/mochi-512.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});