'use client';

import { useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import DashedLine from '@/components/ui/DashedLine';
import { useStore } from '@/lib/store';
import { Order } from '@/lib/menu-data';
import {
  TAX_RATE,
  SERVICE_CHARGE_RATE,
  SUDAMA_UPI_VPA,
  SUDAMA_PAYEE_NAME,
  SUDAMA_MERCHANT_CODE,
  SUDAMA_MBK_MC,
  SUDAMA_TR,
} from '@/lib/constants';

interface BillingInvoiceProps {
  orders: Order[];
}

export default function BillingInvoice({ orders }: BillingInvoiceProps) {
  const { cart, tableNumber, menu, isBillPaid, markBillAsPaid, resetSession } = useStore();
  const [showPaySuccess, setShowPaySuccess] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showOriginalScanner, setShowOriginalScanner] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cashSelected, setCashSelected] = useState(false);

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

  // Exact UPI query parameter bundle matching Mobikwik merchant counter standard
  const upiParams = new URLSearchParams({
    pa: SUDAMA_UPI_VPA,
    pn: SUDAMA_PAYEE_NAME,
    mc: SUDAMA_MERCHANT_CODE,
    mbkmc: SUDAMA_MBK_MC,
    tr: SUDAMA_TR,
    am: grandTotal.toString(),
    cu: 'INR',
    tn: `Sudama Bhel Table ${tableNumber} Bill`,
  }).toString();

  const upiIntentUri = `upi://pay?${upiParams}`;
  const phonePeUri = `phonepe://pay?${upiParams}`;
  const gpayUri = `gpay://upi/pay?${upiParams}`;
  const paytmUri = `paytmmp://pay?${upiParams}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(SUDAMA_UPI_VPA);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
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
      `Payment: ${isBillPaid ? 'Paid ✅' : 'Pending'}\n` +
      `UPI ID: ${SUDAMA_UPI_VPA}\n\n` +
      `_Thank you for visiting Sudama Bhel, Loni Kalbhor! Visit again._ 🙏`;

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

              <button
                onClick={() => resetSession()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary/40 bg-surface py-3 text-xs font-bold text-text-dark hover:bg-white transition-colors"
              >
                <span>🔄</span> Start Fresh Order / Clear Table
              </button>
            </div>
          ) : (
            <>
              {/* Primary UPI Payment Gateway Button */}
              <button
                onClick={() => setShowUpiModal(true)}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-primary py-4 font-georgia text-base font-black text-white shadow-premium hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-60"
              >
                <span>⚡</span>
                <span>Pay ₹{grandTotal} (UPI / GPay / PhonePe / QR)</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowOriginalScanner(true);
                    setShowUpiModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface py-2.5 text-xs font-bold text-text-dark hover:bg-white transition-colors"
                >
                  <span>📷</span> Counter QR
                </button>
                <button
                  onClick={() => setCashSelected(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface py-2.5 text-xs font-bold text-text-dark hover:bg-white transition-colors"
                >
                  <span>💵</span> Pay Cash
                </button>
              </div>

              {cashSelected && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-center animate-fade-in space-y-2">
                  <p className="text-xs font-bold text-amber-900">
                    💵 Please pay ₹{grandTotal} in cash directly at the Sudama Bhel billing counter.
                  </p>
                  <button
                    onClick={handleConfirmPaid}
                    className="w-full rounded-xl bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-700"
                  >
                    Confirm Cash Paid at Counter
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── UPI Payment Gateway Modal ───────────────────────────────────────── */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-surface p-5 text-center shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="text-left">
                <h3 className="font-georgia text-lg font-black text-text-dark">Sudama Bhel UPI Gateway</h3>
                <p className="text-[11px] text-text-muted">Table {tableNumber} • Amount: ₹{grandTotal}</p>
              </div>
              <button
                onClick={() => setShowUpiModal(false)}
                className="text-gray-400 hover:text-text-dark text-xl leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Direct 1-Tap Payment App Buttons */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted text-left">
                1-Tap Instant Payment
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={phonePeUri}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#5f259f] py-3 text-xs font-black text-white hover:bg-[#501e87] transition-all shadow-sm active:scale-95"
                >
                  <span>🟣</span> PhonePe
                </a>
                <a
                  href={gpayUri}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white py-3 text-xs font-black text-gray-800 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <span>🔵</span> Google Pay
                </a>
                <a
                  href={paytmUri}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#002e6e] py-3 text-xs font-black text-white hover:bg-[#002252] transition-all shadow-sm active:scale-95"
                >
                  <span>🔷</span> Paytm
                </a>
                <a
                  href={upiIntentUri}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-black text-white hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                >
                  <span>⚡</span> Any UPI App
                </a>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm border border-border">
              {showOriginalScanner ? (
                <div className="relative h-52 w-52 overflow-hidden rounded-xl">
                  <Image
                    src="/sudama-scanner.jpg"
                    alt="Sudama Bhel UPI Scanner"
                    fill
                    sizes="208px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="p-1">
                  <QRCodeSVG
                    value={upiIntentUri}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#1F2421"
                    level="M"
                  />
                </div>
              )}

              <div className="mt-2 flex items-center justify-center gap-1.5">
                <p className="font-mono text-[10px] font-bold text-text-muted break-all">
                  {SUDAMA_UPI_VPA}
                </p>
                <button
                  onClick={handleCopyUpi}
                  className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-text-dark hover:bg-gray-200"
                >
                  {copiedUpi ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* Switch between Dynamic QR and Original Stand QR */}
            <div className="flex justify-center gap-2 text-xs">
              <button
                onClick={() => setShowOriginalScanner(false)}
                className={`rounded-lg px-2.5 py-1 font-bold transition-colors ${
                  !showOriginalScanner ? 'bg-primary text-white' : 'bg-background text-text-muted'
                }`}
              >
                Dynamic Bill QR (₹{grandTotal})
              </button>
              <button
                onClick={() => setShowOriginalScanner(true)}
                className={`rounded-lg px-2.5 py-1 font-bold transition-colors ${
                  showOriginalScanner ? 'bg-primary text-white' : 'bg-background text-text-muted'
                }`}
              >
                Counter Scanner QR
              </button>
            </div>

            {/* Payment Confirmation Button */}
            <button
              onClick={handleConfirmPaid}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-green py-3.5 font-georgia text-sm font-black text-white hover:bg-accent-green/90 transition-colors shadow-soft disabled:opacity-50 active:scale-95"
            >
              <span>✅</span> {isProcessing ? 'Verifying...' : 'Payment Done / Mark as Paid'}
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
