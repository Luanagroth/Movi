import { describe, expect, it, vi } from 'vitest';
import type { CollectedManifestFile } from './ingestion-manifest.js';
import { OpenRouteServicePathProvider, enrichCollectedManifestPaths } from './route-path-enricher.js';

const collectedManifest: CollectedManifestFile = {
  manifestVersion: '1.0',
  citySlug: 'sao-francisco-do-sul',
  providerSlug: 'verdes-mares',
  entityType: 'line',
  data: {
    id: 'collected-line-0100',
    code: '0100',
    slug: '0100-enseada-via-ubatuba',
    name: 'Enseada via Ubatuba',
    operator: 'Verdes Mares',
    mode: 'urban',
    routeLabel: 'Centro -> Enseada',
    originLabel: 'Centro',
    destinationLabel: 'Enseada',
    fares: [],
    collectionStatus: 'reviewed',
    source: {
      sourceId: 'verdes-mares-sfs',
      sourceName: 'Verdes Mares Sao Francisco do Sul',
      sourceUrl: 'https://vmares.com.br/sao-francisco-do-sul/',
      collectedAt: '2026-04-10T12:00:00.000Z',
      collectionMethod: 'manual',
      sourceLineRef: '0100',
    },
    directions: [
      {
        id: 'collected-line-0100-outbound',
        type: 'outbound',
        name: 'Saida do Centro',
        routeLabel: 'Centro -> Enseada',
        originLabel: 'Centro',
        destinationLabel: 'Enseada',
        mapPath: [],
        stops: [
          {
            id: 'stop-1',
            name: 'Centro',
            sequence: 1,
            location: { lat: -26.24, lng: -48.63 },
          },
          {
            id: 'stop-2',
            name: 'Enseada',
            sequence: 2,
            location: { lat: -26.22, lng: -48.5 },
          },
        ],
        departures: [],
        source: {
          sourceId: 'verdes-mares-sfs',
          sourceName: 'Verdes Mares Sao Francisco do Sul',
          sourceUrl: 'https://vmares.com.br/sao-francisco-do-sul/',
          collectedAt: '2026-04-10T12:00:00.000Z',
          collectionMethod: 'manual',
          sourceLineRef: '0100',
          sourceDirectionRef: 'outbound',
        },
      },
    ],
  },
};

describe('enrichCollectedManifestPaths', () => {
  it('preenche mapPath a partir do provider quando a direcao ainda nao tem geometria', async () => {
    const provider = {
      buildSegmentPath: vi.fn().mockResolvedValue([
        { lat: -26.24, lng: -48.63 },
        { lat: -26.23, lng: -48.57 },
        { lat: -26.22, lng: -48.5 },
      ]),
    };

    const enriched = await enrichCollectedManifestPaths(collectedManifest, {
      provider,
    });

    expect(provider.buildSegmentPath).toHaveBeenCalledTimes(1);
    expect(enriched.entityType).toBe('line');
    if (enriched.entityType !== 'line') {
      throw new Error('Manifest inesperado');
    }

    expect(enriched.data.directions[0]?.mapPath).toEqual([
      { sequence: 1, lat: -26.24, lng: -48.63 },
      { sequence: 2, lat: -26.23, lng: -48.57 },
      { sequence: 3, lat: -26.22, lng: -48.5 },
    ]);
  });

  it('mantem mapPath existente quando force nao foi informado', async () => {
    const provider = {
      buildSegmentPath: vi.fn(),
    };

    const enriched = await enrichCollectedManifestPaths(
      {
        ...collectedManifest,
        data: {
          ...collectedManifest.data,
          directions: [
            {
              ...collectedManifest.data.directions[0]!,
              mapPath: [
                { sequence: 1, lat: -26.24, lng: -48.63 },
                { sequence: 2, lat: -26.22, lng: -48.5 },
              ],
            },
          ],
        },
      },
      { provider }
    );

    expect(provider.buildSegmentPath).not.toHaveBeenCalled();
    if (enriched.entityType !== 'line') {
      throw new Error('Manifest inesperado');
    }
    expect(enriched.data.directions[0]?.mapPath).toHaveLength(2);
  });
});

describe('OpenRouteServicePathProvider', () => {
  it('converte a resposta encoded polyline em pontos do mapPath', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [
          {
            geometry: 'jtd_DvqzgHRIi@qA_@u@uC_DOWM[K]Kw@lGuB',
          },
        ],
      }),
    });

    const provider = new OpenRouteServicePathProvider({
      apiKey: 'test-key',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const points = await provider.buildSegmentPath(
      { lat: -26.24, lng: -48.63 },
      { lat: -26.22, lng: -48.5 }
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(points.length).toBeGreaterThan(2);
    expect(points[0]?.lat).toBeCloseTo(-26.24344, 4);
    expect(points[0]?.lng).toBeCloseTo(-48.63791, 4);
  });
});
