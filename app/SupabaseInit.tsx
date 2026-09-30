'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

/**
 * Client component — boots Supabase realtime sync (orders + menu) once on mount.
 * Placed in the root layout so it runs on every page.
 */
export default function SupabaseInit() {
  const { initSupabaseSync, fetchWeather } = useStore();
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    initSupabaseSync();
    fetchWeather();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
