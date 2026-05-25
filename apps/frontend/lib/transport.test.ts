import { describe, expect, it } from 'vitest';
import { fallbackLines } from '@cityline/shared';
import {
  buildLineDirections,
  estimateWalkingMinutes,
  filterLinesByQuery,
  findNearestStopForDirection,
  findNearestStops,
  getDistanceInMeters,
  getMinutesUntilDeparture,
  getNextDepartures,
  recommendBoardingStopForDirection,
} from './transport';

describe('transport helpers', () => {
  it('filtra linhas por texto relevante', () => {
    const result = filterLinesByQuery(fallbackLines, 'Praia');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.name).toContain('Praia Grande');
  });

  it('retorna apenas proximas partidas futuras', () => {
    const schedules = fallbackLines[0]!.schedules.weekday;
    const departures = getNextDepartures(schedules, new Date('2026-03-30T06:15:00'));
    expect(departures[0]?.time).toBe('06:20');
    expect(departures).toHaveLength(3);
  });

  it('permite encontrar linhas pelo codigo', () => {
    const result = filterLinesByQuery(fallbackLines, '0101');
    expect(result.some((line) => line.code === '0101')).toBe(true);
  });

  it('encontra os pontos mais proximos da localizacao do usuario', () => {
    const matches = findNearestStops(fallbackLines, { lat: -26.2434, lng: -48.6379 });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.stopName).toContain('Praca');
    expect(matches[0]?.lines.length).toBeGreaterThan(0);
  });

  it('mostra status correto para partidas passadas e futuras', () => {
    expect(getMinutesUntilDeparture('05:40', new Date('2026-03-30T06:20:00'))).toBe('já saiu');
    expect(getMinutesUntilDeparture('06:20', new Date('2026-03-30T06:20:00'))).toBe('saindo agora');
    expect(getMinutesUntilDeparture('06:32', new Date('2026-03-30T06:20:00'))).toBe('partida em 12 min');
  });

  it('gera dois sentidos de rota para a mesma linha', () => {
    const directions = buildLineDirections(fallbackLines[0]!);

    expect(directions).toHaveLength(2);
    expect(directions[0]?.origin).toBe(fallbackLines[0]!.origin);
    expect(directions[1]?.origin).toBe(fallbackLines[0]!.destination);
    expect(directions[1]?.path[0]).toEqual(fallbackLines[0]!.path.at(-1));
  });

  it('seleciona a parada mais proxima dentro do sentido ativo', () => {
    const direction = buildLineDirections(fallbackLines[0]!)[0]!;
    const nearest = findNearestStopForDirection(direction, { lat: -26.2434, lng: -48.6351 });

    expect(nearest).not.toBeNull();
    expect(nearest?.stopName).toContain('Ogmo');
    expect(nearest?.walkingMinutes).toBeGreaterThan(0);
  });

  it('calcula distancia e caminhada estimada de forma consistente', () => {
    const distance = getDistanceInMeters({ lat: -26.2434, lng: -48.6379 }, { lat: -26.2435, lng: -48.6351 });

    expect(distance).toBeGreaterThan(200);
    expect(estimateWalkingMinutes(distance)).toBeGreaterThanOrEqual(1);
  });

  it('retorna null quando a geolocalizacao ou os dados do sentido falham', () => {
    expect(findNearestStopForDirection(null, { lat: -26.24, lng: -48.63 })).toBeNull();
    expect(findNearestStopForDirection({ stops: [] }, null)).toBeNull();
  });

  it('recomenda operacionalmente uma parada viavel para embarque', () => {
    const direction = buildLineDirections(fallbackLines[0]!)[0]!;
    const recommendation = recommendBoardingStopForDirection(
      direction,
      'weekday',
      { lat: -26.2434, lng: -48.6351 },
      new Date('2026-03-30T06:00:00')
    );

    expect(recommendation).not.toBeNull();
    expect(recommendation?.reason).toBe('operational');
    expect(recommendation?.canMakeIt).toBe(true);
    expect(recommendation?.nextDepartureTime).toBeTruthy();
  });

  it('avisa quando o usuario nao chega a tempo para um embarque util', () => {
    const direction = buildLineDirections(fallbackLines[0]!)[0]!;
    const recommendation = recommendBoardingStopForDirection(
      direction,
      'weekday',
      { lat: -26.37, lng: -48.84 },
      new Date('2026-03-30T19:55:00')
    );

    expect(recommendation).not.toBeNull();
    expect(recommendation?.canMakeIt).toBe(false);
    expect(recommendation?.reason).toBe('nearest-fallback');
  });

  it('faz fallback para a parada fisicamente mais proxima quando faltam horarios', () => {
    const direction = {
      ...buildLineDirections(fallbackLines[0]!)[0]!,
      schedules: {
        weekday: [],
        saturday: [],
        sunday: [],
      },
    };

    const recommendation = recommendBoardingStopForDirection(
      direction,
      'weekday',
      { lat: -26.2434, lng: -48.6351 },
      new Date('2026-03-30T06:00:00')
    );

    expect(recommendation).not.toBeNull();
    expect(recommendation?.reason).toBe('nearest-fallback');
    expect(recommendation?.stopName).toContain('Ogmo');
  });
});
