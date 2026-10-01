'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { TOTAL_TABLES } from '@/lib/constants';

interface TopBarProps {
  title?: string;
}

function TableUrlSync() {
  const searchParams = useSearchParams();
  const setTableNumber = useStore((s) => s.setTableNumber);

  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const n = parseInt(tableParam, 10);
      if (!isNaN(n) && n > 0) setTableNumber(n);
    }
  }, [searchParams, setTableNumber]);

  return null;
}

export default function TopBar({ title = 'Sudama Bhel' }: TopBarProps) {
  const [mounted, setMounted] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const { tableNumber, setTableNumber, totalTables } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTable = mounted ? tableNumber : 1;
  const count = totalTables ?? TOTAL_TABLES;

  return (
    <>
      <Suspense fallback={null}>
        <TableUrlSync />
      </Suspense>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-accent-brown px-4 py-2 shadow-sm">
        {/* Logo + Name */}
        <div className="flex items-center gap-2">
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-white">
            <Image
              src="/sudama-logo.png"
              alt="Sudama Bhel Logo"
              fill
              sizes="36px"
              className="object-contain p-0.5"
            />
          </div>
          <span className="font-georgia text-base font-bold text-white">{title}</span>
        </div>

        {/* Clickable Table badge */}
        <button
          onClick={() => setShowPicker(true)}
          title="Tap to switch table"
          className="flex items-center gap-1.5 rounded-2xl bg-primary/95 hover:bg-primary px-3 py-1 font-georgia text-xs font-black text-white shadow-soft transition-transform active:scale-95"
        >
          <span>Table {currentTable}</span>
          <span className="text-[10px] opacity-80">▾</span>
        </button>
      </header>

      {/* Quick Table Switcher Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-surface p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div>
                <h3 className="font-georgia text-base font-black text-text-dark">Select Your Table</h3>
                <p className="text-xs text-text-muted">Currently seated at: <strong>Table {currentTable}</strong></p>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="text-gray-400 hover:text-text-dark text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {Array.from({ length: count }, (_, i) => i + 1).map((n) => {
                const isSelected = n === currentTable;
                return (
                  <button
                    key={n}
                    onClick={() => {
                      setTableNumber(n);
                      setShowPicker(false);
                    }}
                    className={`flex h-11 w-full items-center justify-center rounded-xl border font-bold text-sm transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-sm font-black'
                        : 'border-border bg-background text-text-dark hover:border-primary/50'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowPicker(false)}
              className="w-full rounded-2xl border border-border py-2 text-xs font-bold text-text-muted hover:bg-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
