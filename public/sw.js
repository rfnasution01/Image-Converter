const CACHE_NAME = 'pixconvertly-pwa-v1';

const APP_SHELL_URLS = [
  '/',
  '/favicon.ico',
  '/favicon/site.webmanifest',
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-512x512.png',
  '/favicon/apple-touch-icon.png',
];

const getNextStaticUrls = (html) => {
  const matches = html.match(/\/?_next\/static\/[^"'<>\\\s]+/g) ?? [];
  return [...new Set(matches.map((url) => (url.startsWith('/') ? url : `/${url}`)))];
};

const cacheAppShell = async () => {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL_URLS);

  const shellResponse = await fetch('/', { cache: 'reload' });

  if (!shellResponse.ok) {
    return;
  }

  await cache.put('/', shellResponse.clone());
  const shellHtml = await shellResponse.text();
  const nextStaticUrls = getNextStaticUrls(shellHtml);

  await Promise.all(
    nextStaticUrls.map((url) =>
      cache.add(url).catch(() => {
        // Ignore optional chunk cache failures; runtime caching will retry later.
      }),
    ),
  );
};

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const isCacheableStaticRequest = (request) => {
  const url = new URL(request.url);

  return (
    url.origin === self.location.origin &&
    ['font', 'image', 'manifest', 'script', 'style', 'worker'].includes(request.destination)
  );
};

const fetchAndCache = async (request, cacheKey = request) => {
  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(cacheKey, response.clone());
  }

  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || !['http:', 'https:'].includes(url.protocol)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetchAndCache(request, '/')
        .catch(async () => {
          const cachedPage = await caches.match(request);
          return cachedPage ?? caches.match('/') ?? Response.error();
        }),
    );
    return;
  }

  if (isCacheableStaticRequest(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => cachedResponse ?? fetchAndCache(request)),
    );
  }
});
