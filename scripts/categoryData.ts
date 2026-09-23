/**
 * Canonical TREND STREET garment-type categories. Shared by scripts/seed.ts
 * (full catalog seed) and scripts/seedCategories.ts (categories only).
 *
 * These map to products.category_id and drive /shop?category= filtering.
 * Marketing concepts like "New Arrivals" and "Sale" are intentionally NOT
 * categories here — they're product attributes (is_new_arrival,
 * discount_percentage) already surfaced via ShopPage sort/filter params and
 * the HomePage sections, not a garment type a product belongs to.
 */
export const CATEGORIES = [
  { name: 'T-Shirts', slug: 't-shirts', description: 'Heavyweight oversized, drop-shoulder, and raw-edge streetwear essentials.', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85', order: 1 },
  { name: 'Shirts', slug: 'shirts', description: 'Cuban collars, textured linens, and relaxed luxury button-downs.', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85', order: 2 },
  { name: 'Jeans', slug: 'jeans', description: 'Japanese selvedge, vintage 90s baggy, and straight-cut premium denims.', imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=85', order: 3 },
  { name: 'Trousers', slug: 'trousers', description: 'Double-pleated tailoring, relaxed drapey cuts, and tactical modular cargos.', imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85', order: 4 },
  { name: 'Jackets', slug: 'jackets', description: 'Minimalist cropped bombers, heavyweight chore overshirts, and utility jackets.', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85', order: 5 },
  { name: 'Hoodies', slug: 'hoodies', description: '450 GSM luxury French terry boxy hoodies with no drawstrings.', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85', order: 6 },
  { name: 'Polos', slug: 'polos', description: 'Fine-knit mercerized cotton retro collar polos.', imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=85', order: 7 },
];
