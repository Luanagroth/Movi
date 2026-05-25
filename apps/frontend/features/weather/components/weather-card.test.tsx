import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeatherCard } from './weather-card';

describe('WeatherCard', () => {
  it('renderiza estado de fallback quando clima falha', () => {
    render(<WeatherCard status="error" weather={null} />);
    expect(screen.getByText('Clima indisponivel no momento')).toBeTruthy();
  });

  it('renderiza card com dados de clima', () => {
    render(
      <WeatherCard
        status="success"
        weather={{
          locationName: 'Sao Francisco do Sul',
          temperatureCelsius: 24,
          apparentTemperatureCelsius: 25,
          conditionLabel: 'Parcialmente nublado',
          conditionEmoji: '🌤️',
          precipitationProbability: 35,
          precipitationMm: 0,
          uvIndex: 4,
          windSpeedKmh: 12,
          nextHours: [
            {
              isoTime: '2026-05-25T12:00:00-03:00',
              timeLabel: '12:00',
              temperatureCelsius: 25,
              precipitationProbability: 20,
              uvIndex: 5,
              weatherCode: 1,
              conditionLabel: 'Predominio de sol',
              conditionEmoji: '🌤️',
            },
          ],
          advice: 'Boa viagem.',
          adviceKind: 'stable',
          updatedAt: '2026-05-25T10:00:00-03:00',
        }}
      />
    );

    expect(screen.getByText(/Clima em Sao Francisco do Sul/)).toBeTruthy();
    expect(screen.getByText(/Agora:/)).toBeTruthy();
    expect(screen.getByText(/Proximas horas/)).toBeTruthy();
  });
});
