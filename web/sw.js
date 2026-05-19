/**
 * Service Worker for Zombie Survival PWA
 * Enables offline gameplay and caching
 */

const CACHE_NAME = 'zombie-survival-v14';
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
                const coreAssets = ASSETS_TO_CACHE.slice(0, 3);
                return Promise.all(
                    coreAssets.map(url => cache.add(url).catch(() => {}))
                );
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches cleanly
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            
            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                    return networkResponse;
                }
                
                const responseToCache = networkResponse.clone();
                // Fix: wrapped in event.waitUntil to keep worker alive during cache write
                event.waitUntil(
                    caches.open(CACHE_NAME).then(cache => {
                        return cache.put(event.request, responseToCache);
                    }).catch(err => console.error('[Service Worker] Dynamic cache put failed:', err))
                );
                
                return networkResponse;
            }).catch(err => {
                console.log('[Service Worker] Fetch failed:', err);
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
    
    const targetUrl = new URL('./', self.location.origin).href;
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (let client of clientList) {
                // Better matching logic covering trailing slash variants or index files
                const clientUrl = new URL(client.url, self.location.origin).href;
                if ((clientUrl === targetUrl || clientUrl.endsWith('/index.html')) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});

console.log('[Service Worker] Loaded');
