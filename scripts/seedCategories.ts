/**
 * Seeds ONLY the garment-type categories into Supabase — no products, no
 * collections, no coupons. Safe to run against a live store to populate the
 * Category dropdown in Admin > Products without creating any demo/fake
 * product data.
 *
 * Idempotent: upserts on slug, so re-running is harmless.
 *
 * Run with: npm run seed:categories
 */
import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin, isSupabaseAdminConfigured } from '../server/supabaseAdmin.js';
import { CATEGORIES } from './categoryData.js';

async function main() {
  if (!isSupabaseAdminConfigured) {
    console.error('Supabase is not configured. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env before seeding.');
    process.exit(1);
  }

  console.log(`Seeding ${CATEGORIES.length} categories...`);
  for (const c of CATEGORIES) {
    const { error } = await supabaseAdmin
      .from('categories')
      .upsert({ name: c.name, slug: c.slug, description: c.description, image_url: c.imageUrl, display_order: c.order }, { onConflict: 'slug' });
    if (error) throw error;
    console.log(`  ✓ ${c.name} (${c.slug})`);
  }

  console.log('\nCategories seeded successfully.');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Category seed failed:', err);
    process.exit(1);
  });
