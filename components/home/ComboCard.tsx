'use client';

import Image from 'next/image';
import { MenuItem } from '@/lib/menu-data';
import { useStore } from '@/lib/store';

interface ComboCardProps {
  item: MenuItem;
}

export default function ComboCard({ item }: ComboCardProps) {
  const addToCart = useStore((s) => s.addToCart);

  return (
    <div className="min-w-[220px] max-w-[220px] overflow-hidden rounded-2xl bg-surface shadow-soft">
      <div className="relative h-24 w-full">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="220px"
          className="object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="font-georgia text-sm font-bold text-text-dark truncate">{item.name}</h3>
        <p className="mt-0.5 text-xs text-text-muted truncate">{item.description}</p>
        <div className="mt-2 flex items-center justify-between">
          {/* Price — Chilli Red */}
          <span className="font-georgia text-sm font-bold text-primary">₹{item.price}</span>
          <button
            onClick={() => addToCart(item)}
            className="rounded-full bg-primary/10 p-1 text-primary hover:bg-primary/20 transition-colors"
            aria-label={`Add ${item.name} to cart`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
