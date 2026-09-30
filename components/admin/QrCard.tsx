'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BASE_URL, TOTAL_TABLES } from '@/lib/constants';
import { useStore } from '@/lib/store';

export default function QrCard() {
  const { totalTables, setTotalTables } = useStore();
  const tableCount = totalTables ?? TOTAL_TABLES;

  const [selectedTable, setSelectedTable] = useState(1);
  const [origin, setOrigin] = useState(BASE_URL);
  const [viewAll, setViewAll] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleAddTable = () => {
    const next = tableCount + 1;
    setTotalTables(next);
    setSelectedTable(next);
    setNotification(`✅ Table ${next} added successfully!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRemoveTable = () => {
    if (tableCount <= 1) return;
    const next = tableCount - 1;
    setTotalTables(next);
    if (selectedTable > next) setSelectedTable(next);
    setNotification(`Table ${tableCount} removed.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDirectCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 50) {
      setTotalTables(val);
      if (selectedTable > val) setSelectedTable(val);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-5">
      {/* ── Table Capacity Management Bar ──────────────────────────────────── */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/6 p-4">
        <div>
          <h2 className="font-georgia text-base font-bold text-white flex items-center gap-2">
            <span>🪑</span> Restaurant Table Manager
          </h2>
          <p className="text-xs text-white/50">
            Currently configured: <strong className="text-primary">{tableCount} Tables</strong>. Add or remove tables as your seating expands.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Minus button */}
          <button
            onClick={handleRemoveTable}
            disabled={tableCount <= 1}
            title="Remove last table"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            −
          </button>

          {/* Number input */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/40 px-3 py-1.5">
            <span className="text-xs text-white/40">Tables:</span>
            <input
              type="number"
              min={1}
              max={50}
              value={tableCount}
              onChange={handleDirectCountChange}
              className="w-10 bg-transparent text-center font-georgia font-black text-sm text-primary outline-none"
            />
          </div>

          {/* Plus button */}
          <button
            onClick={handleAddTable}
            title="Add a new table"
            className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 font-georgia text-xs font-black text-black shadow-premium hover:bg-primary/90 transition-colors"
          >
            <span>+</span> Add Table
          </button>
        </div>
      </div>

      {notification && (
        <div className="print:hidden rounded-xl border border-accent-green/40 bg-accent-green/10 px-4 py-2 text-xs font-bold text-accent-green animate-fadeIn">
          {notification}
        </div>
      )}

      {/* ── Action & View Switcher ────────────────────────────────────────── */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewAll(false)}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-colors ${
              !viewAll ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Single Table Card
          </button>
          <button
            onClick={() => setViewAll(true)}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-colors ${
              viewAll ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📄 View All {tableCount} Tables (Batch Print)
          </button>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-1.5 text-xs font-bold text-white transition-colors"
        >
          🖨️ Print Standees
        </button>
      </div>

      {/* ── SINGLE TABLE VIEW ──────────────────────────────────────────────── */}
      {!viewAll ? (
        <div className="space-y-6">
          {/* Table selector buttons */}
          <div className="print:hidden">
            <p className="text-xs text-white/60 mb-2">Select a table to preview:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: tableCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedTable(n)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border font-bold text-base transition-all ${
                    n === selectedTable
                      ? 'border-primary bg-primary text-black'
                      : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Standee Preview Card */}
          <div className="flex justify-center">
            <TableQrStandee tableNum={selectedTable} origin={origin} />
          </div>

          <p className="print:hidden text-center text-xs text-white/40">
            💡 Click <strong>&ldquo;🖨️ Print Standees&rdquo;</strong> above to print. Cards are sized for standard table acrylic stands.
          </p>
        </div>
      ) : (
        /* ── ALL TABLES GRID (BATCH PRINT) ─────────────────────────────────── */
        <div className="space-y-4">
          <p className="print:hidden text-xs text-white/60">
            Showing all {tableCount} tables ready for printing. Click <strong>&ldquo;🖨️ Print Standees&rdquo;</strong> to print the entire set.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4">
            {Array.from({ length: tableCount }, (_, i) => i + 1).map((n) => (
              <div key={n} className="flex justify-center break-inside-avoid">
                <TableQrStandee tableNum={n} origin={origin} compact />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable Standee Card Component ──────────────────────────────────────────
function TableQrStandee({
  tableNum,
  origin,
  compact = false,
}: {
  tableNum: number;
  origin: string;
  compact?: boolean;
}) {
  const qrData = `${origin}/?table=${tableNum}`;

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-2xl text-center border-2 border-border/40 ${
        compact ? 'w-64 py-5' : 'w-72 sm:w-80 p-7'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🍽️</span>
        <div>
          <p className="font-georgia text-base font-black tracking-[2px] text-text-dark leading-none">
            SUDAMA BHEL
          </p>
          <p className="text-[10px] font-bold text-primary tracking-wide">
            पुण्याचे सुप्रसिद्ध सुदामा भेळ
          </p>
        </div>
      </div>

      <p className="text-[11px] font-medium text-gray-500">
        Scan QR with Camera or Google Lens to Order
      </p>

      {/* QR Code */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-inner">
        <QRCodeSVG
          value={qrData}
          size={compact ? 150 : 180}
          bgColor="#ffffff"
          fgColor="#1F2421"
          level="M"
        />
      </div>

      {/* Table Badge */}
      <div className="w-full rounded-2xl bg-primary py-2 text-center shadow-md">
        <p className="font-georgia text-lg font-black tracking-widest text-black">
          TABLE {tableNum}
        </p>
      </div>

      {/* Footer Info */}
      <p className="max-w-[220px] break-all font-mono text-[9px] text-gray-400">
        {qrData}
      </p>
      <p className="text-[10px] font-semibold text-gray-400">
        No App Download Required • Contactless Menu
      </p>
    </div>
  );
}
