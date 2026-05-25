'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ServiceDay, TransportLine } from '@cityline/shared';
import { AlertTriangle, ArrowRightLeft, CalendarDays, Clock3, Route, Search } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusPill } from '@/components/ui/status-pill';
import { useLineDirectionState } from '@/features/dashboard/hooks/use-line-direction-state';
import { DepartureList } from '@/features/schedules/components/departure-list';
import { getDayTypeLabel } from '@/lib/ui-copy';

interface PublicSchedulesBoardProps {
  lines: TransportLine[];
  initialLineId?: string;
  dataSource: 'live' | 'fallback';
  lastUpdated: string;
}

const dayTypes: ServiceDay[] = ['weekday', 'saturday', 'sunday'];

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getLineSearchText = (line: TransportLine) =>
  normalizeText([line.code, line.name, line.routeLabel, line.summary, line.origin, line.destination, ...line.stops.map((stop) => stop.name)].join(' '));

const getFirstKnownDeparture = (line: TransportLine) =>
  line.schedules.weekday[0]?.time ?? line.schedules.saturday[0]?.time ?? line.schedules.sunday[0]?.time ?? null;

const getInitialSelectedLineId = (lines: TransportLine[], initialLineId?: string) => {
  if (!lines.length) return '';
  if (initialLineId && lines.some((line) => line.id === initialLineId)) return initialLineId;
  const firstLine = lines[0];
  return firstLine ? firstLine.id : '';
};

export function PublicSchedulesBoard({ lines, initialLineId, dataSource, lastUpdated }: PublicSchedulesBoardProps) {
  const [query, setQuery] = useState('');
  const [selectedLineId, setSelectedLineId] = useState(getInitialSelectedLineId(lines, initialLineId));
  const [dayType, setDayType] = useState<ServiceDay>('weekday');
  const [hasMounted, setHasMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setHasMounted(true);
    const syncNow = () => setNow(new Date());
    syncNow();
    const timer = window.setInterval(syncNow, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredLines = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    if (!normalizedQuery) return lines;

    return lines.filter((line) => getLineSearchText(line).includes(normalizedQuery));
  }, [lines, query]);

  const selectedLine = useMemo(
    () => lines.find((line) => line.id === selectedLineId) ?? filteredLines[0] ?? lines[0] ?? null,
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

  const fullSchedule = effectiveActiveDirection?.schedules[dayType] ?? [];
  const nextDepartures = effectiveActiveDirection?.nextDepartures ?? [];
  const updatedLabel = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(lastUpdated));

  return (
    <PageTransition>
      <section className="rounded-[28px] border border-gray-200 bg-white p-7 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Horarios reais</p>
            <h1 className="mt-3 text-4xl font-semibold text-gray-950">Proximas partidas</h1>
            <p className="mt-3 text-sm font-medium text-gray-500">
              Consulte partidas por linha, sentido e tipo de dia. Atualizado as {updatedLabel}.
            </p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${dataSource === 'live' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {dataSource === 'live' ? 'API ativa' : 'Modo seguro'}
          </span>
        </div>

        {dataSource === 'fallback' ? (
          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Nao foi possivel consultar a API agora. Mostrando dados locais para manter a consulta disponivel.</p>
          </div>
        ) : null}

        <div className="mt-7 grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
          <div className="space-y-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar linha, parada ou destino"
                className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-4 pl-12 text-sm font-medium outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/80"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {dayTypes.map((currentDayType) => (
                <button
                  key={currentDayType}
                  type="button"
                  onClick={() => setDayType(currentDayType)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    dayType === currentDayType ? 'border-blue-200 bg-blue-600 text-white shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200'
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  {getDayTypeLabel('pt-BR', currentDayType)}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              {filteredLines.length ? (
                filteredLines.map((line) => {
                  const active = selectedLine?.id === line.id;
                  const firstDeparture = getFirstKnownDeparture(line);

                  return (
                    <button
                      key={line.id}
                      type="button"
                      onClick={() => setSelectedLineId(line.id)}
                      className={`flex flex-col gap-3 rounded-[22px] border p-4 text-left transition sm:flex-row sm:items-center sm:justify-between ${
                        active
                          ? 'border-blue-200 bg-blue-50 shadow-[0_14px_34px_rgba(37,99,235,0.10)]'
                          : 'border-gray-100 bg-slate-50 hover:border-blue-100 hover:bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-blue-700">{line.code}</p>
                          <StatusPill status={line.status} />
                        </div>
                        <p className="mt-1 font-semibold text-gray-950">{line.name}</p>
                        <p className="mt-1 truncate text-xs font-medium text-gray-500">{line.routeLabel}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-950 shadow-sm">
                        <Clock3 className="h-4 w-4 text-blue-600" />
                        {firstDeparture ?? 'Sem horario'}
                      </div>
                    </button>
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
          </div>

          <div className="rounded-[26px] border border-gray-100 bg-slate-50 p-5">
            {selectedLine ? (
              <div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="rounded-xl bg-[#EEF4FF] px-3 py-2 text-sm font-semibold text-blue-700">{selectedLine.code}</span>
                    <h2 className="mt-4 text-2xl font-semibold text-gray-950">{selectedLine.name}</h2>
                    <p className="mt-2 text-sm font-medium text-gray-500">{selectedLine.routeLabel}</p>
                  </div>
                  <StatusPill status={selectedLine.status} />
                </div>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <ArrowRightLeft className="h-4 w-4 text-blue-700" />
                    Sentido da viagem
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {effectiveDirectionOptions.length ? (
                      effectiveDirectionOptions.map((direction) => (
                        <button
                          key={direction.id}
                          type="button"
                          onClick={() => setSelectedDirectionId(direction.id)}
                          disabled={directionsLoading}
                          className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            (effectiveActiveDirection?.id ?? selectedDirectionId) === direction.id
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:ring-blue-200'
                          }`}
                        >
                          {direction.label}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum sentido cadastrado para esta linha.</p>
                    )}
                  </div>
                  {directionsLoading ? <p className="mt-2 text-xs text-slate-500">Carregando horarios deste sentido...</p> : null}
                  {directionsError ? <p className="mt-2 text-xs text-rose-600">{directionsError}</p> : null}
                </div>

                <div className="mt-5 space-y-5">
                  {nextDepartures.length ? (
                    <DepartureList title="Proximas partidas" items={nextDepartures} compact referenceTime={now} locale="pt-BR" />
                  ) : (
                    <EmptyState
                      title="Sem proximas partidas"
                      description="Nao encontramos uma proxima partida para a linha, sentido e tipo de dia selecionados."
                      icon={<Clock3 className="h-5 w-5" />}
                    />
                  )}

                  {fullSchedule.length ? (
                    <DepartureList title="Grade completa" items={fullSchedule} referenceTime={now} locale="pt-BR" />
                  ) : (
                    <EmptyState
                      title="Sem horarios cadastrados"
                      description="Esta linha ou sentido ainda nao possui horarios para o tipo de dia selecionado."
                      icon={<Route className="h-5 w-5" />}
                    />
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Nenhuma linha disponivel"
                description="Nao encontramos linhas para consultar horarios agora. Tente novamente em alguns instantes."
                icon={<Clock3 className="h-5 w-5" />}
              />
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
