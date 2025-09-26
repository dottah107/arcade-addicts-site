self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('aa-v4').then((c) =>
      c.addAll(['/', '/assets/logo.png'])
    )
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});


