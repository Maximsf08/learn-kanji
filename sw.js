/* Learn Kanji offline worker (cache names keep the code name kakitori): serves the app from cache so it works without a connection. */
const VERSION = '1.2.1-0a22ee7af0';
const CACHE = 'kakitori-' + VERSION;
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./privacy.html", "./fonts/klee-one-400.woff2", "./fonts/klee-one-600.woff2", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon.svg", "./icons/maskable-512.png"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(a => new Request(a, { cache: 'reload' })))));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('kakitori-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => { if (event.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cached = await caches.match('./index.html');
      if (cached) return cached;
      try { return await fetch(req); } catch (e) { return new Response('Learn Kanji is offline and not cached yet.', { status: 503 }); }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) return cached;
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') {
      const cache = await caches.open(CACHE);
      cache.put(req, res.clone());
    }
    return res;
  })());
});
