/**
 * Supabase Menu Seeding Script
 * Run with: npm run seed
 *
 * Populates your Supabase `menu_items` table with the official Sudama Bhel menu.
 */

import { createClient } from '@supabase/supabase-js';
import { MENU_ITEMS } from '../lib/menu-data';
import { menuItemToRow } from '../lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`\n🚀 Seeding ${MENU_ITEMS.length} Sudama Bhel menu items to Supabase at ${supabaseUrl}...`);

  const rows = MENU_ITEMS.map(menuItemToRow);

  const { data, error } = await supabase
    .from('menu_items')
    .upsert(rows, { onConflict: 'id' })
    .select();

  if (error) {
    if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
      console.error('\n⚠️ The table "menu_items" does not exist in your Supabase database yet!');
      console.error('👉 Please go to Supabase Dashboard → SQL Editor, run the script from "supabase/schema.sql", and then rerun: npm run seed\n');
    } else {
      console.error('❌ Supabase upsert error:', error);
    }
    process.exit(1);
  }

  console.log(`\n✅ Successfully seeded ${data?.length ?? rows.length} menu items into Supabase!`);
  console.log('Categories seeded:');
  const catCounts = MENU_ITEMS.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(catCounts).forEach(([cat, count]) => {
    console.log(`  • ${cat}: ${count} items`);
  });
  console.log('\n🎉 Menu is now active in Supabase and will sync realtime with the web app.\n');
}

seed().catch((err) => {
  console.error('Unexpected error during seeding:', err);
  process.exit(1);
});
