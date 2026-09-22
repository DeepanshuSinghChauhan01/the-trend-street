import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Product,
  Category,
  Collection,
  Coupon,
  Order,
  Review,
  InventoryLog,
  StoreConfig,
  AdminMetrics
} from '../src/types/index.js';

export const STORE_CONFIG: StoreConfig = {
  name: process.env.STORE_NAME || 'TREND STREET',
  city: process.env.STORE_CITY || 'Mainpuri',
  state: process.env.STORE_STATE || 'Uttar Pradesh',
  pincode: process.env.STORE_PINCODE || '205001',
  address: process.env.STORE_ADDRESS || 'Station Road, Near Civil Lines, Mainpuri, Uttar Pradesh 205001',
  phone: process.env.STORE_PHONE || '+91 98765 43210',
  whatsapp: process.env.STORE_WHATSAPP || '+919876543210',
  email: process.env.STORE_EMAIL || 'trendstreet277@gmail.com',
  hours: process.env.STORE_HOURS || 'Monday – Sunday: 10:30 AM – 9:30 PM',
  googleMapsUrl: process.env.STORE_GOOGLE_MAPS_URL || 'https://maps.google.com/?q=Mainpuri+Uttar+Pradesh',
  freeShippingThreshold: 1999,
  standardShippingFee: 99,
  expressLocalAvailable: true,
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

export interface DatabaseState {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  coupons: Coupon[];
  orders: Order[];
  reviews: Review[];
  inventoryLogs: InventoryLog[];
  customers: { id: string; name: string; email: string; phone: string; ordersCount: number; totalSpent: number; createdAt: string }[];
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-tshirts',
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Heavyweight oversized, drop-shoulder, and raw-edge streetwear essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
    itemCount: 3,
  },
  {
    id: 'cat-shirts',
    name: 'Shirts',
    slug: 'shirts',
    description: 'Cuban collars, textured linens, and relaxed luxury button-downs.',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
    itemCount: 2,
  },
  {
    id: 'cat-jeans',
    name: 'Jeans',
    slug: 'jeans',
    description: 'Japanese selvedge, vintage 90s baggy, and straight-cut premium denims.',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=85',
    itemCount: 2,
  },
  {
    id: 'cat-trousers',
    name: 'Trousers',
    slug: 'trousers',
    description: 'Double-pleated tailoring, relaxed drapey cuts, and tactical modular cargos.',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85',
    itemCount: 2,
  },
  {
    id: 'cat-jackets',
    name: 'Jackets',
    slug: 'jackets',
    description: 'Minimalist cropped bombers, heavyweight chore overshirts, and utility jackets.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85',
    itemCount: 2,
  },
  {
    id: 'cat-hoodies',
    name: 'Hoodies',
    slug: 'hoodies',
    description: '450 GSM luxury French terry boxy hoodies with no drawstrings.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
    itemCount: 1,
  },
  {
    id: 'cat-polos',
    name: 'Polos',
    slug: 'polos',
    description: 'Fine-knit mercerized cotton retro collar polos.',
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85',
    itemCount: 1,
  },
];

