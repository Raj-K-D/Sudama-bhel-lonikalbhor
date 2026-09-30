'use client';

import clsx from 'clsx';
import { CATEGORIES } from '@/lib/menu-data';

export const CATEGORY_ICONS: Record<string, string> = {
  'Bhel & Chaat': '🥣',
  'Breakfast & Snacks': '🥟',
  'South Indian': '🥞',
  'Pizza': '🍕',
  'Sandwich': '🥪',
  'Burger': '🍔',
  'Maggi & Fries': '🍟',
  'Hot & Cold Drinks': '☕',
  'Meals': '🍱',
};

const CATEGORY_SHORT_LABELS: Record<string, string> = {
  'Bhel & Chaat': 'Chaat',
  'Breakfast & Snacks': 'Snacks',
  'South Indian': 'South Ind.',
  'Pizza': 'Pizza',
  'Sandwich': 'Sandwich',
  'Burger': 'Burger',
  'Maggi & Fries': 'Maggi',
  'Hot & Cold Drinks': 'Drinks',
  'Meals': 'Meals',
};

interface CategorySidebarProps {
  selected: string;
  onSelect: (cat: string) => void;
}

export default function CategorySidebar({ selected, onSelect }: CategorySidebarProps) {
  return (
    <aside className="flex w-[76px] flex-shrink-0 flex-col border-r border-border bg-surface/95 py-3 overflow-y-auto scrollbar-hide">
      {CATEGORIES.map((category) => {
        const isSelected = category === selected;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className="flex flex-col items-center gap-1 py-2 px-1"
            title={category}
          >
            <div
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary shadow-soft text-white'
                  : 'border-border bg-primary/8 hover:bg-primary/15',
              )}
            >
              <span className="text-2xl">{CATEGORY_ICONS[category] ?? '🍽️'}</span>
            </div>
            <span
              className={clsx(
                'font-georgia text-[10px] text-center leading-tight line-clamp-1',
                isSelected ? 'font-black text-text-dark' : 'text-text-muted',
              )}
            >
              {CATEGORY_SHORT_LABELS[category] ?? category}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
