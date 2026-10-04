import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

const BASE_URL = 'https://sudama-bhel-lonikalbhor.vercel.app';
const TOTAL_TABLES = 12;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'table-qr-prints');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateAll() {
  console.log('Generating QR codes for 12 tables...');
  const tableData: { num: number; qrDataUrl: string; qrSvg: string }[] = [];

  for (let i = 1; i <= TOTAL_TABLES; i++) {
    const url = `${BASE_URL}/?table=${i}`;
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 600,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    const qrSvg = await QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    tableData.push({ num: i, qrDataUrl, qrSvg });
  }

  // Create HTML document for 4 per A4 page (3 pages for 12 tables)
  const pages = [
    tableData.slice(0, 4),
    tableData.slice(4, 8),
    tableData.slice(8, 12),
  ];

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sudama Bhel - Table QR Stickers (All 12 Tables - 4 per Page)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Mukta:wght@500;700;800;900&family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 8mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', 'Mukta', sans-serif;
      background-color: #f3f4f6;
      color: #111827;
      padding: 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print-bar {
      max-width: 900px;
      margin: 0 auto 24px;
      background: #1e1e24;
      color: #ffffff;
      padding: 16px 24px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }

    .print-btn {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 800;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
      transition: all 0.2s;
    }

    .print-btn:hover {
      background: #b91c1c;
      transform: scale(1.02);
    }

    /* ── A4 Page Container ─────────────────────────────────────────────── */
    .a4-page {
      width: 194mm;
      min-height: 281mm;
      height: 281mm;
      max-height: 281mm;
      margin: 0 auto 30px;
      background: #ffffff;
      padding: 4mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 5mm;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      border-radius: 8px;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
    }

    /* ── Single Table Card / Sticker ───────────────────────────────────── */
    .sticker-container {
      border: 2px dashed #9ca3af;
      border-radius: 20px;
      padding: 6px;
      position: relative;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      height: 100%;
      overflow: hidden;
    }

    .scissor-tag {
      position: absolute;
      top: -8px;
      left: 16px;
      background: #ffffff;
      padding: 0 6px;
      font-size: 9px;
      font-weight: 700;
      color: #6b7280;
    }

    .card {
      border: 4px solid #dc2626;
      border-radius: 16px;
      background: #ffffff;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      text-align: center;
      box-shadow: inset 0 0 0 1px #fef08a;
    }

    /* Header */
    .header {
      background: linear-gradient(180deg, #b91c1c 0%, #dc2626 100%);
      width: 100%;
      border-radius: 10px;
      padding: 5px 4px;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(185, 28, 28, 0.3);
    }

    .badge-sub {
      font-size: 8px;
      font-weight: 800;
      color: #fef08a;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .brand-title {
      font-family: 'Mukta', sans-serif;
      font-size: 15px;
      font-weight: 900;
      line-height: 1.15;
      color: #ffffff;
      margin: 1px 0;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .brand-eng {
      font-size: 7.5px;
      font-weight: 800;
      color: #fde047;
      letter-spacing: 1px;
    }

    /* Tagline */
    .tagline {
      background: #fef9c3;
      border: 1px solid #facc15;
      width: 100%;
      border-radius: 6px;
      padding: 2.5px 2px;
      font-size: 8px;
      font-weight: 900;
      color: #78350f;
      margin: 3px 0 2px;
    }

    /* Table Banner */
    .table-banner {
      background: #dc2626;
      border: 2px solid #fbbf24;
      width: 100%;
      border-radius: 8px;
      padding: 2.5px 0;
      color: #ffffff;
      font-family: 'Playfair Display', serif;
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 2px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }

    /* QR Code Box — BIG & PROMINENT */
    .qr-box {
      background: #ffffff;
      border: 2px solid #e5e7eb;
      border-radius: 14px;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: auto 0;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    }

    .qr-img {
      width: 195px;
      height: 195px;
      display: block;
    }

    /* 4-Step Instructions */
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2px;
      width: 100%;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 3px 2px;
      margin-top: 2px;
    }

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .step-num {
      background: #dc2626;
      color: #ffffff;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      font-size: 7.5px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1px;
    }

    .step-text {
      font-size: 7px;
      font-weight: 800;
      color: #1f2937;
      line-height: 1.1;
    }

    .step-sub {
      font-size: 6px;
      color: #6b7280;
    }

    /* Footer */
    .footer {
      background: #111827;
      color: #ffffff;
      width: 100%;
      border-radius: 6px;
      padding: 2.5px 2px;
      font-size: 6.5px;
      font-weight: 700;
      margin-top: 2px;
      letter-spacing: 0.3px;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .no-print-bar {
        display: none !important;
      }
      .a4-page {
        margin: 0;
        box-shadow: none;
        border-radius: 0;
        padding: 0;
        height: 281mm;
      }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 4px;">🖨️ Sudama Bhel - Table QR Stickers (All 12 Tables)</h2>
      <p style="font-size: 13px; color: #9ca3af;">Exactly 4 stickers per A4 page. Ready to print, cut along dashed lines ✂️, and stick on dining tables.</p>
    </div>
    <button class="print-btn" onclick="window.print()">
      <span>🖨️</span> Print / Save as PDF
    </button>
  </div>

  ${pages
    .map(
      (pageCards, pageIdx) => `
    <!-- PAGE ${pageIdx + 1} (Tables ${pageCards[0].num} to ${pageCards[pageCards.length - 1].num}) -->
    <div class="a4-page">
      ${pageCards
        .map(
          (table) => `
        <div class="sticker-container">
          <span class="scissor-tag">✂️ Cut here</span>
          <div class="card">
            <!-- Header -->
            <div class="header">
              <p class="badge-sub">⭐ पुण्याचे सुप्रसिद्ध ⭐</p>
              <h2 class="brand-title">सुदामा भेळ ॲन्ड स्नॅक्स</h2>
              <p class="brand-eng">SUDAMA BHEL • LONI KALBHOR</p>
            </div>

            <!-- Value Banner -->
            <div class="tagline">
              ⚡ रांगेत थांबू नका! थेट टेबलवरून ऑर्डर करा ⚡
            </div>

            <!-- Table Badge -->
            <div class="table-banner">
              TABLE ${table.num < 10 ? '0' + table.num : table.num}
            </div>

            <!-- Center QR Code -->
            <div class="qr-box">
              <img class="qr-img" src="${table.qrDataUrl}" alt="Table ${table.num} QR Code" />
            </div>

            <!-- 4-Step Guide -->
            <div class="steps-grid">
              <div class="step-item">
                <span class="step-num">१</span>
                <span class="step-text">स्कॅन करा</span>
                <span class="step-sub">Scan QR</span>
              </div>
              <div class="step-item">
                <span class="step-num">२</span>
                <span class="step-text">मेनू निवडा</span>
                <span class="step-sub">Pick Items</span>
              </div>
              <div class="step-item">
                <span class="step-num">३</span>
                <span class="step-text">ऑर्डर करा</span>
                <span class="step-sub">Place Order</span>
              </div>
              <div class="step-item">
                <span class="step-num">४</span>
                <span class="step-text">टेबलवर जेवा</span>
                <span class="step-sub">Fast Service</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              ✨ No App Required • Contactless Menu • Pay via UPI or Cash
            </div>
          </div>
        </div>
      `,
        )
        .join('')}
    </div>
  `,
    )
    .join('')}

</body>
</html>`;

  const htmlPath = path.join(OUTPUT_DIR, 'sudama-table-qr-stickers-all12.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log(`Document written to: ${htmlPath}`);

  // Also copy to root public for easy web access at /table-qr-prints.html
  const publicHtmlPath = path.join(__dirname, '..', 'public', 'table-qr-stickers.html');
  fs.writeFileSync(publicHtmlPath, htmlContent, 'utf-8');
  console.log(`Web-accessible copy written to: ${publicHtmlPath}`);
}

generateAll().catch(console.error);
