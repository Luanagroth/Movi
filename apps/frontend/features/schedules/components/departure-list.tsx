import type { ScheduleEntry } from '@cityline/shared';
import { getDepartureTiming } from '@/lib/transport';
import type { UiLocale } from '@/lib/ui-copy';
import { uiCopy } from '@/lib/ui-copy';
import type { DirectionDeparture } from '@/types/transport-detail';

interface DepartureListProps {
  title: string;
  items: Array<ScheduleEntry | DirectionDeparture>;
  compact?: boolean;
  referenceTime?: Date | null;
  locale?: UiLocale;
}

export function DepartureList({ title, items, compact = false, referenceTime = null, locale = 'pt-BR' }: DepartureListProps) {
  const copy = uiCopy[locale].labels;
  const formatNextWindowLabel = (time: string) => {
    if (!referenceTime) {
      return `${copy.nextDeparture}: ${time}`;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const nextOccurrence = new Date(referenceTime);
    nextOccurrence.setHours(hours ?? 0, minutes ?? 0, 0, 0);

    if (nextOccurrence <= referenceTime) {
      nextOccurrence.setDate(nextOccurrence.getDate() + 1);
    }

    const remainingMinutes = Math.max(0, Math.round((nextOccurrence.getTime() - referenceTime.getTime()) / 60_000));
    const remainingHours = Math.floor(remainingMinutes / 60);
    const extraMinutes = remainingMinutes % 60;

    if (!remainingMinutes) {
      return `${copy.nextDeparture}: ${time}`;
    }

    const timeWindow =
      remainingHours > 0
        ? `${remainingHours}h${extraMinutes ? ` ${extraMinutes}min` : ''}`
        : `${extraMinutes} min`;

    if (locale === 'en') {
      return `Returns tomorrow at ${time} (in ${timeWindow})`;
    }

    if (locale === 'es') {
      return `Vuelve manana a las ${time} (en ${timeWindow})`;
    }

    return `Volta amanha as ${time} (em ${timeWindow})`;
  };

  const formatTimingLabel = (item: ScheduleEntry | DirectionDeparture, timingLabel: string, timingStatus: string) => {
    if ('minutesUntil' in item) {
      return timingLabel;
    }

    if (timingStatus === 'past') {
      return formatNextWindowLabel(item.time);
    }

    if (timingStatus !== 'now') {
      return timingLabel;
    }

    const [hours, minutes] = item.time.split(':').map(Number);

    if (!referenceTime) {
      return timingLabel;
    }

    const targetMinutes = (hours ?? 0) * 60 + (minutes ?? 0);
    const currentMinutes = referenceTime.getHours() * 60 + referenceTime.getMinutes();
    const diff = targetMinutes - currentMinutes;

    if (diff < 0) {
      return locale === 'en'
        ? `No departure now. Next window from ${item.time}`
        : locale === 'es'
          ? `No hay salida ahora. Proxima ventana desde ${item.time}`
          : `Nao ha saida agora. Proxima janela a partir de ${item.time}`;
    }

    return timingLabel;
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500">
            {copy.now}: {referenceTime ? referenceTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </p>
        </div>
        <span className="text-xs text-slate-500">
          {items.length} {copy.schedules}
        </span>
      </div>

      <div className={`grid gap-2 ${compact ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'}`}>
        {items.map((item) => {
          const timing =
            'minutesUntil' in item
              ? {
                  label: item.label,
                  status: item.status === 'now' ? 'now' : item.status === 'tomorrow' ? 'upcoming' : 'upcoming',
                }
              : referenceTime
                ? getDepartureTiming(item.time, referenceTime)
                : {
                    label: copy.plannedSchedule,
                    status: 'upcoming' as const,
                };
          const timingLabel = formatTimingLabel(item, timing.label, timing.status);

          const cardClassName =
            !('minutesUntil' in item) && timing.status === 'past'
              ? 'border-slate-200 bg-slate-100/90'
              : timing.status === 'now'
                ? 'border-emerald-300 bg-emerald-50'
                : timing.status === 'soon'
                  ? 'border-sky-300 bg-sky-50'
                  : 'border-slate-200 bg-white';

          return (
            <div key={item.id} className={`rounded-xl border-l-4 px-3 py-2.5 ${cardClassName} ${!('minutesUntil' in item) && timing.status === 'past' ? 'border-l-slate-300' : timing.status === 'now' ? 'border-l-emerald-500' : timing.status === 'soon' ? 'border-l-sky-500' : 'border-l-brand-400'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-base font-semibold text-slate-900">{item.time}</p>
                {item.isPeak ? (
                  <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {copy.peak}
                  </span>
                ) : null}
              </div>
              <p className={`mt-1 text-xs font-medium ${timing.status === 'past' ? 'text-slate-500' : timing.status === 'now' ? 'text-emerald-700' : 'text-brand-700'}`}>
                {timingLabel}
              </p>
              {'note' in item && item.note ? <p className="mt-1 text-[11px] text-slate-500">{item.note}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
