'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title = 'Sudama Bhel' }: TopBarProps) {
  const [mounted, setMounted] = useState(false);
  const tableNumber = useStore((s) => s.tableNumber);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
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
      {/* Table badge */}
      <span className="rounded-2xl bg-primary/90 px-3 py-1 font-georgia text-xs font-black text-white">
        Table {mounted ? tableNumber : 1}
      </span>
    </header>
  );
}
