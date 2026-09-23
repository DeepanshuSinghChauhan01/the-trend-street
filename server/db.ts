import {
  Product,
  ProductImage,
  ProductVariant,
  Category,
  Collection,
  Coupon,
  Order,
  OrderItem,
  Review,
  InventoryLog,
  StoreConfig,
  AdminMetrics,
  ProductListResult,
  AdminProductInput,
} from '../src/types/index.js';
import { supabaseAdmin, assertSupabaseConfigured } from './supabaseAdmin.js';

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

const DEFAULT_PAGE_SIZE = 24;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapVariantRow(v: any): ProductVariant {
  return {
    id: v.id,
    productId: v.product_id,
    title: v.title,
    sku: v.sku,
    price: Number(v.price),
    compareAtPrice: v.compare_at_price != null ? Number(v.compare_at_price) : undefined,
    color: v.color,
    colorHex: v.color_hex,
    size: v.size,
    stock: v.stock,
    weightGrams: v.weight_grams ?? undefined,
  };
}

function mapImageRow(img: any): ProductImage {
  return {
    id: img.id,
    url: img.url,
    altText: img.alt_text || '',
    isPrimary: img.is_primary,
    sortOrder: img.display_order,
    color: img.color || undefined,
  };
}

function mapProductRow(row: any): Product {
  // Product-level/fallback images (color undefined) always sort first, so
  // existing callers that assume images[0] is "the" thumbnail (ProductCard,
  // admin table, cart, wishlist) keep working unchanged even after
  // color-specific images are added. Within that, display_order is preserved.
  const images: ProductImage[] = (row.product_images || [])
    .map(mapImageRow)
    .sort((a: ProductImage, b: ProductImage) => {
      const aHasColor = a.color ? 1 : 0;
      const bHasColor = b.color ? 1 : 0;
      if (aHasColor !== bHasColor) return aHasColor - bHasColor;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    brand: row.brand,
    shortDescription: row.short_description || '',
    description: row.description,
    category: row.categories?.slug || '',
    subcategory: row.subcategory || undefined,
    gender: row.gender || 'men',
    collection: row.collections?.slug || undefined,
    images,
    videoUrl: row.video_url || undefined,
    sku: row.sku,
    basePrice: Number(row.base_price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    discountPercentage: row.discount_percentage || 0,
    status: row.status,
    tags: row.tags || [],
    productType: row.product_type || '',
    material: row.material || '',
    fit: row.fit,
    careInstructions: row.care_instructions || '',
    weightGrams: row.weight_grams,
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    variants: (row.product_variants || []).map(mapVariantRow),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    isFeatured: row.is_featured,
    isNewArrival: row.is_new_arrival,
    isBestSeller: row.is_best_seller,
    isTrending: row.is_trending,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const PRODUCT_SELECT = '*, categories(slug, name), collections(slug, name), product_images(*), product_variants(*)';

class DatabaseService {
  // -----------------------------------------------------------------
  // PRODUCTS
  // -----------------------------------------------------------------
  public async getProducts(params?: {
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
    page?: number;
    pageSize?: number;
    ids?: string[];
  }): Promise<ProductListResult> {
    assertSupabaseConfigured();

    const page = Math.max(1, params?.page || 1);
    const pageSize = Math.min(60, Math.max(1, params?.pageSize || DEFAULT_PAGE_SIZE));

    if (params?.ids) {
      if (params.ids.length === 0) return { data: [], total: 0, page: 1, pageSize, hasMore: false };
      const { data, error, count } = await supabaseAdmin.from('products').select(PRODUCT_SELECT, { count: 'exact' }).in('id', params.ids);
      if (error) throw error;
      const products = (data || []).map(mapProductRow);
      return { data: products, total: count || products.length, page: 1, pageSize: products.length, hasMore: false };
    }

    let productIdFilter: string[] | null = null;
    if ((params?.size && params.size !== 'all') || (params?.color && params.color !== 'all')) {
      let variantQuery = supabaseAdmin.from('product_variants').select('product_id');
      if (params?.size && params.size !== 'all') {
        variantQuery = variantQuery.ilike('size', params.size).gt('stock', 0);
      }
      if (params?.color && params.color !== 'all') {
        variantQuery = variantQuery.ilike('color', `%${params.color}%`);
      }
      const { data: variantRows, error: variantErr } = await variantQuery;
      if (variantErr) throw variantErr;
      productIdFilter = [...new Set((variantRows || []).map((r: any) => r.product_id))];
      if (productIdFilter.length === 0) {
        return { data: [], total: 0, page, pageSize, hasMore: false };
      }
    }

    const needCategoryJoin = Boolean(params?.category && params.category !== 'all');
    const needCollectionJoin = Boolean(params?.collection && params.collection !== 'all');
    const select = PRODUCT_SELECT
      .replace('categories(slug, name)', needCategoryJoin ? 'categories!inner(slug, name)' : 'categories(slug, name)')
      .replace('collections(slug, name)', needCollectionJoin ? 'collections!inner(slug, name)' : 'collections(slug, name)');

    let query = supabaseAdmin.from('products').select(select, { count: 'exact' });

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    } else if (!params?.status) {
      query = query.eq('status', 'active');
    }

    if (needCategoryJoin) {
      query = query.eq('categories.slug', params!.category);
    }
    if (needCollectionJoin) {
      query = query.eq('collections.slug', params!.collection);
    }
    if (params?.fit && params.fit !== 'all') {
      query = query.ilike('fit', params.fit);
    }
    if (params?.search) {
      const q = params.search.trim();
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%,brand.ilike.%${q}%`);
    }
    if (params?.minPrice !== undefined) {
      query = query.gte('base_price', params.minPrice);
    }
    if (params?.maxPrice !== undefined) {
      query = query.lte('base_price', params.maxPrice);
    }
    if (productIdFilter) {
      query = query.in('id', productIdFilter);
    }

    switch (params?.sort) {
      case 'price-low':
      case 'price-asc':
        query = query.order('base_price', { ascending: true });
        break;
      case 'price-high':
      case 'price-desc':
        query = query.order('base_price', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'best-selling':
        query = query.order('is_best_seller', { ascending: false }).order('review_count', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      default:
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        break;
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const products = (data || []).map(mapProductRow);
    const total = count || 0;

    return {
      data: products,
      total,
      page,
      pageSize,
      hasMore: from + products.length < total,
    };
  }

  public async getProductBySlug(slug: string): Promise<Product | null> {
    assertSupabaseConfigured();
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProductRow(data) : null;
  }

  public async getProductById(id: string): Promise<Product | null> {
    assertSupabaseConfigured();
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProductRow(data) : null;
  }

  private async resolveCategoryId(slug: string): Promise<string> {
    const { data, error } = await supabaseAdmin.from('categories').select('id').eq('slug', slug).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Category "${slug}" does not exist.`);
    return data.id;
  }

  private async resolveCollectionId(slug?: string): Promise<string | null> {
    if (!slug) return null;
    const { data, error } = await supabaseAdmin.from('collections').select('id').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data ? data.id : null;
  }

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title);
    let candidate = base;
    let suffix = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let query = supabaseAdmin.from('products').select('id').eq('slug', candidate);
      if (excludeId) query = query.neq('id', excludeId);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return candidate;
      candidate = `${base}-${suffix++}`;
    }
  }

  public async createProduct(input: AdminProductInput): Promise<Product> {
    assertSupabaseConfigured();
    if (!input.images?.length) throw new Error('At least one product image is required.');
    if (!input.variants?.length) throw new Error('At least one product variant is required.');

    const categoryId = await this.resolveCategoryId(input.categorySlug);
    const collectionId = await this.resolveCollectionId(input.collectionSlug);
    const slug = input.slug ? slugify(input.slug) : await this.generateUniqueSlug(input.title);

    const { data: productRow, error: productErr } = await supabaseAdmin
      .from('products')
      .insert({
        title: input.title,
        slug,
        brand: input.brand || 'TREND STREET',
        short_description: input.shortDescription || null,
        description: input.description,
        category_id: categoryId,
        collection_id: collectionId,
        subcategory: input.subcategory || null,
        gender: input.gender || 'men',
        sku: input.sku,
        base_price: input.basePrice,
        compare_at_price: input.compareAtPrice ?? null,
        discount_percentage: input.discountPercentage || 0,
        status: input.status || 'active',
        tags: input.tags || [],
        product_type: input.productType || null,
        material: input.material || null,
        fit: input.fit || null,
        care_instructions: input.careInstructions || null,
        weight_grams: input.weightGrams || 350,
        video_url: input.videoUrl || null,
        seo_title: input.seoTitle || null,
        seo_description: input.seoDescription || null,
        is_featured: Boolean(input.isFeatured),
        is_new_arrival: Boolean(input.isNewArrival),
        is_best_seller: Boolean(input.isBestSeller),
        is_trending: Boolean(input.isTrending),
      })
      .select('id')
      .single();

    if (productErr) throw productErr;
    const productId = productRow.id as string;

    try {
      await this.replaceProductImages(productId, input.images);
      await this.replaceProductVariants(productId, input.sku, input.title, input.variants);
    } catch (err) {
      await supabaseAdmin.from('products').delete().eq('id', productId);
      throw err;
    }

    const created = await this.getProductById(productId);
    if (!created) throw new Error('Failed to load product after creation.');
    return created;
  }

  public async updateProduct(id: string, input: Partial<AdminProductInput>): Promise<Product | null> {
    assertSupabaseConfigured();
    const existing = await this.getProductById(id);
    if (!existing) return null;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (input.title !== undefined) updates.title = input.title;
    if (input.slug !== undefined) updates.slug = await this.generateUniqueSlug(input.slug, id);
    if (input.brand !== undefined) updates.brand = input.brand;
    if (input.shortDescription !== undefined) updates.short_description = input.shortDescription;
    if (input.description !== undefined) updates.description = input.description;
    if (input.categorySlug !== undefined) updates.category_id = await this.resolveCategoryId(input.categorySlug);
    if (input.collectionSlug !== undefined) updates.collection_id = await this.resolveCollectionId(input.collectionSlug);
    if (input.subcategory !== undefined) updates.subcategory = input.subcategory;
    if (input.gender !== undefined) updates.gender = input.gender;
    if (input.sku !== undefined) updates.sku = input.sku;
    if (input.basePrice !== undefined) updates.base_price = input.basePrice;
    if (input.compareAtPrice !== undefined) updates.compare_at_price = input.compareAtPrice;
    if (input.discountPercentage !== undefined) updates.discount_percentage = input.discountPercentage;
    if (input.status !== undefined) updates.status = input.status;
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.productType !== undefined) updates.product_type = input.productType;
    if (input.material !== undefined) updates.material = input.material;
    if (input.fit !== undefined) updates.fit = input.fit;
    if (input.careInstructions !== undefined) updates.care_instructions = input.careInstructions;
    if (input.weightGrams !== undefined) updates.weight_grams = input.weightGrams;
    if (input.videoUrl !== undefined) updates.video_url = input.videoUrl;
    if (input.seoTitle !== undefined) updates.seo_title = input.seoTitle;
    if (input.seoDescription !== undefined) updates.seo_description = input.seoDescription;
    if (input.isFeatured !== undefined) updates.is_featured = input.isFeatured;
    if (input.isNewArrival !== undefined) updates.is_new_arrival = input.isNewArrival;
    if (input.isBestSeller !== undefined) updates.is_best_seller = input.isBestSeller;
    if (input.isTrending !== undefined) updates.is_trending = input.isTrending;

    const { error: updateErr } = await supabaseAdmin.from('products').update(updates).eq('id', id);
    if (updateErr) throw updateErr;

    if (input.images) {
      await this.replaceProductImages(id, input.images);
    }
    if (input.variants) {
      await this.replaceProductVariants(id, input.sku || existing.sku, input.title || existing.title, input.variants);
    }

    return this.getProductById(id);
  }

  private async replaceProductImages(productId: string, images: AdminProductInput['images']) {
    await supabaseAdmin.from('product_images').delete().eq('product_id', productId);
    if (!images.length) return;
    const rows = images.map((img, idx) => ({
      product_id: productId,
      url: img.url,
      alt_text: img.altText || '',
      display_order: idx,
      is_primary: img.isPrimary ?? idx === 0,
      color: img.color || null,
    }));
    const { error } = await supabaseAdmin.from('product_images').insert(rows);
    if (error) throw error;
  }

  private async replaceProductVariants(productId: string, productSku: string, productTitle: string, variants: AdminProductInput['variants']) {
    await supabaseAdmin.from('product_variants').delete().eq('product_id', productId);
    if (!variants.length) return;
    const rows = variants.map(v => ({
      product_id: productId,
      title: `${v.color} / ${v.size}`,
      sku: v.exactSku || (v.skuSuffix ? `${productSku}-${v.skuSuffix}` : `${productSku}-${slugify(v.color).toUpperCase()}-${v.size}`),
      price: v.price,
      compare_at_price: v.compareAtPrice ?? null,
      color: v.color,
      color_hex: v.colorHex,
      size: v.size,
      stock: v.stock,
    }));
    const { error } = await supabaseAdmin.from('product_variants').insert(rows);
    if (error) throw error;
  }

  /** Soft delete: archives the product instead of removing it, per store policy. */
  public async deleteProduct(id: string): Promise<boolean> {
    assertSupabaseConfigured();
    const { error, data } = await supabaseAdmin
      .from('products')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  // -----------------------------------------------------------------
  // CATEGORIES & COLLECTIONS
  // -----------------------------------------------------------------
  public async getCategories(): Promise<Category[]> {
    assertSupabaseConfigured();
    const { data, error } = await supabaseAdmin.from('categories').select('*').order('display_order');
    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      imageUrl: c.image_url || '',
      itemCount: 0,
    }));
  }

  public async getCollections(): Promise<Collection[]> {
    assertSupabaseConfigured();
    const { data, error } = await supabaseAdmin.from('collections').select('*').eq('is_active', true).order('created_at');
    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      bannerImage: c.banner_image || '',
    }));
  }

  // -----------------------------------------------------------------
  // COUPONS
  // -----------------------------------------------------------------
  public async getCoupons(): Promise<Coupon[]> {
    assertSupabaseConfigured();
    const { data, error } = await supabaseAdmin.from('coupons').select('*').eq('is_active', true);
    if (error) throw error;
    return (data || []).map(mapCouponRow);
  }

  public async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
    assertSupabaseConfigured();
    const normalized = code.trim().toUpperCase();
    const { data, error } = await supabaseAdmin.from('coupons').select('*').ilike('code', normalized).maybeSingle();
    if (error) throw error;
    if (!data) return { valid: false, discount: 0, message: 'Invalid coupon code.' };

    const coupon = mapCouponRow(data);
    if (!coupon.isActive) return { valid: false, discount: 0, message: 'This coupon is no longer active.' };
    if (new Date(coupon.expiryDate) < new Date()) return { valid: false, discount: 0, message: 'This coupon has expired.' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached.' };
    }
    if (subtotal < coupon.minimumOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Add items worth ₹${(coupon.minimumOrder - subtotal).toFixed(0)} more to apply coupon ${coupon.code}. Minimum order ₹${coupon.minimumOrder}.`,
      };
    }

    let discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
    if (coupon.type === 'percentage' && coupon.maximumDiscount && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      discount: Math.round(discount * 100) / 100,
      message: `Coupon ${coupon.code} applied successfully! You saved ₹${discount.toFixed(0)}.`,
      coupon,
    };
  }

  // -----------------------------------------------------------------
  // INVENTORY
  // -----------------------------------------------------------------
  private async checkStockAvailability(items: { productId: string; variantId: string; quantity: number }[]): Promise<{
    available: boolean;
    errorItem?: { productTitle: string; requested: number; inStock: number };
  }> {
    for (const item of items) {
      const { data: variant, error } = await supabaseAdmin
        .from('product_variants')
        .select('id, stock, title, products(title)')
        .eq('id', item.variantId)
        .maybeSingle();
      if (error) throw error;
      if (!variant) {
        return { available: false, errorItem: { productTitle: 'Unknown Product', requested: item.quantity, inStock: 0 } };
      }
      if (variant.stock < item.quantity) {
        const productTitle = (variant as any).products?.title || 'Product';
        return {
          available: false,
          errorItem: { productTitle: `${productTitle} (${variant.title})`, requested: item.quantity, inStock: variant.stock },
        };
      }
    }
    return { available: true };
  }

  private async logInventoryChange(productId: string, productTitle: string, variantId: string, variantTitle: string, oldStock: number, newStock: number, reason: InventoryLog['reason'], admin: string) {
    const { error } = await supabaseAdmin.from('inventory_logs').insert({
      product_id: productId,
      product_title: productTitle,
      variant_id: variantId,
      variant_title: variantTitle,
      old_stock: oldStock,
      new_stock: newStock,
      change: newStock - oldStock,
      reason,
      admin,
    });
    if (error) throw error;
  }

  public async getInventoryLogs(): Promise<InventoryLog[]> {
    assertSupabaseConfigured();
    const { data, error } = await supabaseAdmin.from('inventory_logs').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    return (data || []).map((l: any) => ({
      id: l.id,
      productId: l.product_id,
      productTitle: l.product_title,
      variantId: l.variant_id,
      variantTitle: l.variant_title,
      oldStock: l.old_stock,
      newStock: l.new_stock,
      change: l.change,
      reason: l.reason,
      admin: l.admin,
      timestamp: l.created_at,
    }));
  }

  public async adjustInventory(variantId: string, newStock: number, reason: InventoryLog['reason'], admin: string): Promise<boolean> {
    assertSupabaseConfigured();
    const { data: variant, error: fetchErr } = await supabaseAdmin
      .from('product_variants')
      .select('id, stock, title, product_id, products(title)')
      .eq('id', variantId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!variant) return false;

    const clamped = Math.max(0, newStock);
    const { error: updateErr } = await supabaseAdmin
      .from('product_variants')
      .update({ stock: clamped, updated_at: new Date().toISOString() })
      .eq('id', variantId);
    if (updateErr) throw updateErr;

    await this.logInventoryChange(
      variant.product_id,
      (variant as any).products?.title || 'Product',
      variant.id,
      variant.title,
      variant.stock,
      clamped,
      reason,
      admin
    );
    return true;
  }

  // -----------------------------------------------------------------
  // ORDERS
  // -----------------------------------------------------------------
  public async getOrders(): Promise<Order[]> {
    assertSupabaseConfigured();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*), order_status_history(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapOrderRow);
  }

  public async getOrderByIdOrNumber(idOrNumber: string): Promise<Order | null> {
    assertSupabaseConfigured();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*), order_status_history(*)')
      .or(`id.eq.${idOrNumber},order_number.eq.${idOrNumber}`)
      .maybeSingle();
    if (error) throw error;
    return data ? mapOrderRow(data) : null;
  }

  public async createOrder(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    userId?: string;
    shippingAddress: Order['shippingAddress'];
    billingAddress?: Order['billingAddress'];
    items: { productId: string; variantId: string; title: string; variantTitle: string; color: string; size: string; sku: string; price: number; quantity: number; image: string }[];
    couponCode?: string;
    paymentMethod: Order['paymentMethod'];
    paymentStatus?: Order['paymentStatus'];
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    notes?: string;
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    assertSupabaseConfigured();

    const stockCheck = await this.checkStockAvailability(data.items);
    if (!stockCheck.available) {
      return { success: false, error: `Insufficient stock for ${stockCheck.errorItem?.productTitle}. Only ${stockCheck.errorItem?.inStock} available.` };
    }

    let subtotal = 0;
    const validatedItems: OrderItem[] = [];
    for (const item of data.items) {
      const { data: variant } = await supabaseAdmin.from('product_variants').select('price').eq('id', item.variantId).maybeSingle();
      const unitPrice = variant ? Number(variant.price) : item.price;
      const total = unitPrice * item.quantity;
      subtotal += total;
      validatedItems.push({ id: '', productId: item.productId, variantId: item.variantId, title: item.title, variantTitle: item.variantTitle, sku: item.sku, color: item.color, size: item.size, price: unitPrice, quantity: item.quantity, image: item.image, total });
    }

    let discount = 0;
    let appliedCoupon: Coupon | undefined;
    if (data.couponCode) {
      const validation = await this.validateCoupon(data.couponCode, subtotal);
      if (validation.valid) {
        discount = validation.discount;
        appliedCoupon = validation.coupon;
      }
    }

    const shippingCharge = subtotal >= STORE_CONFIG.freeShippingThreshold ? 0 : STORE_CONFIG.standardShippingFee;
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const taxAmount = Math.round(taxableSubtotal * 0.05 * 100) / 100;
    const grandTotal = Math.round((taxableSubtotal + shippingCharge) * 100) / 100;
    const orderNumber = `TS-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const { data: orderRow, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: data.userId || null,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        shipping_address: data.shippingAddress,
        billing_address: data.billingAddress || data.shippingAddress,
        subtotal,
        discount,
        coupon_code: data.couponCode || null,
        shipping_charge: shippingCharge,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        payment_method: data.paymentMethod,
        payment_status: data.paymentStatus || (data.paymentMethod === 'COD' ? 'PENDING' : 'PAID'),
        order_status: 'CONFIRMED',
        razorpay_order_id: data.razorpayOrderId || null,
        razorpay_payment_id: data.razorpayPaymentId || null,
        notes: data.notes || null,
      })
      .select('*')
      .single();
    if (orderErr) throw orderErr;

    const orderId = orderRow.id as string;

    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(
      validatedItems.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        variant_id: item.variantId,
        title: item.title,
        variant_title: item.variantTitle,
        sku: item.sku,
        color: item.color,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        total: item.total,
      }))
    );
    if (itemsErr) throw itemsErr;

    await supabaseAdmin.from('order_status_history').insert([
      { order_id: orderId, status: 'PENDING', note: null },
      { order_id: orderId, status: 'CONFIRMED', note: `Order placed via ${data.paymentMethod}` },
    ]);

    // Deduct inventory & record logs
    for (const item of validatedItems) {
      const { data: variant } = await supabaseAdmin.from('product_variants').select('stock, title').eq('id', item.variantId).maybeSingle();
      if (!variant) continue;
      const newStock = Math.max(0, variant.stock - item.quantity);
      await supabaseAdmin.from('product_variants').update({ stock: newStock, updated_at: new Date().toISOString() }).eq('id', item.variantId);
      await this.logInventoryChange(item.productId, item.title, item.variantId, variant.title, variant.stock, newStock, 'ORDER_PLACED', `Order Placed (${orderNumber})`);
    }

    if (appliedCoupon) {
      await supabaseAdmin.from('coupons').update({ used_count: appliedCoupon.usedCount + 1 }).eq('id', appliedCoupon.id);
      await supabaseAdmin.from('coupon_usages').insert({ coupon_id: appliedCoupon.id, order_id: orderId, user_id: data.userId || null, discount_amount: discount });
    }

    const order = await this.getOrderByIdOrNumber(orderId);
    return { success: true, order: order! };
  }

  public async updateOrderStatus(orderId: string, status: Order['orderStatus'], note?: string): Promise<Order | null> {
    assertSupabaseConfigured();
    const order = await this.getOrderByIdOrNumber(orderId);
    if (!order) return null;

    await supabaseAdmin.from('orders').update({ order_status: status, updated_at: new Date().toISOString() }).eq('id', order.id);
    await supabaseAdmin.from('order_status_history').insert({ order_id: order.id, status, note: note || null });

    if (status === 'CANCELLED') {
      for (const item of order.items) {
        const { data: variant } = await supabaseAdmin.from('product_variants').select('stock').eq('id', item.variantId).maybeSingle();
        if (!variant) continue;
        const newStock = variant.stock + item.quantity;
        await supabaseAdmin.from('product_variants').update({ stock: newStock, updated_at: new Date().toISOString() }).eq('id', item.variantId);
        await this.logInventoryChange(item.productId, item.title, item.variantId, item.variantTitle, variant.stock, newStock, 'ORDER_CANCELLED', `Cancelled (${order.orderNumber})`);
      }
    }

    return this.getOrderByIdOrNumber(order.id);
  }

  // -----------------------------------------------------------------
  // REVIEWS
  // -----------------------------------------------------------------
  public async getReviews(productId?: string): Promise<Review[]> {
    assertSupabaseConfigured();
    let query = supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false });
    if (productId) query = query.eq('product_id', productId).eq('is_approved', true);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapReviewRow);
  }

  public async addReview(review: { productId: string; userName: string; userEmail?: string; rating: number; title: string; comment: string; isVerifiedPurchase: boolean; isApproved: boolean }): Promise<Review> {
    assertSupabaseConfigured();
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: review.productId,
        user_name: review.userName,
        user_email: review.userEmail || null,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        is_verified_purchase: review.isVerifiedPurchase,
        is_approved: review.isApproved,
      })
      .select('*')
      .single();
    if (error) throw error;

    const { data: approvedReviews } = await supabaseAdmin.from('reviews').select('rating').eq('product_id', review.productId).eq('is_approved', true);
    const list = approvedReviews || [];
    const avg = list.reduce((acc: number, r: any) => acc + r.rating, 0) / (list.length || 1);
    await supabaseAdmin.from('products').update({ rating: Math.round(avg * 10) / 10, review_count: list.length }).eq('id', review.productId);

    return mapReviewRow(data);
  }

  // -----------------------------------------------------------------
  // ADMIN METRICS & CUSTOMERS
  // -----------------------------------------------------------------
  public async getAdminMetrics(): Promise<AdminMetrics> {
    assertSupabaseConfigured();
    const { data: orders, error: ordersErr } = await supabaseAdmin.from('orders').select('*, order_items(*), order_status_history(*)').order('created_at', { ascending: false });
    if (ordersErr) throw ordersErr;
    const mappedOrders = (orders || []).map(mapOrderRow);

    const totalOrders = mappedOrders.length;
    const totalRevenue = mappedOrders.filter(o => o.paymentStatus === 'PAID' || o.orderStatus === 'DELIVERED').reduce((sum, o) => sum + o.grandTotal, 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const pendingOrdersCount = mappedOrders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED').length;

    const { count: totalProducts } = await supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).neq('status', 'archived');
    const { data: lowStockVariants } = await supabaseAdmin.from('product_variants').select('id').lte('stock', 5);
    const { count: totalCustomers } = await supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer');

    const categoryMap: { [cat: string]: { amount: number; count: number } } = {};
    for (const order of mappedOrders) {
      for (const item of order.items) {
        const { data: product } = await supabaseAdmin.from('products').select('categories(slug)').eq('id', item.productId).maybeSingle();
        const cat = (product as any)?.categories?.slug || 'other';
        if (!categoryMap[cat]) categoryMap[cat] = { amount: 0, count: 0 };
        categoryMap[cat].amount += item.total;
        categoryMap[cat].count += item.quantity;
      }
    }

    return {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      averageOrderValue,
      totalCustomers: totalCustomers || 0,
      totalProducts: totalProducts || 0,
      lowStockCount: (lowStockVariants || []).length,
      pendingOrdersCount,
      salesByCategory: Object.entries(categoryMap).map(([category, d]) => ({ category, amount: Math.round(d.amount), count: d.count })),
      recentOrders: mappedOrders.slice(0, 5),
    };
  }

  public async getAllActiveProductsForSitemap(): Promise<{ slug: string; updatedAt: string }[]> {
    assertSupabaseConfigured();
    const { data, error } = await supabaseAdmin.from('products').select('slug, updated_at').eq('status', 'active');
    if (error) throw error;
    return (data || []).map((p: any) => ({ slug: p.slug, updatedAt: p.updated_at }));
  }

  public async getCustomers() {
    assertSupabaseConfigured();
    const { data: orders, error } = await supabaseAdmin.from('orders').select('customer_name, customer_email, customer_phone, grand_total, created_at');
    if (error) throw error;

    const map = new Map<string, { id: string; name: string; email: string; phone: string; ordersCount: number; totalSpent: number; createdAt: string }>();
    for (const o of orders || []) {
      const key = o.customer_email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += Number(o.grand_total);
      } else {
        map.set(key, {
          id: key,
          name: o.customer_name,
          email: o.customer_email,
          phone: o.customer_phone,
          ordersCount: 1,
          totalSpent: Number(o.grand_total),
          createdAt: o.created_at,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }
}

function mapCouponRow(c: any): Coupon {
  return {
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    minimumOrder: Number(c.minimum_order),
    maximumDiscount: c.maximum_discount != null ? Number(c.maximum_discount) : undefined,
    startDate: c.start_date,
    expiryDate: c.expiry_date,
    usageLimit: c.usage_limit ?? undefined,
    usedCount: c.used_count,
    perUserLimit: c.per_user_limit ?? undefined,
    isActive: c.is_active,
    description: c.description || undefined,
  };
}

function mapReviewRow(r: any): Review {
  return {
    id: r.id,
    productId: r.product_id,
    userName: r.user_name,
    userEmail: r.user_email || undefined,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    isVerifiedPurchase: r.is_verified_purchase,
    isApproved: r.is_approved,
    createdAt: r.created_at,
  };
}

function mapOrderRow(o: any): Order {
  const items: OrderItem[] = (o.order_items || []).map((i: any) => ({
    id: i.id,
    productId: i.product_id,
    variantId: i.variant_id,
    title: i.title,
    variantTitle: i.variant_title,
    sku: i.sku,
    color: i.color,
    size: i.size,
    price: Number(i.price),
    quantity: i.quantity,
    image: i.image || '',
    total: Number(i.total),
  }));

  const statusHistory = (o.order_status_history || [])
    .map((h: any) => ({ status: h.status, timestamp: h.created_at, note: h.note || undefined }))
    .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    id: o.id,
    orderNumber: o.order_number,
    customerId: o.user_id || undefined,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    shippingAddress: o.shipping_address,
    billingAddress: o.billing_address || undefined,
    items,
    subtotal: Number(o.subtotal),
    discount: Number(o.discount),
    couponCode: o.coupon_code || undefined,
    shippingCharge: Number(o.shipping_charge),
    taxAmount: Number(o.tax_amount),
    grandTotal: Number(o.grand_total),
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    orderStatus: o.order_status,
    razorpayOrderId: o.razorpay_order_id || undefined,
    razorpayPaymentId: o.razorpay_payment_id || undefined,
    trackingNumber: o.tracking_number || undefined,
    statusHistory,
    notes: o.notes || undefined,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

export const db = new DatabaseService();
