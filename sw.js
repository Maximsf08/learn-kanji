/* Learn Kanji's earlier address. The web version that lived here has moved (to the Microsoft Store, and to the
   web edition at the new address). This service worker replaces its offline one: it deletes the old cached copy of
   the web app, unregisters itself, and sends any open page to the notice (index.html), which hands the progress
   on. The query string keeps the browser's HTTP cache from handing back the old page, which would register this
   worker again. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // the earlier web version's caches only ('kakitori-web-' is the web edition's, never kept at this address)
    for (const key of await caches.keys()) if (key.startsWith('kakitori-') && !key.startsWith('kakitori-web-')) await caches.delete(key);
    await self.registration.unregister();
    const notice = new URL('./?moved=1', self.registration.scope).href;
    for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(notice);
  })());
});
