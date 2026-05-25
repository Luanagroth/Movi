import type { CollectedDirection, CollectedLine, CollectedRoutePathPoint } from '@cityline/shared';
import { parseCollectedManifest, type CollectedManifestFile } from './ingestion-manifest.js';

interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RoutePathProvider {
  buildSegmentPath(start: RoutePoint, end: RoutePoint): Promise<RoutePoint[]>;
}

export interface EnrichCollectedPathsOptions {
  provider: RoutePathProvider;
  force?: boolean;
}

const decodePolyline = (encoded: string, precision = 5): RoutePoint[] => {
  const coordinates: RoutePoint[] = [];
  const factor = 10 ** precision;
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length + 1);

    latitude += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length + 1);

    longitude += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push({
      lat: latitude / factor,
      lng: longitude / factor,
    });
  }

  return coordinates;
};

const hasCoordinates = (point: RoutePoint | undefined): point is RoutePoint =>
  point !== undefined && Number.isFinite(point.lat) && Number.isFinite(point.lng);

const dedupeAdjacentPoints = (points: RoutePoint[]) =>
  points.filter((point, index, collection) => {
    const previous = collection[index - 1];
    return !previous || previous.lat !== point.lat || previous.lng !== point.lng;
  });

const toSequencedMapPath = (points: RoutePoint[]): CollectedRoutePathPoint[] =>
  dedupeAdjacentPoints(points).map((point, index) => ({
    sequence: index + 1,
    lat: point.lat,
    lng: point.lng,
  }));

const buildFallbackPathFromStops = (direction: CollectedDirection) =>
  direction.stops
    .slice()
    .sort((left, right) => left.sequence - right.sequence)
    .map((stop) => stop.location)
    .filter(hasCoordinates);

const buildDirectionPath = async (direction: CollectedDirection, provider: RoutePathProvider): Promise<CollectedRoutePathPoint[]> => {
  const orderedStops = direction.stops
    .slice()
    .sort((left, right) => left.sequence - right.sequence)
    .map((stop) => stop.location)
    .filter(hasCoordinates);

  if (orderedStops.length < 2) {
    return toSequencedMapPath(orderedStops);
  }

  const mergedPath: RoutePoint[] = [];

  for (let index = 0; index < orderedStops.length - 1; index += 1) {
    const current = orderedStops[index];
    const next = orderedStops[index + 1];

    if (!current || !next) {
      continue;
    }

    try {
      const segment = dedupeAdjacentPoints(await provider.buildSegmentPath(current, next));
      if (!segment.length) {
        mergedPath.push(current, next);
        continue;
      }

      if (!mergedPath.length) {
        mergedPath.push(...segment);
        continue;
      }

      const previous = mergedPath[mergedPath.length - 1];
      const segmentStart = segment[0];

      if (previous && segmentStart && previous.lat === segmentStart.lat && previous.lng === segmentStart.lng) {
        mergedPath.push(...segment.slice(1));
      } else {
        mergedPath.push(...segment);
      }
    } catch {
      mergedPath.push(current, next);
    }
  }

  return toSequencedMapPath(mergedPath.length ? mergedPath : orderedStops);
};

const enrichLineDirections = async (line: CollectedLine, options: EnrichCollectedPathsOptions): Promise<CollectedLine> => {
  const directions = await Promise.all(
    line.directions.map(async (direction) => {
      if (direction.type !== 'outbound' && direction.type !== 'inbound') {
        return direction;
      }

      if (!options.force && direction.mapPath.length > 0) {
        return direction;
      }

      const generatedMapPath = await buildDirectionPath(direction, options.provider);
      const fallbackMapPath = toSequencedMapPath(buildFallbackPathFromStops(direction));

      return {
        ...direction,
        mapPath: generatedMapPath.length ? generatedMapPath : fallbackMapPath,
      };
    })
  );

  return {
    ...line,
    directions,
  };
};

export const enrichCollectedManifestPaths = async (
  manifestInput: CollectedManifestFile,
  options: EnrichCollectedPathsOptions
): Promise<CollectedManifestFile> => {
  const manifest = parseCollectedManifest(manifestInput);

  if (manifest.entityType !== 'line') {
    return manifest;
  }

  const lineData = manifest.data as CollectedLine;

  return {
    ...manifest,
    entityType: 'line',
    data: await enrichLineDirections(lineData, options),
  };
};

export class OpenRouteServicePathProvider implements RoutePathProvider {
  constructor(
    private readonly config: {
      apiKey: string;
      baseUrl?: string;
      profile?: string;
      fetchImpl?: typeof fetch;
    }
  ) {}

  async buildSegmentPath(start: RoutePoint, end: RoutePoint): Promise<RoutePoint[]> {
    const fetchImpl = this.config.fetchImpl ?? fetch;
    const baseUrl = (this.config.baseUrl ?? 'https://api.openrouteservice.org').replace(/\/$/, '');
    const profile = this.config.profile ?? 'driving-car';
    const endpoint = `${baseUrl}/v2/directions/${profile}/json`;

    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Authorization: this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
        geometry_simplify: false,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`OpenRouteService retornou ${response.status}: ${responseText}`);
    }

    const payload = (await response.json()) as {
      routes?: Array<{
        geometry?: string;
      }>;
    };

    const geometry = payload.routes?.[0]?.geometry;

    if (!geometry) {
      return [start, end];
    }

    return decodePolyline(geometry).filter(hasCoordinates);
  }
}
