// Minimal service worker: network-first with a cache fallback for the app shell.
// API calls are never cached (financial data must always be live).
const CACHE = 'bookkeeping-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // only same-origin
  if (url.pathname.startsWith('/api')) return       // never cache the API

  e.respondWith((async () => {
    const cache = await caches.open(CACHE)
    try {
      const fresh = await fetch(req)
      cache.put(req, fresh.clone())
      return fresh
    } catch (err) {
      const cached = await cache.match(req)
      if (cached) return cached
      if (req.mode === 'navigate') {
        const shell = (await cache.match('/index.html')) || (await cache.match('/'))
        if (shell) return shell
      }
      throw err
    }
  })())
})
