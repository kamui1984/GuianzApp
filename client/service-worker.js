self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});

self.addEventListener('fetch', event => {
  // Simple network-first for API, cache-first for static
  if (event.request.url.includes('/api')) {
    event.respondWith(fetch(event.request).catch(() => new Response(JSON.stringify({error: 'offline'}), {headers: {'Content-Type':'application/json'}})));
  } else {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  }
});
