'use client';

import { useEffect } from 'react';

async function cleanupDevServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch {
    // noop
  }

  if (!('caches' in window)) return;

  try {
    const cacheNames = await caches.keys();
    const cityLineCaches = cacheNames.filter((cacheName) => cacheName.startsWith('cityline-'));
    await Promise.all(cityLineCaches.map((cacheName) => caches.delete(cacheName)));
  } catch {
    // noop
  }
}

export function PwaServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      void cleanupDevServiceWorkers();
      return;
    }
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;

    const registerServiceWorker = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
        console.error('Falha ao registrar o service worker do MOVI.', error);
      });
    };

    window.addEventListener('load', registerServiceWorker);

    return () => {
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  return null;
}
