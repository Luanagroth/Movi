import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fallbackLines, type ServiceDay } from '@cityline/shared';

vi.mock('@/services/transport/transport.service', () => ({
  getLineDirections: vi.fn(),
  getLineDirectionStops: vi.fn(),
  getLineDirectionSchedules: vi.fn(),
  getLineDirectionPath: vi.fn(),
}));

import {
  getLineDirections,
  getLineDirectionPath,
  getLineDirectionSchedules,
  getLineDirectionStops,
} from '@/services/transport/transport.service';
import { useLineDirectionState } from './use-line-direction-state';

const mockedGetLineDirections = vi.mocked(getLineDirections);
const mockedGetLineDirectionStops = vi.mocked(getLineDirectionStops);
const mockedGetLineDirectionSchedules = vi.mocked(getLineDirectionSchedules);
const mockedGetLineDirectionPath = vi.mocked(getLineDirectionPath);

const lineA = {
  ...fallbackLines[0]!,
  id: 'line-a',
  code: 'A',
  name: 'Linha A',
};

const lineB = {
  ...fallbackLines[1]!,
  id: 'line-b',
  code: 'B',
  name: 'Linha B',
};

const makeDirection = (lineId: string, directionId: string) => ({
  id: directionId,
  lineId,
  lineCode: lineId.toUpperCase(),
  lineName: `Linha ${lineId.toUpperCase()}`,
  type: 'outbound' as const,
  label: 'Ida',
  routeLabel: 'Origem -> Destino',
  origin: 'Origem',
  destination: 'Destino',
  stopCount: 1,
  pathPoints: 1,
});

const makeStopsResponse = (line: typeof lineA, directionId: string) => ({
  lineId: line.id,
  lineCode: line.code,
  lineName: line.name,
  direction: {
    id: directionId,
    type: 'outbound' as const,
    label: 'Ida',
    routeLabel: line.routeLabel,
    origin: line.origin,
    destination: line.destination,
  },
  items: line.stops.slice(0, 1),
});

const makeSchedulesResponse = (line: typeof lineA, directionId: string, dayType: ServiceDay) => ({
  lineId: line.id,
  lineCode: line.code,
  lineName: line.name,
  direction: {
    id: directionId,
    type: 'outbound' as const,
    label: 'Ida',
    routeLabel: line.routeLabel,
    origin: line.origin,
    destination: line.destination,
  },
  dayType,
  items: line.schedules[dayType].slice(0, 1),
  nextDepartures: [],
  summary: 'Sem partidas imediatas',
  hasDeparturesToday: false,
});

const makePathResponse = (line: typeof lineA, directionId: string) => ({
  lineId: line.id,
  lineCode: line.code,
  lineName: line.name,
  direction: {
    id: directionId,
    type: 'outbound' as const,
    label: 'Ida',
    routeLabel: line.routeLabel,
    origin: line.origin,
    destination: line.destination,
  },
  path: line.path.slice(0, 2),
});

