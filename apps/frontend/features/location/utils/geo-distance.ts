import type { GeoPoint } from '@cityline/shared';

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (value: number) => (value * Math.PI) / 180;

export const getGeoDistanceMeters = (from: GeoPoint, to: GeoPoint) => {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatApproximateDistance = (distanceMeters: number) => {
  if (!Number.isFinite(distanceMeters)) return 'Distancia indisponivel';
  if (distanceMeters < 1000) return `${Math.max(0, Math.round(distanceMeters))} m`;

  return `${(distanceMeters / 1000).toFixed(1).replace('.', ',')} km`;
};
