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






// recovery-redirect bust 2025-09-26T02:00:37

// recovery-redirect bust 2025-09-26T02:03:34

// reset-flow bust 2025-09-26T02:11:57

