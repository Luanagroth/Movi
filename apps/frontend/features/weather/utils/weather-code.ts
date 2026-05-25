import type { WeatherAdviceKind } from '@/features/weather/types/weather.types';

interface ConditionInfo {
  label: string;
  emoji: string;
}

const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);
const STORM_CODES = new Set([95, 96, 99]);
const FOG_CODES = new Set([45, 48]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);

export function getConditionInfo(weatherCode: number | null | undefined): ConditionInfo {
  if (weatherCode == null) return { label: 'Condicao indisponivel', emoji: '🌤️' };
  if (weatherCode === 0) return { label: 'Ceu limpo', emoji: '☀️' };
  if (weatherCode === 1) return { label: 'Predominio de sol', emoji: '🌤️' };
  if (weatherCode === 2) return { label: 'Parcialmente nublado', emoji: '⛅' };
  if (weatherCode === 3) return { label: 'Nublado', emoji: '☁️' };
  if (FOG_CODES.has(weatherCode)) return { label: 'Nevoeiro', emoji: '🌫️' };
  if (STORM_CODES.has(weatherCode)) return { label: 'Temporal', emoji: '⛈️' };
  if (RAIN_CODES.has(weatherCode)) return { label: 'Chuva', emoji: '🌧️' };
  if (SNOW_CODES.has(weatherCode)) return { label: 'Frio intenso', emoji: '🧥' };

  return { label: 'Tempo variavel', emoji: '🌤️' };
}

export function getTravelAdvice(input: {
  temperatureCelsius: number | null;
  precipitationProbability: number | null;
  precipitationMm: number | null;
  uvIndex: number | null;
  windSpeedKmh: number | null;
  weatherCode: number | null;
}): { kind: WeatherAdviceKind; message: string } {
  const rainLikely =
    input.precipitationProbability != null && input.precipitationProbability >= 45
      ? true
      : input.precipitationMm != null && input.precipitationMm > 0;
  const isStorm = input.weatherCode != null && STORM_CODES.has(input.weatherCode);
  const isRain = input.weatherCode != null && (RAIN_CODES.has(input.weatherCode) || STORM_CODES.has(input.weatherCode));

  if (isStorm || rainLikely || isRain) return { kind: 'rain', message: 'Leve guarda-chuva.' };
  if (input.uvIndex != null && input.uvIndex >= 7) return { kind: 'uv', message: 'Use protetor solar.' };
  if (input.temperatureCelsius != null && input.temperatureCelsius >= 30) return { kind: 'heat', message: 'Hidrate-se.' };
  if (input.temperatureCelsius != null && input.temperatureCelsius <= 15) return { kind: 'cold', message: 'Leve um casaco.' };
  if (input.windSpeedKmh != null && input.windSpeedKmh >= 30) return { kind: 'wind', message: 'Atencao ao vento.' };

  return { kind: 'stable', message: 'Boa viagem.' };
}

