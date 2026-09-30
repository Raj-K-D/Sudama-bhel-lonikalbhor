'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import TopBar from '@/components/layout/TopBar';
import WeatherBanner from '@/components/home/WeatherBanner';
import RecommendationPanel from '@/components/home/RecommendationPanel';
import ComboCard from '@/components/home/ComboCard';
import QuoteBlock from '@/components/home/QuoteBlock';
import LiveBackground from '@/components/ui/LiveBackground';

// ── Inner component that reads ?table= from the URL ──────────────────────────
// Must be separated so it can be wrapped in <Suspense> (Next.js requirement).
function TableParamReader() {
  const searchParams = useSearchParams();
  const setTableNumber = useStore((s) => s.setTableNumber);

  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const n = parseInt(tableParam, 10);
      if (!isNaN(n) && n > 0) setTableNumber(n);
    }
  }, [searchParams, setTableNumber]);

  return null;
}

// ── Main Home Page ────────────────────────────────────────────────────────────
export default function HomePage() {
  const { addToCart, menu } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = searchQuery
    ? menu.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // Bestsellers & Sudama Specials
  const bestsellers = menu.filter((item) =>
    item.tags?.includes('bestseller') || item.tags?.includes('special'),
  ).slice(0, 10);

  return (
    <LiveBackground>
      {/* Suspense boundary required by Next.js for useSearchParams() */}
      <Suspense fallback={null}>
        <TableParamReader />
      </Suspense>

      <TopBar />

      <div className="flex flex-col gap-4 py-3">
        {/* ── Search Bar ─────────────────────────────────────────────── */}
        <div className="px-4">
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-3">
            <span className="text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bhel, pani puri, misal, dosa, sandwich..."
              className="flex-1 bg-transparent text-sm text-text-dark placeholder-gray-400 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Search results ─────────────────────────────────────────── */}
        {searchQuery && (
          <div className="px-4">
            <p className="mb-2 font-georgia text-base font-bold text-text-dark">
              Search Results ({searchResults.length})
            </p>
            {searchResults.length === 0 ? (
              <p className="text-sm text-text-muted">No items found matching your search.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="flex min-w-[80px] flex-col items-start"
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                      <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <p className="mt-1 w-20 truncate font-georgia text-xs font-bold text-text-dark">{item.name}</p>
                    <p className="text-[11px] font-bold text-primary">₹{item.price}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Weather Banner ─────────────────────────────────────────── */}
        <div className="px-4">
          <WeatherBanner />
        </div>

        {/* ── Smart Recommendation Panel ─────────────────────────────── */}
        <RecommendationPanel />

        {/* ── Offer Banner ───────────────────────────────────────────── */}
        <div className="px-4">
          <p className="mb-2 font-georgia text-lg font-bold text-text-dark">Sudama Special Offer</p>
          <Link href="/menu">
            <div className="relative h-32 w-full overflow-hidden rounded-2xl shadow-soft">
              <Image
                src="/images/menu/bhel-puri.jpg"
                alt="Sudama Bhel Pune Special Deal"
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="rounded-full bg-accent-gold px-2.5 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
                  Pune’s Pride
                </span>
                <p className="mt-1 font-georgia text-base font-bold text-white">
                  पुण्याचे सुप्रसिद्ध सुदामा भेळ ॲन्ड स्नॅक्स — Fresh & Authentic Taste!
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Bestsellers & Specials ─────────────────────────────────── */}
        <div>
          <div className="mb-3 px-4 flex items-center justify-between">
            <p className="font-georgia text-lg font-bold text-text-dark">
              Sudama Bestsellers &amp; Specials
            </p>
            <Link href="/menu" className="text-xs font-bold text-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide pb-1">
            {bestsellers.map((item) => (
              <ComboCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* ── Culinary Quote ─────────────────────────────────────────── */}
        <QuoteBlock />

        <div className="h-4" />
      </div>
    </LiveBackground>
  );
}
