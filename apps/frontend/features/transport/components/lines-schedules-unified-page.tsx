'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { ServiceDay, TransportLine } from '@cityline/shared';
import {
  ArrowRight,
  Bus,
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Route,
  Search,
  ShipWheel,
  Smartphone,
  Star,
  UserRound,
} from 'lucide-react';
import { useLineDirectionState } from '@/features/dashboard/hooks/use-line-direction-state';
import { ImmersiveHeader } from '@/components/immersive-header';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useFavorites } from '@/hooks/use-favorites';
import { getDistanceInMeters } from '@/lib/transport';
import { getLineDirectionSchedules } from '@/services/transport/transport.service';
import type { TransitMapProps } from '@/features/map/components/transit-map';
import type { MapLineView } from '@/types/dashboard';

interface LinesSchedulesUnifiedPageProps {
  lines: TransportLine[];
  initialLineId?: string;
  initialPanel?: 'terrestrial' | 'ferry';
  dataSource: 'live' | 'fallback';
}

const heroImage = '/images/cityline/onibus.png';
const URBAN_FARE_LABEL = 'R$ 6,50';

const dayTypeOptions: Array<{ id: ServiceDay; label: string }> = [
  { id: 'weekday', label: 'Dias úteis' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo e feriados' },
];

const TransitMap = dynamic<TransitMapProps>(() => import('@/features/map/components/transit-map').then((module) => module.TransitMap), {
  ssr: false,
  loading: () => <div className="grid h-[340px] place-items-center bg-slate-100 text-sm font-medium text-gray-500">Carregando mapa...</div>,
});

function LineBadge({
  label,
  tone = 'green',
  active = false,
}: {
  label: string;
  tone?: 'yellow' | 'green' | 'blue' | 'red' | 'dark';
  active?: boolean;
}) {
  const colors = {
    yellow: active
      ? 'bg-[#ffd200] border-[#ffd200] text-[#14233c]'
      : 'bg-[#fff3ae] border-[#ffd200] text-[#14233c]',
    green: 'bg-[#eef8ef] border-[#17803e] text-[#17803e]',
    blue: 'bg-[#eff6ff] border-[#2d6ca2] text-[#2d6ca2]',
    red: 'bg-[#fff1ed] border-[#e15a3d] text-[#e15a3d]',
    dark: 'bg-[#f5f1e6] border-[#14233c] text-[#14233c]',
  };

  const isLongLabel = label.length > 5;

  return (
    <span
      className={`flex h-10 shrink-0 items-center justify-center rounded-lg border font-black ${isLongLabel ? 'min-w-[72px] px-2 text-[11px]' : 'w-10 text-sm'} whitespace-nowrap ${colors[tone]}`}
    >
      {label}
    </span>
  );
}

function ScheduleGrid({ title, times, tone = 'green' }: { title: string; times: string[]; tone?: 'green' | 'blue' }) {
  const border = tone === 'green' ? 'border-[#17803e]' : 'border-[#2d6ca2]';
  const titleColor = tone === 'green' ? 'text-[#17803e]' : 'text-[#2d6ca2]';

  return (
    <section className={`overflow-hidden rounded-xl border ${border} bg-white/60`}>
      <div className="border-b border-current/15 px-6 py-4">
        <h3 className={`text-sm font-black ${titleColor}`}>{title}</h3>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-10">
        {times.map((time) => (
          <div key={`${title}-${time}`} className="border-b border-r border-[#14233c]/8 px-4 py-4 text-center text-sm font-medium text-[#14233c]">
            {time}
          </div>
        ))}
      </div>
    </section>
  );
}

function toMapLine(line: TransportLine): MapLineView {
  return {
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
  };
}

function MapReadyArea({
  line,
  activeDirection,
  showStopNumbers,
}: {
  line: TransportLine;
  activeDirection: {
    id?: string;
    lineId?: string;
    origin: string;
    destination: string;
    routeLabel: string;
    path: TransitMapProps['lines'][number]['path'];
    stops: TransitMapProps['lines'][number]['stops'];
  } | null;
  showStopNumbers: boolean;
}) {
  const hasPath = (activeDirection?.path.length ?? line.path.length) > 0;
  const hasStops = (activeDirection?.stops.length ?? line.stops.length) > 0;
  const mapLine = toMapLine(line);

  return (
    <div id="mapa" className="overflow-hidden rounded-2xl border border-[#14233c]/10 bg-[#dfe8d9] shadow-inner">
      {hasPath || hasStops ? (
        <TransitMap
          lines={[mapLine]}
          activeLineId={line.id}
          activeDirectionId={activeDirection?.id}
          activeDirection={activeDirection}
          showStopNumbers={showStopNumbers}
        />
      ) : (
        <div className="grid h-[340px] place-items-center bg-slate-50 px-4 text-center text-sm font-medium text-[#14233c]/70">
          Rota e paradas ainda não disponíveis para esta linha.
        </div>
      )}
    </div>
  );
}

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const lineText = (line: TransportLine) =>
  normalizeText([line.code, line.name, line.routeLabel, line.origin, line.destination].join(' '));

const toneByIndex: Array<'yellow' | 'green' | 'blue' | 'red' | 'dark'> = ['yellow', 'green', 'blue', 'green', 'dark', 'blue', 'green', 'dark', 'red', 'green'];

const isPedestrianFerry = (line: TransportLine | null) =>
  Boolean(line && line.mode === 'ferry' && (line.code.toUpperCase().includes('PED') || line.name.toLowerCase().includes('pedestre')));

const resolveFerryLabel = (line: TransportLine | null) => {
  if (!line || line.mode !== 'ferry') return null;
  if (isPedestrianFerry(line)) {
    return {
      title: 'Lancha para pedestres',
      subtitle: 'Travessia gratuita',
    };
  }

  return {
    title: 'Ferry Boat',
    subtitle: 'Travessia tarifada',
  };
};

const getFerryDisplayName = (line: TransportLine) => {
  if (isPedestrianFerry(line)) {
    return 'Lancha Centro Histórico ↔ Vila da Glória';
  }
  return 'Ferry Boat Laranjeiras ↔ Vila da Glória';
};

const parseFerryFareRows = (fareLabel?: string) => {
  if (!fareLabel) return [];
  return fareLabel
    .replace(/Â·/g, '·')
    .split('·')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/^(.*)\s(R\$\s?[\d.,]+)$/);
      if (!match) {
        return { category: item, price: '' };
      }

      return {
        category: match[1]?.trim() ?? item,
        price: match[2]?.trim() ?? '',
      };
    });
};

