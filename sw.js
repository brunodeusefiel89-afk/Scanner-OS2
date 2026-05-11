const CACHE = 'osscanner-v3';
const ASSETS = ['./index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Requisições à API Anthropic: sempre online, nunca cachear
  if (e.request.url.includes('anthropic.com')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

// Recebe mensagem para sincronizar registros pendentes
self.addEventListener('message', e => {
  if (e.data === 'sync') {
    self.clients.matchAll().then(clients =>
      clients.forEach(c => c.postMessage({ type: 'sync-ready' }))
    );
  }
});
