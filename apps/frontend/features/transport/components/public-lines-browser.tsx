'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { ServiceDay, TransportLine } from '@cityline/shared';
import { AlertTriangle, ChevronDown, Clock3, Folder, Heart, LogIn, Route, Search, Ticket } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusPill } from '@/components/ui/status-pill';
import { useLineDirectionState } from '@/features/dashboard/hooks/use-line-direction-state';
import { DepartureList } from '@/features/schedules/components/departure-list';
import { useFavorites } from '@/hooks/use-favorites';
import { getTransportModeLabel } from '@/lib/ui-copy';

interface PublicLinesBrowserProps {
  lines: TransportLine[];
  initialLineId?: string;
  dataSource: 'live' | 'fallback';
  lastUpdated: string;
}

const dayType: ServiceDay = 'weekday';

const groupDefinitions = [
  { id: 'enseada', label: 'Enseada', keywords: ['enseada', 'ubatuba', 'majorca', 'capri', 'praia'] },
  { id: 'ribeira', label: 'Ribeira e Ervino', keywords: ['ribeira', 'ervino', 'iperoba'] },
  { id: 'forte', label: 'Forte', keywords: ['forte'] },
  { id: 'centro', label: 'Centro', keywords: ['centro', 'terminal', 'hospital'] },
  { id: 'intercity', label: 'Intermunicipal', keywords: ['joinville', 'araquari', 'br-280'] },
  { id: 'ferry', label: 'Hidroviario', keywords: ['ferry', 'balsa', 'vila da gloria', 'laranjeiras'] },
  { id: 'other', label: 'Outras linhas', keywords: [] },
];

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const lineSearchText = (line: TransportLine) =>
  normalizeText(
    [
      line.code,
      line.name,
      line.routeLabel,
      line.summary,
      line.origin,
      line.destination,
      line.operator,
      line.mode ?? '',
      line.fareLabel ?? '',
      line.amenities.join(' '),
      ...line.stops.map((stop) => stop.name),
    ].join(' ')
  );

const getLineGroupId = (line: TransportLine) => {
  if (line.mode === 'ferry') return 'ferry';
  if (line.mode === 'intercity') return 'intercity';

  const searchable = lineSearchText(line);
  return groupDefinitions.find((group) => group.id !== 'other' && group.keywords.some((keyword) => searchable.includes(keyword)))?.id ?? 'other';
};

const getFirstPlannedDeparture = (line: TransportLine) =>
  line.schedules.weekday[0]?.time ?? line.schedules.saturday[0]?.time ?? line.schedules.sunday[0]?.time ?? null;

const getInitialSelectedLineId = (lines: TransportLine[], initialLineId?: string) => {
  if (!lines.length) return '';
  if (initialLineId && lines.some((line) => line.id === initialLineId)) return initialLineId;
  const firstLine = lines[0];
  return firstLine ? firstLine.id : '';
};

