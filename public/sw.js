const CACHE_NAME = 'alumnihub-v1';
const urlsToCache = [
  '/',
  '/login',
  '/index.html',
  '/manifest.json',
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Don't fail if some URLs can't be cached
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('Some resources failed to cache:', err);
        });
      })
      .then(() => {
        console.log('Service Worker installed, skipping waiting...');
        return self.skipWaiting();
      })
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - COMPLETELY BYPASS service worker for API calls
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const request = event.request;
  
  // CRITICAL: Don't intercept API calls or non-GET requests AT ALL
  // Simply don't call event.respondWith() - request goes directly to network
  if (
    // Any API endpoint
    url.pathname.startsWith('/api/') ||
    // Any backend server
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('alumni-portal-yw7q') ||
    url.hostname.includes('render.com') ||
    // ANY non-GET request (POST, PUT, DELETE, PATCH, etc.)
    request.method !== 'GET' ||
    // Any request with credentials
    request.credentials === 'include' ||
    // Any request with Authorization header
    request.headers.get('Authorization')
  ) {
    // DO NOTHING - let browser handle request normally
    // Don't call event.respondWith() = service worker ignores this
    return;
  }
  
  // Only handle GET requests for same-origin static assets
  // Only cache if it's a GET request to our own domain
  if (request.method === 'GET' && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Return cached if available
          if (cachedResponse) {
            return cachedResponse;
          }

          // Fetch from network
          return fetch(request).then((response) => {
            // Only cache successful basic responses
            if (response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // Fallback to network if cache fails
          return fetch(request);
        })
    );
  } else {
    // For any other request, don't intercept
    return;
  }
});

