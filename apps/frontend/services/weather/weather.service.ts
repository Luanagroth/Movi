import { getConditionInfo, getTravelAdvice } from '@/features/weather/utils/weather-code';
import type { HourForecast, WeatherSummary } from '@/features/weather/types/weather.types';

interface OpenMeteoForecastResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    precipitation?: number;
    wind_speed_10m?: number;
    uv_index?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: Array<number | null>;
    apparent_temperature?: Array<number | null>;
    weather_code?: Array<number | null>;
    precipitation_probability?: Array<number | null>;
    uv_index?: Array<number | null>;
  };
}

const SAO_FRANCISCO_DO_SUL = {
  name: 'Sao Francisco do Sul',
  latitude: -26.24333,
  longitude: -48.63806,
};

const WEATHER_REVALIDATE_SECONDS = 10 * 60;

const asNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
};

const formatHour = (isoTime: string) => {
  const date = new Date(isoTime);
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo',
  }).format(date);
};

const getFirstValidNumber = (values?: Array<number | null>) => {
  const first = values?.find((item) => typeof item === 'number' && Number.isFinite(item));
  return first ?? null;
};

function mapNextHours(payload: OpenMeteoForecastResponse): HourForecast[] {
  const times = payload.hourly?.time ?? [];
  const temperatures = payload.hourly?.temperature_2m ?? [];
  const weatherCodes = payload.hourly?.weather_code ?? [];
  const precipitationProbabilities = payload.hourly?.precipitation_probability ?? [];
  const uvIndexes = payload.hourly?.uv_index ?? [];
  const nowTime = payload.current?.time ? new Date(payload.current.time).getTime() : Date.now();

  const points: HourForecast[] = [];

  for (let index = 0; index < times.length; index += 1) {
    const isoTime = times[index];
    if (!isoTime) continue;
    const timestamp = new Date(isoTime).getTime();
    if (Number.isNaN(timestamp) || timestamp < nowTime) continue;

    const weatherCode = asNumber(weatherCodes[index]);
    const condition = getConditionInfo(weatherCode);

    points.push({
      isoTime,
      timeLabel: formatHour(isoTime),
      temperatureCelsius: asNumber(temperatures[index]),
      precipitationProbability: asNumber(precipitationProbabilities[index]),
      uvIndex: asNumber(uvIndexes[index]),
      weatherCode,
      conditionLabel: condition.label,
      conditionEmoji: condition.emoji,
    });

    if (points.length >= 4) break;
  }

  return points;
}

function getRainChance(nextHours: HourForecast[], payload: OpenMeteoForecastResponse): number | null {
  const maxFromHours = nextHours.reduce<number | null>((max, point) => {
    if (point.precipitationProbability == null) return max;
    if (max == null) return point.precipitationProbability;
    return Math.max(max, point.precipitationProbability);
  }, null);

  if (maxFromHours != null) return maxFromHours;
  return getFirstValidNumber(payload.hourly?.precipitation_probability);
}

export async function getSaoFranciscoDoSulWeather(): Promise<WeatherSummary | null> {
  const params = new URLSearchParams({
    latitude: SAO_FRANCISCO_DO_SUL.latitude.toString(),
    longitude: SAO_FRANCISCO_DO_SUL.longitude.toString(),
    timezone: 'America/Sao_Paulo',
    current: 'temperature_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m,uv_index',
    hourly: 'temperature_2m,apparent_temperature,weather_code,precipitation_probability,uv_index',
    forecast_days: '2',
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      next: { revalidate: WEATHER_REVALIDATE_SECONDS },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as OpenMeteoForecastResponse;
    const weatherCode = asNumber(payload.current?.weather_code);
    const condition = getConditionInfo(weatherCode);
    const nextHours = mapNextHours(payload);
    const temperatureCelsius = asNumber(payload.current?.temperature_2m);
    const apparentTemperatureCelsius = asNumber(payload.current?.apparent_temperature);
    const uvIndex = asNumber(payload.current?.uv_index) ?? getFirstValidNumber(payload.hourly?.uv_index);
    const precipitationMm = asNumber(payload.current?.precipitation);
    const windSpeedKmh = asNumber(payload.current?.wind_speed_10m);
    const precipitationProbability = getRainChance(nextHours, payload);
    const advice = getTravelAdvice({
      temperatureCelsius,
      precipitationProbability,
      precipitationMm,
      uvIndex,
      windSpeedKmh,
      weatherCode,
    });

    return {
      locationName: SAO_FRANCISCO_DO_SUL.name,
      temperatureCelsius,
      apparentTemperatureCelsius,
      conditionLabel: condition.label,
      conditionEmoji: condition.emoji,
      precipitationProbability,
      precipitationMm,
      uvIndex,
      windSpeedKmh,
      nextHours,
      advice: advice.message,
      adviceKind: advice.kind,
      updatedAt: payload.current?.time ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

