/**
 * Service Worker for Zombie Survival PWA
 * Enables offline gameplay and caching
 */

const CACHE_NAME = 'zombie-survival-v13';
// Fix: Use relative paths to ensure compatibility with subfolder hosting (e.g., GitHub Pages)
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './touch.js',
    './zombie-survival.js',
    './manifest.json',
    './sw.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching assets');
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.log('[Service Worker] Cache error, falling back to core files:', err);
                // Fix: map to an array of promises and pass them through Promise.all to preserve execution chain
                const coreAssets = ASSETS_TO_CACHE.slice(0, 3);
                return Promise.all(
                    coreAssets.map(url => cache.add(url).catch(() => {}))
                );
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(response => {
            // Return cached response if available
            if (response) {
                return response;
            }
            
            // Otherwise fetch from network
            return fetch(event.request).then(networkResponse => {
                // Don't cache non-2xx responses
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                    return networkResponse;
                }
                
                // Cache successful responses
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                
                return networkResponse;
            }).catch(err => {
                console.log('[Service Worker] Fetch failed:', err);
                // Try fallback to cache again on complete network failure
                return caches.match(event.request);
            });
        })
    );
});

// Handle messages from clients
self.addEventListener('message', event => {
    if (!event.data) return;

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'GET_CACHE_INFO') {
        caches.open(CACHE_NAME).then(cache => {
            cache.keys().then(requests => {
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({
                        type: 'CACHE_INFO',
                        cacheSize: requests.length
                    });
                }
            });
        });
    }
});

// Background sync for saves (future feature)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-game-save') {
        event.waitUntil(
            // Sync game save with server
            new Promise((resolve) => {
                // TODO: Implement save sync
                resolve();
            })
        );
    }
});

// Push notifications (future feature)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Time to play Zombie Survival!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><text y="144" font-size="144" fill="%23ff0000">🧟</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><text y="144" font-size="144" fill="%23ff0000">🧟</text></svg>',
        tag: 'zombie-survival',
        requireInteraction: false
    };
    
    event.waitUntil(
        self.registration.showNotification('Zombie Survival', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    // Fix: Resolve absolute path destination to reliably check window contexts
    const targetUrl = new URL('./', self.location.origin).href;
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Focus existing window if open
            for (let client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window if not open
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});

console.log('[Service Worker] Loaded');
