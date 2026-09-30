# 🍽️ HaveABite — Sudama Bhel & Snacks (सुदामा भेळ)

A modern, lightning-fast contactless QR table-ordering, kitchen KOT management, and analytics web application built for **पुण्याचे सुप्रसिद्ध सुदामा भेळ (Sudama Bhel & Snacks, Pune)**.

---

## 🚀 Key Features

* **📱 Table QR Contactless Ordering**:
  - Customers scan table QR code (`/?table=X`) to browse the official bilingual (मराठी + English) menu.
  - Cart with customization notes chips (`कमी तिखट`, `जास्त तिखट`, `विना कांदा`, `No Onion`, `Extra Spicy`, `Jain Style`).
* **🛎️ Real-Time Kitchen Dashboard (`/admin`)**:
  - Live order board with instant Supabase Realtime synchronization.
  - **Repeating Kitchen Chime**: Continuous dual-tone alert loops every 3.5s while pending orders wait until staff clicks *"👨‍🍳 Start Preparing"*.
  - Printable Thermal Kitchen Order Tickets (KOT) with itemized notes.
* **💳 Integrated UPI Payment Gateway**:
  - Dynamic QR code with auto-computed bill amount (`upi://pay?pa=ombk.AAEA519301ndrbatquc5@mbk...`).
  - 1-tap mobile payment intent buttons for Google Pay, PhonePe, and Paytm.
  - Interactive toggle to display the official counter payment scanner.
* **📍 Anti-Fake Orders GPS Geofencing**:
  - Enforces 200m in-premise radius using the Haversine GPS formula to prevent fake orders placed from home.
  - 1-click calibration button in the admin bar to lock coordinates to the restaurant's actual counter device.
* **🔔 Table Assistance Alert ("पाणी / Call Staff")**:
  - Customers can request water, napkins, extra bowls, or call a waiter directly from their table with audio notification in the kitchen.
* **🧾 WhatsApp Bill Receipt Sharing**:
  - 1-click customer invoice sharing to WhatsApp formatted with Marathi greeting, items, and total amount.
* **📊 Analytics & Revenue Dashboard (`/admin/analytics`)**:
  - Instant client-side metrics: Total revenue, order count, average order value, peak hours, and category breakdown.
* **⚡ Blink-of-an-Eye Image Performance**:
  - 94 menu photos compressed with Sharp to under ~60 KB each (130 MB ➔ 5 MB folder).
  - WebP/AVIF format auto-negotiation and 30-day edge CDN caching.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with localStorage persistence
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime WebSocket subscriptions)
- **Audio & Media**: HTML5 Web Audio API (cross-browser synthesized chimes)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/)

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory (see `.env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
NEXT_PUBLIC_ADMIN_PIN=2518
NEXT_PUBLIC_BASE_URL=https://your-deployed-domain.vercel.app
```

---

## 🏃 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## ☁️ Deployment to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Sudama Bhel web app"
   git remote add origin https://github.com/your-username/haveabite.git
   git branch -M main
   git push -u origin main
   ```
2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new) ➔ Click **Import Project**.
   - Select your GitHub repository.
   - If the repository root contains the `havea-bite-web` subfolder, set **Root Directory** to `havea-bite-web`.
3. **Add Environment Variables in Vercel**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PIN`
   - `NEXT_PUBLIC_BASE_URL` (your final Vercel URL, e.g. `https://sudama-bhel.vercel.app`)
4. **Deploy**: Click **Deploy**!

---

## 🔐 Admin Access

- **Kitchen / Admin URL**: `/admin`
- **Default PIN**: `2518` (configurable via `NEXT_PUBLIC_ADMIN_PIN`)
- **Table QR Codes Generator**: `/admin/qr`
