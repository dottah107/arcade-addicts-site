self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('aa-v7').then((c) =>
      c.addAll(['/', '/assets/logo.png'])
    )
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});






// signup-switch 2025-09-26T19:21:58
