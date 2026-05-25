'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { TransportLine } from '@cityline/shared';
import { AlertTriangle, Clock3, LocateFixed, MapPinned, Navigation, Search } from 'lucide-react';
import { useUserLocation } from '@/hooks/use-user-location';
import { formatApproximateDistance } from '../utils/geo-distance';
import { findNearestStop } from '../utils/nearest-stop';

interface NearestStopFinderProps {
  lines: TransportLine[];
}

export function NearestStopFinder({ lines }: NearestStopFinderProps) {
  const { supported, location, isLoading, error, requestLocation } = useUserLocation();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const nearestStop = useMemo(() => findNearestStop(lines, location), [lines, location]);
  const primaryLine = nearestStop?.lines[0] ?? null;
  const extraLineCount = Math.max(0, (nearestStop?.lines.length ?? 0) - 1);
  const canRequestLocation = hasMounted && supported && !isLoading;

  return (
    <section className="mt-8 rounded-[30px] border border-gray-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EEF4FF] text-blue-600">
            <LocateFixed className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Localizacao inteligente</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-950">Minha parada mais proxima</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Use sua localizacao apenas agora para comparar com as paradas carregadas. O MOVI nao salva nem acompanha
              sua posicao.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void requestLocation()}
          disabled={!canRequestLocation}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          <Navigation className="h-4 w-4" />
          {isLoading ? 'Localizando...' : location ? 'Atualizar localizacao' : 'Usar minha localizacao'}
        </button>
      </div>

      {hasMounted && !supported ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Seu navegador nao suporta geolocalizacao. Use a busca manual por linha, parada ou destino.</p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error} A busca manual continua disponivel.</p>
        </div>
      ) : null}

      <div className="mt-6">
        {nearestStop && primaryLine ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
            <div className="rounded-[24px] border border-blue-100 bg-blue-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Parada mais proxima</p>
              <h3 className="mt-3 text-2xl font-semibold text-gray-950">{nearestStop.stopName}</h3>
              <p className="mt-2 text-sm font-medium text-gray-600">
                Aproximadamente {formatApproximateDistance(nearestStop.distanceMeters)} de voce.
              </p>
              <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Linha relacionada</p>
                <p className="mt-2 text-base font-semibold text-gray-950">
                  {primaryLine.code} - {primaryLine.name}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {primaryLine.origin} para {primaryLine.destination}
                  {extraLineCount ? ` - mais ${extraLineCount} linha(s) nesta parada` : ''}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-gray-950">Proximos passos</p>
              <div className="mt-4 grid gap-3">
                <Link href={`/horarios?linha=${primaryLine.id}`} className="inline-flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-gray-900 shadow-sm transition hover:text-blue-700">
                  Ver horarios da linha
                  <Clock3 className="h-4 w-4 text-blue-600" />
                </Link>
                <Link href={`/mapa?linha=${primaryLine.id}`} className="inline-flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-gray-900 shadow-sm transition hover:text-blue-700">
                  Abrir no mapa
                  <MapPinned className="h-4 w-4 text-blue-600" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-gray-300 bg-slate-50 p-5">
            <Search className="h-6 w-6 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold text-gray-950">
              {location ? 'Nao encontramos paradas proximas nos dados atuais' : 'Clique para encontrar uma parada proxima'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {location
                ? 'As paradas carregadas ainda podem estar em revisao para a sua regiao. A busca manual continua disponivel.'
                : 'A permissao sera solicitada pelo navegador somente depois do clique. Nenhuma localizacao sera salva.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
