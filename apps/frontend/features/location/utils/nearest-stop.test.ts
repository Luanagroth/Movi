import { describe, expect, it } from 'vitest';
import { fallbackLines } from '@cityline/shared';
import { formatApproximateDistance, getGeoDistanceMeters } from './geo-distance';
import { findNearestStop } from './nearest-stop';

describe('location helpers', () => {
  it('calcula distancia geografica aproximada', () => {
    const distance = getGeoDistanceMeters({ lat: -26.2434, lng: -48.6379 }, { lat: -26.2435, lng: -48.6351 });

    expect(distance).toBeGreaterThan(200);
    expect(formatApproximateDistance(distance)).toContain('m');
  });

  it('encontra a parada mais proxima usando linhas carregadas', () => {
    const nearest = findNearestStop(fallbackLines, { lat: -26.2434, lng: -48.6379 });

    expect(nearest).not.toBeNull();
    expect(nearest?.stopName).toContain('Praca');
    expect(nearest?.lines.length).toBeGreaterThan(0);
  });

  it('retorna null sem localizacao ou sem paradas', () => {
    expect(findNearestStop(fallbackLines, null)).toBeNull();
    expect(findNearestStop([], { lat: -26.2434, lng: -48.6379 })).toBeNull();
  });
});
