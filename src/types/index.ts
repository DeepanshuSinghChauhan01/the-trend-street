export type ProductStatus = 'active' | 'draft' | 'archived';

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary?: boolean;
  sortOrder?: number;
  // Undefined/absent = product-level fallback image (shown when the selected
  // color has no images of its own, or for products with no color-specific
  // images at all — this is how every pre-existing product's images behave).
  color?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  title: string; // e.g. "Black / L"
  sku: string;
  price: number;
  compareAtPrice?: number;
  color: string;
  colorHex: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | string;
  stock: number;
  weightGrams?: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brand: string;
  shortDescription: string;
  description: string;
  category: string; // 't-shirts' | 'shirts' | 'jeans' | 'trousers' | 'jackets' | 'hoodies' | 'polos'
  subcategory?: string;
  gender: 'men' | 'women' | 'unisex';
  collection?: string; // 'summer-drop' | 'luxury-minimal' | 'vintage-wash' | 'street-essentials'
  images: ProductImage[];
  videoUrl?: string;
  sku: string;
  basePrice: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  status: ProductStatus;
  tags: string[];
  productType: string;
  material: string;
  fit: 'Oversized' | 'Relaxed' | 'Regular' | 'Slim' | 'Boxy';
  careInstructions: string;
  weightGrams: number;
  seoTitle?: string;
  seoDescription?: string;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  itemCount: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  color: string;
  size: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  image: string;
  slug: string;
  maxStock: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrder: number;
  maximumDiscount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  isActive: boolean;
  description?: string;
}

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  email: string;
  addressLine1: string;
  apartmentSuiteArea: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export type PaymentMethod = 'RAZORPAY' | 'UPI' | 'CARD' | 'NETBANKING' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
  total: number;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. TS-2026-000123
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCharge: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  trackingNumber?: string;
  statusHistory: OrderStatusHistoryItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  ordersCount: number;
  totalSpent: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  oldStock: number;
  newStock: number;
  change: number;
  reason: 'ORDER_PLACED' | 'ORDER_CANCELLED' | 'MANUAL_ADJUSTMENT' | 'RESTOCK' | 'RETURN';
  admin: string;
  timestamp: string;
}

export interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrdersCount: number;
  salesByCategory: { category: string; amount: number; count: number }[];
  recentOrders: Order[];
}

export interface StoreConfig {
  name: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  googleMapsUrl: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressLocalAvailable: boolean;
}

// Payload shape sent from the Admin product form (create + edit) to /api/admin/products
export interface AdminProductVariantInput {
  id?: string; // present when editing an existing variant
  color: string;
  colorHex: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  skuSuffix?: string;
  // When set, used verbatim as the variant SKU instead of being derived from
  // the product SKU + color/size (skuSuffix). Used by the CSV importer, where
  // each row already carries its own complete, authoritative SKU.
  exactSku?: string;
}

export interface AdminProductImageInput {
  id?: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  color?: string;
}

export interface AdminProductInput {
  title: string;
  slug?: string;
  brand?: string;
  shortDescription?: string;
  description: string;
  categorySlug: string;
  subcategory?: string;
  collectionSlug?: string;
  gender?: 'men' | 'women' | 'unisex';
  sku: string;
  basePrice: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  status?: ProductStatus;
  tags?: string[];
  productType?: string;
  material?: string;
  fit?: string;
  careInstructions?: string;
  weightGrams?: number;
  videoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  images: AdminProductImageInput[];
  variants: AdminProductVariantInput[];
}

export interface ProductListResult {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// -------------------------------------------------------------------------
// Bulk product CSV import/export (Admin > Products > Import Products)
// -------------------------------------------------------------------------
export type ImportRowAction = 'CREATE' | 'UPDATE' | 'UNCHANGED' | 'ERROR';

export interface ImportFieldChange {
  field: string;
  from: string;
  to: string;
}

export interface ImportRowResult {
  rowNumber: number;
  sku: string;
  productTitle: string;
  action: ImportRowAction;
  isNewProduct: boolean;
  errors: string[];
  changes: ImportFieldChange[];
}

export interface ImportSummary {
  totalRows: number;
  productsNew: number;
  productsUpdate: number;
  productsUnchanged: number;
  variantsNew: number;
  variantsUpdate: number;
  imagesNew: number;
  errorCount: number;
  categoriesMissing: string[];
}

export interface ImportPreviewResponse {
  success: boolean;
  summary: ImportSummary;
  rows: ImportRowResult[];
  message?: string;
}

export interface ImportCommitResponse {
  success: boolean;
  summary: ImportSummary;
  rows: ImportRowResult[];
  message?: string;
  imported: boolean;
}
