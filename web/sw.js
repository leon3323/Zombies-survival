/**
 * Service Worker for Zombie Survival PWA
 * Enables offline gameplay and caching
 */

const CACHE_NAME = 'zombie-survival-v9';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/touch.js',
    '/zombie-survival.js', // 2. Fixed filename mismatch here
    '/manifest.json',
    '/sw.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching assets');
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.log('[Service Worker] Cache error:', err);
                // Continue even if some files fail to cache
                return ASSETS_TO_CACHE.filter((_, i) => i < 3).forEach(url => {
                    cache.add(url).catch(() => {});
                });
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
            return fetch(event.request).then(response => {
                // Don't cache non-2xx responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }
                
                // Cache successful responses
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                
                return response;
            }).catch(err => {
                // Return offline page or cached version
                console.log('[Service Worker] Fetch failed:', err);
                return caches.match(event.request);
            });
        })
    );
});

// Handle messages from clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        caches.open(CACHE_NAME).then(cache => {
            cache.keys().then(requests => {
                event.ports[0].postMessage({
                    type: 'CACHE_INFO',
                    cacheSize: requests.length
                });
            });
        });
    }
});

// Background sync for saves (future feature)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-game-save') {
        event.waitUntil(
            // Sync game save with server
            new Promise((resolve, reject) => {
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
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // Focus existing window if open
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window if not open
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

console.log('[Service Worker] Loaded');
