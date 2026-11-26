/* 静态导出的离线缓存。改版时必须递增 CACHE 版本号，旧缓存会在 activate 时清理。 */
const CACHE = "bookkeeping-v3";
const CORE = [
  "/",
  "/index.html",
  "/add.html",
  "/habits.html",
  "/more.html",
  "/budgets.html",
  "/settings.html",
  "/history.html",
  "/todos.html",
  "/recurring.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  // 逐条写入：某条 404 时不会像 addAll 那样整批失败（旧的 /stats.html 就是这样把预缓存拖垮的）。
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(CORE.map((url) => cache.add(new Request(url, { cache: "reload" })).catch(() => undefined))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

const isImmutable = (url) => url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(url.pathname);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 构建产物文件名带 hash，可直接命中缓存，避免每次回源。
  if (isImmutable(url)) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => undefined);
        return res;
      })),
    );
    return;
  }

  // 页面与其它资源：网络优先，离线回退缓存；导航请求再兜底到缓存首页。
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => undefined);
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        if (req.mode === "navigate") {
          const fallback = (await caches.match("/index.html")) || (await caches.match("/"));
          if (fallback) return fallback;
        }
        return Response.error();
      }),
  );
});
