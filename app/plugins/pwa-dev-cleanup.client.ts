import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(() => {
  if (!import.meta.dev || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  if (!import.meta.client) {
    return;
  }

  const registerCleanup = () => {
    window.addEventListener('load', async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          const scriptURL = registration.active?.scriptURL ?? registration.installing?.scriptURL ?? registration.waiting?.scriptURL;
          if (!scriptURL || scriptURL.includes('dev-sw.js')) {
            await registration.unregister();
          }
        }

        if ('caches' in window) {
          const keys = await caches.keys();
          for (const key of keys) {
            if (key.startsWith('workbox-') || key.includes('monetraq')) {
              await caches.delete(key);
            }
          }
        }
      } catch (error) {
        console.warn('[Monetraq] Failed to cleanup service workers during dev', error);
      }
    });
  };

  if (document.readyState === 'complete') {
    registerCleanup();
  } else {
    window.addEventListener('DOMContentLoaded', registerCleanup, { once: true });
  }
});