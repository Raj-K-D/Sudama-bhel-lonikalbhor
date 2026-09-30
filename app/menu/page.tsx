'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/menu-data';
import CategorySidebar, { CATEGORY_ICONS } from '@/components/menu/CategorySidebar';
import FoodCard from '@/components/menu/FoodCard';
import LiveBackground from '@/components/ui/LiveBackground';
import TopBar from '@/components/layout/TopBar';

const CATEGORY_MARATHI: Record<string, string> = {
  'Bhel & Chaat': 'भेळ आणि चाट',
  'Breakfast & Snacks': 'ब्रेकफास्ट ॲन्ड स्नॅक्स',
  'South Indian': 'साऊथ इंडियन',
  'Pizza': 'पिझ्झा',
  'Sandwich': 'सँडविच',
  'Burger': 'बर्गर',
  'Maggi & Fries': 'मॅगी & फ्राईज्',
  'Hot & Cold Drinks': 'हॉट ड्रिंक्स ॲन्ड कोल्ड्रिंक्स',
  'Meals': 'मिल्स / जेवण',
};

export default function MenuPage() {
  const menu = useStore((s) => s.menu);
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);

  const items = menu.filter((item) => item.category === selectedCategory);

  return (
    <LiveBackground>
      <TopBar title="Our Menu" />

      <div className="flex h-[calc(100vh-56px-80px)]">
        {/* ── Category sidebar ────────────────────────────────────── */}
        <CategorySidebar selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* ── Menu grid ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Title row */}
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{CATEGORY_ICONS[selectedCategory] ?? '🍽️'}</span>
                <div>
                  <h2 className="font-georgia text-xl font-black text-text-dark">{selectedCategory}</h2>
                  <p className="text-xs font-semibold text-primary">{CATEGORY_MARATHI[selectedCategory]}</p>
                </div>
              </div>
              <span className="rounded-xl bg-accent-gold/20 px-3 py-1 font-georgia text-xs font-black text-accent-brown">
                {items.length} choices
              </span>
            </div>

            {/* Special category notice */}
            {selectedCategory === 'Bhel & Chaat' && (
              <p className="mt-2 rounded-xl bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary">
                💡 टीप: आपली आवड-निवड अगोदर सांगावी (गोड, मिडियम, तिखट)
              </p>
            )}
          </div>

          {/* Responsive grid: 2 cols on mobile, 3 on wider screens */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item, idx) => (
              <FoodCard key={item.id} item={item} priority={idx < 4} />
            ))}
          </div>
        </div>
      </div>
    </LiveBackground>
  );
}
