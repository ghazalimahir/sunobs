// PENTING: tukar nilai CACHE ini pada SETIAP kali app.js/style.css/index.html
// diubah. Kalau fail ni sendiri tak berubah, pelayar akan terus guna
// cache lama selama-lamanya walaupun fail lain dah dikemaskini di GitHub.
const CACHE = "sunobs-mobile-v2-0-0-ui-refresh";
const ASSETS = [
  "./", "./index.html", "./style.css", "./app.js",
  "./coefficients.json", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (e.request.url.includes("coefficients.json")) {
        return fetch(e.request)
          .then(res => {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
            return res;
          })
          .catch(() => cached);
      }
      return cached || fetch(e.request);
    })
  );
});
