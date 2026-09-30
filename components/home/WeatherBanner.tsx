'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

const WEATHER_ICONS: Record<string, string> = {
  sunny: '☀️',
  rainy: '🌧️',
  cold: '❄️',
};

const WEATHER_LABELS: Record<string, string> = {
  sunny: 'Clear & Sunny',
  rainy: 'Rainy Day',
  cold: 'Cold Weather',
};

const WEATHER_TIPS: Record<string, string> = {
  sunny: 'Perfect weather — enjoy an outdoor bite!',
  rainy: 'Cozy inside? We\'ve got warm comfort food for you.',
  cold: 'Cold outside — warm up with our hot specials!',
};

export default function WeatherBanner() {
  const { weather, temp, isFetchingWeather, fetchWeather } = useStore();

  useEffect(() => {
    fetchWeather();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${
        weather === 'rainy'
          ? 'bg-blue-50 border border-blue-200'
          : weather === 'cold'
          ? 'bg-indigo-50 border border-indigo-200'
          : 'bg-amber-50 border border-amber-200'
      }`}
    >
      <span className="text-2xl">{isFetchingWeather ? '🔄' : WEATHER_ICONS[weather]}</span>
      <div>
        <p className="font-bold text-text-dark">{WEATHER_LABELS[weather]} · {temp.toFixed(0)}°C</p>
        <p className="text-text-muted text-xs">{WEATHER_TIPS[weather]}</p>
      </div>
    </div>
  );
}
