'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import TopBar from '@/components/layout/TopBar';
import LiveBackground from '@/components/ui/LiveBackground';
import CartSection from '@/components/cart/CartSection';
import OrderTracker from '@/components/cart/OrderTracker';
import BillingInvoice from '@/components/cart/BillingInvoice';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { tableNumber, getCustomerOrders, cart } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTable = mounted ? tableNumber : 1;
  const placedOrders = mounted ? getCustomerOrders(currentTable) : [];
  const hasContent = mounted && (placedOrders.length > 0 || cart.length > 0);

  return (
    <LiveBackground>
      <TopBar title="Your Table Session" />

      <div className="flex flex-col gap-5 p-4">
        <div>
          <h1 className="font-georgia text-2xl font-black text-text-dark">Your Table Session</h1>
          <p className="font-georgia text-sm text-text-muted">
            Table {currentTable} • Active Orders & Cart
          </p>
        </div>

        {/* Current cart */}
        <CartSection />

        {/* Kitchen progress tracker */}
        <OrderTracker orders={placedOrders} />

        {/* Billing invoice (only when there is content) */}
        {hasContent && <BillingInvoice orders={placedOrders} />}

        <div className="h-4" />
      </div>
    </LiveBackground>
  );
}
