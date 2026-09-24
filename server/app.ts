import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db, STORE_CONFIG } from './db.js';
import { supabaseAdmin } from './supabaseAdmin.js';
import { previewImport, commitImport } from './import/productImport.js';
import { generateTemplateCsv } from './import/csv.js';
import { exportProductsToCsv } from './import/exportProducts.js';

dotenv.config();

export const app = express();

// Bulk CSV product imports need a larger body limit than typical JSON API calls.
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------------
// HELPERS
// -------------------------------------------------------------
function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (err: any) {
      if (err?.name === 'SupabaseNotConfiguredError') {
        res.status(503).json({ success: false, message: err.message });
        return;
      }
      console.error(err);
      res.status(500).json({ success: false, message: err?.message || 'Internal server error.' });
    }
  };
}

async function getOptionalUserId(req: Request): Promise<string | undefined> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return undefined;
  try {
    const { data } = await supabaseAdmin.auth.getUser(token);
    return data.user?.id;
  } catch {
    return undefined;
  }
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ success: false, message: 'Missing authorization token.' });
      return;
    }
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
      return;
    }
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle();
    if (profileErr || !profile || !['admin', 'manager'].includes(profile.role)) {
      res.status(403).json({ success: false, message: 'Access denied: Admin role required.' });
      return;
    }
    (req as any).adminUser = userData.user;
    next();
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Admin verification failed.' });
  }
}

// -------------------------------------------------------------
// STORE CONFIGURATION & PINCODE CHECKER
// -------------------------------------------------------------
app.get('/api/store/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      ...STORE_CONFIG,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_trendstreet_demo',
      isTestMode: !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_'),
    },
  });
});

app.post('/api/delivery/check-pincode', (req: Request, res: Response) => {
  const { pincode } = req.body;

  if (!pincode || !/^\d{6}$/.test(pincode.toString().trim())) {
    res.status(400).json({
      success: false,
      message: 'Please enter a valid 6-digit Indian PIN code.',
    });
    return;
  }

  const pin = pincode.toString().trim();
  const firstDigit = pin[0];

  const isMainpuri = pin.startsWith('205');
  const isUttarPradesh = pin.startsWith('20') || pin.startsWith('21') || pin.startsWith('22') || pin.startsWith('24') || pin.startsWith('28');
  const isNorthIndia = ['1', '2', '3'].includes(firstDigit);

  let estimatedDays = '3–5 business days';
  let message = 'Standard Express Delivery available.';
  let isLocalExpress = false;

  if (isMainpuri) {
    estimatedDays = 'Same-Day or Next-Day Delivery';
    message = 'Local dispatch from TREND STREET Mainpuri flagship store.';
    isLocalExpress = true;
  } else if (isUttarPradesh) {
    estimatedDays = '2–3 business days';
    message = 'Fast state-wide regional express shipping available.';
  } else if (isNorthIndia) {
    estimatedDays = '3–4 business days';
  } else {
    estimatedDays = '4–6 business days';
  }

  res.json({
    success: true,
    data: {
      pincode: pin,
      serviceable: true,
      codAvailable: true,
      prepaidAvailable: true,
      estimatedDelivery: estimatedDays,
      message,
      isLocalExpress,
      storePickupAvailable: isMainpuri,
    },
  });
});

// -------------------------------------------------------------
// PRODUCT CATALOG ROUTES
// -------------------------------------------------------------
app.get('/api/products', asyncHandler(async (req: Request, res: Response) => {
  const { category, collection, search, sort, size, color, minPrice, maxPrice, fit, status, page, pageSize, ids } = req.query;
  const result = await db.getProducts({
    category: category as string,
    collection: collection as string,
    search: search as string,
    sort: sort as string,
    size: size as string,
    color: color as string,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    fit: fit as string,
    status: status as string,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    ids: ids ? (ids as string).split(',').filter(Boolean) : undefined,
  });

  res.json({ success: true, ...result });
}));

app.get('/api/products/:slug', asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = await db.getProductBySlug(slug);

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  const relatedResult = await db.getProducts({ category: product.category, pageSize: 5 });
  const related = relatedResult.data.filter(p => p.id !== product.id).slice(0, 4);
  const reviews = await db.getReviews(product.id);

  res.json({
    success: true,
    data: { ...product, relatedProducts: related, reviews },
  });
}));

app.get('/api/categories', asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getCategories() });
}));

app.get('/api/collections', asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getCollections() });
}));

