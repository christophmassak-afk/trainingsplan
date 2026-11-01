// Offline-Unterstützung für das Trainingstagebuch.
// Seite: zuerst Netz (Updates kommen an), sonst Zwischenspeicher. Bilder und Symbole: zuerst Zwischenspeicher.
const CACHE = "tt-tagebuch-v2";
const GRUND = ["./", "index.html", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(GRUND)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    ev.respondWith(fetch(req).then((res) => {
      const kopie = res.clone();
      caches.open(CACHE).then((c) => c.put("index.html", kopie));
      return res;
    }).catch(() => caches.match("index.html")));
    return;
  }
  ev.respondWith(caches.match(req).then((treffer) => treffer || fetch(req).then((res) => {
    if (res.ok) { const kopie = res.clone(); caches.open(CACHE).then((c) => c.put(req, kopie)); }
    return res;
  })));
});
