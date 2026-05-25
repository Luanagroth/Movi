'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { TransportLine } from '@cityline/shared';
import { Clock3, Heart, Loader2, LogIn, MapPinned, MapPin, Trash2, UserRound } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useFavorites } from '@/hooks/use-favorites';
import { ApiRequestError } from '@/services/api/client';
import { listSavedLocations, type SavedLocationRecord } from '@/services/auth/auth.service';

interface FavoritesAccountProps {
  lines: TransportLine[];
}

const getFirstDeparture = (line: TransportLine) =>
  line.schedules.weekday[0]?.time ?? line.schedules.saturday[0]?.time ?? line.schedules.sunday[0]?.time ?? null;

export function FavoritesAccount({ lines }: FavoritesAccountProps) {
  const { isAuthenticated, isLoading, session } = useAuthSession();
  const { error, favorites, hydrated, pendingLineIds, toggleFavorite } = useFavorites();
  const [locations, setLocations] = useState<SavedLocationRecord[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  const favoriteLines = useMemo(
    () =>
      favorites
        .map((favorite) => ({
          favorite,
          line: lines.find((line) => line.id === favorite.lineId),
        }))
        .filter((item): item is { favorite: typeof item.favorite; line: TransportLine } => Boolean(item.line)),
    [favorites, lines]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setLocations([]);
      return;
    }

    let active = true;
    setLocationsLoading(true);
    setLocationsError(null);

    void listSavedLocations()
      .then((items) => {
        if (active) setLocations(items);
      })
      .catch((loadError) => {
        if (!active) return;
        if (loadError instanceof ApiRequestError && loadError.statusCode === 401) {
          setLocationsError('Sua sessão expirou. Entre novamente para ver localizações salvas.');
          return;
        }
        setLocationsError('Não foi possível carregar localizações salvas agora.');
      })
      .finally(() => {
        if (active) setLocationsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (isLoading || !hydrated) {
    return (
      <section className="rounded-[30px] border border-gray-200 bg-white p-7 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Carregando sua conta...
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="rounded-[30px] border border-gray-200 bg-white p-7 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Favoritos</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-950">Entre para salvar suas linhas</h1>
          <p className="mt-3 leading-7 text-gray-500">
            O MOVI continua público sem login. Para sincronizar linhas favoritas e ver localizações salvas, use uma
            conta gratuita.
          </p>
          <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)]">
            <LogIn className="h-4 w-4" />
            Entrar ou cadastrar
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-7 xl:grid-cols-[1fr_0.72fr]">
      <section className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Favoritos</p>
            <h1 className="mt-3 text-3xl font-semibold text-gray-950">Minhas linhas salvas</h1>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Conta: {session?.user.name ?? session?.user.email}
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            {favoriteLines.length} linha(s)
          </span>
        </div>

        {error ? <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</p> : null}

        <div className="mt-7 space-y-3">
          {favoriteLines.length ? (
            favoriteLines.map(({ favorite, line }) => (
              <article key={favorite.id} className="rounded-[24px] border border-gray-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="rounded-xl bg-gray-950 px-3 py-2 text-sm font-semibold text-white">{line.code}</span>
                    <h2 className="mt-5 text-xl font-semibold text-gray-950">{line.name}</h2>
                    <p className="mt-2 text-sm font-medium text-gray-500">{line.routeLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void toggleFavorite(line.id)}
                    disabled={pendingLineIds.includes(line.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {pendingLineIds.includes(line.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Remover
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link href={`/horarios?linha=${line.id}`} className="inline-flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-gray-900 shadow-sm transition hover:text-blue-700">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-blue-600" />
                      {getFirstDeparture(line) ?? 'Ver horários'}
                    </span>
                    Horarios
                  </Link>
                  <Link href={`/mapa?linha=${line.id}`} className="inline-flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-gray-900 shadow-sm transition hover:text-blue-700">
                    <span className="inline-flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-blue-600" />
                      Rota e paradas
                    </span>
                    Mapa
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              title="Nenhuma linha favorita"
              description="Abra a página de linhas e toque em Salvar linha para montar sua lista."
              icon={<Heart className="h-5 w-5" />}
            />
          )}
        </div>
      </section>

      <aside className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#EEF4FF] text-blue-600">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Conta</p>
            <h2 className="text-xl font-semibold text-gray-950">Localizacoes salvas</h2>
          </div>
        </div>

        {locationsError ? <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{locationsError}</p> : null}

        <div className="mt-6 space-y-3">
          {locationsLoading ? (
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Carregando localizações...
            </div>
          ) : locations.length ? (
            locations.map((location) => (
              <div key={location.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-950">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {location.label ?? 'Local salvo'}
                </p>
                <p className="mt-2 text-xs font-medium text-gray-500">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-gray-500">
              Nenhuma localização salva ainda. O suporte existe no backend, mas esta tela apenas lista dados já salvos.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