// -------------------------------------------------------------
// COUPONS API (SERVER-SIDE CALCULATION)
// -------------------------------------------------------------
app.post('/api/coupons/validate', asyncHandler(async (req: Request, res: Response) => {
  const { code, subtotal } = req.body;

  if (!code || typeof subtotal !== 'number') {
    res.status(400).json({ success: false, message: 'Coupon code and subtotal are required.' });
    return;
  }

  const result = await db.validateCoupon(code, subtotal);
  if (!result.valid) {
    res.status(400).json({ success: false, message: result.message });
    return;
  }

  res.json({
    success: true,
    data: {
      code: result.coupon!.code,
      type: result.coupon!.type,
      discount: result.discount,
      message: result.message,
    },
  });
}));

app.get('/api/coupons', asyncHandler(async (req: Request, res: Response) => {
  const coupons = (await db.getCoupons()).filter(c => c.isActive);
  res.json({ success: true, data: coupons });
}));

// -------------------------------------------------------------
// RAZORPAY PAYMENT & VERIFICATION ROUTES
// -------------------------------------------------------------
app.post('/api/payment/create-order', (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Valid amount in INR is required.' });
      return;
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_trendstreet_demo';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const amountInPaise = Math.round(amount * 100);
    const razorpayOrderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    res.json({
      success: true,
      data: {
        id: razorpayOrderId,
        entity: 'order',
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        key: keyId,
        isTestMode: !keySecret || keyId.startsWith('rzp_test_'),
        notes: notes || { brand: 'TREND STREET Mainpuri' },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/payment/verify', (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      res.status(400).json({ success: false, message: 'Order ID and Payment ID are required.' });
      return;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && razorpay_signature) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto.createHmac('sha256', keySecret).update(body.toString()).digest('hex');

      if (expectedSignature !== razorpay_signature) {
        res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
        return;
      }
    }

    res.json({
      success: true,
      message: 'Payment signature verified successfully.',
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ORDERS ROUTES (SERVER AUTHORITATIVE ORDER CREATION)
// -------------------------------------------------------------
app.post('/api/orders/create', asyncHandler(async (req: Request, res: Response) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    billingAddress,
    items,
    couponCode,
    paymentMethod,
    paymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    notes,
  } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || !items.length) {
    res.status(400).json({
      success: false,
      message: 'Missing required order fields (Customer details, shipping address, or items).',
    });
    return;
  }

  if (!customerEmail.includes('@') || customerPhone.length < 10) {
    res.status(400).json({ success: false, message: 'Invalid email address or mobile number.' });
    return;
  }

  const userId = await getOptionalUserId(req);

  const orderResult = await db.createOrder({
    customerName,
    customerEmail,
    customerPhone,
    userId,
    shippingAddress,
    billingAddress,
    items,
    couponCode,
    paymentMethod,
    paymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    notes,
  });

  if (!orderResult.success) {
    res.status(400).json({ success: false, message: orderResult.error });
    return;
  }

  res.status(201).json({
    success: true,
    data: orderResult.order,
    message: `Order ${orderResult.order?.orderNumber} placed successfully!`,
  });
}));

app.get('/api/orders/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await db.getOrderByIdOrNumber(id);

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  res.json({ success: true, data: order });
}));

app.post('/api/orders/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await db.getOrderByIdOrNumber(id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
    res.status(400).json({
      success: false,
      message: `Order cannot be cancelled in its current state (${order.orderStatus}). Please contact store support.`,
    });
    return;
  }

  const updatedOrder = await db.updateOrderStatus(order.id, 'CANCELLED', reason || 'Cancelled by customer');
  res.json({
    success: true,
    data: updatedOrder,
    message: 'Order cancelled successfully and inventory restored.',
  });
}));

// -------------------------------------------------------------
// REVIEWS API (WITH VERIFIED PURCHASE VALIDATION)
// -------------------------------------------------------------
app.get('/api/reviews', asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.query;
  const reviews = await db.getReviews(productId as string);
  res.json({ success: true, data: reviews });
}));

app.post('/api/reviews', asyncHandler(async (req: Request, res: Response) => {
  const { productId, userName, userEmail, rating, title, comment } = req.body;

  if (!productId || !userName || !rating || !title || !comment) {
    res.status(400).json({ success: false, message: 'All review fields are required.' });
    return;
  }

  let isVerifiedPurchase = false;
  if (userEmail) {
    const userOrders = (await db.getOrders()).filter(o => o.customerEmail.toLowerCase() === userEmail.toLowerCase());
    isVerifiedPurchase = userOrders.some(o => o.items.some(i => i.productId === productId));
  }

  const newReview = await db.addReview({
    productId,
    userName,
    userEmail,
    rating: Number(rating),
    title,
    comment,
    isVerifiedPurchase,
    isApproved: true,
  });

  res.status(201).json({
    success: true,
    data: newReview,
    message: 'Thank you for your review! It has been published.',
  });
}));

