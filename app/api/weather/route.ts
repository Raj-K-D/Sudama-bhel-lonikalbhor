import { NextResponse } from 'next/server';

// ─── Weather proxy ─────────────────────────────────────────────────────────
// Proxies the wttr.in API to avoid browser CORS issues.
// Mirrors the exact logic from Flutter's RestaurantState.fetchRealWeather().

export async function GET() {
  try {
    const res = await fetch('https://wttr.in/?format=j1', {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) throw new Error('wttr.in error');

    const data = await res.json();
    const tempC = parseFloat(data?.current_condition?.[0]?.temp_C ?? '32');
    const desc: string =
      (data?.current_condition?.[0]?.weatherDesc?.[0]?.value ?? '').toLowerCase();

    let mode: 'sunny' | 'rainy' | 'cold';
    if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
      mode = 'rainy';
    } else if (tempC < 20) {
      mode = 'cold';
    } else {
      mode = 'sunny';
    }

    return NextResponse.json({ mode, temp: tempC, description: desc });
  } catch {
    // Return sensible defaults if weather API is unavailable
    return NextResponse.json({ mode: 'sunny', temp: 32, description: 'clear' });
  }
}
