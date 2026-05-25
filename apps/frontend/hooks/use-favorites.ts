'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FavoriteRecord } from '@cityline/shared';
import { ApiRequestError } from '@/services/api/client';
import { loadStoredAuthSession } from '@/services/auth/auth.service';
import { createFavorite, getFavorites, removeFavorite } from '@/services/transport/transport.service';

const STORAGE_KEY = 'cityline:favorites:v2';
const EMPTY_FAVORITES: FavoriteRecord[] = [];

const areFavoritesEqual = (left: FavoriteRecord[], right: FavoriteRecord[]) => {
  if (left === right) return true;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    const leftItem = left[index];
    const rightItem = right[index];

    if (!leftItem || !rightItem) return false;
    if (leftItem.id !== rightItem.id || leftItem.lineId !== rightItem.lineId || leftItem.createdAt !== rightItem.createdAt) {
      return false;
    }
  }

  return true;
};

export function useFavorites(initialFavorites: FavoriteRecord[] = EMPTY_FAVORITES) {
  const stableInitialFavorites = useMemo(() => initialFavorites, [initialFavorites]);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>(initialFavorites);
  const [hydrated, setHydrated] = useState(false);
  const [pendingLineIds, setPendingLineIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const session = loadStoredAuthSession();
      const hasToken = Boolean(session?.token);
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      const nextFavorites = hasToken && rawValue ? (JSON.parse(rawValue) as FavoriteRecord[]) : stableInitialFavorites;

      setRequiresLogin((current) => (current === !hasToken ? current : !hasToken));
      setFavorites((current) => (areFavoritesEqual(current, nextFavorites) ? current : nextFavorites));
    } catch {
      setFavorites((current) => (areFavoritesEqual(current, stableInitialFavorites) ? current : stableInitialFavorites));
    } finally {
      setHydrated((current) => (current ? current : true));
    }
  }, [stableInitialFavorites]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const session = loadStoredAuthSession();
    const hasToken = Boolean(session?.token);
    setRequiresLogin((current) => (current === !hasToken ? current : !hasToken));

    if (!hasToken) {
      setFavorites((current) => (current.length ? [] : current));
      return;
    }

    let active = true;

    void getFavorites()
      .then((remoteFavorites) => {
        if (!active) return;
        setFavorites((current) => (areFavoritesEqual(current, remoteFavorites) ? current : remoteFavorites));
        setError(null);
      })
      .catch((loadError) => {
        if (!active) return;

        if (loadError instanceof ApiRequestError && loadError.statusCode === 401) {
          setFavorites((current) => (current.length ? [] : current));
          setRequiresLogin((current) => (current ? current : true));
          setError('Sua sessao expirou. Entre novamente para ver seus favoritos.');
          return;
        }

        setError('Nao foi possivel carregar seus favoritos agora.');
      });

    return () => {
      active = false;
    };
  }, [hydrated]);

  const isFavorite = useCallback(
    (lineId: string) => favorites.some((item) => item.lineId === lineId),
    [favorites]
  );

  const favoriteIds = useMemo(() => favorites.map((item) => item.lineId), [favorites]);

  const toggleFavorite = useCallback(
    async (lineId: string) => {
      const session = loadStoredAuthSession();
      setRequiresLogin(!session?.token);
      setError(null);

      if (!session?.token) {
        setError('Entre na sua conta para salvar linhas favoritas.');
        return;
      }

      setPendingLineIds((current) => [...current, lineId]);
      const existing = favorites.find((item) => item.lineId === lineId);

      if (existing) {
        setFavorites((current) => current.filter((item) => item.lineId !== lineId));

        try {
          await removeFavorite(existing.id);
        } catch (removeError) {
          setFavorites((current) => (current.some((item) => item.lineId === lineId) ? current : [...current, existing]));

          if (removeError instanceof ApiRequestError && removeError.statusCode === 401) {
            setRequiresLogin(true);
            setError('Sua sessao expirou. Entre novamente para remover favoritos.');
          } else {
            setError('Nao foi possivel remover este favorito agora.');
          }
        } finally {
          setPendingLineIds((current) => current.filter((item) => item !== lineId));
        }

        return;
      }

      const optimisticFavorite: FavoriteRecord = {
        id: `fav-${lineId}`,
        lineId,
        createdAt: new Date().toISOString(),
      };

      setFavorites((current) => [...current, optimisticFavorite]);

      try {
        const savedFavorite = await createFavorite(lineId);
        setFavorites((current) => current.map((item) => (item.lineId === lineId ? savedFavorite : item)));
      } catch (createError) {
        setFavorites((current) => current.filter((item) => item.lineId !== lineId));

        if (createError instanceof ApiRequestError && createError.statusCode === 401) {
          setRequiresLogin(true);
          setError('Sua sessao expirou. Entre novamente para salvar favoritos.');
        } else {
          setError('Nao foi possivel salvar este favorito agora.');
        }
      } finally {
        setPendingLineIds((current) => current.filter((item) => item !== lineId));
      }
    },
    [favorites]
  );

  return {
    favorites,
    favoriteIds,
    hydrated,
    pendingLineIds,
    error,
    requiresLogin,
    isFavorite,
    toggleFavorite,
  };
}