const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-summer-drop',
    name: 'Drop 01: Raw Minimal',
    slug: 'raw-minimal',
    description: 'Structured silhouettes in mineral tones, high-density cottons, and neutral undertones.',
    bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 'col-luxury-streetwear',
    name: 'Modern Streetwear',
    slug: 'modern-streetwear',
    description: 'Oversized luxury essentials designed for everyday high-velocity urban life.',
    bannerImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 'col-monochrome',
    name: 'Monochrome Luxe',
    slug: 'monochrome-luxe',
    description: 'Curated blacks, off-whites, and deep charcoals for a confident modern aesthetic.',
    bannerImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-acid-wash-tee',
    title: 'Heavyweight Acid Wash Boxy Tee',
    slug: 'heavyweight-acid-wash-boxy-tee',
    brand: 'TREND STREET',
    shortDescription: '260 GSM single jersey cotton with artisanal acid wash finish.',
    description: 'Crafted from 100% premium combed cotton with a high-density 260 GSM weight. Features a dropped shoulder, ribbed 1.25" neck collar that does not bacon, and a subtle vintage acid wash fade. Cut in our signature boxy silhouette.',
    category: 't-shirts',
    collection: 'raw-minimal',
    sku: 'TS-TEE-AW01',
    basePrice: 1499,
    compareAtPrice: 2299,
    discountPercentage: 35,
    status: 'active',
    tags: ['Oversized', 'Heavyweight', 'Acid Wash', 'Streetwear', 'Best Seller'],
    productType: 'Oversized T-Shirt',
    material: '100% Combed Heavyweight Cotton (260 GSM)',
    fit: 'Boxy',
    careInstructions: 'Machine wash cold inside-out. Do not tumble dry. Cool iron avoiding prints.',
    weightGrams: 320,
    seoTitle: 'Heavyweight Acid Wash Boxy Tee | TREND STREET Mainpuri',
    seoDescription: 'Buy premium 260 GSM acid wash oversized t-shirt from TREND STREET. Fast shipping across India.',
    rating: 4.9,
    reviewCount: 28,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    createdAt: new Date('2026-01-10').toISOString(),
    updatedAt: new Date('2026-03-01').toISOString(),
    images: [
      {
        id: 'img-tee-1',
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
        altText: 'Heavyweight Acid Wash Boxy Tee front view',
        isPrimary: true,
      },
      {
        id: 'img-tee-2',
        url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85',
        altText: 'Heavyweight Acid Wash Boxy Tee side profile',
      },
      {
        id: 'img-tee-3',
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85',
        altText: 'Fabric detail texture 260 GSM',
      },
    ],
    variants: [
      { id: 'v-tee-blk-s', productId: 'prod-acid-wash-tee', title: 'Vintage Black / S', sku: 'TS-TEE-AW01-BLK-S', price: 1499, compareAtPrice: 2299, color: 'Vintage Black', colorHex: '#1e1e24', size: 'S', stock: 12 },
      { id: 'v-tee-blk-m', productId: 'prod-acid-wash-tee', title: 'Vintage Black / M', sku: 'TS-TEE-AW01-BLK-M', price: 1499, compareAtPrice: 2299, color: 'Vintage Black', colorHex: '#1e1e24', size: 'M', stock: 18 },
      { id: 'v-tee-blk-l', productId: 'prod-acid-wash-tee', title: 'Vintage Black / L', sku: 'TS-TEE-AW01-BLK-L', price: 1499, compareAtPrice: 2299, color: 'Vintage Black', colorHex: '#1e1e24', size: 'L', stock: 14 },
      { id: 'v-tee-blk-xl', productId: 'prod-acid-wash-tee', title: 'Vintage Black / XL', sku: 'TS-TEE-AW01-BLK-XL', price: 1499, compareAtPrice: 2299, color: 'Vintage Black', colorHex: '#1e1e24', size: 'XL', stock: 8 },
      { id: 'v-tee-gry-m', productId: 'prod-acid-wash-tee', title: 'Washed Grey / M', sku: 'TS-TEE-AW01-GRY-M', price: 1499, compareAtPrice: 2299, color: 'Washed Grey', colorHex: '#4b5563', size: 'M', stock: 15 },
      { id: 'v-tee-gry-l', productId: 'prod-acid-wash-tee', title: 'Washed Grey / L', sku: 'TS-TEE-AW01-GRY-L', price: 1499, compareAtPrice: 2299, color: 'Washed Grey', colorHex: '#4b5563', size: 'L', stock: 10 },
    ],
  },
  {
    id: 'prod-cuban-linen-shirt',
    title: 'Cuban Collar Textured Linen Shirt',
    slug: 'cuban-collar-textured-linen-shirt',
    brand: 'TREND STREET',
    shortDescription: '100% French linen blend with natural drape and custom horn buttons.',
    description: 'The definitive summer staple. Tailored with a relaxed camp collar, straight vented hem for untucked styling, and a breathable open-weave linen texture that softens beautifully with every wear. Finished with mother-of-pearl effect tonal buttons.',
    category: 'shirts',
    collection: 'raw-minimal',
    sku: 'TS-SHIRT-LN02',
    basePrice: 2299,
    compareAtPrice: 3499,
    discountPercentage: 34,
    status: 'active',
    tags: ['Linen', 'Resort', 'Camp Collar', 'Relaxed', 'Summer'],
    productType: 'Casual Shirt',
    material: '70% French Linen, 30% Long-Staple Cotton',
    fit: 'Relaxed',
    careInstructions: 'Dry clean recommended or gentle cold hand wash. Dry in shade.',
    weightGrams: 280,
    seoTitle: 'Cuban Collar Textured Linen Shirt | TREND STREET',
    seoDescription: 'Shop luxury relaxed Cuban collar linen shirts at TREND STREET Mainpuri. Premium breathable fabrics.',
    rating: 4.8,
    reviewCount: 19,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isTrending: true,
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-03-02').toISOString(),
    images: [
      {
        id: 'img-shirt-1',
        url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
        altText: 'Cuban Collar Textured Linen Shirt in Sand Beige',
        isPrimary: true,
      },
      {
        id: 'img-shirt-2',
        url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85',
        altText: 'Linen shirt texture close-up',
      },
    ],
    variants: [
      { id: 'v-sh-sand-s', productId: 'prod-cuban-linen-shirt', title: 'Sand Beige / S', sku: 'TS-SHIRT-LN02-SND-S', price: 2299, compareAtPrice: 3499, color: 'Sand Beige', colorHex: '#d7c4b7', size: 'S', stock: 6 },
      { id: 'v-sh-sand-m', productId: 'prod-cuban-linen-shirt', title: 'Sand Beige / M', sku: 'TS-SHIRT-LN02-SND-M', price: 2299, compareAtPrice: 3499, color: 'Sand Beige', colorHex: '#d7c4b7', size: 'M', stock: 12 },
      { id: 'v-sh-sand-l', productId: 'prod-cuban-linen-shirt', title: 'Sand Beige / L', sku: 'TS-SHIRT-LN02-SND-L', price: 2299, compareAtPrice: 3499, color: 'Sand Beige', colorHex: '#d7c4b7', size: 'L', stock: 9 },
      { id: 'v-sh-sand-xl', productId: 'prod-cuban-linen-shirt', title: 'Sand Beige / XL', sku: 'TS-SHIRT-LN02-SND-XL', price: 2299, compareAtPrice: 3499, color: 'Sand Beige', colorHex: '#d7c4b7', size: 'XL', stock: 4 },
      { id: 'v-sh-blk-m', productId: 'prod-cuban-linen-shirt', title: 'Raven Black / M', sku: 'TS-SHIRT-LN02-BLK-M', price: 2299, compareAtPrice: 3499, color: 'Raven Black', colorHex: '#121214', size: 'M', stock: 10 },
      { id: 'v-sh-blk-l', productId: 'prod-cuban-linen-shirt', title: 'Raven Black / L', sku: 'TS-SHIRT-LN02-BLK-L', price: 2299, compareAtPrice: 3499, color: 'Raven Black', colorHex: '#121214', size: 'L', stock: 8 },
    ],
  },
  {
    id: 'prod-selvedge-jeans',
    title: 'Japanese Raw Selvedge Straight Jeans',
    slug: 'japanese-raw-selvedge-straight-jeans',
    brand: 'TREND STREET',
    shortDescription: '14.5 oz heavy raw selvedge denim with red ID ticker line.',
    description: 'Woven on vintage shuttle looms using 100% long-staple ring-spun cotton. Pure indigo-dyed yarn that develops unique personalized fades and whiskering over time. Classic mid-rise straight leg cut with copper hardware and debossed leather backpatch.',
    category: 'jeans',
    collection: 'modern-streetwear',
    sku: 'TS-JEAN-SLV03',
    basePrice: 3499,
    compareAtPrice: 4999,
    discountPercentage: 30,
    status: 'active',
    tags: ['Raw Denim', 'Selvedge', 'Straight Fit', 'Indigo', 'Premium'],
    productType: 'Jeans',
    material: '100% Cotton 14.5oz Raw Selvedge Denim',
    fit: 'Regular',
    careInstructions: 'Soak inside-out in cold water. Hang dry. Avoid washing for first 3-6 months for best natural fading.',
    weightGrams: 750,
    seoTitle: 'Japanese Raw Selvedge Straight Jeans | TREND STREET',
    seoDescription: '14.5oz raw selvedge denim straight cut jeans. Crafted for longevity and authentic fading.',
    rating: 5.0,
    reviewCount: 34,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isTrending: false,
    createdAt: new Date('2026-01-05').toISOString(),
    updatedAt: new Date('2026-02-28').toISOString(),
    images: [
      {
        id: 'img-jean-1',
        url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=85',
        altText: 'Raw Selvedge Straight Jeans front profile',
        isPrimary: true,
      },
      {
        id: 'img-jean-2',
        url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85',
        altText: 'Raw denim selvedge cuff detail',
      },
    ],
    variants: [
      { id: 'v-jn-ind-30', productId: 'prod-selvedge-jeans', title: 'Raw Indigo / S (30)', sku: 'TS-JEAN-SLV03-30', price: 3499, compareAtPrice: 4999, color: 'Raw Indigo', colorHex: '#1e293b', size: 'S', stock: 8 },
      { id: 'v-jn-ind-32', productId: 'prod-selvedge-jeans', title: 'Raw Indigo / M (32)', sku: 'TS-JEAN-SLV03-32', price: 3499, compareAtPrice: 4999, color: 'Raw Indigo', colorHex: '#1e293b', size: 'M', stock: 15 },
      { id: 'v-jn-ind-34', productId: 'prod-selvedge-jeans', title: 'Raw Indigo / L (34)', sku: 'TS-JEAN-SLV03-34', price: 3499, compareAtPrice: 4999, color: 'Raw Indigo', colorHex: '#1e293b', size: 'L', stock: 11 },
      { id: 'v-jn-ind-36', productId: 'prod-selvedge-jeans', title: 'Raw Indigo / XL (36)', sku: 'TS-JEAN-SLV03-36', price: 3499, compareAtPrice: 4999, color: 'Raw Indigo', colorHex: '#1e293b', size: 'XL', stock: 6 },
    ],
  },
  {
    id: 'prod-pleated-trousers',
    title: 'Double Pleated Wide-Leg Wool Trousers',
    slug: 'double-pleated-wide-leg-wool-trousers',
    brand: 'TREND STREET',
    shortDescription: 'Tailored drape with double front pleats and concealed side adjusters.',
    description: 'An architectural silhouette designed for modern sartorial street style. Crafted from high-twist tropical wool blend with a heavy fluid drape that stacks cleanly over sneakers or dress loafers. Features bespoke internal waistband curtain and deep pockets.',
    category: 'trousers',
    collection: 'monochrome-luxe',
    sku: 'TS-TRS-PL04',
    basePrice: 2899,
    compareAtPrice: 4199,
    discountPercentage: 31,
    status: 'active',
    tags: ['Tailored', 'Pleated', 'Wide Leg', 'Minimalist', 'Luxe'],
    productType: 'Trousers',
    material: '55% Tropical Wool, 43% Polyester, 2% Elastane',
    fit: 'Relaxed',
    careInstructions: 'Dry clean only. Cool iron with pressing cloth.',
    weightGrams: 460,
    seoTitle: 'Double Pleated Wide-Leg Trousers | TREND STREET',
    seoDescription: 'Shop tailored double-pleated wide leg trousers for men. Premium fluid drape cut.',
    rating: 4.9,
    reviewCount: 22,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    createdAt: new Date('2026-01-20').toISOString(),
    updatedAt: new Date('2026-03-03').toISOString(),
    images: [
      {
        id: 'img-trs-1',
        url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85',
        altText: 'Double Pleated Wide-Leg Trousers Charcoal',
        isPrimary: true,
      },
      {
        id: 'img-trs-2',
        url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85',
        altText: 'Pleat and waistband construction detail',
      },
    ],
    variants: [
      { id: 'v-tr-ch-s', productId: 'prod-pleated-trousers', title: 'Charcoal Grey / S', sku: 'TS-TRS-PL04-CH-S', price: 2899, compareAtPrice: 4199, color: 'Charcoal Grey', colorHex: '#334155', size: 'S', stock: 7 },
      { id: 'v-tr-ch-m', productId: 'prod-pleated-trousers', title: 'Charcoal Grey / M', sku: 'TS-TRS-PL04-CH-M', price: 2899, compareAtPrice: 4199, color: 'Charcoal Grey', colorHex: '#334155', size: 'M', stock: 14 },
      { id: 'v-tr-ch-l', productId: 'prod-pleated-trousers', title: 'Charcoal Grey / L', sku: 'TS-TRS-PL04-CH-L', price: 2899, compareAtPrice: 4199, color: 'Charcoal Grey', colorHex: '#334155', size: 'L', stock: 9 },
      { id: 'v-tr-blk-m', productId: 'prod-pleated-trousers', title: 'Matte Black / M', sku: 'TS-TRS-PL04-BLK-M', price: 2899, compareAtPrice: 4199, color: 'Matte Black', colorHex: '#0f172a', size: 'M', stock: 12 },
      { id: 'v-tr-blk-l', productId: 'prod-pleated-trousers', title: 'Matte Black / L', sku: 'TS-TRS-PL04-BLK-L', price: 2899, compareAtPrice: 4199, color: 'Matte Black', colorHex: '#0f172a', size: 'L', stock: 10 },
    ],
  },
  {
    id: 'prod-french-terry-hoodie',
    title: '450 GSM Heavy French Terry Boxy Hoodie',
    slug: '450-gsm-heavy-french-terry-boxy-hoodie',
    brand: 'TREND STREET',
    shortDescription: 'Ultra-heavy unbrushed loopback cotton with double-layer crossover hood.',
    description: 'Engineered without compromise. Weighing a substantial 450 grams per square meter, this hoodie delivers structured drape, drop shoulders, zero-drawstring clean neckline, and blind stitching. Ribbed 2x2 heavy side gussets provide unrestricted movement.',
    category: 'hoodies',
    collection: 'modern-streetwear',
    sku: 'TS-HD-FT05',
    basePrice: 2999,
    compareAtPrice: 4499,
    discountPercentage: 33,
    status: 'active',
    tags: ['450 GSM', 'French Terry', 'Heavyweight', 'Boxy Hoodie', 'Drop 01'],
    productType: 'Hoodie',
    material: '100% Organic Loopback French Terry (450 GSM)',
    fit: 'Boxy',
    careInstructions: 'Machine wash cold inside-out. Do not bleach. Air dry flat.',
    weightGrams: 850,
    seoTitle: '450 GSM Heavy French Terry Boxy Hoodie | TREND STREET',
    seoDescription: 'The ultimate luxury boxy hoodie in 450 GSM heavyweight cotton. Available online and in Mainpuri store.',
    rating: 4.9,
    reviewCount: 41,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    createdAt: new Date('2026-01-08').toISOString(),
    updatedAt: new Date('2026-03-04').toISOString(),
    images: [
      {
        id: 'img-hd-1',
        url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
        altText: '450 GSM Heavy French Terry Boxy Hoodie in Carbon Black',
        isPrimary: true,
      },
      {
        id: 'img-hd-2',
        url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85',
        altText: 'Hoodie fit and double-layer hood detail',
      },
    ],
    variants: [
      { id: 'v-hd-blk-s', productId: 'prod-french-terry-hoodie', title: 'Carbon Black / S', sku: 'TS-HD-FT05-BLK-S', price: 2999, compareAtPrice: 4499, color: 'Carbon Black', colorHex: '#171717', size: 'S', stock: 5 },
      { id: 'v-hd-blk-m', productId: 'prod-french-terry-hoodie', title: 'Carbon Black / M', sku: 'TS-HD-FT05-BLK-M', price: 2999, compareAtPrice: 4499, color: 'Carbon Black', colorHex: '#171717', size: 'M', stock: 16 },
      { id: 'v-hd-blk-l', productId: 'prod-french-terry-hoodie', title: 'Carbon Black / L', sku: 'TS-HD-FT05-BLK-L', price: 2999, compareAtPrice: 4499, color: 'Carbon Black', colorHex: '#171717', size: 'L', stock: 14 },
      { id: 'v-hd-blk-xl', productId: 'prod-french-terry-hoodie', title: 'Carbon Black / XL', sku: 'TS-HD-FT05-BLK-XL', price: 2999, compareAtPrice: 4499, color: 'Carbon Black', colorHex: '#171717', size: 'XL', stock: 9 },
      { id: 'v-hd-bone-m', productId: 'prod-french-terry-hoodie', title: 'Bone White / M', sku: 'TS-HD-FT05-BON-M', price: 2999, compareAtPrice: 4499, color: 'Bone White', colorHex: '#e4e4e7', size: 'M', stock: 11 },
      { id: 'v-hd-bone-l', productId: 'prod-french-terry-hoodie', title: 'Bone White / L', sku: 'TS-HD-FT05-BON-L', price: 2999, compareAtPrice: 4499, color: 'Bone White', colorHex: '#e4e4e7', size: 'L', stock: 7 },
    ],
  },
  {
    id: 'prod-utility-bomber',
    title: 'Cropped Minimalist Utility Bomber',
    slug: 'cropped-minimalist-utility-bomber',
    brand: 'TREND STREET',
    shortDescription: 'Water-repellent matte twill with tonal 2-way YKK zip and storm flap.',
    description: 'A cropped high-fashion silhouette with voluminous sleeves and dropped shoulders. Features insulated diamond quilted lining, concealed arm flight pocket, interior chest pocket, and heavyweight elasticated wool-rib collar and cuffs.',
    category: 'jackets',
    collection: 'raw-minimal',
    sku: 'TS-JKT-BMB06',
    basePrice: 4499,
    compareAtPrice: 6999,
    discountPercentage: 35,
    status: 'active',
    tags: ['Bomber', 'Cropped', 'Outerwear', 'YKK', 'Water-Repellent'],
    productType: 'Jacket',
    material: 'High-Density Matte Nylon Twill with Diamond Quilted Satin Lining',
    fit: 'Boxy',
    careInstructions: 'Specialist dry clean only.',
    weightGrams: 920,
    seoTitle: 'Cropped Minimalist Utility Bomber | TREND STREET',
    seoDescription: 'Shop designer cropped utility bomber jackets from TREND STREET. Premium luxury streetwear.',
    rating: 4.9,
    reviewCount: 16,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isTrending: true,
    createdAt: new Date('2026-01-25').toISOString(),
    updatedAt: new Date('2026-03-05').toISOString(),
    images: [
      {
        id: 'img-jkt-1',
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85',
        altText: 'Cropped Minimalist Utility Bomber front view',
        isPrimary: true,
      },
      {
        id: 'img-jkt-2',
        url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=85',
        altText: 'Utility bomber sleeve and hardware detail',
      },
    ],
    variants: [
      { id: 'v-bmb-olv-m', productId: 'prod-utility-bomber', title: 'Washed Olive / M', sku: 'TS-JKT-BMB06-OLV-M', price: 4499, compareAtPrice: 6999, color: 'Washed Olive', colorHex: '#3f4f3a', size: 'M', stock: 8 },
      { id: 'v-bmb-olv-l', productId: 'prod-utility-bomber', title: 'Washed Olive / L', sku: 'TS-JKT-BMB06-OLV-L', price: 4499, compareAtPrice: 6999, color: 'Washed Olive', colorHex: '#3f4f3a', size: 'L', stock: 6 },
      { id: 'v-bmb-blk-m', productId: 'prod-utility-bomber', title: 'Stealth Black / M', sku: 'TS-JKT-BMB06-BLK-M', price: 4499, compareAtPrice: 6999, color: 'Stealth Black', colorHex: '#09090b', size: 'M', stock: 10 },
      { id: 'v-bmb-blk-l', productId: 'prod-utility-bomber', title: 'Stealth Black / L', sku: 'TS-JKT-BMB06-BLK-L', price: 4499, compareAtPrice: 6999, color: 'Stealth Black', colorHex: '#09090b', size: 'L', stock: 7 },
    ],
  },
  {
    id: 'prod-tactical-cargos',
    title: 'Modular Wide-Leg Tactical Cargo Pants',
    slug: 'modular-wide-leg-tactical-cargo-pants',
    brand: 'TREND STREET',
    shortDescription: 'Reinforced cotton ripstop with articulated knees and bungee hem adjusters.',
    description: 'Built for functionality without sacrificing street aesthetic. Cut with relaxed leg volume, 6-pocket tactical array with hidden magnetic closures, reinforced seat, and elastic drawcord cuffs allowing switch between wide-leg and stacked jogger silhouette.',
    category: 'trousers',
    collection: 'modern-streetwear',
    sku: 'TS-TRS-CRG07',
    basePrice: 2799,
    compareAtPrice: 3999,
    discountPercentage: 30,
    status: 'active',
    tags: ['Cargo', 'Ripstop', 'Wide Leg', 'Tactical', 'Streetwear'],
    productType: 'Cargo Pants',
    material: '100% Military Grade Cotton Ripstop (310 GSM)',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold with like colors. Line dry.',
    weightGrams: 580,
    seoTitle: 'Modular Wide-Leg Tactical Cargo Pants | TREND STREET',
    seoDescription: 'Heavy-duty tactical cargo pants with modular bungee hems. Available at TREND STREET.',
    rating: 4.8,
    reviewCount: 25,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    isTrending: true,
    createdAt: new Date('2026-01-12').toISOString(),
    updatedAt: new Date('2026-03-01').toISOString(),
    images: [
      {
        id: 'img-crg-1',
        url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=85',
        altText: 'Modular Wide-Leg Tactical Cargo Pants in Stealth Black',
        isPrimary: true,
      },
    ],
    variants: [
      { id: 'v-crg-blk-s', productId: 'prod-tactical-cargos', title: 'Stealth Black / S', sku: 'TS-TRS-CRG07-BLK-S', price: 2799, compareAtPrice: 3999, color: 'Stealth Black', colorHex: '#18181b', size: 'S', stock: 9 },
      { id: 'v-crg-blk-m', productId: 'prod-tactical-cargos', title: 'Stealth Black / M', sku: 'TS-TRS-CRG07-BLK-M', price: 2799, compareAtPrice: 3999, color: 'Stealth Black', colorHex: '#18181b', size: 'M', stock: 15 },
      { id: 'v-crg-blk-l', productId: 'prod-tactical-cargos', title: 'Stealth Black / L', sku: 'TS-TRS-CRG07-BLK-L', price: 2799, compareAtPrice: 3999, color: 'Stealth Black', colorHex: '#18181b', size: 'L', stock: 12 },
      { id: 'v-crg-olv-m', productId: 'prod-tactical-cargos', title: 'Olive Drab / M', sku: 'TS-TRS-CRG07-OLV-M', price: 2799, compareAtPrice: 3999, color: 'Olive Drab', colorHex: '#3f4f3a', size: 'M', stock: 10 },
      { id: 'v-crg-olv-l', productId: 'prod-tactical-cargos', title: 'Olive Drab / L', sku: 'TS-TRS-CRG07-OLV-L', price: 2799, compareAtPrice: 3999, color: 'Olive Drab', colorHex: '#3f4f3a', size: 'L', stock: 8 },
    ],
  },
  {
    id: 'prod-knit-polo',
    title: 'Mercerized Ribbed Knit Relaxed Polo',
    slug: 'mercerized-ribbed-knit-relaxed-polo',
    brand: 'TREND STREET',
    shortDescription: 'Ultra-soft long-staple combed cotton knit with Johnny collar neckline.',
    description: 'Elevated minimalism. Knitted with ultra-fine 14-gauge mercerized yarn that offers a subtle natural sheen, wrinkle resistance, and thermal comfort. Seamless open collar with ribbed hem cuffs that sit neatly at the waistline.',
    category: 'polos',
    collection: 'monochrome-luxe',
    sku: 'TS-POLO-MR08',
    basePrice: 2199,
    compareAtPrice: 3199,
    discountPercentage: 31,
    status: 'active',
    tags: ['Knit Polo', 'Mercerized Cotton', 'Minimalist', 'Luxe'],
    productType: 'Polo Shirt',
    material: '100% Mercerized Combed Cotton',
    fit: 'Relaxed',
    careInstructions: 'Hand wash cold or gentle machine wash inside mesh bag. Dry flat.',
    weightGrams: 310,
    seoTitle: 'Mercerized Ribbed Knit Relaxed Polo | TREND STREET',
    seoDescription: 'Buy luxury knit polos in mercerized cotton from TREND STREET. Premium Indian craftsmanship.',
    rating: 4.7,
    reviewCount: 14,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isTrending: false,
    createdAt: new Date('2026-02-01').toISOString(),
    updatedAt: new Date('2026-03-02').toISOString(),
    images: [
      {
        id: 'img-polo-1',
        url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85',
        altText: 'Mercerized Ribbed Knit Relaxed Polo in Ecru Cream',
        isPrimary: true,
      },
    ],
    variants: [
      { id: 'v-plo-ecr-s', productId: 'prod-knit-polo', title: 'Ecru Cream / S', sku: 'TS-POLO-MR08-ECR-S', price: 2199, compareAtPrice: 3199, color: 'Ecru Cream', colorHex: '#f4f1ea', size: 'S', stock: 6 },
      { id: 'v-plo-ecr-m', productId: 'prod-knit-polo', title: 'Ecru Cream / M', sku: 'TS-POLO-MR08-ECR-M', price: 2199, compareAtPrice: 3199, color: 'Ecru Cream', colorHex: '#f4f1ea', size: 'M', stock: 12 },
      { id: 'v-plo-ecr-l', productId: 'prod-knit-polo', title: 'Ecru Cream / L', sku: 'TS-POLO-MR08-ECR-L', price: 2199, compareAtPrice: 3199, color: 'Ecru Cream', colorHex: '#f4f1ea', size: 'L', stock: 8 },
      { id: 'v-plo-nvy-m', productId: 'prod-knit-polo', title: 'Deep Navy / M', sku: 'TS-POLO-MR08-NVY-M', price: 2199, compareAtPrice: 3199, color: 'Deep Navy', colorHex: '#1e3a8a', size: 'M', stock: 10 },
      { id: 'v-plo-nvy-l', productId: 'prod-knit-polo', title: 'Deep Navy / L', sku: 'TS-POLO-MR08-NVY-L', price: 2199, compareAtPrice: 3199, color: 'Deep Navy', colorHex: '#1e3a8a', size: 'L', stock: 6 },
    ],
  },
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-trend10',
    code: 'TREND10',
    type: 'percentage',
    value: 10,
    minimumOrder: 1500,
    maximumDiscount: 500,
    startDate: new Date('2026-01-01').toISOString(),
    expiryDate: new Date('2026-12-31').toISOString(),
    usageLimit: 1000,
    usedCount: 84,
    perUserLimit: 1,
    isActive: true,
    description: 'Get 10% off on orders above ₹1,499 (Max discount ₹500)',
  },
  {
    id: 'coup-street500',
    code: 'STREET500',
    type: 'fixed',
    value: 500,
    minimumOrder: 2999,
    maximumDiscount: 500,
    startDate: new Date('2026-01-01').toISOString(),
    expiryDate: new Date('2026-12-31').toISOString(),
    usageLimit: 500,
    usedCount: 42,
    perUserLimit: 1,
    isActive: true,
    description: 'Flat ₹500 off on your purchase above ₹2,999',
  },
  {
    id: 'coup-welcome15',
    code: 'WELCOME15',
    type: 'percentage',
    value: 15,
    minimumOrder: 1999,
    maximumDiscount: 600,
    startDate: new Date('2026-01-01').toISOString(),
    expiryDate: new Date('2026-12-31').toISOString(),
    usageLimit: 2000,
    usedCount: 112,
    perUserLimit: 1,
    isActive: true,
    description: 'Welcome perk: 15% off on first luxury street haul above ₹1,999',
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-acid-wash-tee',
    userName: 'Vikram Singh',
    userEmail: 'vikram.s@example.com',
    rating: 5,
    title: 'The fabric density is unreal',
    comment: 'Ordered from Lucknow. The 260 GSM weight gives that heavy structural drape you usually only find on high-end international drops. Neckline stays firm after three washes.',
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: new Date('2026-02-14').toISOString(),
  },
  {
    id: 'rev-2',
    productId: 'prod-acid-wash-tee',
    userName: 'Aman Agarwal',
    userEmail: 'aman.a@example.com',
    rating: 5,
    title: 'Visited the Mainpuri store in person',
    comment: 'Proud to see a homegrown UP brand doing luxury fashion at this standard. Purchased the Vintage Black in Size L directly at the Mainpuri store. Fits immaculate.',
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: new Date('2026-02-20').toISOString(),
  },
  {
    id: 'rev-3',
    productId: 'prod-selvedge-jeans',
    userName: 'Kabir Mehta',
    userEmail: 'kabir.m@example.com',
    rating: 5,
    title: 'Authentic red-line selvedge',
    comment: 'The 14.5oz raw denim is stiff at first as it should be, but molds into your body after a week. True Japanese aesthetic.',
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: new Date('2026-02-28').toISOString(),
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'TS-2026-000101',
    customerId: 'cust-1',
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.verma@example.com',
    customerPhone: '+91 98980 11223',
    shippingAddress: {
      fullName: 'Rahul Verma',
      mobile: '+91 98980 11223',
      email: 'rahul.verma@example.com',
      addressLine1: 'Flat 402, Royal Residency',
      apartmentSuiteArea: 'Civil Lines',
      city: 'Mainpuri',
      state: 'Uttar Pradesh',
      pincode: '205001',
      landmark: 'Near Railway Station',
    },
    items: [
      {
        id: 'oi-1',
        productId: 'prod-acid-wash-tee',
        variantId: 'v-tee-blk-l',
        title: 'Heavyweight Acid Wash Boxy Tee',
        variantTitle: 'Vintage Black / L',
        sku: 'TS-TEE-AW01-BLK-L',
        color: 'Vintage Black',
        size: 'L',
        price: 1499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
        total: 1499,
      },
      {
        id: 'oi-2',
        productId: 'prod-cuban-linen-shirt',
        variantId: 'v-sh-sand-l',
        title: 'Cuban Collar Textured Linen Shirt',
        variantTitle: 'Sand Beige / L',
        sku: 'TS-SHIRT-LN02-SND-L',
        color: 'Sand Beige',
        size: 'L',
        price: 2299,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
        total: 2299,
      },
    ],
    subtotal: 3798,
    discount: 500,
    couponCode: 'STREET500',
    shippingCharge: 0,
    taxAmount: 164.9,
    grandTotal: 3462.9,
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    razorpayOrderId: 'order_test_TS101',
    razorpayPaymentId: 'pay_test_TS101_confirmed',
    statusHistory: [
      { status: 'PENDING', timestamp: new Date('2026-02-10T10:00:00Z').toISOString() },
      { status: 'CONFIRMED', timestamp: new Date('2026-02-10T10:05:00Z').toISOString(), note: 'Payment verified via Razorpay' },
      { status: 'PACKED', timestamp: new Date('2026-02-10T14:30:00Z').toISOString(), note: 'Dispatched from Mainpuri flagship store hub' },
      { status: 'SHIPPED', timestamp: new Date('2026-02-11T09:00:00Z').toISOString() },
      { status: 'DELIVERED', timestamp: new Date('2026-02-12T16:20:00Z').toISOString(), note: 'Delivered to customer' },
    ],
    createdAt: new Date('2026-02-10T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-02-12T16:20:00Z').toISOString(),
  },
  {
    id: 'ord-1002',
    orderNumber: 'TS-2026-000102',
    customerId: 'cust-2',
    customerName: 'Siddharth Roy',
    customerEmail: 'siddharth.roy@example.com',
    customerPhone: '+91 97112 34567',
    shippingAddress: {
      fullName: 'Siddharth Roy',
      mobile: '+91 97112 34567',
      email: 'siddharth.roy@example.com',
      addressLine1: 'B-12, Sector 62',
      apartmentSuiteArea: 'Noida',
      city: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
      pincode: '201301',
    },
    items: [
      {
        id: 'oi-3',
        productId: 'prod-french-terry-hoodie',
        variantId: 'v-hd-blk-m',
        title: '450 GSM Heavy French Terry Boxy Hoodie',
        variantTitle: 'Carbon Black / M',
        sku: 'TS-HD-FT05-BLK-M',
        color: 'Carbon Black',
        size: 'M',
        price: 2999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
        total: 2999,
      },
    ],
    subtotal: 2999,
    discount: 299.9,
    couponCode: 'TREND10',
    shippingCharge: 0,
    taxAmount: 134.95,
    grandTotal: 2834.05,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'SHIPPED',
    statusHistory: [
      { status: 'PENDING', timestamp: new Date('2026-03-01T12:00:00Z').toISOString() },
      { status: 'CONFIRMED', timestamp: new Date('2026-03-01T12:30:00Z').toISOString(), note: 'Customer confirmed via OTP/Phone' },
      { status: 'PACKED', timestamp: new Date('2026-03-01T17:00:00Z').toISOString() },
      { status: 'SHIPPED', timestamp: new Date('2026-03-02T10:00:00Z').toISOString(), note: 'In transit via Bluedart Express' },
    ],
    createdAt: new Date('2026-03-01T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-03-02T10:00:00Z').toISOString(),
  },
];