export function PublicLinesBrowser({ lines, initialLineId, dataSource, lastUpdated }: PublicLinesBrowserProps) {
  const [query, setQuery] = useState('');
  const [openGroup, setOpenGroup] = useState<string>('enseada');
  const [selectedLineId, setSelectedLineId] = useState(getInitialSelectedLineId(lines, initialLineId));
  const [hasMounted, setHasMounted] = useState(false);
  const { error: favoritesError, isFavorite, pendingLineIds, requiresLogin, toggleFavorite } = useFavorites();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const filteredLines = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    if (!normalizedQuery) return lines;

    return lines.filter((line) => lineSearchText(line).includes(normalizedQuery));
  }, [lines, query]);

  const groupedLines = useMemo(
    () =>
      groupDefinitions
        .map((group) => ({
          ...group,
          lines: filteredLines.filter((line) => getLineGroupId(line) === group.id),
        }))
        .filter((group) => group.lines.length > 0),
    [filteredLines]
  );

  const selectedLine = useMemo(
    () => filteredLines.find((line) => line.id === selectedLineId) ?? lines.find((line) => line.id === selectedLineId) ?? filteredLines[0] ?? lines[0] ?? null,
    [filteredLines, lines, selectedLineId]
  );

  useEffect(() => {
    if (!lines.length) {
      setSelectedLineId('');
      return;
    }

    if (initialLineId && lines.some((line) => line.id === initialLineId)) {
      setSelectedLineId(initialLineId);
      return;
    }

    setSelectedLineId((current) => (lines.some((line) => line.id === current) ? current : (lines[0]?.id ?? '')));
  }, [initialLineId, lines]);

  const {
    selectedDirectionId,
    setSelectedDirectionId,
    directionsLoading,
    directionsError,
    effectiveDirectionOptions,
    effectiveActiveDirection,
  } = useLineDirectionState({ selectedLine, dayType, hasMounted, enableLiveDirectionRequests: dataSource === 'live' });

  useEffect(() => {
    if (!selectedLine && filteredLines[0]) {
      setSelectedLineId(filteredLines[0].id);
    }
  }, [filteredLines, selectedLine]);

  const nextDeparture = effectiveActiveDirection?.nextDepartures[0]?.time ?? (selectedLine ? getFirstPlannedDeparture(selectedLine) : null);
  const updatedLabel = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(lastUpdated));

  return (
    <PageTransition>
      <div className="grid gap-7 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Linhas reais</p>
              <h1 className="mt-3 text-3xl font-semibold text-gray-950">Escolha por regiao</h1>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${dataSource === 'live' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {dataSource === 'live' ? 'API ativa' : 'Modo seguro'}
            </span>
          </div>

          {dataSource === 'fallback' ? (
            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>Nao foi possivel consultar a API agora. Mostrando dados locais para voce continuar navegando.</p>
            </div>
          ) : null}

          <label className="relative mt-7 block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Digite linha, bairro, parada ou destino"
              className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-4 pl-12 text-sm font-medium outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/80"
            />
          </label>

          <p className="mt-3 text-xs font-medium text-gray-500">
            {filteredLines.length} linha(s) encontradas - atualizado as {updatedLabel}
          </p>

          <div className="mt-7 space-y-3">
            {groupedLines.length ? (
              groupedLines.map((group) => {
                const isOpen = openGroup === group.id;

                return (
                  <div key={group.id} className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
                    <button type="button" onClick={() => setOpenGroup(isOpen ? '' : group.id)} className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50">
                      <span className="inline-flex items-center gap-3 text-base font-semibold text-gray-950">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#EEF4FF] text-blue-600">
                          <Folder className="h-4 w-4" />
                        </span>
                        {group.label}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{group.lines.length}</span>
                      </span>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen ? (
                      <div className="space-y-2 border-t border-gray-100 bg-slate-50/70 p-3">
                        {group.lines.map((line) => (
                          <button
                            key={line.id}
                            type="button"
                            onClick={() => setSelectedLineId(line.id)}
                            className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition ${
                              selectedLine?.id === line.id
                                ? 'bg-blue-600 text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)]'
                                : 'bg-white text-gray-700 shadow-sm hover:border-blue-100 hover:text-gray-950'
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold">{line.code} - {line.name}</span>
                              <span className={`mt-1 block truncate text-xs ${selectedLine?.id === line.id ? 'text-blue-100' : 'text-gray-500'}`}>{line.routeLabel}</span>
                            </span>
                            <Route className="h-5 w-5 shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="Nenhuma linha encontrada"
                description="Tente buscar por numero, bairro, parada ou destino."
                icon={<Search className="h-5 w-5" />}
              />
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] sm:p-7">
          {selectedLine ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="rounded-xl bg-[#EEF4FF] px-3 py-2 text-sm font-semibold text-blue-700">{selectedLine.code}</span>
                  <h2 className="mt-5 text-3xl font-semibold text-gray-950">{selectedLine.name}</h2>
                  <p className="mt-2 text-sm font-medium text-gray-500">{selectedLine.routeLabel}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={selectedLine.status} />
                  <button
                    type="button"
                    onClick={() => void toggleFavorite(selectedLine.id)}
                    disabled={pendingLineIds.includes(selectedLine.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                      isFavorite(selectedLine.id)
                        ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                        : 'bg-blue-600 text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)]'
                    }`}
                  >
                    <Heart className="h-4 w-4" fill={isFavorite(selectedLine.id) ? 'currentColor' : 'none'} />
                    {pendingLineIds.includes(selectedLine.id)
                      ? 'Salvando...'
                      : isFavorite(selectedLine.id)
                        ? 'Linha salva'
                        : 'Salvar linha'}
                  </button>
                </div>
              </div>

              {favoritesError ? (
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
                  <span>{favoritesError}</span>
                  {requiresLogin ? (
                    <Link href="/login" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-amber-900 shadow-sm">
                      <LogIn className="h-4 w-4" />
                      Entrar ou cadastrar
                    </Link>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-7 rounded-2xl border border-brand-100 bg-sky-50/80 p-4">
                <p className="text-sm font-semibold text-slate-800">Sentido da viagem</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {effectiveDirectionOptions.map((direction) => (
                    <button
                      key={direction.id}
                      type="button"
                      onClick={() => setSelectedDirectionId(direction.id)}
                      disabled={directionsLoading}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        (effectiveActiveDirection?.id ?? selectedDirectionId) === direction.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-blue-200'
                      }`}
                    >
                      {direction.label}
                    </button>
                  ))}
                </div>
                {directionsLoading ? <p className="mt-2 text-xs text-slate-500">Carregando sentidos, horarios e paradas...</p> : null}
                {directionsError ? <p className="mt-2 text-xs text-rose-600">{directionsError}</p> : null}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-gray-100 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-gray-500">Modalidade</p>
                    <p className="mt-2 text-xl font-semibold text-gray-950">{getTransportModeLabel('pt-BR', selectedLine.mode ?? 'urban')}</p>
                </div>
                <div className="rounded-[24px] border border-gray-100 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-gray-500">Proxima saida</p>
                  <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-gray-950">
                    <Clock3 className="h-5 w-5 text-blue-600" />
                    {nextDeparture ?? 'Sem horario'}
                  </p>
                </div>
                <div className="rounded-[24px] border border-gray-100 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-gray-500">Tarifa</p>
                  <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-gray-950">
                    <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {selectedLine.fareLabel ?? 'Consulte a operadora'}
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-[26px] bg-[#1F2937] p-6 text-white shadow-[0_18px_50px_rgba(31,41,55,0.16)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Paradas neste sentido</p>
                <div className="thin-scrollbar mt-6 max-h-[460px] space-y-3 overflow-auto pr-1">
                  {effectiveActiveDirection?.stops.length ? (
                    effectiveActiveDirection.stops.map((stop, index) => (
                      <div key={stop.id} className="flex items-center gap-3 rounded-2xl bg-white/6 p-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-sm font-semibold">{index + 1}</span>
                        <span className="text-sm font-medium text-gray-100">{stop.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-300">Nenhuma parada cadastrada para este sentido.</p>
                  )}
                </div>
              </div>

              <div className="mt-7 rounded-[26px] border border-gray-100 bg-slate-50 p-5">
                <DepartureList
                  title="Proximas partidas"
                  items={effectiveActiveDirection?.nextDepartures ?? []}
                  compact
                  referenceTime={hasMounted ? new Date() : null}
                  locale="pt-BR"
                />
              </div>
            </>
          ) : (
            <EmptyState
              title="Nenhuma linha disponivel"
              description="Nao encontramos linhas para exibir agora. Tente novamente em alguns instantes."
              icon={<Route className="h-5 w-5" />}
            />
          )}
        </section>
      </div>
    </PageTransition>
  );
}
