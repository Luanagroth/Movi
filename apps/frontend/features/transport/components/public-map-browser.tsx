'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import type { ServiceDay, TransportLine } from '@cityline/shared';
import { AlertTriangle, ArrowRightLeft, LocateFixed, MapPin, Navigation, Route } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusPill } from '@/components/ui/status-pill';
import { useLineDirectionState } from '@/features/dashboard/hooks/use-line-direction-state';
import type { TransitMapProps } from '@/features/map/components/transit-map';
import type { MapLineView } from '@/types/dashboard';

interface PublicMapBrowserProps {
  lines: TransportLine[];
  mapLines: MapLineView[];
  initialLineId?: string;
  dataSource: 'live' | 'fallback';
  lastUpdated: string;
}

const TransitMap = dynamic<TransitMapProps>(() => import('@/features/map/components/transit-map').then((module) => module.TransitMap), {
  ssr: false,
  loading: () => <div className="grid h-full min-h-[520px] place-items-center bg-slate-100 text-sm font-medium text-gray-500">Carregando mapa...</div>,
});

const dayType: ServiceDay = 'weekday';

const getLineMapData = (line: TransportLine): MapLineView => ({
  id: line.id,
  code: line.code,
  name: line.name,
  color: line.color,
  status: line.status,
  origin: line.origin,
  destination: line.destination,
  mode: line.mode,
  fareLabel: line.fareLabel,
  path: line.path,
  stops: line.stops,
});

const getInitialSelectedLineId = (lines: TransportLine[], mapLines: MapLineView[], initialLineId?: string) => {
  const availableLineIds = new Set([...lines.map((line) => line.id), ...mapLines.map((line) => line.id)]);
  if (initialLineId && availableLineIds.has(initialLineId)) return initialLineId;
  return lines[0]?.id ?? mapLines[0]?.id ?? '';
};

export function PublicMapBrowser({ lines, mapLines, initialLineId, dataSource, lastUpdated }: PublicMapBrowserProps) {
  const [selectedLineId, setSelectedLineId] = useState(getInitialSelectedLineId(lines, mapLines, initialLineId));
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const availableLineIds = new Set([...lines.map((line) => line.id), ...mapLines.map((line) => line.id)]);
    if (!availableLineIds.size) {
      setSelectedLineId('');
      return;
    }

    if (initialLineId && availableLineIds.has(initialLineId)) {
      setSelectedLineId(initialLineId);
      return;
    }

    setSelectedLineId((current) => (availableLineIds.has(current) ? current : lines[0]?.id ?? mapLines[0]?.id ?? ''));
  }, [initialLineId, lines, mapLines]);

  const selectedLine = useMemo(
    () => lines.find((line) => line.id === selectedLineId) ?? lines[0] ?? null,
    [lines, selectedLineId]
  );
  const selectedMapLine = useMemo(() => {
    if (!selectedLine) return mapLines[0] ?? null;
    return mapLines.find((line) => line.id === selectedLine.id) ?? getLineMapData(selectedLine);
  }, [mapLines, selectedLine]);

  const {
    selectedDirectionId,
    setSelectedDirectionId,
    directionsLoading,
    directionsError,
    effectiveDirectionOptions,
    effectiveActiveDirection,
  } = useLineDirectionState({ selectedLine, dayType, hasMounted, enableLiveDirectionRequests: dataSource === 'live' });

  const safeMapLines = mapLines.length ? mapLines : lines.map(getLineMapData);
  const visibleMapLines = selectedMapLine ? [selectedMapLine] : safeMapLines;
  const visibleStops = effectiveActiveDirection?.stops ?? selectedMapLine?.stops ?? [];
  const visiblePath = effectiveActiveDirection?.path ?? selectedMapLine?.path ?? [];
  const hasMapGeometry = visibleStops.length > 0 || visiblePath.length > 0;
  const updatedLabel = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(lastUpdated));

  return (
    <PageTransition>
      <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
        <div className="grid min-h-[720px] xl:grid-cols-[360px_1fr]">
          <aside className="border-b border-gray-200 bg-white p-6 xl:border-b-0 xl:border-r">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Mapa interativo</p>
                <h1 className="mt-3 text-3xl font-semibold text-gray-950">Rotas em tempo real</h1>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${dataSource === 'live' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                {dataSource === 'live' ? 'API ativa' : 'Modo seguro'}
              </span>
            </div>
            <p className="mt-3 text-xs font-medium text-gray-500">Atualizado as {updatedLabel}</p>

            {dataSource === 'fallback' ? (
              <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Nao foi possivel consultar a API agora. Mostrando dados locais para manter o mapa disponivel.</p>
              </div>
            ) : null}

            <select
              value={selectedLine?.id ?? ''}
              onChange={(event) => setSelectedLineId(event.target.value)}
              className="mt-7 w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/80"
            >
              {lines.map((line) => (
                <option key={line.id} value={line.id}>{line.code} - {line.name}</option>
              ))}
            </select>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-300 px-3 py-3 text-sm font-semibold text-white shadow-none"
                title="Disponivel pela busca de localizacao na home"
              >
                <LocateFixed className="h-4 w-4" />
                Localizacao
              </button>
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-gray-400 shadow-sm"
                title="Em breve"
              >
                <Navigation className="h-4 w-4" />
                Proxima parada
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
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
                          : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-blue-200'
                      }`}
                    >
                      {direction.label}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum sentido cadastrado para esta linha.</p>
                )}
              </div>
              {directionsLoading ? <p className="mt-2 text-xs text-slate-500">Carregando rota, paradas e sentidos...</p> : null}
              {directionsError ? <p className="mt-2 text-xs text-rose-600">{directionsError}</p> : null}
            </div>

            <div className="mt-7 rounded-[24px] border border-gray-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-950">Legenda da rota</p>
                {selectedLine ? <StatusPill status={selectedLine.status} /> : null}
              </div>
              <div className="thin-scrollbar mt-4 max-h-[360px] space-y-3 overflow-auto pr-1">
                {visibleStops.length ? (
                  visibleStops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">{index + 1}</span>
                      <span className="text-sm font-medium text-gray-700">{stop.name}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="Sem paradas cadastradas"
                    description="Esta linha ou sentido ainda nao possui paradas para exibir."
                    icon={<Route className="h-5 w-5" />}
                  />
                )}
              </div>
            </div>
          </aside>

          <div className="relative min-h-[520px]">
            {hasMapGeometry ? (
              <div className="h-full min-h-[520px]">
                <TransitMap
                  lines={visibleMapLines}
                  activeLineId={selectedLine?.id}
                  activeDirectionId={effectiveActiveDirection?.id}
                  activeDirection={effectiveActiveDirection}
                  onSelectLine={(lineId) => setSelectedLineId(lineId)}
                />
              </div>
            ) : (
              <div className="grid h-full min-h-[520px] place-items-center bg-slate-50 p-6">
                <EmptyState
                  title="Sem geometria de mapa"
                  description="Rota e paradas ainda nao disponiveis para esta linha ou sentido."
                  icon={<MapPin className="h-5 w-5" />}
                />
              </div>
            )}

            {selectedLine ? (
              <div className="absolute left-5 top-5 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-950">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {selectedLine.name}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
