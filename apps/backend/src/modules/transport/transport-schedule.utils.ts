import { differenceInMinutes, parseTimeToMinutes, selectUpcomingSchedulesAcrossDays, type ScheduleEntry, type ServiceDay } from '@cityline/shared';

export { differenceInMinutes, parseTimeToMinutes };

export interface UpcomingDeparture {
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

export interface NextDeparturesResult {
  items: UpcomingDeparture[];
  summary: string;
  hasDeparturesToday: boolean;
}

const getFriendlyDepartureLabel = (minutesUntil: number, isTomorrow = false) => {
  if (isTomorrow) {
    return 'proxima saida amanha';
  }

  if (minutesUntil <= 1) {
    return 'saida agora';
  }

  return `partida em ${minutesUntil} minutos`;
};
export const selectNextDepartures = (
  schedules: Record<ServiceDay, ScheduleEntry[]>,
  dayType: ServiceDay,
  reference = new Date(),
  limit = 3
): NextDeparturesResult => {
  const window = selectUpcomingSchedulesAcrossDays(schedules, dayType, reference, limit);

  if (window.hasDeparturesToday && window.items.length) {
    return {
      items: window.items.map((item) => {
        const minutesUntil = item.minutesUntil;

        return {
          id: item.schedule.id,
          time: item.schedule.time,
          dayType: item.dayType,
          minutesUntil,
          status: minutesUntil <= 1 ? 'now' : 'upcoming',
          label: getFriendlyDepartureLabel(minutesUntil),
          platform: item.schedule.platform,
          note: item.schedule.note,
          isPeak: item.schedule.isPeak,
          occupancy: item.schedule.occupancy,
          isTomorrow: false,
        };
      }),
      summary: getFriendlyDepartureLabel(window.items[0]!.minutesUntil),
      hasDeparturesToday: true,
    };
  }

  if (window.items.length) {
    const firstNextItem = window.items[0]!;
    const daysUntil = Math.max(1, Math.floor(firstNextItem.minutesUntil / (24 * 60)));
    return {
      items: window.items.map((item) => ({
        id: item.schedule.id,
        time: item.schedule.time,
        dayType: item.dayType,
        minutesUntil: item.minutesUntil,
        status: item.isTomorrow ? 'tomorrow' : 'upcoming',
        label:
          item.isTomorrow
            ? getFriendlyDepartureLabel(item.minutesUntil, true)
            : `proxima partida em ${daysUntil} dias`,
        platform: item.schedule.platform,
        note: item.schedule.note,
        isPeak: item.schedule.isPeak,
        occupancy: item.schedule.occupancy,
        isTomorrow: item.isTomorrow,
      })),
      summary:
        firstNextItem.isTomorrow
          ? `sem mais saidas hoje. proxima saida amanha as ${firstNextItem.schedule.time}`
          : `sem mais saidas hoje. proxima saida em ${daysUntil} dias as ${firstNextItem.schedule.time}`,
      hasDeparturesToday: false,
    };
  }

  return {
    items: [],
    summary: 'sem mais saidas hoje',
    hasDeparturesToday: false,
  };
};
