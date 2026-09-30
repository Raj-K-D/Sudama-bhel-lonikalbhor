'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isSoundMuted, setSoundMuted, playOrderAlertChime } from '@/lib/notify';

interface AdminTopBarProps {
  activeTables: number;
}

export default function AdminTopBar({ activeTables }: AdminTopBarProps) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isSoundMuted());
  }, []);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) {
      playOrderAlertChime();
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 bg-text-dark px-5 py-3 border-b border-white/10">
      <div>
        <h1 className="font-georgia text-xl font-bold text-white">Sudama Bhel — Kitchen</h1>
        <p className="text-xs text-white/60">Live kitchen tickets & realtime table status.</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleSound}
          title={muted ? 'Unmute kitchen alert sound' : 'Mute kitchen alert sound'}
          className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition-colors ${
            muted
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-accent-green/20 text-accent-green border border-accent-green/40'
          }`}
        >
          <span>{muted ? '🔇' : '🔊'}</span>
          <span>{muted ? 'Muted' : 'Sound ON'}</span>
        </button>

        <Link
          href="/admin/qr"
          className="flex items-center gap-1 rounded-2xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
        >
          <span>📱</span> Table QR
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1 rounded-2xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
        >
          <span>🛍️</span> Customer View
        </Link>

        <span className="ml-1 rounded-xl border border-primary/50 bg-primary/20 px-3 py-1.5 font-georgia text-xs font-black text-primary">
          Active: {activeTables}
        </span>
      </div>
    </header>
  );
}
