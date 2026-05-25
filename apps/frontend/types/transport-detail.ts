import type { GeoPoint, ScheduleEntry, ServiceDay, StopPoint, TransportMode } from '@cityline/shared';

export interface LineDirectionSummary {
  id: string;
  lineId: string;
  lineCode: string;
  lineName: string;
  type: 'outbound' | 'inbound';
  label: string;
  routeLabel: string;
  origin: string;
  destination: string;
  stopCount: number;
  pathPoints: number;
}

export interface DirectionDeparture {
  id: string;
  time: string;
  dayType: ServiceDay;
  minutesUntil: number;
  status: 'now' | 'upcoming' | 'tomorrow';
  label: string;
  platform?: string;
  note?: string;
  isPeak: boolean;
  occupancy: ScheduleEntry['occupancy'];
  isTomorrow: boolean;
}

export interface LineDirectionDetail {
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
  path: GeoPoint[];
  stops: StopPoint[];
  schedules: Record<ServiceDay, ScheduleEntry[]>;
  nextDepartures: DirectionDeparture[];
  nextSummary: string;
  hasDeparturesToday: boolean;
}
