import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import CallWaiterModal from '@/components/ui/CallWaiterModal';
import SupabaseInit from './SupabaseInit';

export const metadata: Metadata = {
  title: 'Sudama Bhel — Scan & Order',
  description: 'QR-based table ordering system for Sudama Bhel. Scan your table QR, browse the menu, and order instantly.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Sudama Bhel' },
};

export const viewport: Viewport = {
  themeColor: '#D32F2F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-text-dark antialiased">
        {/* Razorpay SDK */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />

        {/* Supabase realtime sync — boots once on app mount */}
        <SupabaseInit />

        {/* Customer pages get a centred max-w-2xl container.
            Admin pages break out of it via their own layout. */}
        <main className="max-w-2xl mx-auto pb-20">
          {children}
        </main>

        {/* Floating Call Staff / Water modal */}
        <CallWaiterModal />

        {/* Bottom nav (hidden on /admin/* routes automatically) */}
        <BottomNav />
      </body>
    </html>
  );
}

