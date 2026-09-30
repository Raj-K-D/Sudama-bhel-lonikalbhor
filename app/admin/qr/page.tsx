'use client';

import QrCard from '@/components/admin/QrCard';

// PinGate, LiveBackground, and AdminTopBar come from /admin/layout.tsx
export default function QrPage() {
  return (
    <div className="p-4 sm:p-6">
      <QrCard />
    </div>
  );
}
