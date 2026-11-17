// Service worker Windi's Sweet Bakery: membuat game bisa dibuka & dimainkan tanpa internet.
// - Halaman: coba jaringan dulu, kalau gagal pakai salinan tersimpan.
// - File statis (kode, gambar, tekstur, musik, model 3D): pakai cache dulu, lalu jaringan.
// - /api/*: selalu ke jaringan (game sendiri menangani mode offline lewat simpanan di HP).
const ASSET_CACHE = "windi-assets-v2";
const PAGE_CACHE = "windi-pages-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGE_CACHE).then((c) => c.add("/").catch(() => undefined)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== ASSET_CACHE && k !== PAGE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGE_CACHE).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/", { cacheName: PAGE_CACHE }).then((r) => r || Response.error())),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && (url.pathname.startsWith("/_next/static/") || /\.(webp|png|jpg|jpeg|glb|mp3|m4a|mp4|woff2?|webmanifest)$/.test(url.pathname))) {
            const copy = res.clone();
            caches.open(ASSET_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
