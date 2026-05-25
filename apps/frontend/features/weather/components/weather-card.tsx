import React from 'react';
import { AlertTriangle, CloudRain, LoaderCircle, Sun, Wind } from 'lucide-react';
import type { WeatherCardState, WeatherSummary } from '@/features/weather/types/weather.types';

interface WeatherCardProps {
  status: WeatherCardState;
  weather?: WeatherSummary | null;
}

const formatNumber = (value: number | null, digits = 0) => {
  if (value == null) return '--';
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(value);
};

const formatUpdatedTime = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '--:--';

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo',
  }).format(date);
};

const EmptyState = () => (
  <section className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Clima</p>
        <p className="mt-1 text-base font-semibold text-slate-900">Clima indisponivel no momento</p>
        <p className="mt-1 text-sm text-slate-600">As rotas e horarios continuam disponiveis normalmente.</p>
      </div>
    </div>
  </section>
);

const LoadingState = () => (
  <section className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
    <div className="flex items-center gap-3 text-slate-700">
      <LoaderCircle className="h-5 w-5 animate-spin" />
      <p className="text-sm font-medium">Atualizando clima...</p>
    </div>
  </section>
);

export function WeatherCard({ status, weather }: WeatherCardProps) {
  if (status === 'loading') return <LoadingState />;
  if (status === 'error' || status === 'empty' || !weather) return <EmptyState />;

  return (
    <section className="mt-8 rounded-2xl border border-[#e6d9a6] bg-[#f9f4df] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9c7a16]">Clima em {weather.locationName}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-2xl" aria-hidden>
              {weather.conditionEmoji}
            </span>
            <p className="text-xl font-black text-[#14233c]">
              Agora: {formatNumber(weather.temperatureCelsius)} C, {weather.conditionLabel.toLowerCase()}
            </p>
          </div>
          <p className="mt-2 text-sm text-[#6e5a1c]">
            Sensacao: {formatNumber(weather.apparentTemperatureCelsius)} C | Dica: <span className="font-semibold">{weather.advice}</span>
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[520px]">
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8b7a4a]">Chuva (proximas horas)</p>
            <p className="mt-2 flex items-center gap-2 text-base font-black text-[#14233c]">
              <CloudRain className="h-4 w-4 text-[#b28719]" />
              {formatNumber(weather.precipitationProbability)}%
            </p>
          </article>
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8b7a4a]">Indice UV</p>
            <p className="mt-2 flex items-center gap-2 text-base font-black text-[#14233c]">
              <Sun className="h-4 w-4 text-[#c4961a]" />
              {formatNumber(weather.uvIndex, 1)}
            </p>
          </article>
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8b7a4a]">Vento</p>
            <p className="mt-2 flex items-center gap-2 text-base font-black text-[#14233c]">
              <Wind className="h-4 w-4 text-[#b28719]" />
              {formatNumber(weather.windSpeedKmh, 1)} km/h
            </p>
          </article>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#eadba9] bg-white/85 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8b7a4a]">Proximas horas</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {weather.nextHours.length > 0 ? (
            weather.nextHours.map((hour) => (
              <article key={hour.isoTime} className="rounded-lg border border-[#f1e6bf] bg-white p-3">
                <p className="text-xs font-semibold text-[#8b7a4a]">{hour.timeLabel}</p>
                <p className="mt-1 text-sm font-black text-[#14233c]">
                  {hour.conditionEmoji} {formatNumber(hour.temperatureCelsius)} C
                </p>
                <p className="text-xs text-[#8b7a4a]">Chuva {formatNumber(hour.precipitationProbability)}%</p>
              </article>
            ))
          ) : (
            <p className="col-span-full text-sm text-[#6e5a1c]">Sem previsao horaria detalhada no momento.</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-[#8b7a4a]">Atualizado as {formatUpdatedTime(weather.updatedAt)} | Fonte: Open-Meteo</p>
    </section>
  );
}
