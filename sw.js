/* Plaque Attack offline support: the whole game is cached so it plays on a
   train with no signal. Network first (so updates arrive), cache as backup. */
const CACHE = "plaque-attack-v1";
const FILES = [
  "./", "index.html", "css/style.css", "manifest.webmanifest", "icons/icon-192.png",
  "js/main.js", "js/engine.js", "js/render.js", "js/input.js", "js/audio.js", "js/save.js", "js/rng.js", "js/codex.js",
  "js/data/teeth.js", "js/data/instruments.js", "js/data/conditions.js", "js/data/cases.js", "js/data/quiz.js",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match("index.html"))),
  );
});
