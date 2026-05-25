import { DirectionType, LineOperationalStatus, OccupancyLevel, ServiceDayType, TransportMode as PrismaTransportMode } from '@prisma/client';
import { buildLineDirections as buildSharedLineDirections, type ScheduleEntry, type ServiceDay, type StopPoint, type TransportLine, type TransportMode } from '@cityline/shared';
import type { TransportLineRecord } from './transport.repository.js';

export interface LineDirectionView {
  id: string;
  lineId: string;
  lineCode: string;
  lineName: string;
  type: 'outbound' | 'inbound';
  label: string;
  routeLabel: string;
  origin: string;
  destination: string;
  mode?: TransportMode;
  fareLabel?: string;
  stops: StopPoint[];
  path: TransportLine['path'];
  schedules: Record<ServiceDay, ScheduleEntry[]>;
}

const formatCurrency = (amountCents: number, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amountCents / 100);

const parseAmenities = (value: string) => {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const toSharedMode = (mode: PrismaTransportMode): TransportMode => {
  switch (mode) {
    case PrismaTransportMode.INTERMUNICIPAL:
      return 'intercity';
    case PrismaTransportMode.FERRY:
      return 'ferry';
    case PrismaTransportMode.MUNICIPAL:
    default:
      return 'urban';
  }
};

const toSharedStatus = (status: LineOperationalStatus): TransportLine['status'] => {
  switch (status) {
    case LineOperationalStatus.ATTENTION:
      return 'attention';
    case LineOperationalStatus.REDUCED:
      return 'reduced';
    case LineOperationalStatus.ON_TIME:
    default:
      return 'on-time';
  }
};

const toSharedDay = (serviceDay: ServiceDayType): ServiceDay | null => {
  switch (serviceDay) {
    case ServiceDayType.WEEKDAY:
      return 'weekday';
    case ServiceDayType.SATURDAY:
      return 'saturday';
    case ServiceDayType.SUNDAY:
      return 'sunday';
    case ServiceDayType.HOLIDAY:
    default:
      return null;
  }
};

const toSharedOccupancy = (occupancy: OccupancyLevel): ScheduleEntry['occupancy'] => {
  switch (occupancy) {
    case OccupancyLevel.LOW:
      return 'low';
    case OccupancyLevel.HIGH:
      return 'high';
    case OccupancyLevel.MEDIUM:
    default:
      return 'medium';
  }
};

const toDirectionType = (type: DirectionType): LineDirectionView['type'] => {
  switch (type) {
    case DirectionType.INBOUND:
      return 'inbound';
    case DirectionType.OUTBOUND:
    default:
      return 'outbound';
  }
};

const toStopPoint = (lineStop: TransportLineRecord['directions'][number]['lineStops'][number]): StopPoint => ({
  id: lineStop.stop.id,
  name: lineStop.stop.name,
  sequence: lineStop.sequence,
  location: {
    lat: lineStop.stop.latitude,
    lng: lineStop.stop.longitude,
  },
});

const toScheduleMap = (direction: TransportLineRecord['directions'][number] | undefined): Record<ServiceDay, ScheduleEntry[]> => {
  const base: Record<ServiceDay, ScheduleEntry[]> = {
    weekday: [],
    saturday: [],
    sunday: [],
  };

  if (!direction) {
    return base;
  }

  for (const schedule of direction.schedules) {
    const dayType = toSharedDay(schedule.serviceDay);

    if (!dayType) {
      continue;
    }

    base[dayType].push({
      id: schedule.id,
      time: schedule.departureTime,
      dayType,
      isPeak: schedule.isPeak,
      occupancy: toSharedOccupancy(schedule.occupancy),
      platform: schedule.platform ?? undefined,
      note: schedule.note ?? undefined,
    });
  }

  return base;
};

const buildFareLabel = (line: TransportLineRecord) => {
  if (line.fares.length) {
    return line.fares
      .map((fare) => {
        if (typeof fare.amountCents === 'number') {
          return `${fare.label} ${formatCurrency(fare.amountCents, fare.currency)}`;
        }

        return fare.label;
      })
      .join(' · ');
  }

  if (line.fareSummary?.trim()) {
    return line.fareSummary;
  }

  return undefined;
};

const pickPrimaryDirection = (line: TransportLineRecord) =>
  line.directions.find((direction) => direction.type === DirectionType.OUTBOUND) ?? line.directions[0];

const toGeoPath = (direction: TransportLineRecord['directions'][number]) =>
  direction.routePaths.map((point) => ({
    lat: point.latitude,
    lng: point.longitude,
  }));

export const mapDirectionRecord = (line: TransportLineRecord, direction: TransportLineRecord['directions'][number]): LineDirectionView => {
  const mode = toSharedMode(line.transportMode);

  return {
    id: direction.id,
    lineId: line.id,
    lineCode: line.code,
    lineName: line.name,
    type: toDirectionType(direction.type),
    label: `${direction.originLabel} -> ${direction.destinationLabel}`,
    routeLabel: direction.routeLabel,
    origin: direction.originLabel,
    destination: direction.destinationLabel,
    mode,
    fareLabel: buildFareLabel(line),
    stops: direction.lineStops.map(toStopPoint),
    path: toGeoPath(direction),
    schedules: toScheduleMap(direction),
  };
};

export const mapDirectionRecords = (line: TransportLineRecord): LineDirectionView[] => line.directions.map((direction) => mapDirectionRecord(line, direction));

export const buildFallbackDirections = (line: TransportLine): LineDirectionView[] =>
  buildSharedLineDirections(line, {
    outboundId: `${line.id}-outbound`,
    inboundId: `${line.id}-inbound`,
    inboundScheduleTag: 'inbound',
    inboundStopIdSuffix: '-inbound',
  }).map((direction) => ({
    id: direction.id,
    lineId: line.id,
    lineCode: line.code,
    lineName: line.name,
    type: direction.type,
    label: direction.label,
    routeLabel: direction.routeLabel,
    origin: direction.origin,
    destination: direction.destination,
    mode: line.mode,
    fareLabel: line.fareLabel,
    path: direction.path,
    stops: direction.stops,
    schedules: direction.schedules,
  }));

export const mapTransportLineRecord = (line: TransportLineRecord): TransportLine => {
  const primaryDirection = pickPrimaryDirection(line);

  return {
    id: line.id,
    code: line.code,
    name: line.name,
    operator: line.operator,
    routeLabel: primaryDirection?.routeLabel ?? line.routeLabel,
    summary: line.summary ?? 'Linha cadastrada na base local de mobilidade.',
    origin: primaryDirection?.originLabel ?? line.originLabel,
    destination: primaryDirection?.destinationLabel ?? line.destinationLabel,
    estimatedDurationMinutes: line.estimatedDurationMinutes ?? 0,
    distanceKm: line.distanceKm ?? 0,
    color: line.color ?? '#2563eb',
    status: toSharedStatus(line.operationalStatus),
    mode: toSharedMode(line.transportMode),
    fareLabel: buildFareLabel(line),
    amenities: parseAmenities(line.amenities),
    updatedAt: (line.sourceUpdatedAt ?? line.updatedAt).toISOString(),
    stops: (primaryDirection?.lineStops ?? []).map(toStopPoint),
    path: primaryDirection ? toGeoPath(primaryDirection) : [],
    schedules: toScheduleMap(primaryDirection),
  };
};
