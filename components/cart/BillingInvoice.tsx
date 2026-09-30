'use client';

import { useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import DashedLine from '@/components/ui/DashedLine';
import { useStore } from '@/lib/store';
import { Order } from '@/lib/menu-data';
import { TAX_RATE, SERVICE_CHARGE_RATE } from '@/lib/constants';

interface BillingInvoiceProps {
  orders: Order[];
}

const SUDAMA_UPI_VPA = 'ombk.AAEA519301ndrbatquc5@mbk';
const SUDAMA_PAYEE_NAME = 'Sudama Bhel';

export default function BillingInvoice({ orders }: BillingInvoiceProps) {
  const { cart, tableNumber, menu, isBillPaid, markBillAsPaid, resetSession } = useStore();
  const [showPaySuccess, setShowPaySuccess] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showOriginalScanner, setShowOriginalScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compute totals
  const orderedTotal = orders.reduce((sum, order) =>
    sum + order.items.reduce((s, oi) => {
      const m = menu.find((i) => i.id === oi.itemId);
      return s + (m?.price ?? 0) * oi.quantity;
    }, 0), 0,
  );
  const pendingTotal = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);
  const subtotal = orderedTotal + pendingTotal;
  const tax = subtotal * TAX_RATE;
  const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
  const grandTotal = Math.round(subtotal + tax + serviceCharge);

  // Exact UPI intent string for seamless one-tap payment
  const upiIntentUri = `upi://pay?pa=${SUDAMA_UPI_VPA}&pn=${encodeURIComponent(
    SUDAMA_PAYEE_NAME,
  )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`Sudama Bhel Table ${tableNumber} Bill`)}`;

  const handleOpenUpi = () => {
    // If mobile, try opening UPI intent directly
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = upiIntentUri;
      setTimeout(() => {
        setShowUpiModal(true);
      }, 1000);
    } else {
      setShowUpiModal(true);
    }
  };

  const handleConfirmPaid = () => {
    setIsProcessing(true);
    setTimeout(() => {
      markBillAsPaid();
      setIsProcessing(false);
      setShowUpiModal(false);
      setShowPaySuccess(true);
    }, 400);
  };

  const handleShareWhatsApp = () => {
    const itemsText = [
      ...orders.flatMap((o) =>
        o.items.map((oi) => {
          const m = menu.find((i) => i.id === oi.itemId);
          return `• ${m?.name ?? 'Item'} x${oi.quantity}: ₹${((m?.price ?? 0) * oi.quantity).toFixed(0)}${
            oi.notes ? ` (${oi.notes})` : ''
          }`;
        }),
      ),
      ...cart.map(
        (c) =>
          `• ${c.item.name} x${c.quantity}: ₹${(c.item.price * c.quantity).toFixed(0)}${
            c.notes ? ` (${c.notes})` : ''
          }`,
      ),
    ].join('\n');

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const text =
      `*🍽️ पुण्याचे सुप्रसिद्ध सुदामा भेळ ॲन्ड स्नॅक्स (Sudama Bhel)*\n` +
      `*Table ${tableNumber} — Final Bill Invoice*\n` +
      `📅 ${dateStr}\n` +
      `--------------------------------\n` +
      `${itemsText}\n` +
      `--------------------------------\n` +
      `Subtotal: ₹${subtotal.toFixed(0)}\n` +
      (tax > 0 ? `GST / Tax: ₹${tax.toFixed(0)}\n` : '') +
      `*Total Amount: ₹${grandTotal}*\n` +
      `Payment: ${isBillPaid ? 'Paid via UPI ✅' : 'Payment Completed ✅'}\n` +
      `UPI ID: ${SUDAMA_UPI_VPA}\n\n` +
      `_Thank you for visiting Sudama Bhel, Pune! Visit again soon._ 🙏`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <div className="rounded-3xl border-2 border-primary bg-background p-5 sm:p-6 shadow-premium">
        {/* Header */}
        <div className="text-center">
          <p className="font-georgia text-xl font-black tracking-[3px] text-text-dark">SUDAMA BHEL BILLING</p>
          <p className="text-xs font-bold text-text-muted">Table {tableNumber} • Consolidated Order Invoice</p>
        </div>

        <div className="mt-4">
          <DashedLine />
        </div>

        {/* Items */}
        <div className="mt-4 space-y-2.5">
          {orders.flatMap((o) =>
            o.items.map((oi) => {
              const m = menu.find((i) => i.id === oi.itemId);
              if (!m) return null;
              return (
                <InvoiceRow
                  key={`${o.id}-${oi.itemId}`}
                  name={m.name}
                  imageUrl={m.imageUrl}
                  quantity={oi.quantity}
                  total={m.price * oi.quantity}
                  notes={oi.notes}
                />
              );
            }),
          )}
          {cart.map((c) => (
            <InvoiceRow
              key={c.item.id}
              name={c.item.name}
              imageUrl={c.item.imageUrl}
              quantity={c.quantity}
              total={c.item.price * c.quantity}
              notes={c.notes}
              isPending
            />
          ))}
        </div>

        <div className="mt-4">
          <DashedLine />
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-1.5">
          <ReceiptRow label="Subtotal" value={subtotal} />
          {tax > 0 && <ReceiptRow label="Tax / GST (10%)" value={tax} />}
          {serviceCharge > 0 && <ReceiptRow label="Service Charge (5%)" value={serviceCharge} />}
        </div>

        <div className="mt-3">
          <DashedLine />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-black tracking-wide text-text-dark">TOTAL AMOUNT</span>
          <span className="font-georgia text-2xl font-black text-primary">₹{grandTotal}</span>
        </div>

        {/* Payment Actions */}
        <div className="mt-6 space-y-3">
          {isBillPaid ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-accent-green bg-green-50 py-4 shadow-sm">
                <span className="text-accent-green text-xl">✅</span>
                <span className="font-georgia font-black text-accent-green">Paid & Settled. Thank you!</span>
              </div>

              <button
                onClick={handleShareWhatsApp}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 font-georgia text-sm font-bold text-white shadow-soft hover:bg-[#1EBE5D] transition-colors active:scale-95"
              >
                <span>📲</span> Share Bill Receipt on WhatsApp
              </button>
            </div>
          ) : (
            <>
              {/* Primary UPI Payment Gateway Button */}
              <button
                onClick={handleOpenUpi}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-primary py-4 font-georgia text-base font-black text-white shadow-premium hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-60"
              >
                <span>⚡</span>
                <span>Pay ₹{grandTotal} via any UPI (GPay / PhonePe / Paytm)</span>
              </button>

              <button
                onClick={() => setShowUpiModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-2.5 text-xs font-bold text-text-dark hover:bg-white transition-colors"
              >
                <span>📷</span> View Counter UPI Scanner QR Code
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── UPI Scanner & Payment Modal ────────────────────────────────────── */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="text-left">
                <h3 className="font-georgia text-lg font-black text-text-dark">Sudama Bhel UPI Gateway</h3>
                <p className="text-[11px] text-text-muted">Table {tableNumber} • Amount: ₹{grandTotal}</p>
              </div>
              <button
                onClick={() => setShowUpiModal(false)}
                className="text-gray-400 hover:text-text-dark text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm border border-border">
              {showOriginalScanner ? (
                <div className="relative h-56 w-56 overflow-hidden rounded-xl">
                  <Image
                    src="/sudama-scanner.jpg"
                    alt="Sudama Bhel UPI Scanner"
                    fill
                    sizes="224px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="p-2">
                  <QRCodeSVG
                    value={upiIntentUri}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#1F2421"
                    level="M"
                  />
                </div>
              )}

              <p className="mt-3 font-mono text-[11px] font-bold text-text-muted break-all">
                {SUDAMA_UPI_VPA}
              </p>
              <span className="rounded-full bg-accent-gold/20 px-3 py-0.5 text-[10px] font-bold text-accent-brown">
                Sudama Bhel & Snacks
              </span>
            </div>

            {/* Switch between Dynamic QR and Original Stand QR */}
            <div className="flex justify-center gap-2 text-xs">
              <button
                onClick={() => setShowOriginalScanner(false)}
                className={`rounded-lg px-2.5 py-1 font-bold ${
                  !showOriginalScanner ? 'bg-primary text-white' : 'bg-background text-text-muted'
                }`}
              >
                Dynamic Amount QR (₹{grandTotal})
              </button>
              <button
                onClick={() => setShowOriginalScanner(true)}
                className={`rounded-lg px-2.5 py-1 font-bold ${
                  showOriginalScanner ? 'bg-primary text-white' : 'bg-background text-text-muted'
                }`}
              >
                Original Scanner
              </button>
            </div>

            {/* Direct 1-click open on mobile */}
            <a
              href={upiIntentUri}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-green py-3 font-georgia text-sm font-black text-white hover:bg-accent-green/90 transition-colors shadow-soft"
            >
              <span>📲</span> Open in GPay / PhonePe / Paytm
            </a>

            {/* Payment Confirmation Button */}
            <button
              onClick={handleConfirmPaid}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary py-3 font-georgia text-sm font-black text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              <span>✅</span> {isProcessing ? 'Verifying...' : 'I Have Paid / Payment Complete'}
            </button>
          </div>
        </div>
      )}

      {/* ── Payment Success Modal ───────────────────────────────────────────── */}
      {showPaySuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-2xl space-y-4">
            <p className="text-5xl animate-bounce">🎉</p>
            <h3 className="font-georgia text-xl font-black text-text-dark">Payment Successful!</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Table {tableNumber} bill of <strong>₹{grandTotal}</strong> has been recorded. The counter and kitchen
              team have been notified.
            </p>

            <button
              onClick={handleShareWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 font-georgia text-sm font-bold text-white shadow-soft hover:bg-[#1EBE5D] transition-colors"
            >
              <span>📲</span> Share Receipt on WhatsApp
            </button>

            <button
              onClick={() => {
                setShowPaySuccess(false);
                resetSession();
              }}
              className="w-full rounded-2xl bg-primary py-3 font-georgia font-black text-white hover:bg-primary/90 transition-colors"
            >
              Done & Start Fresh Order
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function InvoiceRow({
  name,
  imageUrl,
  quantity,
  total,
  notes,
  isPending = false,
}: {
  name: string;
  imageUrl: string;
  quantity: number;
  total: number;
  notes?: string;
  isPending?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded">
            <Image src={imageUrl} alt={name} fill sizes="24px" className="object-cover" />
          </div>
          <span className={`text-xs font-bold ${isPending ? 'text-primary' : 'text-text-dark'}`}>
            {name} x{quantity}
            {isPending ? ' (Cart)' : ''}
          </span>
        </div>
        <span className="font-georgia font-black text-text-dark text-xs">₹{total.toFixed(0)}</span>
      </div>
      {notes && (
        <div className="ml-8">
          <span className="text-[10px] text-accent-brown font-semibold bg-accent-gold/20 px-1.5 py-0.5 rounded">
            📝 {notes}
          </span>
        </div>
      )}
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="font-bold text-text-muted">{label}</span>
      <span className="font-georgia font-bold text-text-dark">₹{value.toFixed(0)}</span>
    </div>
  );
}
