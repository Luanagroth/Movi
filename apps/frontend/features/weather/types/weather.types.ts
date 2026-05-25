export type WeatherAdviceKind = 'rain' | 'heat' | 'uv' | 'cold' | 'wind' | 'stable';

export type WeatherCardState = 'loading' | 'success' | 'error' | 'empty';

export interface HourForecast {
  isoTime: string;
  timeLabel: string;
  temperatureCelsius: number | null;
  precipitationProbability: number | null;
  uvIndex: number | null;
  weatherCode: number | null;
  conditionLabel: string;
  conditionEmoji: string;
}

export interface WeatherSummary {
  locationName: string;
  temperatureCelsius: number | null;
  apparentTemperatureCelsius: number | null;
  conditionLabel: string;
  conditionEmoji: string;
  precipitationProbability: number | null;
  precipitationMm: number | null;
  uvIndex: number | null;
  windSpeedKmh: number | null;
  nextHours: HourForecast[];
  advice: string;
  adviceKind: WeatherAdviceKind;
  updatedAt: string;
}

