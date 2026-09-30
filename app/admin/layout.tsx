'use client';

import { useStore } from '@/lib/store';
import PinGate from '@/components/admin/PinGate';
import LiveBackground from '@/components/ui/LiveBackground';
import AdminTopBar from '@/components/layout/AdminTopBar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SUB_NAV = [
  { href: '/admin',           label: '🛎️ Orders'    },
  { href: '/admin/analytics', label: '📊 Analytics'  },
  { href: '/admin/menu',      label: '🍽️ Menu'       },
  { href: '/admin/qr',        label: '📱 QR Codes'   },
];

function AdminSubNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-5 py-3 scrollbar-hide">
      {SUB_NAV.map(({ href, label }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            prefetch={true}
            className={`whitespace-nowrap rounded-xl px-4 py-1.5 text-xs font-bold transition-colors ${
              active ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const activeTables = useStore((s) =>
    Object.values(s.placedOrders).filter((orders) => orders.length > 0).length,
  );

  return (
    // Break out of the root layout's max-w-2xl constraint → full viewport width
    <div style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
      <PinGate>
        <LiveBackground isDark>
          <AdminTopBar activeTables={activeTables} />
          <AdminSubNav />
          {children}
        </LiveBackground>
      </PinGate>
    </div>
  );
}
