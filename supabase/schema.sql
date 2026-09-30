-- ─────────────────────────────────────────────────────────────────────────────
-- Sudama Bhel & Snacks (पुण्याचे सुप्रसिद्ध सुदामा भेळ) — Supabase Schema
-- Run this in the Supabase SQL Editor to set up your project.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            text PRIMARY KEY,
  table_number  integer NOT NULL,
  items         jsonb NOT NULL DEFAULT '[]',
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'preparing', 'ready', 'completed')),
  total_amount  numeric(10, 2) NOT NULL DEFAULT 0,
  weather_mode  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz
);

-- Index for analytics range queries
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

-- ── Menu Items ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  description   text NOT NULL DEFAULT '',
  price         numeric(10, 2) NOT NULL CHECK (price > 0),
  category      text NOT NULL,
  image_url     text NOT NULL DEFAULT '',
  is_available  boolean NOT NULL DEFAULT true,
  tags          text[] NOT NULL DEFAULT '{}'
);

-- ── Row Level Security (permissive — tighten before production) ───────────────
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow all for anon key (change to authenticated-only for production)
CREATE POLICY "allow_all_orders"     ON orders     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);

-- ── Storage bucket for menu images ────────────────────────────────────────────
-- Run in Supabase Dashboard → Storage → New Bucket:
--   Name: menu-images
--   Public: true
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
  VALUES ('menu-images', 'menu-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_menu_images"
  ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "anon_upload_menu_images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "anon_delete_menu_images"
  ON storage.objects FOR DELETE USING (bucket_id = 'menu-images');

-- ── Enable Realtime on orders table ──────────────────────────────────────────
-- Run in Supabase Dashboard → Database → Replication → Realtime
-- Toggle 'orders' and 'menu_items' tables ON, or run:
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
