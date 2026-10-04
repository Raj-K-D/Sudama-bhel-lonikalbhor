'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { BASE_URL, TOTAL_TABLES } from '@/lib/constants';
import { useStore } from '@/lib/store';
import JSZip from 'jszip';

type StandeeTheme = 'red-gold' | 'royal-dark' | 'emerald';

export default function QrCard() {
  const { totalTables, setTotalTables } = useStore();
  const tableCount = totalTables ?? TOTAL_TABLES;

  const [selectedTable, setSelectedTable] = useState(1);
  const [origin, setOrigin] = useState(BASE_URL);
  const [viewAll, setViewAll] = useState(false);
  const [theme, setTheme] = useState<StandeeTheme>('red-gold');
  const [notification, setNotification] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

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

  // ── Render High-Resolution 1200x1600 Standee on Offscreen Canvas ────────────
  const generateStandeeCanvas = async (tableNum: number, currentTheme: StandeeTheme): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    // Theme Color Palette
    const colors = {
      'red-gold': {
        bg: '#FFFFFF',
        headerBg: '#B91C1C',
        headerText: '#FFFFFF',
        subHeaderText: '#FDE047',
        accentGold: '#D97706',
        tableBg: '#DC2626',
        tableText: '#FFFFFF',
        stepBg: '#FEF2F2',
        stepBorder: '#FCA5A5',
        stepText: '#1F2937',
        borderColor: '#DC2626',
        footerBg: '#1F2937',
        footerText: '#FFFFFF',
      },
      'royal-dark': {
        bg: '#18181B',
        headerBg: '#09090B',
        headerText: '#F59E0B',
        subHeaderText: '#FCD34D',
        accentGold: '#F59E0B',
        tableBg: '#F59E0B',
        tableText: '#000000',
        stepBg: '#27272A',
        stepBorder: '#3F3F46',
        stepText: '#FFFFFF',
        borderColor: '#F59E0B',
        footerBg: '#000000',
        footerText: '#D1D5DB',
      },
      'emerald': {
        bg: '#FFFFFF',
        headerBg: '#065F46',
        headerText: '#FFFFFF',
        subHeaderText: '#A7F3D0',
        accentGold: '#059669',
        tableBg: '#047857',
        tableText: '#FFFFFF',
        stepBg: '#ECFDF5',
        stepBorder: '#A7F3D0',
        stepText: '#064E3B',
        borderColor: '#059669',
        footerBg: '#064E3B',
        footerText: '#FFFFFF',
      },
    }[currentTheme];

    // 1. Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, 1200, 1600);

    // 2. Outer Decorative Frame / Border
    ctx.lineWidth = 16;
    ctx.strokeStyle = colors.borderColor;
    ctx.strokeRect(20, 20, 1160, 1560);

    ctx.lineWidth = 4;
    ctx.strokeStyle = colors.accentGold;
    ctx.strokeRect(36, 36, 1128, 1528);

    // 3. Header Section (Curved Bottom)
    ctx.fillStyle = colors.headerBg;
    ctx.beginPath();
    ctx.roundRect(40, 40, 1120, 270, [24, 24, 40, 40]);
    ctx.fill();

    // Marathi Brand Title
    ctx.fillStyle = colors.subHeaderText;
    ctx.font = 'bold 36px "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ पुण्याचे सुप्रसिद्ध ⭐', 600, 105);

    ctx.fillStyle = colors.headerText;
    ctx.font = '900 58px "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
    ctx.fillText('सुदामा भेळ ॲन्ड स्नॅक्स', 600, 180);

    ctx.fillStyle = colors.subHeaderText;
    ctx.font = 'bold 30px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('SUDAMA BHEL • LONI KALBHOR, PUNE', 600, 245);

    // 4. Catchy Value Proposition Banner
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.roundRect(80, 335, 1040, 80, 20);
    ctx.fill();
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#78350F';
    ctx.font = '900 32px "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
    ctx.fillText('⚡ रांगेत थांबू नका! थेट टेबलवरून ऑर्डर करा ⚡', 600, 386);

    // 5. Large TABLE Banner
    ctx.fillStyle = colors.tableBg;
    ctx.beginPath();
    ctx.roundRect(260, 440, 680, 100, 30);
    ctx.fill();
    ctx.strokeStyle = colors.accentGold;
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = colors.tableText;
    ctx.font = '900 56px "Georgia", serif, sans-serif';
    ctx.fillText(`TABLE ${tableNum < 10 ? '0' + tableNum : tableNum}`, 600, 510);

    // 6. Center QR Code Container
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(300, 565, 600, 600, 36);
    ctx.fill();
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Draw QR Code from hidden pre-rendered canvas
    const existingCanvas = document.getElementById(`qr-canvas-hidden-${tableNum}`) as HTMLCanvasElement | null;
    if (existingCanvas) {
      ctx.drawImage(existingCanvas, 360, 625, 480, 480);
    } else {
      // Fallback
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(360, 625, 480, 480);
    }

    // Scan CTA under QR
    ctx.fillStyle = colors.accentGold;
    ctx.font = '900 32px "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
    ctx.fillText('📲 SCAN WITH CAMERA / GPAY / PHONEPE', 600, 1205);

    // 7. 3-Step Simple Guide Section
    ctx.fillStyle = colors.stepBg;
    ctx.beginPath();
    ctx.roundRect(80, 1240, 1040, 180, 24);
    ctx.fill();
    ctx.strokeStyle = colors.stepBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    const steps = [
      { num: '१', title: 'कॅमेरा उघडा', desc: 'Scan QR with Camera' },
      { num: '२', title: 'मेनू निवडा', desc: 'Add Items & Order' },
      { num: '३', title: 'टेबलवर जेवा', desc: 'Served at Your Table' },
    ];

    steps.forEach((st, idx) => {
      const x = 250 + idx * 350;
      // Step badge
      ctx.fillStyle = colors.tableBg;
      ctx.beginPath();
      ctx.arc(x - 90, 1330, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colors.tableText;
      ctx.font = '900 28px "Segoe UI", sans-serif';
      ctx.fillText(st.num, x - 90, 1340);

      // Step text
      ctx.fillStyle = colors.stepText;
      ctx.textAlign = 'left';
      ctx.font = '900 26px "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
      ctx.fillText(st.title, x - 45, 1320);
      ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(st.desc, x - 45, 1350);
      ctx.textAlign = 'center';
    });

    // 8. Footer Trust Badges
    ctx.fillStyle = colors.footerBg;
    ctx.beginPath();
    ctx.roundRect(60, 1445, 1080, 95, 20);
    ctx.fill();

    ctx.fillStyle = colors.footerText;
    ctx.font = 'bold 24px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('✨ No App Download Required • 100% Free & Contactless • Pay via UPI or Cash', 600, 1502);

    return canvas;
  };

  // ── Download Single Table Standee (PNG) ──────────────────────────────────────
  const handleDownloadSingle = async (tableNum: number) => {
    try {
      setNotification(`⏳ Generating Table ${tableNum} Standee HD Image...`);
      const canvas = await generateStandeeCanvas(tableNum, theme);
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Sudama-Bhel-Table-${tableNum < 10 ? '0' + tableNum : tableNum}-Standee.png`;
      link.href = dataUrl;
      link.click();
      setNotification(`✅ Table ${tableNum} Standee downloaded successfully!`);
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      console.error(err);
      setNotification('❌ Failed to export standee.');
    }
  };

  // ── Download All Tables as a ZIP Package ────────────────────────────────────
  const handleDownloadAllZip = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      setNotification(`⏳ Preparing ZIP package for all ${tableCount} tables...`);

      const zip = new JSZip();
      const folder = zip.folder('Sudama-Bhel-Table-Standees');

      for (let i = 1; i <= tableCount; i++) {
        setExportProgress(Math.round((i / tableCount) * 100));
        const canvas = await generateStandeeCanvas(i, theme);
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        const filename = `Table-${i < 10 ? '0' + i : i}-Standee.png`;
        folder?.file(filename, base64Data, { base64: true });
      }

      setNotification('📦 Generating ZIP archive file...');
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sudama-Bhel-All-${tableCount}-Table-Standees.zip`;
      link.click();
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setNotification(`🎉 All ${tableCount} table standees downloaded in ZIP file!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      setNotification('❌ Error creating ZIP file.');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-5">
      {/* ── Hidden Canvas Elements for QR generation ───────────────────────── */}
      <div className="hidden" aria-hidden="true">
        {Array.from({ length: tableCount }, (_, i) => i + 1).map((n) => (
          <QRCodeCanvas
            key={n}
            id={`qr-canvas-hidden-${n}`}
            value={`${origin}/?table=${n}`}
            size={480}
            level="H"
            includeMargin={true}
          />
        ))}
      </div>

      {/* ── Table Capacity Management Bar ──────────────────────────────────── */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="font-georgia text-lg font-bold text-white flex items-center gap-2">
            <span>🪑</span> Restaurant QR Standees & Table Manager
          </h2>
          <p className="text-xs text-white/60">
            Currently configured: <strong className="text-primary">{tableCount} Seating Tables</strong>.
            Export high-definition acrylic standees that entice customers to scan and order.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRemoveTable}
            disabled={tableCount <= 1}
            title="Remove last table"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            −
          </button>

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

          <button
            onClick={handleAddTable}
            title="Add a new table"
            className="flex items-center gap-1 rounded-xl bg-primary px-3.5 py-1.5 font-georgia text-xs font-black text-black shadow-premium hover:bg-primary/90 transition-colors"
          >
            <span>+</span> Add Table
          </button>
        </div>
      </div>

      {/* ── Notification Toast ────────────────────────────────────────────── */}
      {notification && (
        <div className="print:hidden rounded-2xl border-2 border-accent-green/50 bg-accent-green/15 px-5 py-3 text-xs font-bold text-accent-green animate-fadeIn flex items-center justify-between shadow-lg">
          <span>{notification}</span>
          {isExporting && <span className="font-mono">{exportProgress}%</span>}
        </div>
      )}

      {/* ── Theme Switcher & Export Actions Bar ────────────────────────────── */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
        {/* Design Theme Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white/60">Design Style:</span>
          <button
            onClick={() => setTheme('red-gold')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              theme === 'red-gold'
                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <span>🔴</span> Sudama Red & Gold
          </button>
          <button
            onClick={() => setTheme('royal-dark')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              theme === 'royal-dark'
                ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-300'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <span>⬛</span> Royal Dark Velvet
          </button>
          <button
            onClick={() => setTheme('emerald')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              theme === 'emerald'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <span>🟢</span> Fresh Mint
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadAllZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-2xl bg-accent-gold px-4 py-2 font-georgia text-xs font-black text-black shadow-premium hover:bg-accent-gold/90 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>📦</span>
            <span>Download All {tableCount} Standees (.ZIP)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-2xl bg-white/15 hover:bg-white/25 px-4 py-2 text-xs font-bold text-white transition-all active:scale-95"
          >
            <span>🖨️</span>
            <span>Print All (A6 / Acrylic)</span>
          </button>
        </div>
      </div>

      {/* ── View Mode Switcher ────────────────────────────────────────────── */}
      <div className="print:hidden flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewAll(false)}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-colors ${
              !viewAll ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Single Standee Preview
          </button>
          <button
            onClick={() => setViewAll(true)}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-colors ${
              viewAll ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📄 View All {tableCount} Tables (Print Sheet)
          </button>
        </div>

        {!viewAll && (
          <button
            onClick={() => handleDownloadSingle(selectedTable)}
            className="flex items-center gap-1.5 rounded-xl bg-primary/20 border border-primary/50 text-primary px-3 py-1 text-xs font-bold hover:bg-primary hover:text-black transition-colors"
          >
            <span>📥</span> Download Table {selectedTable} (HD PNG)
          </button>
        )}
      </div>

      {/* ── SINGLE TABLE VIEW ──────────────────────────────────────────────── */}
      {!viewAll ? (
        <div className="space-y-6">
          {/* Table selector pill buttons */}
          <div className="print:hidden">
            <p className="text-xs text-white/60 mb-2">Select table number to preview & download:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: tableCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedTable(n)}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border font-bold text-base transition-all active:scale-95 ${
                    n === selectedTable
                      ? 'border-primary bg-primary text-black shadow-lg scale-105'
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
            <AttractiveTableStandee
              tableNum={selectedTable}
              origin={origin}
              theme={theme}
              onDownload={() => handleDownloadSingle(selectedTable)}
            />
          </div>

          <p className="print:hidden text-center text-xs text-white/50">
            💡 <strong>Pro-Tip:</strong> Print on 300 GSM photo paper and insert into 4&quot;x6&quot; acrylic T-stand / L-stands for maximum customer scanning.
          </p>
        </div>
      ) : (
        /* ── ALL TABLES GRID (BATCH PRINT VIEW) ────────────────────────────── */
        <div className="space-y-4">
          <p className="print:hidden text-xs text-white/60">
            Showing all {tableCount} table standees formatted for printing. Click <strong>&ldquo;🖨️ Print All&rdquo;</strong> to print directly or <strong>&ldquo;📦 Download All Standees (.ZIP)&rdquo;</strong> to save all HD images.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 print:grid-cols-2 print:gap-6">
            {Array.from({ length: tableCount }, (_, i) => i + 1).map((n) => (
              <div key={n} className="flex justify-center break-inside-avoid print:mb-8">
                <AttractiveTableStandee
                  tableNum={n}
                  origin={origin}
                  theme={theme}
                  onDownload={() => handleDownloadSingle(n)}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Ultra-Attractive High-Converting Table Standee Component ─────────────────
function AttractiveTableStandee({
  tableNum,
  origin,
  theme,
  onDownload,
  compact = false,
}: {
  tableNum: number;
  origin: string;
  theme: StandeeTheme;
  onDownload?: () => void;
  compact?: boolean;
}) {
  const qrData = `${origin}/?table=${tableNum}`;

  const themeStyles = {
    'red-gold': {
      cardBg: 'bg-white',
      border: 'border-red-600',
      headerBg: 'bg-gradient-to-b from-red-700 to-red-600',
      headerTitle: 'text-yellow-300',
      headerSub: 'text-white',
      tableBanner: 'bg-red-600 text-white border-amber-400',
      stepBox: 'bg-red-50 border-red-200 text-gray-800',
      stepBadge: 'bg-red-600 text-white',
      footerBg: 'bg-gray-900 text-white',
    },
    'royal-dark': {
      cardBg: 'bg-zinc-900 text-white',
      border: 'border-amber-500',
      headerBg: 'bg-gradient-to-b from-black to-zinc-900',
      headerTitle: 'text-amber-400',
      headerSub: 'text-zinc-100',
      tableBanner: 'bg-amber-500 text-black border-yellow-300',
      stepBox: 'bg-zinc-800 border-zinc-700 text-zinc-100',
      stepBadge: 'bg-amber-500 text-black',
      footerBg: 'bg-black text-zinc-300',
    },
    'emerald': {
      cardBg: 'bg-white',
      border: 'border-emerald-600',
      headerBg: 'bg-gradient-to-b from-emerald-800 to-emerald-600',
      headerTitle: 'text-emerald-200',
      headerSub: 'text-white',
      tableBanner: 'bg-emerald-600 text-white border-emerald-300',
      stepBox: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      stepBadge: 'bg-emerald-600 text-white',
      footerBg: 'bg-emerald-950 text-white',
    },
  }[theme];

  return (
    <div
      className={`relative flex flex-col items-center rounded-[32px] ${themeStyles.cardBg} ${
        compact ? 'w-[320px] p-5' : 'w-full max-w-[380px] p-6'
      } border-[6px] ${themeStyles.border} shadow-2xl text-center select-none overflow-hidden transition-all`}
    >
      {/* Top Header Card */}
      <div className={`w-full rounded-2xl ${themeStyles.headerBg} py-4 px-3 shadow-md`}>
        <p className={`text-xs font-black tracking-widest uppercase ${themeStyles.headerTitle}`}>
          ⭐ पुण्याचे सुप्रसिद्ध ⭐
        </p>
        <h1 className={`mt-0.5 font-georgia text-2xl font-black tracking-wide ${themeStyles.headerSub}`}>
          सुदामा भेळ ॲन्ड स्नॅक्स
        </h1>
        <p className="mt-0.5 text-[11px] font-bold text-amber-300/90 tracking-wider uppercase">
          SUDAMA BHEL • LONI KALBHOR
        </p>
      </div>

      {/* Catchy Value Banner */}
      <div className="mt-3 w-full rounded-xl bg-amber-100 border border-amber-300 py-1.5 px-2">
        <p className="text-xs font-black text-amber-950 flex items-center justify-center gap-1">
          <span>⚡</span>
          <span>रांगेत थांबू नका! थेट टेबलवरून ऑर्डर करा</span>
          <span>⚡</span>
        </p>
      </div>

      {/* Prominent Table Badge */}
      <div
        className={`mt-3 w-full rounded-2xl py-2 px-4 shadow-md border-2 ${themeStyles.tableBanner}`}
      >
        <p className="font-georgia text-xl font-black tracking-[4px]">
          TABLE {tableNum < 10 ? '0' + tableNum : tableNum}
        </p>
      </div>

      {/* High-Contrast QR Code Frame */}
      <div className="mt-3 relative rounded-3xl bg-white p-4 shadow-inner border-2 border-gray-200">
        <QRCodeSVG
          value={qrData}
          size={compact ? 180 : 210}
          bgColor="#ffffff"
          fgColor="#111827"
          level="H"
          includeMargin={false}
        />
        <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-black text-amber-700">
          <span>📲</span>
          <span>SCAN WITH ANY CAMERA / GPAY / PHONEPE</span>
        </div>
      </div>

      {/* 3-Step Simple How It Works */}
      <div className={`mt-3 w-full rounded-2xl border ${themeStyles.stepBox} p-2.5 space-y-1.5`}>
        <div className="grid grid-cols-3 gap-1.5 text-left">
          <div className="flex items-center gap-1.5">
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${themeStyles.stepBadge}`}>
              १
            </span>
            <div>
              <p className="text-[10px] font-black leading-tight">स्कॅन करा</p>
              <p className="text-[8px] opacity-75">Scan QR</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${themeStyles.stepBadge}`}>
              २
            </span>
            <div>
              <p className="text-[10px] font-black leading-tight">मेनू निवडा</p>
              <p className="text-[8px] opacity-75">Pick Items</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${themeStyles.stepBadge}`}>
              ३
            </span>
            <div>
              <p className="text-[10px] font-black leading-tight">टेबलवर जेवा</p>
              <p className="text-[8px] opacity-75">Fast Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Trust Badges */}
      <div className={`mt-3 w-full rounded-xl ${themeStyles.footerBg} py-2 px-3 text-[10px] font-bold`}>
        <p className="leading-tight">
          ✨ No App Required • 100% Free & Contactless
        </p>
        <p className="text-[9px] opacity-80 mt-0.5">
          Pay via UPI (GPay/PhonePe/Paytm) or Cash at Counter
        </p>
      </div>

      {/* Download Action (Hidden on Print) */}
      {onDownload && (
        <button
          onClick={onDownload}
          className="print:hidden mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gray-900/10 hover:bg-gray-900/20 py-2 text-xs font-bold text-gray-800 transition-colors"
        >
          <span>📥</span> Download Table {tableNum} HD PNG
        </button>
      )}
    </div>
  );
}
