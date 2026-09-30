'use client';

import Image from 'next/image';
import { useStore } from '@/lib/store';
import { MenuItem } from '@/lib/menu-data';
import { getRecommendations, getGreetingText, getRecommendationTitle, getRecommendationSubtitle } from '@/lib/recommendations';

export default function RecommendationPanel() {
  const { menu, weather, temp, addToCart } = useStore();
  const recommended = getRecommendations(menu, weather);

  return (
    <div className="mx-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent-gold/10 p-4">
      <p className="text-xs font-semibold text-text-muted" suppressHydrationWarning>
        {getGreetingText()}
      </p>
      <h2 className="mt-1 font-georgia text-xl font-bold text-text-dark" suppressHydrationWarning>
        {getRecommendationTitle(weather)}
      </h2>
      <p className="text-sm text-text-muted" suppressHydrationWarning>
        {getRecommendationSubtitle(weather, temp)}
      </p>

      {/* Horizontal scroll of recommended items */}
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {recommended.map((item) => (
          <RecommendedItem key={item.id} item={item} onAdd={() => addToCart(item)} />
        ))}
      </div>
    </div>
  );
}

function RecommendedItem({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="flex min-w-[80px] max-w-[80px] flex-col items-start text-left group"
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <p className="mt-1.5 truncate w-full font-georgia text-xs font-bold text-text-dark leading-tight">
        {item.name}
      </p>
      {/* Price — Chilli Red */}
      <p className="text-[11px] font-bold text-primary">₹{item.price}</p>
    </button>
  );
}