const computePolylineDistanceKm = (points: Array<{ lat: number; lng: number }>) => {
  if (points.length < 2) return 0;
  let totalMeters = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (!previous || !current) continue;
    totalMeters += getDistanceInMeters(previous, current);
  }
  return totalMeters / 1000;
};

const estimateDurationMinutes = (distanceKm: number, stopCount: number, mode?: TransportLine['mode']) => {
  if (distanceKm <= 0) return 0;
  const averageSpeedKmH = mode === 'intercity' ? 30 : mode === 'ferry' ? 16 : 22;
  const runningTimeMinutes = (distanceKm / averageSpeedKmH) * 60;
  const dwellTimeMinutes = Math.max(0, stopCount - 2) * 0.35;
  return Math.max(8, Math.round(runningTimeMinutes + dwellTimeMinutes));
};

export function LinesSchedulesUnifiedPage({ lines, initialLineId, initialPanel = 'terrestrial', dataSource }: LinesSchedulesUnifiedPageProps) {
  const { isAuthenticated } = useAuthSession();
  const { isFavorite, toggleFavorite, pendingLineIds, error: favoritesError } = useFavorites();
  const [query, setQuery] = useState('');
  const dayType: ServiceDay = 'weekday';
  const [showStops, setShowStops] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [activePanel, setActivePanel] = useState<'terrestrial' | 'ferry'>(initialPanel);
  const [allSchedulesLoading, setAllSchedulesLoading] = useState(false);
  const [schedulesByDay, setSchedulesByDay] = useState<Record<ServiceDay, string[]>>({
    weekday: [],
    saturday: [],
    sunday: [],
  });

  const terrestrialLines = useMemo(() => lines.filter((line) => line.mode !== 'ferry'), [lines]);
  const ferryLines = useMemo(() => lines.filter((line) => line.mode === 'ferry'), [lines]);

  const filteredLines = useMemo(() => {
    const term = normalizeText(query.trim());
    if (!term) return terrestrialLines;
    return terrestrialLines.filter((line) => lineText(line).includes(term));
  }, [terrestrialLines, query]);

  const fallbackSelectedLine = terrestrialLines[0] ?? null;
  const initialSelected =
    initialLineId && terrestrialLines.some((line) => line.id === initialLineId) ? initialLineId : fallbackSelectedLine?.id;
  const [selectedLineId, setSelectedLineId] = useState(initialSelected);
  const [selectedFerryLineId, setSelectedFerryLineId] = useState<string | undefined>(ferryLines[0]?.id);

  const selectedLine = useMemo(
    () => terrestrialLines.find((line) => line.id === selectedLineId) ?? filteredLines[0] ?? fallbackSelectedLine,
    [fallbackSelectedLine, filteredLines, selectedLineId, terrestrialLines]
  );
  const selectedFerryLine = useMemo(
    () => ferryLines.find((line) => line.id === selectedFerryLineId) ?? ferryLines[0] ?? null,
    [ferryLines, selectedFerryLineId]
  );
  const selectedDisplayLine = activePanel === 'ferry' ? selectedFerryLine : selectedLine;

  useEffect(() => {
    if (!query.trim()) return;
    const currentVisible = filteredLines.some((line) => line.id === selectedLineId);
    if (!currentVisible && filteredLines[0]) {
      setSelectedLineId(filteredLines[0].id);
    }
  }, [filteredLines, query, selectedLineId]);

  useEffect(() => {
    if (selectedFerryLineId && ferryLines.some((line) => line.id === selectedFerryLineId)) return;
    setSelectedFerryLineId(ferryLines[0]?.id);
  }, [ferryLines, selectedFerryLineId]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const {
    selectedDirectionId,
    setSelectedDirectionId,
    directionsLoading,
    directionsError,
    effectiveDirectionOptions,
    effectiveActiveDirection,
  } = useLineDirectionState({
    selectedLine: selectedDisplayLine ?? null,
    dayType,
    hasMounted,
    enableLiveDirectionRequests: dataSource === 'live',
  });

  useEffect(() => {
    setShowStops(false);
  }, [selectedDisplayLine?.id, selectedDirectionId]);

  const selectedDirection = effectiveActiveDirection;
  const activeDirectionId = selectedDirection?.id ?? selectedDirectionId;
  const activeOrigin = selectedDirection?.origin ?? selectedDisplayLine?.origin ?? '';
  const activeDestination = selectedDirection?.destination ?? selectedDisplayLine?.destination ?? '';
  const activeRouteLabel = selectedDirection?.routeLabel ?? selectedDisplayLine?.routeLabel ?? '';
  const activeStops = useMemo(
    () => selectedDirection?.stops ?? selectedDisplayLine?.stops ?? [],
    [selectedDirection?.stops, selectedDisplayLine?.stops]
  );
  const activePath = useMemo(
    () => (selectedDirection?.path.length ? selectedDirection.path : selectedDisplayLine?.path ?? []),
    [selectedDirection?.path, selectedDisplayLine?.path]
  );
  const ferryLabel = resolveFerryLabel(selectedDisplayLine);
  const ferryFareRows = parseFerryFareRows(selectedDisplayLine?.fareLabel);
  const fareCardValue =
    activePanel === 'ferry'
      ? isPedestrianFerry(selectedDisplayLine)
        ? 'Gratuito'
        : ferryFareRows.length
          ? 'Consulte tabela'
          : selectedDisplayLine?.fareLabel || 'Tarifas por tipo'
      : URBAN_FARE_LABEL;

  const computedDistanceKm = useMemo(() => {
    if (!selectedDisplayLine) return 0;
    if (selectedDisplayLine.distanceKm > 0) return selectedDisplayLine.distanceKm;
    const pathDistanceKm = computePolylineDistanceKm(activePath);
    if (pathDistanceKm > 0) return pathDistanceKm;
    return computePolylineDistanceKm(activeStops.map((stop) => stop.location));
  }, [activePath, activeStops, selectedDisplayLine]);

  const computedDurationMinutes = useMemo(() => {
    if (!selectedDisplayLine) return 0;
    if (selectedDisplayLine.estimatedDurationMinutes > 0) return selectedDisplayLine.estimatedDurationMinutes;
    return estimateDurationMinutes(computedDistanceKm, activeStops.length, selectedDisplayLine.mode);
  }, [activeStops.length, computedDistanceKm, selectedDisplayLine]);

  useEffect(() => {
    if (!selectedDisplayLine) {
      setSchedulesByDay({ weekday: [], saturday: [], sunday: [] });
      return;
    }

    const localSchedules: Record<ServiceDay, string[]> = {
      weekday: selectedDisplayLine.schedules.weekday.map((item) => item.time),
      saturday: selectedDisplayLine.schedules.saturday.map((item) => item.time),
      sunday: selectedDisplayLine.schedules.sunday.map((item) => item.time),
    };

    if (!activeDirectionId || dataSource !== 'live') {
      setSchedulesByDay(localSchedules);
      return;
    }

    let cancelled = false;
    setAllSchedulesLoading(true);

    void Promise.allSettled(
      (['weekday', 'saturday', 'sunday'] as ServiceDay[]).map((serviceDay) =>
        getLineDirectionSchedules(selectedDisplayLine.id, activeDirectionId, serviceDay).then((response) => ({
          serviceDay,
          times: response.items.map((item) => item.time),
        }))
      )
    )
      .then((results) => {
        if (cancelled) return;

        const resolved: Record<ServiceDay, string[]> = { ...localSchedules };
        for (const result of results) {
          if (result.status === 'fulfilled') {
            resolved[result.value.serviceDay] = result.value.times;
          }
        }
        setSchedulesByDay(resolved);
      })
      .catch(() => {
        if (cancelled) return;
        setSchedulesByDay(localSchedules);
      })
      .finally(() => {
        if (!cancelled) setAllSchedulesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeDirectionId, dataSource, selectedDisplayLine]);

  const visibleLines = filteredLines.length ? filteredLines : terrestrialLines;

  return (
    <main className="min-h-screen bg-[#f5f1e6] text-[#14233c] font-sans">
      <section className="mx-auto min-h-screen max-w-[1460px] overflow-hidden bg-[#f5f1e6] shadow-2xl lg:rounded-[28px]">
        <ImmersiveHeader activeHref="/linhas" />

        <section className="relative min-h-[560px] overflow-hidden">
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
            <Image src={heroImage} alt="Ônibus amarelo MOVI" fill className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e6] via-[#f5f1e6]/68 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e6]/35 via-transparent to-[#13100b]/10" />
          </div>

          <div className="relative z-10 flex min-h-[560px] flex-col justify-center px-8 pt-28 lg:px-12">
            <div className="max-w-[620px]">
              <p className="mb-6 text-sm font-black uppercase tracking-[0.24em] text-[#14233c]">Linhas e horários</p>
              <h1 className="text-4xl font-black leading-[0.98] tracking-normal text-[#10213d] sm:text-5xl lg:text-7xl">
                Encontre sua linha
                <br />
                <span className="text-[#16803f]">e veja os horários</span>
              </h1>
              <p className="mt-7 max-w-[500px] text-lg font-medium leading-8 text-[#14233c]">
                Pesquise sua linha ou navegue pela lista e veja os horários, itinerários e pontos de parada.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-20 mx-auto -mt-12 max-w-[820px] px-8">
          <div className="grid gap-3 rounded-3xl border border-[#14233c]/10 bg-white/92 p-4 shadow-lg backdrop-blur md:grid-cols-[1fr_auto] md:items-center">
            <label className="flex items-center gap-3 rounded-2xl border border-[#14233c]/15 bg-white px-4 py-3">
              <Search size={20} className="text-[#14233c]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por linha, bairro, parada ou destino"
                className="w-full bg-transparent text-sm font-medium text-[#14233c] outline-none placeholder:text-[#14233c]/50"
                aria-label="Busca rápida de linhas"
              />
            </label>
            <button
              type="button"
              onClick={() => setQuery('')}
              disabled={!query}
              className="rounded-full border border-[#14233c]/25 bg-white px-5 py-3 text-xs font-black uppercase text-[#14233c] transition enabled:hover:bg-[#f5f1e6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Limpar
            </button>
          </div>
        </section>

        <section className="grid gap-8 px-8 py-10 lg:grid-cols-[360px_1fr] lg:px-12">
          <aside className="rounded-3xl bg-[#f0eadc] p-8 shadow-sm">
            <h2 className="text-sm font-black uppercase text-[#14233c]">Todas as linhas</h2>
            <p className="mt-2 text-sm font-medium text-[#14233c]/75">Navegue e selecione a linha desejada</p>

            <div className="mt-8 max-h-[710px] space-y-2 overflow-y-auto pr-2">
              {visibleLines.map((line, index) => {
                const active = activePanel === 'terrestrial' && selectedLine?.id === line.id;
                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => {
                      setActivePanel('terrestrial');
                      setSelectedLineId(line.id);
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl p-3 text-left transition ${active ? 'bg-[#ffd200] shadow-lg shadow-yellow-500/20' : 'hover:bg-white/70'}`}
                  >
                    <LineBadge label={line.code} tone={toneByIndex[index % toneByIndex.length] ?? 'green'} active={active} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black text-[#14233c]">{line.name}</span>
                      <span className="block text-xs font-medium text-[#14233c]/75">{line.routeLabel}</span>
                    </span>
                    <ArrowRight size={17} />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setActivePanel('ferry')}
              className={`mt-8 flex w-full items-center gap-4 rounded-2xl border p-6 text-left shadow-sm transition ${
                activePanel === 'ferry'
                  ? 'border-[#14233c]/30 bg-[#ffd200]/40'
                  : 'border-[#d7bd58]/40 bg-[#fff4cd] hover:bg-[#ffefb3]'
              }`}
            >
              <ShipWheel size={38} className="text-[#071d39]" />
              <span className="flex-1">
                <span className="block text-sm font-black text-[#14233c]">Ferry Boat</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-[#14233c]/70">
                  {ferryLines.length
                    ? `${ferryLines.length} rota(s) hidroviárias - ver horários e informações`
                    : 'Clique aqui para ver horários e informações'}
                </span>
              </span>
              <ArrowRight size={17} />
            </button>
          </aside>

          <section className="rounded-3xl border border-[#14233c]/10 bg-[#f8f3e8] p-8 shadow-sm">
            {selectedDisplayLine ? (
              <>
                {activePanel === 'ferry' && ferryLines.length > 1 ? (
                  <div className="mb-6 rounded-2xl border border-[#14233c]/10 bg-white/70 p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-[#14233c]">Rotas hidroviárias</p>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {ferryLines.map((line) => (
                        <button
                          key={line.id}
                          type="button"
                          onClick={() => setSelectedFerryLineId(line.id)}
                          className={`rounded-xl border px-4 py-3 text-left transition ${
                            selectedDisplayLine.id === line.id
                              ? 'border-[#14233c] bg-[#14233c] text-white shadow-sm'
                              : 'border-[#14233c]/25 bg-white text-[#14233c] hover:bg-[#f5f1e6]'
                          }`}
                        >
                          <p className="text-[11px] font-black uppercase tracking-[0.08em] opacity-80">{line.code}</p>
                          <p className="mt-1 text-sm font-bold leading-5">{getFerryDisplayName(line)}</p>
                          <p className={`mt-1 text-xs font-semibold ${selectedDisplayLine.id === line.id ? 'text-white/85' : 'text-[#14233c]/70'}`}>
                            {isPedestrianFerry(line) ? 'Lancha gratuita para pedestres' : 'Travessia com tabela de tarifas'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <LineBadge label={selectedDisplayLine.code} tone="yellow" active />
                    <div>
                      <h2 className="text-3xl font-black tracking-[-0.04em] text-[#14233c]">{selectedDisplayLine.name}</h2>
                      {ferryLabel ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[#14233c]/20 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#14233c]">
                            {ferryLabel.title}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${
                              isPedestrianFerry(selectedDisplayLine) ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ferryLabel.subtitle}
                          </span>
                        </div>
                      ) : null}
                      <p className="mt-2 text-base font-medium text-[#14233c]">{activeRouteLabel}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => void toggleFavorite(selectedDisplayLine.id)}
                      disabled={pendingLineIds.includes(selectedDisplayLine.id)}
                      className={`flex items-center gap-2 rounded-full border px-5 py-3 text-xs font-black uppercase transition ${
                        isFavorite(selectedDisplayLine.id)
                          ? 'border-[#14532d]/20 bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]'
                          : 'border-[#14233c]/30 text-[#14233c] hover:bg-white'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <Star size={15} />
                      {pendingLineIds.includes(selectedDisplayLine.id)
                        ? 'Salvando...'
                        : isFavorite(selectedDisplayLine.id)
                          ? 'Favorita'
                          : 'Favoritar'}
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { icon: Clock, label: 'Tempo médio de viagem', value: computedDurationMinutes > 0 ? `${computedDurationMinutes} min` : 'Não informado' },
                    { icon: Route, label: 'Extensão da linha', value: computedDistanceKm > 0 ? `${computedDistanceKm.toFixed(1)} km` : 'Não informado' },
                    { icon: CreditCard, label: 'Tarifa', value: fareCardValue },
                    { icon: Bus, label: 'Tipo de serviço', value: selectedDisplayLine.mode === 'intercity' ? 'Intermunicipal' : selectedDisplayLine.mode === 'ferry' ? 'Hidroviário' : 'Convencional' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4 rounded-xl border border-[#14233c]/10 bg-white/55 p-5">
                      <item.icon size={26} className="text-[#14233c]" />
                      <div>
                        <p className="text-xs font-medium text-[#14233c]/70">{item.label}</p>
                        <p className="mt-1 text-base font-black text-[#14233c]">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {activePanel === 'ferry' ? (
                  <div className="mt-6 rounded-xl border border-[#14233c]/10 bg-white/70 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#14233c]">Tarifas da travessia</h3>
                      {isPedestrianFerry(selectedDisplayLine) ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black uppercase text-green-800">Gratuita</span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-800">Tarifada</span>
                      )}
                    </div>

                    {isPedestrianFerry(selectedDisplayLine) ? (
                      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                        Esta linha é exclusiva para pedestres e possui gratuidade.
                      </div>
                    ) : ferryFareRows.length ? (
                      <div className="overflow-hidden rounded-xl border border-[#14233c]/10 bg-white">
                        <div className="grid grid-cols-[1fr_auto] border-b border-[#14233c]/10 bg-[#f5f1e6] px-4 py-3 text-xs font-black uppercase tracking-[0.06em] text-[#14233c]">
                          <span>Categoria</span>
                          <span>Valor</span>
                        </div>
                        {ferryFareRows.map((row) => (
                          <div key={`${row.category}-${row.price}`} className="grid grid-cols-[1fr_auto] border-b border-[#14233c]/10 px-4 py-3 text-sm last:border-b-0">
                            <span className="font-medium text-[#14233c]">{row.category}</span>
                            <span className="font-black text-[#14233c]">{row.price || '-'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-[#14233c]/70">Tarifas ainda não disponíveis para esta rota.</p>
                    )}
                  </div>
                ) : null}

                <div className="mt-6">
                  <MapReadyArea line={selectedDisplayLine} activeDirection={selectedDirection} showStopNumbers={showStops} />
                </div>

                <div className="mt-6 rounded-xl border border-[#14233c]/10 bg-white/70 p-5">
                  <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-end md:gap-6">
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#14233c]">Paradas</p>
                      <button
                        type="button"
                        onClick={() => setShowStops((value) => !value)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#14233c]/25 bg-white px-5 py-3 text-xs font-black uppercase text-[#14233c] hover:bg-[#f5f1e6]"
                      >
                        {showStops ? 'Ocultar paradas' : 'Mostrar paradas'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[#14233c]">
                        <Route className="h-4 w-4 text-[#14233c]" />
                        Sentido da viagem
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {effectiveDirectionOptions.length ? (
                          effectiveDirectionOptions.map((direction) => (
                            <button
                              key={direction.id}
                              type="button"
                              onClick={() => setSelectedDirectionId(direction.id)}
                              disabled={directionsLoading}
                              className={`rounded-full border px-5 py-3 text-xs font-black uppercase transition ${
                                activeDirectionId === direction.id
                                  ? 'border-[#14233c] bg-[#14233c] text-white'
                                  : 'border-[#14233c]/25 bg-white text-[#14233c] hover:bg-[#f5f1e6]'
                              }`}
                            >
                              {direction.label}
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">Nenhum sentido cadastrado para esta linha.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {directionsLoading ? <p className="mt-3 text-xs text-slate-500">Carregando rota, paradas e horários...</p> : null}
                  {directionsError ? <p className="mt-3 text-xs text-rose-600">{directionsError}</p> : null}

                  {showStops ? (
                    activeStops.length > 0 ? (
                      <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-[#14233c]/10 bg-white">
                        {activeStops.map((stop, index) => (
                          <div key={stop.id} className="flex items-center gap-3 border-b border-[#14233c]/8 px-4 py-3 text-sm last:border-b-0">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#eef8ef] text-xs font-black text-[#17803e]">
                              {stop.sequence ?? index + 1}
                            </span>
                            <span className="font-medium text-[#14233c]">{stop.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm font-medium text-[#14233c]/70">
                        Paradas ainda não disponíveis para este sentido.
                      </p>
                    )
                  ) : null}
                </div>

                <div className="mt-10 flex flex-wrap items-end justify-between gap-5">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-[0.14em] text-[#14233c]">Horários</h2>
                    <p className="mt-2 text-sm font-medium text-[#14233c]/70">Dias úteis, sábado e domingo/feriados exibidos juntos.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {allSchedulesLoading ? <p className="text-xs font-semibold text-slate-500">Carregando horários de todos os dias...</p> : null}

                  {dayTypeOptions.map((option, index) => {
                    const times = schedulesByDay[option.id];
                    if (!times.length) {
                      return (
                        <div key={option.id} className="rounded-xl border border-dashed border-[#14233c]/20 bg-white/60 p-5 text-sm font-medium text-[#14233c]/70">
                          {option.label}: sem horários cadastrados para este sentido.
                        </div>
                      );
                    }

                    return (
                      <ScheduleGrid
                        key={option.id}
                        title={`${option.label} - Sentido: ${activeOrigin} -> ${activeDestination}`}
                        times={times}
                        tone={index % 2 === 0 ? 'green' : 'blue'}
                      />
                    );
                  })}
                </div>

                {!isAuthenticated ? (
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e0b83b] bg-[#fff4cd] p-5">
                    <div className="flex items-center gap-3">
                      <Star className="text-[#d59d00]" size={24} />
                      <p className="text-sm font-bold text-[#14233c]">Dica: você pode favoritar essa linha para acessá-la mais rápido.</p>
                    </div>
                    <Link href="/login" className="flex items-center gap-2 rounded-xl border border-[#14233c]/30 px-5 py-3 text-xs font-black uppercase text-[#14233c]">
                      <UserRound size={15} /> Fazer login para favoritar
                    </Link>
                  </div>
                ) : null}

                {favoritesError ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                    {favoritesError}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-[#14233c]/20 bg-white/60 p-8 text-sm font-medium text-[#14233c]/70">
                Nenhuma linha disponível no momento.
              </div>
            )}

            {dataSource === 'fallback' ? (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                Modo seguro ativo: a API está indisponível agora. Exibindo dados locais para manter a consulta.
              </p>
            ) : null}
          </section>
        </section>

        <footer className="mx-8 grid overflow-hidden rounded-t-[34px] bg-[#071d39] text-white lg:mx-12 lg:grid-cols-4">
          {[
            { icon: MapPin, title: 'Planeje sua viagem', text: 'Encontre a melhor rota até o seu destino.', href: '/mapa' },
            { icon: CreditCard, title: 'Cartão transporte', text: 'Veja como adquirir e recarregar seu cartão.', href: '/bilhetes' },
            { icon: MessageCircle, title: 'Atendimento', text: 'Fale conosco pelos canais oficiais.', href: '/contato' },
            { icon: Smartphone, title: 'App MOVI', text: 'Baixe o app e tenha tudo na palma da mão.', href: '/login' },
          ].map((item, index) => (
            <Link key={item.title} href={item.href} className={`flex gap-5 p-8 ${index > 0 ? 'border-l border-white/10' : ''}`}>
              <item.icon className="shrink-0" size={36} />
              <div>
                <h3 className="text-sm font-black uppercase">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">{item.text}</p>
              </div>
            </Link>
          ))}
        </footer>
      </section>
    </main>
  );
}
