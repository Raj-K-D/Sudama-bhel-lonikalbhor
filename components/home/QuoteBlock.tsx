'use client';

import { useState, useEffect } from 'react';
import { QUOTES } from '@/lib/recommendations';

export default function QuoteBlock() {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[new Date().getMinutes() % QUOTES.length]);
  }, []);

  return (
    <div className="mx-4 rounded-3xl border border-border bg-surface p-6 shadow-soft text-center">
      {/* Turmeric Gold quote marks */}
      <span className="text-4xl text-accent-gold">❝</span>
      <p className="mt-2 font-georgia text-sm italic leading-relaxed text-text-dark">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="mt-3 font-georgia text-xs font-bold uppercase tracking-widest text-text-muted">
        — {quote.author}
      </p>
    </div>
  );
}