const INITIAL_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: 'inv-1',
    productId: 'prod-acid-wash-tee',
    productTitle: 'Heavyweight Acid Wash Boxy Tee',
    variantId: 'v-tee-blk-l',
    variantTitle: 'Vintage Black / L',
    oldStock: 15,
    newStock: 14,
    change: -1,
    reason: 'ORDER_PLACED',
    admin: 'System (Order TS-2026-000101)',
    timestamp: new Date('2026-02-10T10:05:00Z').toISOString(),
  },
  {
    id: 'inv-2',
    productId: 'prod-french-terry-hoodie',
    productTitle: '450 GSM Heavy French Terry Boxy Hoodie',
    variantId: 'v-hd-blk-m',
    variantTitle: 'Carbon Black / M',
    oldStock: 17,
    newStock: 16,
    change: -1,
    reason: 'ORDER_PLACED',
    admin: 'System (Order TS-2026-000102)',
    timestamp: new Date('2026-03-01T12:30:00Z').toISOString(),
  },
  {
    id: 'inv-3',
    productId: 'prod-acid-wash-tee',
    productTitle: 'Heavyweight Acid Wash Boxy Tee',
    variantId: 'v-tee-blk-m',
    variantTitle: 'Vintage Black / M',
    oldStock: 8,
    newStock: 18,
    change: 10,
    reason: 'RESTOCK',
    admin: 'Store Manager (Mainpuri)',
    timestamp: new Date('2026-02-05T14:00:00Z').toISOString(),
  },
];

