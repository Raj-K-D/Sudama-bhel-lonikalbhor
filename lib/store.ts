'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getSupabase, rowToOrder, rowToMenuItem, orderToRow,
  menuItemToRow, MenuItemRow, OrderRow,
} from './supabase';
import { MenuItem, CartItem, Order, OrderStatus, MENU_ITEMS } from './menu-data';
import { WeatherMode } from './recommendations';
import { TOTAL_TABLES } from './constants';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RestaurantStore {
  tableNumber: number;
  setTableNumber: (n: number) => void;
  totalTables: number;
  setTotalTables: (n: number) => void;

  cart: CartItem[];
  addToCart: (item: MenuItem, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;

  placedOrders: Record<number, Order[]>;
  getOrdersForTable: (table: number) => Order[];
  getTableTotal: (table: number) => number;
  placeOrder: () => void;
  updateOrderStatus: (tableNum: number, orderId: string, status: OrderStatus) => void;
  setTableOrdersReady: (tableNum: number) => void;
  cancelOrder: (tableNum: number, orderId: string) => void;

  // Table assistance requests (Call Waiter / Water / Clean)
  assistanceRequests: { id: string; tableNumber: number; requestType: string; timestamp: string }[];
  requestAssistance: (tableNumber: number, requestType: string) => void;
  dismissAssistance: (id: string) => void;

  isBillPaid: boolean;
  markBillAsPaid: () => void;
  resetSession: () => void;

  weather: WeatherMode;
  temp: number;
  isFetchingWeather: boolean;
  fetchWeather: () => Promise<void>;

  menu: MenuItem[];
  setMenu: (items: MenuItem[]) => void;

  _unsubscribeOrders: (() => void) | null;
  initSupabaseSync: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<RestaurantStore>()(
  persist(
    (set, get) => ({
      // ── Table ───────────────────────────────────────────────────────────────
      tableNumber: 1,
      setTableNumber: (n) => set({ tableNumber: n }),
      totalTables: TOTAL_TABLES,
      setTotalTables: (n) => set({ totalTables: Math.max(1, n) }),

      // ── Cart ────────────────────────────────────────────────────────────────
      cart: [],

      addToCart: (item, notes) => {
        const { cart } = get();
        const idx = cart.findIndex((c) => c.item.id === item.id);
        if (idx >= 0) {
          const updated = [...cart];
          updated[idx] = {
            ...updated[idx],
            quantity: updated[idx].quantity + 1,
            notes: notes !== undefined ? notes : updated[idx].notes,
          };
          set({ cart: updated });
        } else {
          set({ cart: [...cart, { item, quantity: 1, notes }] });
        }
      },

      updateCartItemNotes: (itemId, notes) => {
        const { cart } = get();
        const idx = cart.findIndex((c) => c.item.id === itemId);
        if (idx >= 0) {
          const updated = [...cart];
          updated[idx] = { ...updated[idx], notes };
          set({ cart: updated });
        }
      },

      removeFromCart: (itemId) => {
        const { cart } = get();
        const idx = cart.findIndex((c) => c.item.id === itemId);
        if (idx < 0) return;
        if (cart[idx].quantity > 1) {
          const updated = [...cart];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity - 1 };
          set({ cart: updated });
        } else {
          set({ cart: cart.filter((c) => c.item.id !== itemId) });
        }
      },

      clearCart: () => set({ cart: [] }),

      // ── Orders ──────────────────────────────────────────────────────────────
      placedOrders: {},

      getOrdersForTable: (table) => get().placedOrders[table] ?? [],

      getTableTotal: (table) =>
        (get().placedOrders[table] ?? []).reduce(
          (sum, order) => sum + (order.totalAmount ?? 0), 0,
        ),

      placeOrder: async () => {
        const { cart, tableNumber, weather } = get();
        if (!cart.length) return;

        const sb = getSupabase();
        const id = `ORD-${Date.now()}`;
        const totalAmount = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);

        const newOrder: Order = {
          id,
          tableNumber,
          timestamp: new Date().toISOString(),
          status: 'pending',
          items: cart.map((c) => ({
            itemId: c.item.id,
            quantity: c.quantity,
            ...(c.notes ? { notes: c.notes } : {}),
          })),
          totalAmount,
          weatherMode: weather,
        };

        // Optimistic local update
        const existing = get().placedOrders[tableNumber] ?? [];
        set({ placedOrders: { ...get().placedOrders, [tableNumber]: [...existing, newOrder] }, cart: [], isBillPaid: false });

        if (sb) {
          try {
            await sb.from('orders').insert(orderToRow(newOrder));
          } catch { /* local state still works */ }
        }
      },

      updateOrderStatus: async (tableNum, orderId, status) => {
        const orders = { ...get().placedOrders };
        const tableOrders = [...(orders[tableNum] ?? [])];
        const idx = tableOrders.findIndex((o) => o.id === orderId);
        if (idx < 0) return;

        const completedAt = (status === 'ready' || status === 'completed')
          ? new Date().toISOString() : undefined;
        tableOrders[idx] = { ...tableOrders[idx], status, ...(completedAt ? { completedAt } : {}) };
        set({ placedOrders: { ...orders, [tableNum]: tableOrders } });

        const sb = getSupabase();
        if (sb) {
          try {
            await sb.from('orders')
              .update({ status, ...(completedAt ? { completed_at: completedAt } : {}) })
              .eq('id', orderId);
          } catch { /* ignore */ }
        }
      },

      setTableOrdersReady: (tableNum) => {
        const orders = { ...get().placedOrders };
        const sb = getSupabase();
        const completedAt = new Date().toISOString();
        const tableOrders = (orders[tableNum] ?? []).map((o) => {
          if (o.status !== 'ready' && o.status !== 'completed') {
            if (sb) {
              sb.from('orders').update({ status: 'ready', completed_at: completedAt }).eq('id', o.id).then(() => {});
            }
            return { ...o, status: 'ready' as OrderStatus, completedAt };
          }
          return o;
        });
        set({ placedOrders: { ...orders, [tableNum]: tableOrders } });
      },

      cancelOrder: async (tableNum, orderId) => {
        const orders = { ...get().placedOrders };
        const tableOrders = (orders[tableNum] ?? []).filter((o) => o.id !== orderId);
        set({ placedOrders: { ...orders, [tableNum]: tableOrders } });

        const sb = getSupabase();
        if (sb) {
          try {
            await sb.from('orders').delete().eq('id', orderId);
          } catch { /* ignore */ }
        }
      },

      // ── Billing ─────────────────────────────────────────────────────────────
      isBillPaid: false,
      markBillAsPaid: () => set({ isBillPaid: true }),
      resetSession: () => {
        const { tableNumber } = get();
        set({ cart: [], isBillPaid: false, placedOrders: { ...get().placedOrders, [tableNumber]: [] } });
      },

      // ── Weather ─────────────────────────────────────────────────────────────
      weather: 'sunny',
      temp: 32,
      isFetchingWeather: false,
      fetchWeather: async () => {
        set({ isFetchingWeather: true });
        try {
          const res = await fetch('/api/weather');
          if (res.ok) {
            const data = await res.json();
            set({ weather: data.mode, temp: data.temp });
          }
        } catch { /* silent fallback */ } finally {
          set({ isFetchingWeather: false });
        }
      },

      // ── Menu ─────────────────────────────────────────────────────────────────
      menu: MENU_ITEMS,
      setMenu: (items) => set({ menu: items }),

      // ── Supabase Realtime Sync ────────────────────────────────────────────────
      _unsubscribeOrders: null,

      initSupabaseSync: () => {
        // Teardown previous subscriptions
        get()._unsubscribeOrders?.();
        const sb = getSupabase();
        if (!sb) return;

        // ── 1. Load + watch orders ────────────────────────────────────────────
        const groupOrders = (rows: OrderRow[]) =>
          rows.reduce<Record<number, Order[]>>((acc, row) => {
            const o = rowToOrder(row);
            if (!acc[o.tableNumber]) acc[o.tableNumber] = [];
            acc[o.tableNumber].push(o);
            return acc;
          }, {});

        const refetchOrders = async () => {
          try {
            const { data } = await sb.from('orders').select('*').order('created_at');
            if (data) set({ placedOrders: groupOrders(data as OrderRow[]) });
          } catch { /* ignore */ }
        };

        refetchOrders();

        const orderChannel = sb
          .channel('orders-rt')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refetchOrders)
          .subscribe();

        // ── 2. Load + watch menu_items ────────────────────────────────────────
        const refetchMenu = async () => {
          try {
            const { data } = await sb.from('menu_items').select('*');
            if (data && data.length > 0) {
              set({ menu: (data as MenuItemRow[]).map(rowToMenuItem) });
            }
          } catch { /* ignore */ }
        };

        refetchMenu();

        const menuChannel = sb
          .channel('menu-rt')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, refetchMenu)
          .subscribe();

        set({
          _unsubscribeOrders: () => {
            sb.removeChannel(orderChannel);
            sb.removeChannel(menuChannel);
          },
        });
      },

      // ── Table Assistance Requests (Call Waiter / Water) ─────────────────
      assistanceRequests: [],

      requestAssistance: (tableNumber, requestType) => {
        const id = `AST-${Date.now()}-${tableNumber}`;
        const newReq = {
          id,
          tableNumber,
          requestType,
          timestamp: new Date().toISOString(),
        };
        const current = get().assistanceRequests.filter(
          (r) => !(r.tableNumber === tableNumber && r.requestType === requestType)
        );
        set({ assistanceRequests: [newReq, ...current] });
      },

      dismissAssistance: (id) => {
        set({ assistanceRequests: get().assistanceRequests.filter((r) => r.id !== id) });
      },
    }),
    {
      name: 'quickbite-storage',
      partialize: (s) => ({
        cart: s.cart,
        tableNumber: s.tableNumber,
        totalTables: s.totalTables,
        placedOrders: s.placedOrders,
        assistanceRequests: s.assistanceRequests,
      }),
    },
  ),
);

// ─── Derived helpers ──────────────────────────────────────────────────────────
export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
}

export function cartItemCount(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.quantity, 0);
}
