'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { CartItem } from '@/lib/menu-data';
import { verifyCustomerAtRestaurant } from '@/lib/geofence';

const NOTE_PRESETS = [
  'कमी तिखट (Mild)',
  'जास्त तिखट (Spicy 🔥)',
  'विना कांदा (No Onion)',
  'जास्त गोड चटणी (Extra Sweet)',
  'कुरकुरीत / Crispy',
];

export default function CartSection() {
  const { cart, addToCart, removeFromCart, updateCartItemNotes, placeOrder, tableNumber } = useStore();
  const [activeNoteInput, setActiveNoteInput] = useState<string | null>(null);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [geofenceError, setGeofenceError] = useState<{ title: string; message: string } | null>(null);

  const total = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);

  const handlePlaceOrder = async () => {
    setIsVerifyingLocation(true);
    setGeofenceError(null);

    try {
      const check = await verifyCustomerAtRestaurant();
      if (!check.allowed) {
        setGeofenceError({
          title: check.reason === 'PERMISSION_DENIED' ? '📍 Location Access Required' : '🚫 Outside Restaurant Premises',
          message:
            check.message ??
            'Dining table orders can only be placed while you are physically seated at Sudama Bhel.',
        });
        return;
      }

      await placeOrder();
    } finally {
      setIsVerifyingLocation(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-premium text-center">
        <h2 className="font-georgia text-xl font-black text-text-dark">Current Cart</h2>
        <div className="mt-6 flex flex-col items-center gap-3">
          <span className="text-5xl">🛍️</span>
          <p className="text-sm text-text-muted leading-relaxed">
            Your cart is empty.<br />Go to the Menu tab to add delicious items!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-premium">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-georgia text-xl font-black text-text-dark">Table {tableNumber} Cart</h2>
            <p className="text-xs text-text-muted">Review items & special instructions</p>
          </div>
          <span className="rounded-xl bg-primary px-3 py-1 font-georgia text-xs font-bold text-white shadow-soft">
            {cart.length} item{cart.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="mt-4 space-y-4 divide-y divide-border">
          {cart.map((cartItem: CartItem) => {
            const isNoteOpen = activeNoteInput === cartItem.item.id;
            return (
              <div key={cartItem.item.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-border">
                    <Image
                      src={cartItem.item.imageUrl}
                      alt={cartItem.item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  {/* Name & price */}
                  <div className="flex-1 min-w-0">
                    <p className="font-georgia text-sm font-extrabold text-text-dark truncate">
                      {cartItem.item.name}
                    </p>
                    <p className="text-xs text-text-muted">₹{cartItem.item.price} each</p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => removeFromCart(cartItem.item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 text-primary text-lg leading-none hover:bg-primary/10"
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-black text-text-dark">{cartItem.quantity}</span>
                    <button
                      onClick={() => addToCart(cartItem.item)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 text-primary text-lg leading-none hover:bg-primary/10"
                    >
                      +
                    </button>
                  </div>

                  <span className="w-14 text-right font-georgia font-black text-text-dark text-sm">
                    ₹{(cartItem.item.price * cartItem.quantity).toFixed(0)}
                  </span>
                </div>

                {/* Customization Note Badge or Trigger */}
                <div className="flex flex-wrap items-center gap-2 pl-14">
                  {cartItem.notes ? (
                    <div className="flex items-center gap-1.5 rounded-lg bg-accent-gold/20 px-2.5 py-1 text-xs font-bold text-accent-brown border border-accent-gold/40">
                      <span>📝</span>
                      <span>{cartItem.notes}</span>
                      <button
                        onClick={() => updateCartItemNotes(cartItem.item.id, '')}
                        className="ml-1 text-gray-500 hover:text-red-500 text-xs"
                        title="Remove instruction"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveNoteInput(isNoteOpen ? null : cartItem.item.id)}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>+ Add Note / आवड (कमी तिखट, जैन इ.)</span>
                    </button>
                  )}
                </div>

                {/* Customization Note Input & Quick Chips */}
                {isNoteOpen && !cartItem.notes && (
                  <div className="rounded-2xl border border-border bg-background p-3 ml-14 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. कमी तिखट, जास्त दही, extra crispy..."
                        defaultValue=""
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateCartItemNotes(cartItem.item.id, (e.target as HTMLInputElement).value);
                            setActiveNoteInput(null);
                          }
                        }}
                        className="flex-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs text-text-dark outline-none focus:border-primary"
                        id={`note-input-${cartItem.item.id}`}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`note-input-${cartItem.item.id}`) as HTMLInputElement;
                          if (input && input.value.trim()) {
                            updateCartItemNotes(cartItem.item.id, input.value.trim());
                          }
                          setActiveNoteInput(null);
                        }}
                        className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90"
                      >
                        Save
                      </button>
                    </div>

                    {/* Preset quick chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {NOTE_PRESETS.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => {
                            updateCartItemNotes(cartItem.item.id, chip);
                            setActiveNoteInput(null);
                          }}
                          className="rounded-lg bg-surface border border-border px-2 py-0.5 text-[10px] font-semibold text-text-dark hover:border-primary hover:text-primary transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* In-restaurant Geofence Protected Order Button */}
        <div className="mt-5 border-t border-border pt-4">
          <button
            onClick={handlePlaceOrder}
            disabled={isVerifyingLocation}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-primary py-4 font-georgia text-base font-black text-white shadow-premium hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-70"
          >
            <span>{isVerifyingLocation ? '📍' : '📤'}</span>
            <span>{isVerifyingLocation ? 'Verifying Table Location...' : 'Place Order to Kitchen'}</span>
          </button>
          <p className="mt-2 text-center text-[10px] text-text-muted flex items-center justify-center gap-1">
            <span>🔒</span>
            <span>In-premise protected: Orders can only be placed while seated at Sudama Bhel</span>
          </p>
        </div>
      </div>

      {/* ── Geofence Anti-Spoofing Block Modal ─────────────────────────────── */}
      {geofenceError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-2xl space-y-4">
            <span className="text-5xl">📍</span>
            <h3 className="font-georgia text-lg font-black text-text-dark">{geofenceError.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {geofenceError.message}
            </p>

            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-800">
              💡 <strong>Are you at the table?</strong> Please enable GPS/Location in your phone settings or tap
              Retry while inside the restaurant.
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setGeofenceError(null)}
                className="flex-1 rounded-2xl border border-border py-2.5 text-xs font-bold text-text-muted hover:bg-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setGeofenceError(null);
                  handlePlaceOrder();
                }}
                className="flex-1 rounded-2xl bg-primary py-2.5 font-georgia text-xs font-black text-white hover:bg-primary/90 transition-colors"
              >
                🔄 Retry GPS
              </button>
            </div>

            <button
              onClick={async () => {
                setGeofenceError(null);
                await placeOrder();
              }}
              className="w-full rounded-2xl bg-amber-50 border border-amber-300 py-2 text-xs font-extrabold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              ⚠️ Place Order Anyway (Testing Mode)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
