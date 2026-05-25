import type { GeoPoint, StopPoint, TransportLine } from '@cityline/shared';
import { getGeoDistanceMeters } from './geo-distance';

export interface NearestStopLine {
  id: string;
  code: string;
  name: string;
  color: string;
  origin: string;
  destination: string;
}

export interface NearestStopResult {
  stopId: string;
  stopName: string;
  location: GeoPoint;
  distanceMeters: number;
  lines: NearestStopLine[];
}

const hasValidLocation = (stop: StopPoint) =>
  Number.isFinite(stop.location.lat) && Number.isFinite(stop.location.lng);

const getStopKey = (stop: StopPoint) =>
  `${stop.name.trim().toLowerCase()}-${stop.location.lat.toFixed(5)}-${stop.location.lng.toFixed(5)}`;

export const findNearestStop = (lines: TransportLine[], userLocation: GeoPoint | null): NearestStopResult | null => {
  if (!userLocation) return null;

  const stopsByPosition = new Map<string, NearestStopResult>();

  for (const line of lines) {
    for (const stop of line.stops) {
      if (!hasValidLocation(stop)) continue;

      const key = getStopKey(stop);
      const distanceMeters = getGeoDistanceMeters(userLocation, stop.location);
      const lineSummary: NearestStopLine = {
        id: line.id,
        code: line.code,
        name: line.name,
        color: line.color,
        origin: line.origin,
        destination: line.destination,
      };
      const existing = stopsByPosition.get(key);

      if (existing) {
        existing.distanceMeters = Math.min(existing.distanceMeters, distanceMeters);
        if (!existing.lines.some((entry) => entry.id === line.id)) {
          existing.lines.push(lineSummary);
        }
        continue;
      }

      stopsByPosition.set(key, {
        stopId: stop.id,
        stopName: stop.name,
        location: stop.location,
        distanceMeters,
        lines: [lineSummary],
      });
    }
  }

  return [...stopsByPosition.values()].sort((left, right) => left.distanceMeters - right.distanceMeters)[0] ?? null;
};
