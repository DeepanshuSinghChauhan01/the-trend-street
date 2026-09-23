/**
 * Seeds realistic TREND STREET catalog data into Supabase: categories,
 * collections, coupons, and 8 premium menswear products with full variant
 * matrices and demo imagery.
 *
 * NOTE ON IMAGES: the URLs below point to Unsplash for demo purposes only.
 * For production, upload real photography through the Admin > Products image
 * uploader (Supabase Storage bucket "product-images") and this script's
 * Unsplash URLs will simply be replaced when you edit/re-save the product.
 *
 * Run with: npm run seed
 */
import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin, isSupabaseAdminConfigured } from '../server/supabaseAdmin.js';
import { CATEGORIES } from './categoryData.js';

const COLLECTIONS = [
  { name: 'Drop 01: Raw Minimal', slug: 'raw-minimal', description: 'Structured silhouettes in mineral tones, high-density cottons, and neutral undertones.', bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Modern Streetwear', slug: 'modern-streetwear', description: 'Oversized luxury essentials designed for everyday high-velocity urban life.', bannerImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Monochrome Luxe', slug: 'monochrome-luxe', description: 'Curated blacks, off-whites, and deep charcoals for a confident modern aesthetic.', bannerImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85' },
];

const COUPONS = [
  { code: 'TREND10', type: 'percentage', value: 10, minimumOrder: 1500, maximumDiscount: 500, description: 'Get 10% off on orders above ₹1,499 (Max discount ₹500)' },
  { code: 'STREET500', type: 'fixed', value: 500, minimumOrder: 2999, maximumDiscount: 500, description: 'Flat ₹500 off on your purchase above ₹2,999' },
  { code: 'WELCOME15', type: 'percentage', value: 15, minimumOrder: 1999, maximumDiscount: 600, description: 'Welcome perk: 15% off on first luxury street haul above ₹1,999' },
];

interface SeedVariant { color: string; colorHex: string; size: string; stock: number; }
interface SeedProduct {
  title: string; slug: string; categorySlug: string; subcategory: string; collectionSlug: string;
  sku: string; basePrice: number; compareAtPrice: number; discountPercentage: number;
  shortDescription: string; description: string; productType: string; material: string; fit: string;
  careInstructions: string; weightGrams: number; tags: string[];
  isFeatured: boolean; isNewArrival: boolean; isBestSeller: boolean; isTrending: boolean;
  images: { url: string; altText: string }[];
  variants: SeedVariant[];
}

const PRODUCTS: SeedProduct[] = [
  {
    title: 'Heavyweight Acid Wash Boxy Tee', slug: 'heavyweight-acid-wash-boxy-tee',
    categorySlug: 't-shirts', subcategory: 'Oversized T-Shirt', collectionSlug: 'raw-minimal',
    sku: 'TS-TEE-AW01', basePrice: 1499, compareAtPrice: 2299, discountPercentage: 35,
    shortDescription: '260 GSM single jersey cotton with artisanal acid wash finish.',
    description: 'Crafted from 100% premium combed cotton with a high-density 260 GSM weight. Features a dropped shoulder, ribbed 1.25" neck collar, and a subtle vintage acid wash fade. Cut in our signature boxy silhouette.',
    productType: 'Oversized T-Shirt', material: '100% Combed Heavyweight Cotton (260 GSM)', fit: 'Boxy',
    careInstructions: 'Machine wash cold inside-out. Do not tumble dry. Cool iron avoiding prints.', weightGrams: 320,
    tags: ['Oversized', 'Heavyweight', 'Acid Wash', 'Streetwear', 'Best Seller'],
    isFeatured: true, isNewArrival: true, isBestSeller: true, isTrending: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85', altText: 'Heavyweight Acid Wash Boxy Tee front view' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85', altText: 'Heavyweight Acid Wash Boxy Tee side profile' },
      { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85', altText: 'Fabric detail texture 260 GSM' },
    ],
    variants: [
      { color: 'Vintage Black', colorHex: '#1e1e24', size: 'S', stock: 12 },
      { color: 'Vintage Black', colorHex: '#1e1e24', size: 'M', stock: 18 },
      { color: 'Vintage Black', colorHex: '#1e1e24', size: 'L', stock: 14 },
      { color: 'Vintage Black', colorHex: '#1e1e24', size: 'XL', stock: 8 },
      { color: 'Washed Grey', colorHex: '#4b5563', size: 'M', stock: 15 },
      { color: 'Washed Grey', colorHex: '#4b5563', size: 'L', stock: 10 },
    ],
  },
  {
    title: 'Cuban Collar Textured Linen Shirt', slug: 'cuban-collar-textured-linen-shirt',
    categorySlug: 'shirts', subcategory: 'Casual Shirt', collectionSlug: 'raw-minimal',
    sku: 'TS-SHIRT-LN02', basePrice: 2299, compareAtPrice: 3499, discountPercentage: 34,
    shortDescription: '100% French linen blend with natural drape and custom horn buttons.',
    description: 'The definitive summer staple. Tailored with a relaxed camp collar, straight vented hem for untucked styling, and a breathable open-weave linen texture that softens beautifully with every wear.',
    productType: 'Casual Shirt', material: '70% French Linen, 30% Long-Staple Cotton', fit: 'Relaxed',
    careInstructions: 'Dry clean recommended or gentle cold hand wash. Dry in shade.', weightGrams: 280,
    tags: ['Linen', 'Resort', 'Camp Collar', 'Relaxed', 'Summer'],
    isFeatured: true, isNewArrival: true, isBestSeller: false, isTrending: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85', altText: 'Cuban Collar Textured Linen Shirt in Sand Beige' },
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85', altText: 'Linen shirt texture close-up' },
    ],
    variants: [
      { color: 'Sand Beige', colorHex: '#d7c4b7', size: 'S', stock: 6 },
      { color: 'Sand Beige', colorHex: '#d7c4b7', size: 'M', stock: 12 },
      { color: 'Sand Beige', colorHex: '#d7c4b7', size: 'L', stock: 9 },
      { color: 'Sand Beige', colorHex: '#d7c4b7', size: 'XL', stock: 4 },
      { color: 'Raven Black', colorHex: '#121214', size: 'M', stock: 10 },
      { color: 'Raven Black', colorHex: '#121214', size: 'L', stock: 8 },
    ],
  },
  {
    title: 'Japanese Raw Selvedge Straight Jeans', slug: 'japanese-raw-selvedge-straight-jeans',
    categorySlug: 'jeans', subcategory: 'Selvedge Denim', collectionSlug: 'modern-streetwear',
    sku: 'TS-JEAN-SLV03', basePrice: 3499, compareAtPrice: 4999, discountPercentage: 30,
    shortDescription: '14.5 oz heavy raw selvedge denim with red ID ticker line.',
    description: 'Woven on vintage shuttle looms using 100% long-staple ring-spun cotton. Pure indigo-dyed yarn that develops unique personalized fades over time. Classic mid-rise straight leg cut with copper hardware.',
    productType: 'Jeans', material: '100% Cotton 14.5oz Raw Selvedge Denim', fit: 'Regular',
    careInstructions: 'Soak inside-out in cold water. Hang dry. Avoid washing for first 3-6 months for best fading.', weightGrams: 750,
    tags: ['Raw Denim', 'Selvedge', 'Straight Fit', 'Indigo', 'Premium'],
    isFeatured: true, isNewArrival: false, isBestSeller: true, isTrending: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=85', altText: 'Raw Selvedge Straight Jeans front profile' },
      { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85', altText: 'Raw denim selvedge cuff detail' },
    ],
    variants: [
      { color: 'Raw Indigo', colorHex: '#1e293b', size: 'S', stock: 8 },
      { color: 'Raw Indigo', colorHex: '#1e293b', size: 'M', stock: 15 },
      { color: 'Raw Indigo', colorHex: '#1e293b', size: 'L', stock: 11 },
      { color: 'Raw Indigo', colorHex: '#1e293b', size: 'XL', stock: 6 },
    ],
  },
  {
    title: 'Double Pleated Wide-Leg Wool Trousers', slug: 'double-pleated-wide-leg-wool-trousers',
    categorySlug: 'trousers', subcategory: 'Tailored Trousers', collectionSlug: 'monochrome-luxe',
    sku: 'TS-TRS-PL04', basePrice: 2899, compareAtPrice: 4199, discountPercentage: 31,
    shortDescription: 'Tailored drape with double front pleats and concealed side adjusters.',
    description: 'An architectural silhouette for modern sartorial street style. High-twist tropical wool blend with heavy fluid drape that stacks cleanly over sneakers or dress loafers.',
    productType: 'Trousers', material: '55% Tropical Wool, 43% Polyester, 2% Elastane', fit: 'Relaxed',
    careInstructions: 'Dry clean only. Cool iron with pressing cloth.', weightGrams: 460,
    tags: ['Tailored', 'Pleated', 'Wide Leg', 'Minimalist', 'Luxe'],
    isFeatured: true, isNewArrival: true, isBestSeller: true, isTrending: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85', altText: 'Double Pleated Wide-Leg Trousers Charcoal' },
      { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85', altText: 'Pleat and waistband construction detail' },
    ],
    variants: [
      { color: 'Charcoal Grey', colorHex: '#334155', size: 'S', stock: 7 },
      { color: 'Charcoal Grey', colorHex: '#334155', size: 'M', stock: 14 },
      { color: 'Charcoal Grey', colorHex: '#334155', size: 'L', stock: 9 },
      { color: 'Matte Black', colorHex: '#0f172a', size: 'M', stock: 12 },
      { color: 'Matte Black', colorHex: '#0f172a', size: 'L', stock: 10 },
    ],
  },
  {
    title: '450 GSM Heavy French Terry Boxy Hoodie', slug: '450-gsm-heavy-french-terry-boxy-hoodie',
    categorySlug: 'hoodies', subcategory: 'Boxy Hoodie', collectionSlug: 'modern-streetwear',
    sku: 'TS-HD-FT05', basePrice: 2999, compareAtPrice: 4499, discountPercentage: 33,
    shortDescription: 'Ultra-heavy unbrushed loopback cotton with double-layer crossover hood.',
    description: 'Engineered without compromise. 450 grams per square meter, structured drape, drop shoulders, zero-drawstring clean neckline, and blind stitching. Ribbed 2x2 heavy side gussets for unrestricted movement.',
    productType: 'Hoodie', material: '100% Organic Loopback French Terry (450 GSM)', fit: 'Boxy',
    careInstructions: 'Machine wash cold inside-out. Do not bleach. Air dry flat.', weightGrams: 850,
    tags: ['450 GSM', 'French Terry', 'Heavyweight', 'Boxy Hoodie', 'Drop 01'],
    isFeatured: true, isNewArrival: true, isBestSeller: true, isTrending: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85', altText: '450 GSM Heavy French Terry Boxy Hoodie in Carbon Black' },
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85', altText: 'Hoodie fit and double-layer hood detail' },
    ],
    variants: [
      { color: 'Carbon Black', colorHex: '#171717', size: 'S', stock: 5 },
      { color: 'Carbon Black', colorHex: '#171717', size: 'M', stock: 16 },
      { color: 'Carbon Black', colorHex: '#171717', size: 'L', stock: 14 },
      { color: 'Carbon Black', colorHex: '#171717', size: 'XL', stock: 9 },
      { color: 'Bone White', colorHex: '#e4e4e7', size: 'M', stock: 11 },
      { color: 'Bone White', colorHex: '#e4e4e7', size: 'L', stock: 7 },
    ],
  },
  {
    title: 'Cropped Minimalist Utility Bomber', slug: 'cropped-minimalist-utility-bomber',
    categorySlug: 'jackets', subcategory: 'Bomber Jacket', collectionSlug: 'raw-minimal',
    sku: 'TS-JKT-BMB06', basePrice: 4499, compareAtPrice: 6999, discountPercentage: 35,
    shortDescription: 'Water-repellent matte twill with tonal 2-way YKK zip and storm flap.',
    description: 'A cropped high-fashion silhouette with voluminous sleeves and dropped shoulders. Insulated diamond quilted lining, concealed arm flight pocket, and heavyweight elasticated wool-rib collar and cuffs.',
    productType: 'Jacket', material: 'High-Density Matte Nylon Twill with Diamond Quilted Satin Lining', fit: 'Boxy',
    careInstructions: 'Specialist dry clean only.', weightGrams: 920,
    tags: ['Bomber', 'Cropped', 'Outerwear', 'YKK', 'Water-Repellent'],
    isFeatured: true, isNewArrival: true, isBestSeller: false, isTrending: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85', altText: 'Cropped Minimalist Utility Bomber front view' },
      { url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=85', altText: 'Utility bomber sleeve and hardware detail' },
    ],
    variants: [
      { color: 'Washed Olive', colorHex: '#3f4f3a', size: 'M', stock: 8 },
      { color: 'Washed Olive', colorHex: '#3f4f3a', size: 'L', stock: 6 },
      { color: 'Stealth Black', colorHex: '#09090b', size: 'M', stock: 10 },
      { color: 'Stealth Black', colorHex: '#09090b', size: 'L', stock: 7 },
    ],
  },
  {
    title: 'Modular Wide-Leg Tactical Cargo Pants', slug: 'modular-wide-leg-tactical-cargo-pants',
    categorySlug: 'trousers', subcategory: 'Cargo Pants', collectionSlug: 'modern-streetwear',
    sku: 'TS-TRS-CRG07', basePrice: 2799, compareAtPrice: 3999, discountPercentage: 30,
    shortDescription: 'Reinforced cotton ripstop with articulated knees and bungee hem adjusters.',
    description: 'Built for functionality without sacrificing street aesthetic. Relaxed leg volume, 6-pocket tactical array with hidden magnetic closures, reinforced seat, and elastic drawcord cuffs.',
    productType: 'Cargo Pants', material: '100% Military Grade Cotton Ripstop (310 GSM)', fit: 'Relaxed',
    careInstructions: 'Machine wash cold with like colors. Line dry.', weightGrams: 580,
    tags: ['Cargo', 'Ripstop', 'Wide Leg', 'Tactical', 'Streetwear'],
    isFeatured: false, isNewArrival: false, isBestSeller: true, isTrending: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85', altText: 'Modular Wide-Leg Tactical Cargo Pants in Stealth Black' },
    ],
    variants: [
      { color: 'Stealth Black', colorHex: '#18181b', size: 'S', stock: 9 },
      { color: 'Stealth Black', colorHex: '#18181b', size: 'M', stock: 15 },
      { color: 'Stealth Black', colorHex: '#18181b', size: 'L', stock: 12 },
      { color: 'Olive Drab', colorHex: '#3f4f3a', size: 'M', stock: 10 },
      { color: 'Olive Drab', colorHex: '#3f4f3a', size: 'L', stock: 8 },
    ],
  },
  {
    title: 'Mercerized Ribbed Knit Relaxed Polo', slug: 'mercerized-ribbed-knit-relaxed-polo',
    categorySlug: 'polos', subcategory: 'Knit Polo', collectionSlug: 'monochrome-luxe',
    sku: 'TS-POLO-MR08', basePrice: 2199, compareAtPrice: 3199, discountPercentage: 31,
    shortDescription: 'Ultra-soft long-staple combed cotton knit with Johnny collar neckline.',
    description: 'Elevated minimalism. Knitted with ultra-fine 14-gauge mercerized yarn offering subtle natural sheen, wrinkle resistance, and thermal comfort. Seamless open collar with ribbed hem cuffs.',
    productType: 'Polo Shirt', material: '100% Mercerized Combed Cotton', fit: 'Relaxed',
    careInstructions: 'Hand wash cold or gentle machine wash inside mesh bag. Dry flat.', weightGrams: 310,
    tags: ['Knit Polo', 'Mercerized Cotton', 'Minimalist', 'Luxe'],
    isFeatured: false, isNewArrival: true, isBestSeller: false, isTrending: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85', altText: 'Mercerized Ribbed Knit Relaxed Polo in Ecru Cream' },
    ],
    variants: [
      { color: 'Ecru Cream', colorHex: '#f4f1ea', size: 'S', stock: 6 },
      { color: 'Ecru Cream', colorHex: '#f4f1ea', size: 'M', stock: 12 },
      { color: 'Ecru Cream', colorHex: '#f4f1ea', size: 'L', stock: 8 },
      { color: 'Deep Navy', colorHex: '#1e3a8a', size: 'M', stock: 10 },
      { color: 'Deep Navy', colorHex: '#1e3a8a', size: 'L', stock: 6 },
    ],
  },
];

