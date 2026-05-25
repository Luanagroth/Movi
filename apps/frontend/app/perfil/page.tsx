'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { TransportLine } from '@cityline/shared';
import { ArrowLeft, Heart, Loader2, LogOut, Search, UserRound } from 'lucide-react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useFavorites } from '@/hooks/use-favorites';
import { requestApi, ApiRequestError } from '@/services/api/client';

const heroImage = '/images/cityline/onibus.png';

export default function PerfilPage() {
  const { isLoading, isAuthenticated, session, logout } = useAuthSession();
  const { favorites, hydrated, isFavorite, pendingLineIds, toggleFavorite, error: favoritesError } = useFavorites();
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [linesLoading, setLinesLoading] = useState(false);
  const [linesError, setLinesError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;
    setLinesLoading(true);
    setLinesError(null);

    void requestApi<TransportLine[]>('/lines', { cache: 'no-store' }, { revalidate: 0 })
      .then((items) => {
        if (!active) return;
        setLines(items.filter((line) => line.mode !== 'ferry'));
      })
      .catch((loadError) => {
        if (!active) return;
        if (loadError instanceof ApiRequestError) {
          setLinesError(loadError.message);
          return;
        }
        setLinesError('Não foi possível carregar linhas agora.');
      })
      .finally(() => {
        if (active) setLinesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const filteredLines = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return lines.slice(0, 14);
    return lines
      .filter((line) => `${line.code} ${line.name} ${line.routeLabel}`.toLowerCase().includes(term))
      .slice(0, 14);
  }, [lines, query]);

  if (isLoading || !hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e6] px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-[#14233c]/10 bg-white px-5 py-4 text-sm text-[#14233c]/75 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-[#17803e]" />
          Carregando perfil...
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e6] px-4 py-8">
        <section className="w-full max-w-xl rounded-3xl border border-[#14233c]/10 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#17803e]">Perfil</p>
          <h1 className="mt-3 text-3xl font-black text-[#14233c]">Entre para acessar seu perfil</h1>
          <p className="mt-3 text-sm leading-7 text-[#14233c]/75">
            Com conta ativa você pode gerenciar favoritos e acompanhar sua experiência personalizada.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-xl bg-[#17803e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#136a33]">
              Acessar conta
            </Link>
            <Link href="/" className="rounded-xl border border-[#14233c]/20 px-4 py-2 text-sm font-semibold text-[#14233c] hover:bg-[#f5f1e6]">
              Voltar
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1e6] text-[#14233c] font-sans">
      <section className="mx-auto min-h-screen max-w-[1460px] overflow-hidden bg-[#f5f1e6] shadow-2xl lg:rounded-[28px]">
        <section className="relative min-h-[420px] overflow-hidden">
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <Image src={heroImage} alt="Ônibus amarelo MOVI" fill className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e6] via-[#f5f1e6]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e6]/30 via-transparent to-[#13100b]/10" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1280px] px-8 pb-10 pt-24 lg:px-12">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#14233c]/75 hover:text-[#14233c]">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.24em] text-[#17803e]">Perfil do usuário</p>
            <h1 className="mt-2 text-5xl font-black leading-[0.98] tracking-[-0.05em] text-[#10213d] lg:text-6xl">
              Olá, {session.user.name ?? 'usuário'}
            </h1>
            <p className="mt-4 text-base font-medium text-[#14233c]">{session.user.email}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1280px] gap-6 px-8 py-10 lg:grid-cols-[1fr_1fr] lg:px-12">
          <article className="rounded-3xl border border-[#14233c]/10 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-[#17803e]" />
              <h2 className="text-xl font-black text-[#14233c]">Minha conta</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#14233c]/75">
              Aqui você consegue acessar seus favoritos e continuar adicionando linhas salvas no painel de linhas e horários.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/favoritos" className="inline-flex items-center gap-2 rounded-xl bg-[#17803e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#136a33]">
                <Heart className="h-4 w-4" />
                Ver favoritos ({favorites.length})
              </Link>
              <Link href="/linhas" className="rounded-xl border border-[#14233c]/20 px-4 py-2 text-sm font-semibold text-[#14233c] hover:bg-[#f5f1e6]">
                Ir para linhas e horários
              </Link>
            </div>
          </article>

          <article className="rounded-3xl border border-[#14233c]/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-[#14233c]">Sessão</h2>
            <p className="mt-4 text-sm leading-7 text-[#14233c]/75">
              Se quiser trocar de conta, saia da sessão atual e entre novamente.
            </p>
            <button
              type="button"
              onClick={() => logout()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#14233c]/20 px-4 py-2 text-sm font-semibold text-[#14233c] hover:bg-[#f5f1e6]"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          </article>
        </section>

        <section className="mx-auto max-w-[1280px] px-8 pb-12 lg:px-12">
          <article className="rounded-3xl border border-[#14233c]/10 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-[#14233c]">Favoritar linhas no perfil</h2>
              <span className="rounded-full bg-[#f5f1e6] px-3 py-1 text-xs font-bold text-[#14233c]/70">
                {favorites.length} favorita(s)
              </span>
            </div>

            <label className="mt-5 flex items-center gap-3 rounded-xl border border-[#14233c]/15 bg-white px-4 py-3">
              <Search className="h-4 w-4 text-[#14233c]/60" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por código, linha ou destino"
                className="w-full bg-transparent text-sm font-medium text-[#14233c] outline-none placeholder:text-[#14233c]/50"
              />
            </label>

            {favoritesError ? (
              <p className="mt-4 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-medium text-[#9a3412]">
                {favoritesError}
              </p>
            ) : null}
            {linesError ? (
              <p className="mt-4 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-medium text-[#9a3412]">
                {linesError}
              </p>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {linesLoading ? (
                <div className="col-span-full flex items-center gap-3 rounded-xl border border-[#14233c]/10 bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#475569]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#17803e]" />
                  Carregando linhas...
                </div>
              ) : filteredLines.length ? (
                filteredLines.map((line) => {
                  const favorite = isFavorite(line.id);
                  const pending = pendingLineIds.includes(line.id);
                  return (
                    <div key={line.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#14233c]/10 bg-[#f8fafc] px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#14233c]">
                          {line.code} - {line.name}
                        </p>
                        <p className="truncate text-xs font-medium text-[#14233c]/65">{line.routeLabel}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void toggleFavorite(line.id)}
                        disabled={pending}
                        className={`rounded-lg px-3 py-2 text-xs font-black uppercase transition ${
                          favorite
                            ? 'border border-[#14532d]/20 bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]'
                            : 'border border-[#14233c]/20 bg-white text-[#14233c] hover:bg-[#f1f5f9]'
                        } disabled:opacity-60`}
                      >
                        {pending ? 'Salvando...' : favorite ? 'Salvo' : 'Salvar'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="col-span-full rounded-xl border border-[#14233c]/10 bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#475569]">
                  Nenhuma linha encontrada para esse filtro.
                </p>
              )}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
