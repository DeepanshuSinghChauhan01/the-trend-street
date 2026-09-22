-- ==========================================================
-- TREND STREET — Supabase / PostgreSQL Production Schema
-- Brand: TREND STREET (Mainpuri, Uttar Pradesh, India)
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles / Users Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL DEFAULT 'TREND STREET',
  short_description TEXT,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  sku TEXT NOT NULL UNIQUE,
  base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
  compare_at_price DECIMAL(10, 2) CHECK (compare_at_price >= base_price),
  discount_percentage INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  tags TEXT[] DEFAULT '{}',
  product_type TEXT,
  material TEXT,
  fit TEXT,
  care_instructions TEXT,
  weight_grams INT DEFAULT 350,
  video_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  review_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Product Variants Table (Size, Color, Stock, SKU)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g. "Jet Black / L"
  sku TEXT NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10, 2),
  color TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  size TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  weight_grams INT DEFAULT 350,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_product_color_size UNIQUE (product_id, color, size)
);

-- 7. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Customer Saved Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  address_line1 TEXT NOT NULL,
  apartment_suite_area TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  landmark TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL CHECK (value > 0),
  minimum_order DECIMAL(10, 2) NOT NULL DEFAULT 0,
  maximum_discount DECIMAL(10, 2),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  usage_limit INT,
  used_count INT NOT NULL DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE, -- e.g. TS-2026-000123
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  coupon_code TEXT,
  shipping_charge DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_charge >= 0),
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  grand_total DECIMAL(10, 2) NOT NULL CHECK (grand_total >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('RAZORPAY', 'UPI', 'CARD', 'NETBANKING', 'COD')),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  order_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (order_status IN (
    'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'
  )),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  variant_title TEXT NOT NULL,
  sku TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  image TEXT,
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Order Status History Table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Coupon Usages Table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Inventory Audit Logs Table
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_title TEXT NOT NULL,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  variant_title TEXT NOT NULL,
  old_stock INT NOT NULL,
  new_stock INT NOT NULL,
  change INT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('ORDER_PLACED', 'ORDER_CANCELLED', 'MANUAL_ADJUSTMENT', 'RESTOCK', 'RETURN')),
  admin TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Wishlists & Items Table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
);

-- 16. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_variant ON public.inventory_logs(variant_id);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- Products / Catalog are publicly readable
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public can view variants" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "Public can view product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Public can view approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = true);

-- Orders: Users can read their own orders; Admins can read all
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);
