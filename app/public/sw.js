// Service Worker pour MathUnivers PWA
// Gère le cache et les routes pour le base path /mathsite/

const CACHE_NAME = 'mathunivers-v2';

// Détecter le base path depuis l'URL du service worker
const getBasePath = () => {
  const swUrl = self.location.href;
  const match = swUrl.match(/^(.*\/mathsite\/)/);
  return match ? match[1] : '/';
};

const BASE_PATH = getBasePath();

// Ressources à mettre en cache (chemins relatifs)
const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  console.log('[SW] Base path:', BASE_PATH);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache ouvert, ajout des assets:', STATIC_ASSETS);
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => console.error('[SW] Erreur cache:', err))
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache : Network First, puis Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ne pas intercepter les requêtes API Supabase
  if (url.hostname.includes('supabase.co')) {
    return;
  }
  
  // Ne pas intercepter les requêtes externes (autres domaines)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests (chargement de page)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // En cas d'erreur réseau, retourner index.html depuis le cache
          return caches.match('./index.html').then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback si index.html n'est pas dans le cache
            return caches.match('./');
          });
        })
    );
    return;
  }

  // Pour les autres requêtes (assets, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Retourner depuis le cache si disponible
      if (cachedResponse) {
        // Mettre à jour le cache en arrière-plan
        fetch(request)
          .then((response) => {
            if (response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Sinon, fetch depuis le réseau
      return fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.error('[SW] Fetch failed:', error);
          throw error;
        });
    })
  );
});
