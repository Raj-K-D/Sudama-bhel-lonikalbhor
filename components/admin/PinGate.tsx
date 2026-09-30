'use client';

import { useState, useEffect, useRef } from 'react';
import { ADMIN_PIN } from '@/lib/constants';

interface PinGateProps {
  children: React.ReactNode;
}

/**
 * PIN protection for the admin dashboard.
 * Fixes the "no security" con from the Flutter app.
 * PIN is stored in sessionStorage — survives tab refresh but resets on close.
 */
export default function PinGate({ children }: PinGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if already unlocked in this browser session
    if (sessionStorage.getItem('admin_unlocked') === 'true') {
      setUnlocked(true);
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('admin_unlocked', 'true');
      setUnlocked(true);
    } else {
      setError('Incorrect PIN. Try again.');
      setPin('');
      setTimeout(() => setError(''), 2000);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-text-dark p-4">
      <div className="w-full max-w-xs rounded-3xl bg-white p-8 text-center shadow-2xl">
        <span className="text-5xl">🔒</span>
        <h2 className="mt-3 font-georgia text-2xl font-black text-text-dark">Kitchen Access</h2>
        <p className="mt-1 text-sm text-text-muted">Enter your 4-digit admin PIN to continue.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="• • • •"
            className="w-full rounded-2xl border-2 border-primary/30 bg-background py-3 text-center font-georgia text-2xl tracking-[0.5rem] text-text-dark placeholder-primary/30 outline-none focus:border-primary"
          />

          {error && (
            <p className="text-sm font-bold text-accent-red">{error}</p>
          )}

          <button
            type="submit"
            disabled={pin.length < 4}
            className="rounded-3xl bg-primary py-3 font-georgia text-base font-black text-black shadow-premium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Unlock Dashboard
          </button>
        </form>

        <p className="mt-4 text-xs text-text-muted">🔒 Staff & Owner authorized access only</p>
      </div>
    </div>
  );
}
