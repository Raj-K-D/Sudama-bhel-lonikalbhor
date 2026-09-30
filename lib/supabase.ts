import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Order, MenuItem } from './menu-data';

// ─── Environment ──────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('your-project-id') &&
    (SUPABASE_URL.startsWith('http://') || SUPABASE_URL.startsWith('https://'))
  );
}

// ─── Browser singleton ────────────────────────────────────────────────────────
let _client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!_client && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }
  return _client;
}

// ─── Server client (service-role — bypasses RLS, server-side only) ────────────
export function createServiceClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;
  try {
    return createClient(SUPABASE_URL, serviceKey);
  } catch (e) {
    console.warn('Could not initialize Supabase service client:', e);
    return null;
  }
}

// ─── DB Row types (Postgres snake_case) ───────────────────────────────────────
export interface OrderRow {
  id: string;
  table_number: number;
  items: { itemId: string; quantity: number; notes?: string }[];
  status: string;
  total_amount: number;
  weather_mode?: string;
  created_at: string;
  completed_at?: string;
}

export interface MenuItemRow {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  tags: string[];
}

// ─── Mappers ──────────────────────────────────────────────────────────────────
export function rowToOrder(r: OrderRow): Order {
  return {
    id: r.id,
    tableNumber: r.table_number,
    items: r.items,
    status: r.status as Order['status'],
    totalAmount: r.total_amount,
    weatherMode: r.weather_mode,
    timestamp: r.created_at,
    completedAt: r.completed_at,
  };
}

export function rowToMenuItem(r: MenuItemRow): MenuItem {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    category: r.category,
    imageUrl: r.image_url,
    isAvailable: r.is_available,
    tags: r.tags ?? [],
  };
}

export function orderToRow(o: Order): Omit<OrderRow, 'created_at'> & { created_at: string } {
  return {
    id: o.id,
    table_number: o.tableNumber,
    items: o.items,
    status: o.status,
    total_amount: o.totalAmount ?? 0,
    weather_mode: o.weatherMode,
    created_at: o.timestamp,
    completed_at: o.completedAt,
  };
}

export function menuItemToRow(m: MenuItem): MenuItemRow {
  return {
    id: m.id,
    name: m.name,
    description: m.description,
    price: m.price,
    category: m.category,
    image_url: m.imageUrl,
    is_available: m.isAvailable,
    tags: m.tags ?? [],
  };
}
