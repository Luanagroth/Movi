import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSaoFranciscoDoSulWeather } from './weather.service';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('weather.service', () => {
  it('retorna null quando a API falha', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('network'));
    const result = await getSaoFranciscoDoSulWeather();
    expect(result).toBeNull();
  });

  it('mapeia payload da Open-Meteo para resumo de clima', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          time: '2026-05-25T09:00:00-03:00',
          temperature_2m: 23.4,
          apparent_temperature: 24.2,
          weather_code: 2,
          precipitation: 0,
          wind_speed_10m: 11.3,
          uv_index: 5.4,
        },
        hourly: {
          time: [
            '2026-05-25T10:00:00-03:00',
            '2026-05-25T11:00:00-03:00',
            '2026-05-25T12:00:00-03:00',
            '2026-05-25T13:00:00-03:00',
          ],
          temperature_2m: [24, 25, 26, 26],
          apparent_temperature: [24, 25, 26, 26],
          weather_code: [2, 2, 3, 3],
          precipitation_probability: [10, 20, 30, 20],
          uv_index: [5, 6, 7, 7],
        },
      }),
    } as Response);

    const result = await getSaoFranciscoDoSulWeather();

    expect(result).not.toBeNull();
    expect(result?.locationName).toBe('Sao Francisco do Sul');
    expect(result?.nextHours.length).toBeGreaterThan(0);
    expect(result?.conditionLabel).toBeTruthy();
  });
});

