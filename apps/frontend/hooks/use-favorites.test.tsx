import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/auth/auth.service', () => ({
  loadStoredAuthSession: vi.fn(),
}));

vi.mock('@/services/transport/transport.service', () => ({
  createFavorite: vi.fn(),
  getFavorites: vi.fn(),
  removeFavorite: vi.fn(),
}));

import { loadStoredAuthSession } from '@/services/auth/auth.service';
import { getFavorites } from '@/services/transport/transport.service';
import { useFavorites } from './use-favorites';

const mockedLoadStoredAuthSession = vi.mocked(loadStoredAuthSession);
const mockedGetFavorites = vi.mocked(getFavorites);

describe('useFavorites', () => {
  afterEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('nao entra em loop de re-hidratacao quando initialFavorites nao e informado', async () => {
    mockedLoadStoredAuthSession.mockReturnValue(null);

    const { result, rerender } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.hydrated).toBe(true);
    });

    rerender();
    rerender();
    rerender();

    expect(result.current.requiresLogin).toBe(true);
    expect(mockedGetFavorites).not.toHaveBeenCalled();
    expect(mockedLoadStoredAuthSession).toHaveBeenCalledTimes(2);
  });

  it('carrega favoritos remotos uma vez quando ha sessao valida', async () => {
    mockedLoadStoredAuthSession.mockReturnValue({
      token: 'token-valido',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        createdAt: new Date('2026-05-23T10:00:00.000Z').toISOString(),
      },
    });

    window.localStorage.setItem(
      'cityline:favorites:v2',
      JSON.stringify([{ id: 'local-fav', lineId: 'line-001', createdAt: new Date('2026-05-23T10:05:00.000Z').toISOString() }])
    );

    mockedGetFavorites.mockResolvedValue([
      { id: 'remote-fav', lineId: 'line-0100', createdAt: new Date('2026-05-23T10:06:00.000Z').toISOString() },
    ]);

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.hydrated).toBe(true);
      expect(result.current.favorites[0]?.id).toBe('remote-fav');
    });

    expect(result.current.requiresLogin).toBe(false);
    expect(mockedGetFavorites).toHaveBeenCalledTimes(1);
  });
});
