'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { Order, OrderStatus } from '@/lib/menu-data';

interface TableOrderCardProps {
  tableNum: number;
  orders: Order[];
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'text-primary',
  preparing: 'text-orange-400',
  ready: 'text-accent-green',
  completed: 'text-accent-green',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending 🔔',
  preparing: 'Preparing 👨‍🍳',
  ready: 'Ready ✅',
  completed: 'Completed',
};

export default function TableOrderCard({ tableNum, orders }: TableOrderCardProps) {
  const { menu, updateOrderStatus, setTableOrdersReady, cancelOrder, clearTableOrders } = useStore();
  const [toastVisible, setToastVisible] = useState(false);

  const hasUnprepared = orders.some((o) => o.status !== 'ready');

  const handleMarkAllReady = () => {
    setTableOrdersReady(tableNum);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const printKot = (table: number, order: Order) => {
    if (typeof window === 'undefined') return;
    const win = window.open('', '_blank', 'width=350,height=500');
    if (!win) return;
    const itemsHtml = order.items
      .map((oi) => {
        const m = menu.find((i) => i.id === oi.itemId);
        const price = m?.price ?? 0;
        const total = price * oi.quantity;
        return `<tr>
          <td style="padding:4px 0; font-weight:bold; font-size:12px;">${m?.name ?? oi.itemId}</td>
          <td style="padding:4px 0; text-align:center; font-size:12px;">₹${price}</td>
          <td style="padding:4px 0; text-align:center; font-weight:bold; font-size:13px;">x${oi.quantity}</td>
          <td style="padding:4px 0; text-align:right; font-weight:bold; font-size:12px;">₹${total}</td>
        </tr>${oi.notes ? `<tr><td colspan="4" style="font-size:11px; color:#b45309; padding-bottom:6px;"><strong>👉 Note:</strong> ${oi.notes}</td></tr>` : ''}`;
      })
      .join('');

    const ticketTotal = order.items.reduce((sum, oi) => {
      const m = menu.find((i) => i.id === oi.itemId);
      return sum + (m?.price ?? 0) * oi.quantity;
    }, 0);

    win.document.write(`
      <html>
        <head><title>KOT - Table ${table}</title></head>
        <body style="font-family:monospace; padding:12px; width:280px; margin:0 auto;">
          <h2 style="margin:0; text-align:center;">SUDAMA BHEL</h2>
          <h3 style="margin:4px 0; text-align:center; border-bottom:1px dashed #000; padding-bottom:8px;">KITCHEN ORDER TICKET (KOT)</h3>
          <p style="margin:4px 0; font-size:16px;"><strong>TABLE: ${table}</strong></p>
          <p style="margin:4px 0; font-size:11px;">Ticket: #${order.id.slice(-6)} | ${new Date(order.timestamp).toLocaleTimeString()}</p>
          <hr style="border:none; border-top:1px dashed #000; margin:8px 0;" />
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px dashed #000; font-size:11px;">
                <th style="text-align:left; padding-bottom:4px;">Item</th>
                <th style="text-align:center; padding-bottom:4px;">Price</th>
                <th style="text-align:center; padding-bottom:4px;">Qty</th>
                <th style="text-align:right; padding-bottom:4px;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <hr style="border:none; border-top:1px dashed #000; margin:8px 0;" />
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:13px;">
            <span>Ticket Total:</span>
            <span>₹${ticketTotal}</span>
          </div>
          <p style="text-align:center; font-size:11px; margin:8px 0 0;">-- Send to Kitchen Counter --</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  const printBill = (table: number, ordersToPrint: Order[]) => {
    if (typeof window === 'undefined') return;
    const win = window.open('', '_blank', 'width=380,height=600');
    if (!win) return;

    let grandTotal = 0;
    const itemsHtml = ordersToPrint
      .flatMap((order) => order.items)
      .map((oi) => {
        const m = menu.find((i) => i.id === oi.itemId);
        const price = m?.price ?? 0;
        const total = price * oi.quantity;
        grandTotal += total;
        return `<tr>
          <td style="padding:4px 0; font-weight:bold; font-size:12px;">${m?.name ?? oi.itemId}</td>
          <td style="padding:4px 0; text-align:center; font-size:12px;">₹${price}</td>
          <td style="padding:4px 0; text-align:center; font-weight:bold; font-size:12px;">x${oi.quantity}</td>
          <td style="padding:4px 0; text-align:right; font-weight:bold; font-size:12px;">₹${total}</td>
        </tr>${oi.notes ? `<tr><td colspan="4" style="font-size:10px; color:#666; padding-bottom:4px;">* ${oi.notes}</td></tr>` : ''}`;
      })
      .join('');

    win.document.write(`
      <html>
        <head>
          <title>Bill Receipt - Table ${table}</title>
          <style>
            @page { size: 80mm auto; margin: 4mm; }
            body { font-family: monospace, sans-serif; padding: 8px; width: 280px; margin: 0 auto; color: #000; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .dashed { border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { border-bottom: 1px dashed #000; padding: 4px 0; font-size: 11px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin: 0; font-size: 18px;">सुदामा भेळ ॲन्ड स्नॅक्स</h2>
            <h3 style="margin: 2px 0 4px; font-size: 14px;">SUDAMA BHEL</h3>
            <p style="font-size: 10px; margin: 0;">Pune-Solapur Highway, Loni Kalbhor</p>
          </div>
          <div class="dashed"></div>
          <div style="font-size: 12px; display: flex; justify-content: space-between;">
            <span class="bold">TABLE: ${table}</span>
            <span>${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style="font-size: 10px; color: #444; margin-top: 2px;">
            Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div class="dashed"></div>
          <table>
            <thead>
              <tr>
                <th style="text-align:left;">Item</th>
                <th style="text-align:center;">Price</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="dashed"></div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold;">
            <span>TOTAL AMOUNT:</span>
            <span>₹${grandTotal}</span>
          </div>
          <div class="dashed"></div>
          <div class="center" style="font-size: 11px; margin-top: 8px;">
            <p style="margin: 4px 0 0; font-size: 11px;">धन्यवाद! पुन्हा भेट द्या.</p>
            <p style="margin: 2px 0; font-size: 10px;">Thank you! Visit again.</p>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  return (
    <div
      className={`flex flex-col rounded-3xl border-2 p-5 shadow-premium ${
        hasUnprepared ? 'border-primary' : 'border-accent-green/50'
      } bg-[#221C19]/90`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className={`rounded-xl px-4 py-1.5 font-georgia text-sm font-black text-white ${
            hasUnprepared ? 'bg-primary' : 'bg-accent-green'
          }`}
        >
          TABLE {tableNum}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => printBill(tableNum, orders)}
            title="Print Consolidated Table Bill"
            className="rounded-lg bg-white/15 hover:bg-white/25 px-2 py-1 text-[11px] font-bold text-white transition-colors flex items-center gap-1"
          >
            <span>🧾</span>
            <span>Print Bill</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Clear all orders for Table ${tableNum}? (Table finished / bill paid)`)) {
                clearTableOrders(tableNum);
              }
            }}
            title="Clear all tickets for this table"
            className="rounded-lg bg-white/10 hover:bg-red-500/30 hover:text-red-200 px-2 py-1 text-[11px] font-bold text-white/70 transition-colors"
          >
            ✕ Clear
          </button>
        </div>
      </div>

      {/* Tickets */}
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-80">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-white/10 bg-white/10 p-3.5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white">
                Ticket #{order.id.slice(-6)}
              </p>
              <p className={`font-georgia text-xs font-black ${STATUS_COLOR[order.status]}`}>
                {STATUS_LABEL[order.status]}
              </p>
            </div>

            <div className="my-1.5 h-px bg-white/10" />

            {/* Items with Notes */}
            <div className="space-y-2">
              {order.items.map((oi) => {
                const m = menu.find((i) => i.id === oi.itemId);
                if (!m) return null;
                return (
                  <div key={oi.itemId} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative h-6 w-6 overflow-hidden rounded">
                          <Image src={m.imageUrl} alt={m.name} fill sizes="24px" className="object-cover" />
                        </div>
                        <p className="text-xs font-bold text-white">{m.name}</p>
                      </div>
                      <p className="text-xs font-black text-primary">x{oi.quantity}</p>
                    </div>

                    {oi.notes && (
                      <div className="ml-8">
                        <span className="inline-block rounded-md bg-accent-gold/25 px-2 py-0.5 text-[10px] font-bold text-accent-gold border border-accent-gold/30">
                          📝 {oi.notes}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ticket Actions (Always available for deleting test / canceled tickets) */}
            <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-white/10 pt-2">
              <button
                onClick={() => printKot(tableNum, order)}
                title="Print Kitchen Ticket"
                className="rounded-xl border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/20 transition-colors"
              >
                🖨️ KOT
              </button>

              <button
                onClick={() => printBill(tableNum, [order])}
                title="Print Ticket Bill Receipt"
                className="rounded-xl border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/20 transition-colors"
              >
                🧾 Bill
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`Delete Ticket #${order.id.slice(-6)}?`)) {
                    cancelOrder(tableNum, order.id);
                  }
                }}
                title="Delete or cancel this order"
                className="rounded-xl border border-red-500/40 bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-300 hover:bg-red-500/30 transition-colors"
              >
                🗑️ Delete
              </button>

              {order.status === 'pending' && (
                <button
                  onClick={() => updateOrderStatus(tableNum, order.id, 'preparing')}
                  className="rounded-xl bg-orange-500 px-3 py-1 text-xs font-black text-white hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1"
                >
                  <span>👨‍🍳</span> Prepare
                </button>
              )}

              {order.status === 'preparing' && (
                <button
                  onClick={() => updateOrderStatus(tableNum, order.id, 'ready')}
                  className="rounded-xl bg-accent-green px-3 py-1 text-xs font-black text-white hover:bg-accent-green/90 transition-colors shadow-sm flex items-center gap-1"
                >
                  <span>✅</span> Ready
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer action */}
      <div className="mt-4 space-y-2">
        {hasUnprepared ? (
          <button
            onClick={handleMarkAllReady}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-green py-3 font-georgia text-xs font-black text-white hover:bg-accent-green/90 transition-colors"
          >
            🛎️ Order Ready — Serving to you
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-accent-green/30 bg-accent-green/15 py-3">
            <span className="text-accent-green">✓</span>
            <p className="font-georgia text-xs font-bold text-accent-green">All Tickets Served</p>
          </div>
        )}

        <button
          onClick={() => {
            if (window.confirm(`Clear all orders for Table ${tableNum}? (Table finished / bill paid)`)) {
              clearTableOrders(tableNum);
            }
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-white/70 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 transition-colors"
        >
          <span>🧹</span>
          <span>Clear Table (Paid / Reset)</span>
        </button>
      </div>

      {toastVisible && (
        <p className="mt-2 text-center text-[11px] text-accent-green animate-pulse">
          Table {tableNum} notified: &ldquo;Order Ready!&rdquo;
        </p>
      )}
    </div>
  );
}