// -------------------------------------------------------------
// ADMIN PROTECTED ROUTES (Supabase Auth + profiles.role verification)
// -------------------------------------------------------------
app.get('/api/admin/metrics', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getAdminMetrics() });
}));

app.get('/api/admin/products', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const result = await db.getProducts({ status: 'all', pageSize: 60, page: req.query.page ? Number(req.query.page) : 1 });
  res.json({ success: true, data: result.data, total: result.total, page: result.page, pageSize: result.pageSize, hasMore: result.hasMore });
}));

app.post('/api/admin/products', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const newProduct = await db.createProduct(req.body);
  res.status(201).json({ success: true, data: newProduct });
}));

app.put('/api/admin/products/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const updated = await db.updateProduct(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }
  res.json({ success: true, data: updated });
}));

app.delete('/api/admin/products/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const deleted = await db.deleteProduct(req.params.id);
  res.json({ success: deleted, message: deleted ? 'Product archived.' : 'Product not found.' });
}));

// -------------------------------------------------------------
// BULK PRODUCT IMPORT / EXPORT (CSV)
// -------------------------------------------------------------
app.get('/api/admin/products/import/template', requireAdmin, (req: Request, res: Response) => {
  res.setHeader('Content-Disposition', 'attachment; filename="trend-street-product-import-template.csv"');
  res.type('text/csv').send(generateTemplateCsv());
});

app.post('/api/admin/products/import/validate', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { csv, createMissingCategories } = req.body;
  if (!csv || typeof csv !== 'string') {
    res.status(400).json({ success: false, message: 'CSV file content is required.' });
    return;
  }
  const result = await previewImport(csv, { createMissingCategories: Boolean(createMissingCategories) });
  res.json(result);
}));

app.post('/api/admin/products/import/commit', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { csv, createMissingCategories, skipErrorRows } = req.body;
  if (!csv || typeof csv !== 'string') {
    res.status(400).json({ success: false, imported: false, message: 'CSV file content is required.' });
    return;
  }
  const result = await commitImport(csv, {
    createMissingCategories: Boolean(createMissingCategories),
    skipErrorRows: Boolean(skipErrorRows),
  });
  res.json(result);
}));

app.get('/api/admin/products/export', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const csv = await exportProductsToCsv();
  res.setHeader('Content-Disposition', `attachment; filename="trend-street-products-export-${new Date().toISOString().split('T')[0]}.csv"`);
  res.type('text/csv').send(csv);
}));

app.get('/api/admin/orders', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getOrders() });
}));

app.put('/api/admin/orders/:id/status', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body;
  const updatedOrder = await db.updateOrderStatus(req.params.id, status, note);
  if (!updatedOrder) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }
  res.json({ success: true, data: updatedOrder });
}));

app.get('/api/admin/inventory', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const [logs, productsResult] = await Promise.all([db.getInventoryLogs(), db.getProducts({ status: 'all', pageSize: 60 })]);
  res.json({ success: true, logs, products: productsResult.data });
}));

app.post('/api/admin/inventory/adjust', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { variantId, newStock, reason, adminName } = req.body;
  const ok = await db.adjustInventory(variantId, Number(newStock), reason, adminName || 'Admin');
  if (!ok) {
    res.status(404).json({ success: false, message: 'Variant not found.' });
    return;
  }
  res.json({ success: true, message: 'Stock updated successfully.' });
}));

app.get('/api/admin/customers', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await db.getCustomers() });
}));

// -------------------------------------------------------------
// TECHNICAL SEO ROUTES (ROBOTS.TXT & SITEMAP.XML)
// -------------------------------------------------------------
app.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /account\nSitemap: ${baseUrl}/sitemap.xml\n`
  );
});

app.get('/sitemap.xml', asyncHandler(async (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const [products, categories, collections] = await Promise.all([
    db.getAllActiveProductsForSitemap(),
    db.getCategories(),
    db.getCollections(),
  ]);

  const staticUrls = ['', '/shop', '/about', '/contact', '/shipping-policy', '/return-policy', '/privacy-policy', '/terms'];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  staticUrls.forEach(route => {
    xml += `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
  });

  categories.forEach(cat => {
    xml += `  <url>\n    <loc>${baseUrl}/shop/${cat.slug}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  });

  collections.forEach(col => {
    xml += `  <url>\n    <loc>${baseUrl}/collections/${col.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  products.forEach(p => {
    xml += `  <url>\n    <loc>${baseUrl}/product/${p.slug}</loc>\n    <lastmod>${p.updatedAt.split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;

  res.type('application/xml').send(xml);
}));
