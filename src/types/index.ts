export type ProductStatus = 'active' | 'draft' | 'archived';

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary?: boolean;
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