describe('useLineDirectionState', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('nao reutiliza directionId de outra linha ao trocar a selecao', async () => {
    mockedGetLineDirections.mockImplementation(async (lineId: string) => {
      if (lineId === lineA.id) return [makeDirection(lineA.id, 'line-a-outbound')];
      if (lineId === lineB.id) return [makeDirection(lineB.id, 'line-b-outbound')];
      return [];
    });

    mockedGetLineDirectionStops.mockImplementation(async (lineId: string, directionId: string) =>
      lineId === lineA.id ? makeStopsResponse(lineA, directionId) : makeStopsResponse(lineB, directionId)
    );
    mockedGetLineDirectionSchedules.mockImplementation(async (lineId: string, directionId: string) =>
      lineId === lineA.id
        ? makeSchedulesResponse(lineA, directionId, 'weekday')
        : makeSchedulesResponse(lineB, directionId, 'weekday')
    );
    mockedGetLineDirectionPath.mockImplementation(async (lineId: string, directionId: string) =>
      lineId === lineA.id ? makePathResponse(lineA, directionId) : makePathResponse(lineB, directionId)
    );

    const { rerender } = renderHook(
      ({ selectedLine }) =>
        useLineDirectionState({
          selectedLine,
          dayType: 'weekday',
          hasMounted: true,
        }),
      {
        initialProps: {
          selectedLine: lineA,
        },
      }
    );

    await waitFor(() => {
      expect(mockedGetLineDirectionStops).toHaveBeenCalledWith(lineA.id, 'line-a-outbound');
    });

    rerender({ selectedLine: lineB });

    await waitFor(() => {
      expect(mockedGetLineDirectionStops).toHaveBeenCalledWith(lineB.id, 'line-b-outbound');
    });

    const hasMismatchedStopsCall = mockedGetLineDirectionStops.mock.calls.some(
      ([lineId, directionId]) =>
        (lineId === lineA.id && directionId === 'line-b-outbound') ||
        (lineId === lineB.id && directionId === 'line-a-outbound')
    );
    const hasMismatchedSchedulesCall = mockedGetLineDirectionSchedules.mock.calls.some(
      ([lineId, directionId]) =>
        (lineId === lineA.id && directionId === 'line-b-outbound') ||
        (lineId === lineB.id && directionId === 'line-a-outbound')
    );
    const hasMismatchedPathCall = mockedGetLineDirectionPath.mock.calls.some(
      ([lineId, directionId]) =>
        (lineId === lineA.id && directionId === 'line-b-outbound') ||
        (lineId === lineB.id && directionId === 'line-a-outbound')
    );

    expect(hasMismatchedStopsCall).toBe(false);
    expect(hasMismatchedSchedulesCall).toBe(false);
    expect(hasMismatchedPathCall).toBe(false);
  });

  it('nao chama stops/schedules/path quando directions falha e cai em fallback', async () => {
    mockedGetLineDirections.mockRejectedValue(new Error('404 directions'));

    renderHook(() =>
      useLineDirectionState({
        selectedLine: lineA,
        dayType: 'weekday',
        hasMounted: true,
      })
    );

    await waitFor(() => {
      expect(mockedGetLineDirections).toHaveBeenCalledWith(lineA.id);
    });

    expect(mockedGetLineDirectionStops).not.toHaveBeenCalled();
    expect(mockedGetLineDirectionSchedules).not.toHaveBeenCalled();
    expect(mockedGetLineDirectionPath).not.toHaveBeenCalled();
  });

  it('nao chama endpoints live quando enableLiveDirectionRequests esta desativado', async () => {
    renderHook(() =>
      useLineDirectionState({
        selectedLine: lineA,
        dayType: 'weekday',
        hasMounted: true,
        enableLiveDirectionRequests: false,
      })
    );

    expect(mockedGetLineDirections).not.toHaveBeenCalled();
    expect(mockedGetLineDirectionStops).not.toHaveBeenCalled();
    expect(mockedGetLineDirectionSchedules).not.toHaveBeenCalled();
    expect(mockedGetLineDirectionPath).not.toHaveBeenCalled();
  });

  it('nao chama stops/schedules/path quando a linha existe, mas sem directions live', async () => {
    mockedGetLineDirections.mockResolvedValue([]);

    renderHook(() =>
      useLineDirectionState({
        selectedLine: lineA,
        dayType: 'weekday',
        hasMounted: true,
      })
    );

    await waitFor(() => {
      expect(mockedGetLineDirections).toHaveBeenCalledWith(lineA.id);
    });

    expect(mockedGetLineDirectionStops).not.toHaveBeenCalled();
    expect(mockedGetLineDirectionSchedules).not.toHaveBeenCalled();
    expect(mockedGetLineDirectionPath).not.toHaveBeenCalled();
  });

  it('nao chama ferry-fb-01-outbound quando a linha selecionada e line-0100', async () => {
    const line0100 = {
      ...lineA,
      id: 'line-0100',
      code: '0100',
      name: 'Linha 0100',
    };

    mockedGetLineDirections.mockResolvedValue([
      makeDirection('line-0100', 'line-0100-outbound'),
      makeDirection('line-0100', 'line-0100-inbound'),
    ]);
    mockedGetLineDirectionStops.mockImplementation(async (_lineId, directionId: string) =>
      makeStopsResponse(line0100, directionId)
    );
    mockedGetLineDirectionSchedules.mockImplementation(async (_lineId, directionId: string) =>
      makeSchedulesResponse(line0100, directionId, 'weekday')
    );
    mockedGetLineDirectionPath.mockImplementation(async (_lineId, directionId: string) =>
      makePathResponse(line0100, directionId)
    );

    renderHook(() =>
      useLineDirectionState({
        selectedLine: line0100,
        dayType: 'weekday',
        hasMounted: true,
        initialDirectionId: 'ferry-fb-01-outbound',
      })
    );

    await waitFor(() => {
      expect(mockedGetLineDirectionStops).toHaveBeenCalledWith('line-0100', 'line-0100-outbound');
    });

    const calledWithFerryDirection = mockedGetLineDirectionStops.mock.calls.some(
      ([lineId, directionId]) => lineId === 'line-0100' && directionId === 'ferry-fb-01-outbound'
    );

    expect(calledWithFerryDirection).toBe(false);
  });
});
