'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore, cartItemCount } from '@/lib/store';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '🏠', activeIcon: '🏠' },
  { href: '/menu', label: 'Menu', icon: '🍽️', activeIcon: '🍽️' },
  { href: '/cart', label: 'Cart', icon: '🛍️', activeIcon: '🛍️' },
  { href: '/account', label: 'Account', icon: '👤', activeIcon: '👤' },
];

export default function BottomNav() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const cart = useStore((s) => s.cart);
  const count = cartItemCount(cart);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show bottom nav on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-cart-bar shadow-premium">
      <div className="flex max-w-2xl mx-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center py-2 gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`}
            >
              <div className="relative">
                <span className="text-xl">{icon}</span>
                {/* Cart badge */}
                {mounted && href === '/cart' && count > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-georgia ${isActive ? 'font-bold text-primary' : 'text-gray-400'}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
