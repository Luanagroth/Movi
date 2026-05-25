export type ServiceDay = 'weekday' | 'saturday' | 'sunday';
export type DataSource = 'database' | 'external' | 'fallback' | 'hybrid';
export type LineStatus = 'on-time' | 'attention' | 'reduced';
export type TransportMode = 'urban' | 'intercity' | 'ferry';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface StopPoint {
  id: string;
  name: string;
  sequence: number;
  location: GeoPoint;
}

export interface ScheduleEntry {
  id: string;
  time: string;
  dayType: ServiceDay;
  isPeak: boolean;
  occupancy: 'low' | 'medium' | 'high';
  platform?: string;
  note?: string;
}

export interface TransportLine {
  id: string;
  code: string;
  name: string;
  operator: string;
  routeLabel: string;
  summary: string;
  origin: string;
  destination: string;
  estimatedDurationMinutes: number;
  distanceKm: number;
  color: string;
  status: LineStatus;
  mode?: TransportMode;
  fareLabel?: string;
  amenities: string[];
  updatedAt: string;
  stops: StopPoint[];
  path: GeoPoint[];
  schedules: Record<ServiceDay, ScheduleEntry[]>;
}

export interface FavoriteRecord {
  id: string;
  lineId: string;
  createdAt: string;
  label?: string;
}

export interface ApiMeta {
  source: DataSource;
  lastUpdated: string;
  fallback: boolean;
  count?: number;
  query?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: ApiMeta;
}
