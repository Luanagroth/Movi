import { describe, expect, it } from 'vitest';
import { getConditionInfo, getTravelAdvice } from './weather-code';

describe('weather code helpers', () => {
  it('converte weather code para condicao e emoji', () => {
    expect(getConditionInfo(0)).toEqual({ label: 'Ceu limpo', emoji: '☀️' });
    expect(getConditionInfo(61)).toEqual({ label: 'Chuva', emoji: '🌧️' });
    expect(getConditionInfo(95)).toEqual({ label: 'Temporal', emoji: '⛈️' });
  });

  it('gera dicas uteis para transporte', () => {
    expect(
      getTravelAdvice({
        temperatureCelsius: 24,
        precipitationProbability: 80,
        precipitationMm: 1,
        uvIndex: 3,
        windSpeedKmh: 8,
        weatherCode: 61,
      }).message
    ).toContain('guarda-chuva');

    expect(
      getTravelAdvice({
        temperatureCelsius: 32,
        precipitationProbability: 0,
        precipitationMm: 0,
        uvIndex: 4,
        windSpeedKmh: 10,
        weatherCode: 0,
      }).message
    ).toContain('Hidrate-se');
  });
});

