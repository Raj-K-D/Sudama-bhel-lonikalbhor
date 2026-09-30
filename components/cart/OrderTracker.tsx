'use client';

import Image from 'next/image';
import { Order } from '@/lib/menu-data';
import { useStore } from '@/lib/store';

interface OrderTrackerProps {
  orders: Order[];
}

const STATUS_CONFIG = {
  pending: {
    label: 'Received',
    icon: '🧾',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  preparing: {
    label: 'Preparing in Kitchen',
    icon: '🍳',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  ready: {
    label: 'Serving to you in few minutes!',
    icon: '🛎️',
    color: 'text-accent-green',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  completed: {
    label: 'Completed',
    icon: '✅',
    color: 'text-accent-green',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
};

export default function OrderTracker({ orders }: OrderTrackerProps) {
  const menu = useStore((s) => s.menu);

  if (orders.length === 0) return null;

  return (
    <div className="rounded-3xl border border-primary/12 bg-surface p-5 shadow-soft">
      <h2 className="font-georgia text-xl font-black text-text-dark">Kitchen Progress</h2>

      <div className="mt-3 space-y-3">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status];
          return (
            <div
              key={order.id}
              className={`rounded-2xl border p-3 ${cfg.border} ${cfg.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-georgia text-sm font-bold text-text-dark">
                  Order #{order.id.slice(-5)}
                </span>
                <span className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                {order.items.map((oi) => {
                  const menuItem = menu.find((m) => m.id === oi.itemId);
                  if (!menuItem) return null;
                  return (
                    <div key={oi.itemId} className="flex items-center gap-2">
                      <div className="relative h-5 w-5 flex-shrink-0 overflow-hidden rounded">
                        <Image src={menuItem.imageUrl} alt={menuItem.name} fill sizes="20px" className="object-cover" />
                      </div>
                      <p className="text-xs font-bold text-text-dark">
                        {menuItem.name} x{oi.quantity}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[11px] italic text-text-muted">
        Need more? Just add items in the Menu and place order again!
      </p>
    </div>
  );
}
