import { NextResponse } from 'next/server';
import { createServiceClient, rowToMenuItem, MenuItemRow } from '@/lib/supabase';
import { MENU_ITEMS } from '@/lib/menu-data';

// ── Menu API — Server Route Handler ──────────────────────────────────────────
// Reads menu_items from Supabase; falls back to static MENU_ITEMS if empty.
// Used by the SupabaseInit realtime listener as initial seed check.

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sb = createServiceClient();
    if (sb) {
      const { data, error } = await sb.from('menu_items').select('*').order('category');
      if (!error && data?.length) {
        return NextResponse.json((data as MenuItemRow[]).map(rowToMenuItem));
      }
    }
  } catch { /* fall through */ }

  return NextResponse.json(MENU_ITEMS);
}
