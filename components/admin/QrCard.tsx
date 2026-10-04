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

  // Group tables into chunks of 4 (for 4 per A4 page)
  const tablePages: number[][] = [];
  for (let i = 1; i <= tableCount; i += 4) {
    const page: number[] = [];
    for (let j = i; j < i + 4 && j <= tableCount; j++) {
      page.push(j);
    }
    tablePages.push(page);
  }

  // ── Render High-Resolution 1200x1600 Standee on Offscreen Canvas (English & Centered) ──
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

    // 3. Header Section
    ctx.fillStyle = colors.headerBg;
    ctx.beginPath();
    ctx.roundRect(40, 40, 1120, 270, [24, 24, 40, 40]);
    ctx.fill();

    // English Brand Title
    ctx.fillStyle = colors.subHeaderText;
    ctx.font = 'bold 34px "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ PUNE\'S FAMOUS ⭐', 600, 105);

    ctx.fillStyle = colors.headerText;
    ctx.font = '900 64px "Georgia", serif, sans-serif';
    ctx.fillText('SUDAMA BHEL & SNACKS', 600, 185);

    ctx.fillStyle = colors.subHeaderText;
    ctx.font = 'bold 30px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('LONI KALBHOR • PUNE', 600, 248);

    // 4. Catchy Value Proposition Banner
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.roundRect(80, 335, 1040, 80, 20);
    ctx.fill();
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#78350F';
    ctx.font = '900 32px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚡ SKIP THE LINE • SCAN & ORDER AT TABLE ⚡', 600, 386);

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

    // 6. Center QR Code Container (PERFECTLY CENTERED & EXTRA LARGE)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(240, 560, 720, 680, 36);
    ctx.fill();
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Draw QR Code from hidden pre-rendered canvas right in the middle (600x600 px)
    const existingCanvas = document.getElementById(`qr-canvas-hidden-${tableNum}`) as HTMLCanvasElement | null;
    if (existingCanvas) {
      ctx.drawImage(existingCanvas, 300, 600, 600, 600);
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(300, 600, 600, 600);
    }

    // 7. 3-Step Simple Guide Section (English)
    ctx.fillStyle = colors.stepBg;
    ctx.beginPath();
    ctx.roundRect(80, 1250, 1040, 170, 24);
    ctx.fill();
    ctx.strokeStyle = colors.stepBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    const steps = [
      { num: '1', title: 'Scan QR Code', desc: 'Use Camera / GPay' },
      { num: '2', title: 'Pick Your Items', desc: 'Add Snacks & Cart' },
      { num: '3', title: 'Enjoy at Table', desc: 'Fast Table Service' },
    ];

    steps.forEach((st, idx) => {
      const x = 250 + idx * 350;
      // Step badge
      ctx.fillStyle = colors.tableBg;
      ctx.beginPath();
      ctx.arc(x - 90, 1335, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colors.tableText;
      ctx.font = '900 28px "Segoe UI", sans-serif';
      ctx.fillText(st.num, x - 90, 1345);

      // Step text
      ctx.fillStyle = colors.stepText;
      ctx.textAlign = 'left';
      ctx.font = '900 26px "Segoe UI", Roboto, sans-serif';
      ctx.fillText(st.title, x - 45, 1325);
      ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(st.desc, x - 45, 1355);
      ctx.textAlign = 'center';
    });

    // 8. Footer Trust Badges
    ctx.fillStyle = colors.footerBg;
    ctx.beginPath();
    ctx.roundRect(60, 1450, 1080, 90, 20);
    ctx.fill();

    ctx.fillStyle = colors.footerText;
    ctx.font = 'bold 24px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('✨ No App Required • Contactless Menu • Pay via UPI or Cash', 600, 1505);

    return canvas;
  };

  // ── Download Single Table Standee (PNG) ──────────────────────────────────────
  const handleDownloadSingle = async (tableNum: number) => {
    try {
      setNotification(`⏳ Generating Table ${tableNum} HD Image...`);
      const canvas = await generateStandeeCanvas(tableNum, theme);
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Sudama-Bhel-Table-${tableNum < 10 ? '0' + tableNum : tableNum}-Sticker.png`;
      link.href = dataUrl;
      link.click();
      setNotification(`✅ Table ${tableNum} sticker downloaded successfully!`);
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      console.error(err);
      setNotification('❌ Failed to export image.');
    }
  };

  // ── Download All Tables as a ZIP Package ────────────────────────────────────
  const handleDownloadAllZip = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      setNotification(`⏳ Generating all ${tableCount} table stickers in ZIP...`);

      const zip = new JSZip();
      const folder = zip.folder('Sudama-Bhel-Table-Stickers');

      for (let i = 1; i <= tableCount; i++) {
        setExportProgress(Math.round((i / tableCount) * 100));
        const canvas = await generateStandeeCanvas(i, theme);
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        const filename = `Table-${i < 10 ? '0' + i : i}-Sticker.png`;
        folder?.file(filename, base64Data, { base64: true });
      }

      setNotification('📦 Packaging ZIP file...');
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sudama-Bhel-All-${tableCount}-Table-Stickers.zip`;
      link.click();
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setNotification(`🎉 All ${tableCount} stickers downloaded in ZIP!`);
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
            size={520}
            level="H"
            includeMargin={true}
          />
        ))}
      </div>

      {/* ── Table Capacity Management Bar ──────────────────────────────────── */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-lg">
        <div>
          <h2 className="font-georgia text-lg font-bold text-white flex items-center gap-2">
            <span>🪑</span> Restaurant Table Stickers (4 per A4 Page)
          </h2>
          <p className="text-xs text-white/60">
            Currently configured: <strong className="text-primary">{tableCount} Tables</strong> ({tablePages.length} A4 Pages).
            Formatted to print 4 stickers per sheet with scissor cutting guides.
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
          <span className="text-xs font-bold text-white/60">Color Style:</span>
          <button
            onClick={() => setTheme('red-gold')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              theme === 'red-gold'
                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <span>🔴</span> Red & Gold
          </button>
          <button
            onClick={() => setTheme('royal-dark')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              theme === 'royal-dark'
                ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-300'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <span>⬛</span> Royal Dark
          </button>
          <button
            onClick={() => setTheme('emerald')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              theme === 'emerald'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <span>🟢</span> Emerald Green
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/table-qr-stickers.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-2xl bg-white/20 hover:bg-white/30 px-4 py-2 font-georgia text-xs font-bold text-white transition-all active:scale-95"
          >
            <span>📄</span>
            <span>Open Ready A4 Document</span>
          </a>

          <button
            onClick={handleDownloadAllZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-2xl bg-accent-gold px-4 py-2 font-georgia text-xs font-black text-black shadow-premium hover:bg-accent-gold/90 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>📦</span>
            <span>Download All {tableCount} (.ZIP)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 font-georgia text-xs font-black text-black shadow-premium hover:bg-primary/90 transition-all active:scale-95"
          >
            <span>🖨️</span>
            <span>Print All {tableCount} (4 per A4 Page)</span>
          </button>
        </div>
      </div>

      {/* ── PRINT NOTICE (Screen Only) ─────────────────────────────────────── */}
      <div className="print:hidden rounded-2xl border border-white/10 bg-black/40 p-3 text-center text-xs text-white/70">
        📄 <strong>A4 Print Layout:</strong> Exactly <strong>4 Table Stickers per Page</strong> with dashed cutting borders ✂️.
        Print on A4 sticker paper or cardstock to cut and stick directly on tables.
      </div>

      {/* ── 4-PER-PAGE A4 PRINT SHEETS CONTAINER ───────────────────────────── */}
      <div className="space-y-12 print:space-y-0">
        {tablePages.map((pageTables, pageIndex) => (
          <div
            key={pageIndex}
            className="rounded-3xl bg-neutral-900/60 p-4 sm:p-6 border border-white/10 print:border-none print:p-0 print:m-0 print:bg-white print:break-after-page print:page-break-after-always"
          >
            {/* Screen Page Header (Hidden on Print) */}
            <div className="print:hidden flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="font-georgia text-sm font-bold text-white">
                📄 Sheet {pageIndex + 1} of {tablePages.length} — Tables {pageTables[0]} to {pageTables[pageTables.length - 1]}
              </span>
              <span className="text-xs text-white/50">4 stickers / A4 sheet</span>
            </div>

            {/* 2x2 Grid per A4 Page */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:w-full print:h-full">
              {pageTables.map((n) => (
                <div key={n} className="flex justify-center">
                  <TableStickerCard
                    tableNum={n}
                    origin={origin}
                    theme={theme}
                    onDownload={() => handleDownloadSingle(n)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ultra-Clean Table Sticker Card (4 Per Page with Cutting Guides) ──────────
function TableStickerCard({
  tableNum,
  origin,
  theme,
  onDownload,
}: {
  tableNum: number;
  origin: string;
  theme: StandeeTheme;
  onDownload?: () => void;
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
    <div className="relative p-2 border-2 border-dashed border-gray-400/80 rounded-3xl w-full max-w-[340px] print:max-w-none print:w-full print:border-dashed print:border-gray-400 print:p-2.5">
      {/* Cut scissors indicator */}
      <span className="absolute -top-3 left-6 bg-white px-1 text-[10px] font-bold text-gray-500 print:text-black">
        ✂️ Cut along dashed line
      </span>

      {/* Main Sticker Body */}
      <div
        className={`flex flex-col items-center justify-start gap-1.5 rounded-2xl ${themeStyles.cardBg} p-2.5 border-4 ${themeStyles.border} shadow-lg text-center select-none overflow-hidden h-full min-h-[460px] print:min-h-[480px]`}
      >
        {/* Top Header Card */}
        <div className={`w-full rounded-xl ${themeStyles.headerBg} py-2 px-2 shadow-sm`}>
          <p className={`text-[10px] font-black tracking-widest uppercase ${themeStyles.headerTitle}`}>
            ⭐ पुण्याचे सुप्रसिद्ध • थेट टेबलवरून ऑर्डर करा ⭐
          </p>
          <h1 className={`font-georgia text-xl sm:text-2xl font-black tracking-wide ${themeStyles.headerSub} leading-tight`}>
            सुदामा भेळ ॲन्ड स्नॅक्स
          </h1>
          <p className="text-[10px] font-bold text-amber-300/90 tracking-wider uppercase">
            SUDAMA BHEL • LONI KALBHOR, PUNE
          </p>
        </div>

        {/* Prominent Table Badge */}
        <div
          className={`w-full rounded-xl py-1.5 px-3 shadow-sm border-2 ${themeStyles.tableBanner}`}
        >
          <p className="font-georgia text-lg sm:text-xl font-black tracking-[4px]">
            TABLE {tableNum < 10 ? '0' + tableNum : tableNum}
          </p>
        </div>

        {/* High-Contrast QR Code Container — STARTS DIRECTLY BELOW, ZERO GAP, EXTRA LARGE */}
        <div className="flex-1 flex items-center justify-center w-full my-0 py-0.5">
          <div className="rounded-2xl bg-white p-2 shadow-inner border border-gray-200 inline-block">
            <QRCodeSVG
              value={qrData}
              size={250}
              bgColor="#ffffff"
              fgColor="#111827"
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* 4-Step Simple Guide (1 2 3 4) */}
        <div className={`w-full rounded-xl border ${themeStyles.stepBox} p-2`}>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="flex flex-col items-center">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black mb-0.5 ${themeStyles.stepBadge}`}>
                १
              </span>
              <p className="text-[10px] font-black leading-tight text-gray-900">स्कॅन करा</p>
              <p className="text-[8px] font-bold text-gray-600">Scan QR</p>
            </div>

            <div className="flex flex-col items-center">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black mb-0.5 ${themeStyles.stepBadge}`}>
                २
              </span>
              <p className="text-[10px] font-black leading-tight text-gray-900">मेनू निवडा</p>
              <p className="text-[8px] font-bold text-gray-600">Pick Items</p>
            </div>

            <div className="flex flex-col items-center">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black mb-0.5 ${themeStyles.stepBadge}`}>
                ३
              </span>
              <p className="text-[10px] font-black leading-tight text-gray-900">ऑर्डर करा</p>
              <p className="text-[8px] font-bold text-gray-600">Order</p>
            </div>

            <div className="flex flex-col items-center">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black mb-0.5 ${themeStyles.stepBadge}`}>
                ४
              </span>
              <p className="text-[10px] font-black leading-tight text-gray-900">टेबलवर जेवा</p>
              <p className="text-[8px] font-bold text-gray-600">Served</p>
            </div>
          </div>
        </div>

        {/* Footer Trust Badges */}
        <div className={`mt-1.5 w-full rounded-lg ${themeStyles.footerBg} py-1.5 px-2 text-[9.5px] font-bold`}>
          <p className="leading-tight">
            ✨ No App Needed • Contactless Menu • Pay via UPI / Cash
          </p>
        </div>

        {/* Download Action (Hidden on Print) */}
        {onDownload && (
          <button
            onClick={onDownload}
            className="print:hidden mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-gray-900/10 hover:bg-gray-900/20 py-1.5 text-[11px] font-bold text-gray-800 transition-colors"
          >
            <span>📥</span> Download Table {tableNum} PNG
          </button>
        )}
      </div>
    </div>
  );
}
