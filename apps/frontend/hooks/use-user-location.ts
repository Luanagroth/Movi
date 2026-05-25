'use client';

import { useCallback, useState } from 'react';
import type { GeoPoint } from '@cityline/shared';

export function useUserLocation() {
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const requestLocation = useCallback(async () => {
    if (!supported) {
      setError('Geolocalizacao nao esta disponivel neste navegador.');
      return;
    }

    setIsLoading(true);
    setError(null);

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
          resolve();
        },
        (geoError) => {
          setError(
            geoError.code === geoError.PERMISSION_DENIED
              ? 'Permissao de localizacao negada. Libere o acesso para ver os pontos proximos.'
              : 'Nao foi possivel obter sua localizacao agora.'
          );
          setIsLoading(false);
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, [supported]);

  return {
    supported,
    location,
    isLoading,
    error,
    requestLocation,
  };
}
