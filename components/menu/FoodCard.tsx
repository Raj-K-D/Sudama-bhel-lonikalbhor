'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MenuItem } from '@/lib/menu-data';
import { useStore } from '@/lib/store';

interface FoodCardProps {
  item: MenuItem;
  priority?: boolean;
}

export default function FoodCard({ item, priority = false }: FoodCardProps) {
  const { addToCart, cart } = useStore();
  const [added, setAdded] = useState(false);

  const cartEntry = cart.find((c) => c.item.id === item.id);
  const quantity = cartEntry?.quantity ?? 0;

  const handleAdd = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-surface shadow-soft transition-transform hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-32 w-full overflow-hidden bg-black/5">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover transition-opacity duration-300"
        />
        {/* Category badge — Turmeric Gold */}
        <span className="absolute right-2 top-2 rounded-full bg-accent-gold px-2 py-0.5 font-georgia text-[9px] font-bold text-white">
          {item.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-georgia text-sm font-bold leading-tight text-text-dark line-clamp-2">
          {item.name}
        </h3>
        <p className="mt-1 flex-1 text-[11px] leading-tight text-text-muted line-clamp-2">
          {item.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          {/* Price — Chilli Red */}
          <span className="font-georgia text-sm font-bold text-primary">₹{item.price}</span>

          {quantity > 0 ? (
            /* Show quantity controls when in cart */
            <div className="flex items-center gap-1">
              <button
                onClick={() => useStore.getState().removeFromCart(item.id)}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 text-primary hover:bg-primary/10"
              >
                −
              </button>
              <span className="w-5 text-center font-bold text-text-dark text-sm">{quantity}</span>
              <button
                onClick={handleAdd}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/80"
              >
                +
              </button>
            </div>
          ) : (
            /* Add button */
            <button
              onClick={handleAdd}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                added
                  ? 'bg-accent-green text-white'
                  : 'bg-primary text-white hover:bg-primary/80'
              }`}
            >
              {added ? '✓ Added' : '+ Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