class DatabaseService {
  private state: DatabaseState;

  constructor() {
    this.ensureDataDirectory();
    this.state = this.loadDatabase();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseState {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: parsed.products || INITIAL_PRODUCTS,
          categories: parsed.categories || INITIAL_CATEGORIES,
          collections: parsed.collections || INITIAL_COLLECTIONS,
          coupons: parsed.coupons || INITIAL_COUPONS,
          orders: parsed.orders || INITIAL_ORDERS,
          reviews: parsed.reviews || INITIAL_REVIEWS,
          inventoryLogs: parsed.inventoryLogs || INITIAL_INVENTORY_LOGS,
          customers: parsed.customers || [
            { id: 'cust-1', name: 'Rahul Verma', email: 'rahul.verma@example.com', phone: '+91 98980 11223', ordersCount: 1, totalSpent: 3462.9, createdAt: '2026-02-10' },
            { id: 'cust-2', name: 'Siddharth Roy', email: 'siddharth.roy@example.com', phone: '+91 97112 34567', ordersCount: 1, totalSpent: 2834.05, createdAt: '2026-03-01' }
          ]
        };
      } catch (err) {
        console.error('Failed to parse database file, resetting to initial seed:', err);
      }
    }

    const initialState: DatabaseState = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      collections: INITIAL_COLLECTIONS,
      coupons: INITIAL_COUPONS,
      orders: INITIAL_ORDERS,
      reviews: INITIAL_REVIEWS,
      inventoryLogs: INITIAL_INVENTORY_LOGS,
      customers: [
        { id: 'cust-1', name: 'Rahul Verma', email: 'rahul.verma@example.com', phone: '+91 98980 11223', ordersCount: 1, totalSpent: 3462.9, createdAt: '2026-02-10' },
        { id: 'cust-2', name: 'Siddharth Roy', email: 'siddharth.roy@example.com', phone: '+91 97112 34567', ordersCount: 1, totalSpent: 2834.05, createdAt: '2026-03-01' }
      ]
    };
    this.saveDatabase(initialState);
    return initialState;
  }

  private saveDatabase(state?: DatabaseState) {
    try {
      const dataToSave = state || this.state;
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Products
  public getProducts(params?: {
    category?: string;
    collection?: string;
    search?: string;
    sort?: string;
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    fit?: string;
    status?: string;
  }): Product[] {
    let result = [...this.state.products];

    // Filter by status (default active only, unless admin specifies)
    if (params?.status) {
      result = result.filter(p => p.status === params.status);
    } else {
      result = result.filter(p => p.status === 'active');
    }

    const filterCategory = params?.category;
    if (filterCategory && filterCategory !== 'all') {
      result = result.filter(p => p.category === filterCategory || p.category.toLowerCase() === filterCategory.toLowerCase());
    }

    const filterCollection = params?.collection;
    if (filterCollection && filterCollection !== 'all') {
      result = result.filter(p => p.collection === filterCollection);
    }

    const filterFit = params?.fit;
    if (filterFit && filterFit !== 'all') {
      result = result.filter(p => p.fit.toLowerCase() === filterFit.toLowerCase());
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (params?.size && params.size !== 'all') {
      result = result.filter(p => p.variants.some(v => v.size.toLowerCase() === params.size!.toLowerCase() && v.stock > 0));
    }

    if (params?.color && params.color !== 'all') {
      result = result.filter(p => p.variants.some(v => v.color.toLowerCase().includes(params.color!.toLowerCase())));
    }

    if (params?.minPrice !== undefined) {
      result = result.filter(p => p.basePrice >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      result = result.filter(p => p.basePrice <= params.maxPrice!);
    }

    // Sorting
    if (params?.sort) {
      switch (params.sort) {
        case 'price-low':
        case 'price-asc':
          result.sort((a, b) => a.basePrice - b.basePrice);
          break;
        case 'price-high':
        case 'price-desc':
          result.sort((a, b) => b.basePrice - a.basePrice);
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'best-selling':
          result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        default:
          // 'featured'
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return result;
  }

  public getProductBySlug(slug: string): Product | null {
    const product = this.state.products.find(p => p.slug === slug);
    return product || null;
  }

  public getProductById(id: string): Product | null {
    const product = this.state.products.find(p => p.id === id);
    return product || null;
  }

  public createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.products.unshift(newProduct);
    this.saveDatabase();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.state.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    this.state.products[idx] = {
      ...this.state.products[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.state.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const idx = this.state.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.state.products.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  // Categories & Collections
  public getCategories(): Category[] {
    return this.state.categories;
  }

  public getCollections(): Collection[] {
    return this.state.collections;
  }

  // Coupons
  public getCoupons(): Coupon[] {
    return this.state.coupons;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const normalized = code.trim().toUpperCase();
    const coupon = this.state.coupons.find(c => c.code.toUpperCase() === normalized);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid coupon code.' };
    }

    if (!coupon.isActive) {
      return { valid: false, discount: 0, message: 'This coupon is no longer active.' };
    }

    const now = new Date();
    if (new Date(coupon.expiryDate) < now) {
      return { valid: false, discount: 0, message: 'This coupon has expired.' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached.' };
    }

    if (subtotal < coupon.minimumOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Add items worth ₹${(coupon.minimumOrder - subtotal).toFixed(0)} more to apply coupon ${coupon.code}. Minimum order ₹${coupon.minimumOrder}.`
      };
    }

    let calculatedDiscount = 0;
    if (coupon.type === 'percentage') {
      calculatedDiscount = (subtotal * coupon.value) / 100;
      if (coupon.maximumDiscount && calculatedDiscount > coupon.maximumDiscount) {
        calculatedDiscount = coupon.maximumDiscount;
      }
    } else {
      calculatedDiscount = coupon.value;
    }

    // Discount cannot exceed subtotal
    calculatedDiscount = Math.min(calculatedDiscount, subtotal);

    return {
      valid: true,
      discount: Math.round(calculatedDiscount * 100) / 100,
      message: `Coupon ${coupon.code} applied successfully! You saved ₹${calculatedDiscount.toFixed(0)}.`,
      coupon,
    };
  }

  // Inventory & Stock Validation
  public checkStockAvailability(items: { productId: string; variantId: string; quantity: number }[]): {
    available: boolean;
    errorItem?: { productTitle: string; requested: number; inStock: number };
  } {
    for (const item of items) {
      const product = this.getProductById(item.productId);
      if (!product) {
        return { available: false, errorItem: { productTitle: 'Unknown Product', requested: item.quantity, inStock: 0 } };
      }
      const variant = product.variants.find(v => v.id === item.variantId);
      if (!variant) {
        return { available: false, errorItem: { productTitle: product.title, requested: item.quantity, inStock: 0 } };
      }
      if (variant.stock < item.quantity) {
        return { available: false, errorItem: { productTitle: `${product.title} (${variant.title})`, requested: item.quantity, inStock: variant.stock } };
      }
    }
    return { available: true };
  }

  // Orders
  public getOrders(): Order[] {
    return [...this.state.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderByIdOrNumber(idOrNumber: string): Order | null {
    const order = this.state.orders.find(o => o.id === idOrNumber || o.orderNumber === idOrNumber);
    return order || null;
  }

  public createOrder(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: Order['shippingAddress'];
    billingAddress?: Order['billingAddress'];
    items: Order['items'];
    couponCode?: string;
    paymentMethod: Order['paymentMethod'];
    paymentStatus?: Order['paymentStatus'];
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    notes?: string;
  }): { success: boolean; order?: Order; error?: string } {
    // 1. Stock check
    const stockCheck = this.checkStockAvailability(data.items);
    if (!stockCheck.available) {
      return {
        success: false,
        error: `Insufficient stock for ${stockCheck.errorItem?.productTitle}. Only ${stockCheck.errorItem?.inStock} available.`,
      };
    }

    // 2. Calculate authoritative server price
    let subtotal = 0;
    const validatedItems = data.items.map(item => {
      const product = this.getProductById(item.productId);
      const variant = product?.variants.find(v => v.id === item.variantId);
      const unitPrice = variant?.price ?? product?.basePrice ?? item.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;
      return {
        ...item,
        price: unitPrice,
        total: itemTotal,
      };
    });

    // 3. Validate coupon server-side
    let discount = 0;
    if (data.couponCode) {
      const couponValidation = this.validateCoupon(data.couponCode, subtotal);
      if (couponValidation.valid) {
        discount = couponValidation.discount;
        // Increment coupon used count
        const couponIdx = this.state.coupons.findIndex(c => c.code.toUpperCase() === data.couponCode!.toUpperCase());
        if (couponIdx !== -1) {
          this.state.coupons[couponIdx].usedCount += 1;
        }
      }
    }

    // 4. Calculate Shipping: Free above threshold (₹1999), else standard ₹99
    const shippingCharge = subtotal >= STORE_CONFIG.freeShippingThreshold ? 0 : STORE_CONFIG.standardShippingFee;

    // 5. 5% GST included or calculated
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const taxAmount = Math.round((taxableSubtotal * 0.05) * 100) / 100;
    const grandTotal = Math.round((taxableSubtotal + shippingCharge) * 100) / 100;

    // 6. Generate human-readable order number: TS-2026-XXXXXX
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `TS-2026-${randomSeq}`;

    // 7. Deduct inventory & record logs
    data.items.forEach(item => {
      const product = this.getProductById(item.productId);
      if (product) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant) {
          const oldStock = variant.stock;
          variant.stock = Math.max(0, variant.stock - item.quantity);

          this.state.inventoryLogs.unshift({
            id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            productId: product.id,
            productTitle: product.title,
            variantId: variant.id,
            variantTitle: variant.title,
            oldStock,
            newStock: variant.stock,
            change: -item.quantity,
            reason: 'ORDER_PLACED',
            admin: `Order Placed (${orderNumber})`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress || data.shippingAddress,
      items: validatedItems,
      subtotal,
      discount,
      couponCode: data.couponCode,
      shippingCharge,
      taxAmount,
      grandTotal,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus || (data.paymentMethod === 'COD' ? 'PENDING' : 'PAID'),
      orderStatus: 'CONFIRMED',
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      statusHistory: [
        { status: 'PENDING', timestamp: new Date().toISOString() },
        { status: 'CONFIRMED', timestamp: new Date().toISOString(), note: `Order placed via ${data.paymentMethod}` },
      ],
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.orders.unshift(newOrder);

    // Update or add customer record
    const existingCust = this.state.customers.find(c => c.email.toLowerCase() === data.customerEmail.toLowerCase());
    if (existingCust) {
      existingCust.ordersCount += 1;
      existingCust.totalSpent += grandTotal;
    } else {
      this.state.customers.push({
        id: `cust-${Date.now()}`,
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        ordersCount: 1,
        totalSpent: grandTotal,
        createdAt: new Date().toISOString().split('T')[0],
      });
    }

    this.saveDatabase();
    return { success: true, order: newOrder };
  }

  public updateOrderStatus(orderId: string, status: Order['orderStatus'], note?: string): Order | null {
    const order = this.state.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note,
    });
    order.updatedAt = new Date().toISOString();

    // If cancelled, restore stock
    if (status === 'CANCELLED') {
      order.items.forEach(item => {
        const product = this.getProductById(item.productId);
        if (product) {
          const variant = product.variants.find(v => v.id === item.variantId);
          if (variant) {
            const oldStock = variant.stock;
            variant.stock += item.quantity;

            this.state.inventoryLogs.unshift({
              id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              productId: product.id,
              productTitle: product.title,
              variantId: variant.id,
              variantTitle: variant.title,
              oldStock,
              newStock: variant.stock,
              change: item.quantity,
              reason: 'ORDER_CANCELLED',
              admin: `Cancelled (${order.orderNumber})`,
              timestamp: new Date().toISOString(),
            });
          }
        }
      });
    }

    this.saveDatabase();
    return order;
  }

  // Inventory Adjustments
  public adjustInventory(variantId: string, newStock: number, reason: InventoryLog['reason'], admin: string): boolean {
    for (const product of this.state.products) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        const oldStock = variant.stock;
        variant.stock = Math.max(0, newStock);

        this.state.inventoryLogs.unshift({
          id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: product.id,
          productTitle: product.title,
          variantId: variant.id,
          variantTitle: variant.title,
          oldStock,
          newStock: variant.stock,
          change: newStock - oldStock,
          reason,
          admin,
          timestamp: new Date().toISOString(),
        });

        this.saveDatabase();
        return true;
      }
    }
    return false;
  }

  public getInventoryLogs(): InventoryLog[] {
    return this.state.inventoryLogs;
  }

  // Reviews
  public getReviews(productId?: string): Review[] {
    if (productId) {
      return this.state.reviews.filter(r => r.productId === productId && r.isApproved);
    }
    return this.state.reviews;
  }

  public addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.reviews.unshift(newReview);

    // Update product rating & count
    const productReviews = this.state.reviews.filter(r => r.productId === review.productId && r.isApproved);
    const avg = productReviews.reduce((acc, r) => acc + r.rating, 0) / (productReviews.length || 1);
    const product = this.getProductById(review.productId);
    if (product) {
      product.rating = Math.round(avg * 10) / 10;
      product.reviewCount = productReviews.length;
    }

    this.saveDatabase();
    return newReview;
  }

  // Admin Metrics
  public getAdminMetrics(): AdminMetrics {
    const totalOrders = this.state.orders.length;
    const totalRevenue = this.state.orders
      .filter(o => o.paymentStatus === 'PAID' || o.orderStatus === 'DELIVERED')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const totalCustomers = this.state.customers.length;
    const totalProducts = this.state.products.length;

    // Count variants with stock <= 5
    let lowStockCount = 0;
    this.state.products.forEach(p => {
      p.variants.forEach(v => {
        if (v.stock <= 5) lowStockCount++;
      });
    });

    const pendingOrdersCount = this.state.orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED').length;

    // Sales by Category
    const categoryMap: { [cat: string]: { amount: number; count: number } } = {};
    this.state.orders.forEach(order => {
      order.items.forEach(item => {
        const product = this.getProductById(item.productId);
        const cat = product?.category || 'other';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { amount: 0, count: 0 };
        }
        categoryMap[cat].amount += item.total;
        categoryMap[cat].count += item.quantity;
      });
    });

    const salesByCategory = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      amount: Math.round(data.amount),
      count: data.count,
    }));

    return {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      averageOrderValue,
      totalCustomers,
      totalProducts,
      lowStockCount,
      pendingOrdersCount,
      salesByCategory,
      recentOrders: this.state.orders.slice(0, 5),
    };
  }

  public getCustomers() {
    return this.state.customers;
  }
}

export const db = new DatabaseService();
