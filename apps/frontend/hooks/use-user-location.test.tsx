import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUserLocation } from './use-user-location';

const originalNavigator = global.navigator;

afterEach(() => {
  vi.restoreAllMocks();

  Object.defineProperty(global, 'navigator', {
    configurable: true,
    value: originalNavigator,
  });
});

describe('useUserLocation', () => {
  it('expoe erro amigavel quando a geolocalizacao falha por permissao', async () => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        geolocation: {
          getCurrentPosition: vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
            error({
              code: 1,
              message: 'denied',
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            } as GeolocationPositionError);
          }),
        },
      },
    });

    const { result } = renderHook(() => useUserLocation());

    await act(async () => {
      await result.current.requestLocation();
    });

    expect(result.current.location).toBeNull();
    expect(result.current.error).toContain('Permissao de localizacao negada');
  });
});
