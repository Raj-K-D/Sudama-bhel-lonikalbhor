'use client';

import { useState, useEffect } from 'react';
import { useStore, cartItemCount } from '@/lib/store';
import { TOTAL_TABLES } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import LiveBackground from '@/components/ui/LiveBackground';

export default function AccountPage() {
  const [mounted, setMounted] = useState(false);
  const {
    tableNumber,
    setTableNumber,
    totalTables,
    cart,
    getCustomerOrders,
    getTableTotal,
    isBillPaid,
    resetSession,
  } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTable = mounted ? tableNumber : 1;
  const orders = mounted ? getCustomerOrders(currentTable) : [];
  const totalSpent = mounted ? getTableTotal(currentTable) : 0;
  const itemsInCart = mounted ? cartItemCount(cart) : 0;

  return (
    <LiveBackground>
      <TopBar title="My Account" />

      <div className="flex flex-col gap-5 p-4">
        <div>
          <h1 className="font-georgia text-2xl font-black text-text-dark">My Account</h1>
          <p className="font-georgia text-sm text-text-muted">Table {currentTable} • Session info</p>
        </div>

        {/* ── Table Selector ─────────────────────────────────────────── */}
        <div className="rounded-3xl border border-primary/15 bg-surface p-5 shadow-soft">
          <h2 className="font-georgia text-base font-bold text-text-dark">Your Table</h2>
          <p className="mt-1 text-sm text-text-muted">Switch to a different table number:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: totalTables ?? TOTAL_TABLES }, (_, i) => i + 1).map((n) => {
              const isSelected = n === currentTable;
              return (
                <button
                  key={n}
                  onClick={() => setTableNumber(n)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border font-bold text-base transition-all duration-150 ${
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-background text-text-dark hover:border-primary'
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Session Summary ────────────────────────────────────────── */}
        <div className="rounded-3xl border border-primary/15 bg-surface p-5 shadow-soft space-y-4">
          <h2 className="font-georgia text-base font-bold text-text-dark">Session Summary</h2>
          <div className="space-y-3">
            <SummaryRow icon="🧾" label="Orders Placed" value={`${orders.length}`} />
            <SummaryRow icon="🛍️" label="Items in Cart" value={`${itemsInCart}`} />
            <SummaryRow icon="₹" label="Total Spent" value={`₹${totalSpent.toFixed(0)}`} />
            <SummaryRow
              icon="✅"
              label="Bill Status"
              value={mounted && isBillPaid ? 'Paid ✓' : 'Unpaid'}
              valueColor={mounted && isBillPaid ? 'text-accent-green' : 'text-accent-red'}
            />
          </div>

          <button
            onClick={() => {
              if (window.confirm('Start a fresh dining session on this phone? This will clear your current cart and order view.')) {
                resetSession();
              }
            }}
            className="w-full rounded-2xl border border-border bg-background py-2.5 text-xs font-bold text-text-muted hover:text-red-500 hover:border-red-300 transition-colors"
          >
            🔄 Start Fresh / Reset My Table Session
          </button>
        </div>

        {/* ── About ──────────────────────────────────────────────────── */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <h2 className="font-georgia text-base font-bold text-text-dark">About Sudama Bhel</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Sudama Bhel brings you a smart QR-based table ordering experience. Scan your table QR, browse our delicious menu, and place orders directly from your phone. The kitchen gets notified instantly.
          </p>
          <p className="mt-3 text-xs text-gray-400">
            ℹ️ v2.0.0 • Next.js • Weather-Powered Recommendations
          </p>
        </div>

        <div className="h-4" />
      </div>
    </LiveBackground>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  valueColor = 'text-text-dark',
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <span className={`font-georgia text-sm font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}