function slugForVariantSku(productSku: string, color: string, size: string) {
  const colorCode = color.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 3);
  return `${productSku}-${colorCode}-${size}`;
}

async function main() {
  if (!isSupabaseAdminConfigured) {
    console.error('Supabase is not configured. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env before seeding.');
    process.exit(1);
  }

  console.log('Seeding categories...');
  const categoryIdBySlug: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .upsert({ name: c.name, slug: c.slug, description: c.description, image_url: c.imageUrl, display_order: c.order }, { onConflict: 'slug' })
      .select('id, slug')
      .single();
    if (error) throw error;
    categoryIdBySlug[c.slug] = data.id;
  }

  console.log('Seeding collections...');
  const collectionIdBySlug: Record<string, string> = {};
  for (const c of COLLECTIONS) {
    const { data, error } = await supabaseAdmin
      .from('collections')
      .upsert({ name: c.name, slug: c.slug, description: c.description, banner_image: c.bannerImage, is_active: true }, { onConflict: 'slug' })
      .select('id, slug')
      .single();
    if (error) throw error;
    collectionIdBySlug[c.slug] = data.id;
  }

  console.log('Seeding coupons...');
  for (const c of COUPONS) {
    const { error } = await supabaseAdmin.from('coupons').upsert(
      {
        code: c.code, type: c.type, value: c.value, minimum_order: c.minimumOrder, maximum_discount: c.maximumDiscount,
        start_date: new Date('2026-01-01').toISOString(), expiry_date: new Date('2026-12-31').toISOString(),
        usage_limit: 1000, per_user_limit: 1, is_active: true, description: c.description,
      },
      { onConflict: 'code' }
    );
    if (error) throw error;
  }

  console.log('Seeding products, images, and variants...');
  for (const p of PRODUCTS) {
    const { data: productRow, error: productErr } = await supabaseAdmin
      .from('products')
      .upsert(
        {
          title: p.title, slug: p.slug, brand: 'TREND STREET', short_description: p.shortDescription, description: p.description,
          category_id: categoryIdBySlug[p.categorySlug], collection_id: collectionIdBySlug[p.collectionSlug],
          subcategory: p.subcategory, gender: 'men', sku: p.sku, base_price: p.basePrice, compare_at_price: p.compareAtPrice,
          discount_percentage: p.discountPercentage, status: 'active', tags: p.tags, product_type: p.productType,
          material: p.material, fit: p.fit, care_instructions: p.careInstructions, weight_grams: p.weightGrams,
          is_featured: p.isFeatured, is_new_arrival: p.isNewArrival, is_best_seller: p.isBestSeller, is_trending: p.isTrending,
          rating: 4.8, review_count: 0,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();
    if (productErr) throw productErr;
    const productId = productRow.id as string;

    await supabaseAdmin.from('product_images').delete().eq('product_id', productId);
    const { error: imgErr } = await supabaseAdmin.from('product_images').insert(
      p.images.map((img, idx) => ({ product_id: productId, url: img.url, alt_text: img.altText, display_order: idx, is_primary: idx === 0 }))
    );
    if (imgErr) throw imgErr;

    await supabaseAdmin.from('product_variants').delete().eq('product_id', productId);
    const { error: varErr } = await supabaseAdmin.from('product_variants').insert(
      p.variants.map(v => ({
        product_id: productId,
        title: `${v.color} / ${v.size}`,
        sku: slugForVariantSku(p.sku, v.color, v.size),
        price: p.basePrice,
        compare_at_price: p.compareAtPrice,
        color: v.color,
        color_hex: v.colorHex,
        size: v.size,
        stock: v.stock,
      }))
    );
    if (varErr) throw varErr;

    console.log(`  ✓ ${p.title} (${p.variants.length} variants, ${p.images.length} images)`);
  }

  console.log(`\nSeed complete: ${CATEGORIES.length} categories, ${COLLECTIONS.length} collections, ${COUPONS.length} coupons, ${PRODUCTS.length} products.`);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
