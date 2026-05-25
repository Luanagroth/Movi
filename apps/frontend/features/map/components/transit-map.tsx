'use client';

import { Fragment, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import type { GeoPoint, StopPoint } from '@cityline/shared';
import { cityMapCenter } from '@cityline/shared';
import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import type { UiLocale } from '@/lib/ui-copy';
import { uiCopy } from '@/lib/ui-copy';
import type { MapLineView } from '@/types/dashboard';

interface ActiveDirectionMapView {
  id?: string;
  lineId?: string;
  origin: string;
  destination: string;
  routeLabel: string;
  path: GeoPoint[];
  stops: StopPoint[];
}

export interface TransitMapProps {
  lines: MapLineView[];
  activeLineId?: string;
  activeDirectionId?: string;
  activeDirection?: ActiveDirectionMapView | null;
  showStopNumbers?: boolean;
  userLocation?: GeoPoint;
  locale?: UiLocale;
  onSelectLine?: (lineId: string) => void;
}
const toPathFromStops = (stops: StopPoint[]): GeoPoint[] =>
  stops
    .map((stop) => stop.location)
    .filter((point): point is GeoPoint => point !== null && Number.isFinite(point.lat) && Number.isFinite(point.lng));

function MapViewportSync({ points }: { points: GeoPoint[] }) {
  const map = useMap();

  useEffect(() => {
    const normalizedPoints = points
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
      .map((point) => [point.lat, point.lng] as [number, number]);

    if (!normalizedPoints.length) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (!map.getContainer()?.isConnected) {
        return;
      }

      map.invalidateSize(false);

      if (normalizedPoints.length === 1) {
        map.setView(normalizedPoints[0]!, 13, { animate: false });
        return;
      }

      map.fitBounds(normalizedPoints, { padding: [28, 28], maxZoom: 14, animate: false });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [map, points]);

  return null;
}

export function TransitMap({
  lines,
  activeLineId,
  activeDirectionId,
  activeDirection,
  showStopNumbers = false,
  userLocation,
  locale = 'pt-BR',
  onSelectLine,
}: TransitMapProps) {
  const copy = uiCopy[locale].labels;
  const hasExplicitDirection = Boolean(activeDirectionId);
  const activeLine = lines.find((line) => line.id === activeLineId) ?? lines[0];
  const highlightedLineId = activeLineId ?? activeLine?.id;
  const center = activeDirection?.path[0] ?? activeLine?.path[0] ?? cityMapCenter;
  const activeFallbackPath = hasExplicitDirection && activeDirection?.stops?.length ? toPathFromStops(activeDirection.stops) : [];
  const visibleLines = highlightedLineId ? lines.filter((line) => line.id === highlightedLineId) : lines;
  const focusPoints = [
    ...(activeDirection?.path ?? activeLine?.path ?? []),
    ...activeFallbackPath,
    ...(userLocation ? [userLocation] : []),
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs text-slate-500">{copy.clickMapHint}</p>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-sm">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            {copy.availableLines}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
            {copy.activeLine}
          </span>
        </div>
      </div>
      <div className="h-[340px] overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={[center.lat, center.lng]} zoom={12} scrollWheelZoom className="h-full w-full">
          <MapViewportSync points={focusPoints.length ? focusPoints : [center]} />

          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {userLocation ? (
            <>
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={500}
                pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.1 }}
              />
              <CircleMarker
                center={[userLocation.lat, userLocation.lng]}
                radius={8}
                pathOptions={{ color: '#0369a1', fillColor: '#0ea5e9', fillOpacity: 1 }}
              >
                <Popup>
                  <strong>{copy.yourLocation}</strong>
                  <br />
                  {copy.boardingLocationHint}
                </Popup>
              </CircleMarker>
            </>
          ) : null}

          {visibleLines.map((line) => {
            const isActive = line.id === highlightedLineId;
            const path =
              isActive && activeDirection
                ? activeDirection.path.length
                  ? activeDirection.path
                  : activeFallbackPath
                : line.path;
            const stops = isActive && activeDirection ? activeDirection.stops : line.stops;
            const routeLabel = isActive && activeDirection ? activeDirection.routeLabel : `${line.origin} -> ${line.destination}`;

            return (
              <Fragment key={line.id}>
                <Polyline
                  positions={path.map((point) => [point.lat, point.lng] as [number, number])}
                  pathOptions={{
                    color: line.color,
                    weight: isActive ? 6 : 3,
                    opacity: isActive ? 0.95 : 0.45,
                  }}
                  eventHandlers={{ click: () => onSelectLine?.(line.id) }}
                />
                {stops.map((stop, stopIndex) => {
                  return (
                    <CircleMarker
                      key={stop.id}
                      center={[stop.location.lat, stop.location.lng]}
                      radius={isActive ? 6 : 4}
                      pathOptions={{
                        color: line.color,
                        fillColor: line.color,
                        fillOpacity: 0.95,
                        weight: 1,
                      }}
                      eventHandlers={{ click: () => onSelectLine?.(line.id) }}
                    >
                      {showStopNumbers && isActive ? (
                        <Tooltip
                          permanent
                          direction="center"
                          offset={[0, 0]}
                          opacity={1}
                          interactive={false}
                          className="map-stop-number-chip"
                        >
                          <span className="text-xs font-semibold text-slate-800">{stop.sequence ?? stopIndex + 1}</span>
                        </Tooltip>
                      ) : null}
                      <Popup>
                        <strong>
                          {line.code} · {stop.name}
                        </strong>
                        <br />
                        {routeLabel}
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
