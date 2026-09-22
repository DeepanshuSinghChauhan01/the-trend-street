import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle, Users, Tag,
  Plus, Search, RefreshCw, CheckCircle2, Truck, Eye, LogOut, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Product, Order, InventoryLog, Customer, Coupon } from '../../types/index.js';

export const AdminDashboard: React.FC = () => {
  const { adminToken, adminLogout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'products' | 'coupons' | 'customers'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjust Modal State
  const [adjustModalVariant, setAdjustModalVariant] = useState<{ id: string; title: string; sku: string; stock: number } | null>(null);
  const [newStockInput, setNewStockInput] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Physical stock arrival from Mainpuri workshop');

  // New Product Modal State
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    title: '',
    slug: '',
    category: 't-shirts',
    basePrice: 1499,
    compareAtPrice: 2299,
    material: '100% Ring-Spun Cotton (240 GSM)',
    fit: 'Oversized Boxy Silhouette',
    shortDescription: 'Heavyweight streetwear essential with double-needle collar.',
    description: 'Constructed for structural drape and daily durability.',
    careInstructions: 'Machine wash cold, air dry in shade.',
    primaryImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    stock: 25,
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken || 'trendstreet_admin_2026_secure'}`,
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    loadAdminData();
  }, [isAdmin, adminToken]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [mRes, oRes, pRes, cRes, custRes, invRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers: authHeaders }),
        fetch('/api/admin/orders', { headers: authHeaders }),
        fetch('/api/admin/products', { headers: authHeaders }),
        fetch('/api/coupons'),
        fetch('/api/admin/customers', { headers: authHeaders }),
        fetch('/api/admin/inventory', { headers: authHeaders }),
      ]);

      const [mData, oData, pData, cData, custData, invData] = await Promise.all([
        mRes.json(),
        oRes.json(),
        pRes.json(),
        cRes.json(),
        custRes.json(),
        invRes.json(),
      ]);

      if (mData.success) setMetrics(mData.data);
      if (oData.success) setOrders(oData.data);
      if (pData.success) setProducts(pData.data);
      if (cData.success) setCoupons(cData.data);
      if (custData.success) setCustomers(custData.data);
      if (invData.success) setInventoryLogs(invData.logs || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus, note: `Status updated to ${newStatus} by Admin` }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => (o.id === orderId ? data.data : o)));
        loadAdminData();
      }
    } catch {
      alert('Failed to update order status');
    }
  };

  const handleSaveStockAdjust = async () => {
    if (!adjustModalVariant) return;
    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          variantId: adjustModalVariant.id,
          newStock: newStockInput,
          reason: adjustReason,
          adminName: 'TREND STREET Admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdjustModalVariant(null);
        loadAdminData();
      }
    } catch {
      alert('Failed to adjust stock');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newProductData.title,
        slug: newProductData.slug || newProductData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand: 'TREND STREET',
        category: newProductData.category,
        collections: ['raw-minimal'],
        basePrice: Number(newProductData.basePrice),
        compareAtPrice: Number(newProductData.compareAtPrice),
        material: newProductData.material,
        fit: newProductData.fit,
        careInstructions: newProductData.careInstructions,
        shortDescription: newProductData.shortDescription,
        description: newProductData.description,
        images: [{ id: `img-${Date.now()}`, url: newProductData.primaryImage, alt: newProductData.title, isPrimary: true, sortOrder: 0 }],
        tags: [newProductData.category, 'streetwear'],
        isNewArrival: true,
        isBestSeller: false,
        isTrending: false,
        isActive: true,
        variants: [
          {
            id: `var-${Date.now()}-s`,
            sku: `TS-${newProductData.category.slice(0, 3).toUpperCase()}-S-${Date.now().toString().slice(-4)}`,
            title: `${newProductData.title} - S`,
            color: 'Vintage Black',
            colorHex: '#18181b',
            size: 'S',
            stock: Math.floor(newProductData.stock / 3),
            price: Number(newProductData.basePrice),
            compareAtPrice: Number(newProductData.compareAtPrice),
          },
          {
            id: `var-${Date.now()}-m`,
            sku: `TS-${newProductData.category.slice(0, 3).toUpperCase()}-M-${Date.now().toString().slice(-4)}`,
            title: `${newProductData.title} - M`,
            color: 'Vintage Black',
            colorHex: '#18181b',
            size: 'M',
            stock: Math.floor(newProductData.stock / 3),
            price: Number(newProductData.basePrice),
            compareAtPrice: Number(newProductData.compareAtPrice),
          },
          {
            id: `var-${Date.now()}-l`,
            sku: `TS-${newProductData.category.slice(0, 3).toUpperCase()}-L-${Date.now().toString().slice(-4)}`,
            title: `${newProductData.title} - L`,
            color: 'Vintage Black',
            colorHex: '#18181b',
            size: 'L',
            stock: Math.floor(newProductData.stock / 3),
            price: Number(newProductData.basePrice),
            compareAtPrice: Number(newProductData.compareAtPrice),
          },
        ],
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsNewProductOpen(false);
        loadAdminData();
      }
    } catch {
      alert('Failed to create product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this garment?')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Top Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">ADMIN CONTROL CENTER</span>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded">
              ONLINE
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight mt-1">
            TREND STREET MAINPURI HQ
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              adminLogout();
              navigate('/admin/login');
            }}
            className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121215] border border-zinc-800 p-5 space-y-2">
            <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">Total Store Revenue</p>
            <p className="font-display font-black text-2xl sm:text-3xl text-white">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold">From {metrics.totalOrders} total orders</p>
          </div>

          <div className="bg-[#121215] border border-zinc-800 p-5 space-y-2">
            <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">Pending Fulfillment</p>
            <p className="font-display font-black text-2xl sm:text-3xl text-amber-400">
              {metrics.pendingOrders}
            </p>
            <p className="text-[11px] text-zinc-400">Ready for dispatch</p>
          </div>

          <div className="bg-[#121215] border border-zinc-800 p-5 space-y-2">
            <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">Low Stock Warnings</p>
            <p className={`font-display font-black text-2xl sm:text-3xl ${metrics.lowStockVariantsCount > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {metrics.lowStockVariantsCount}
            </p>
            <p className="text-[11px] text-zinc-400">Variants &le; 5 units</p>
          </div>

          <div className="bg-[#121215] border border-zinc-800 p-5 space-y-2">
            <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">Active Garments</p>
            <p className="font-display font-black text-2xl sm:text-3xl text-white">
              {metrics.totalProducts}
            </p>
            <p className="text-[11px] text-zinc-400">Published in catalog</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Dispatches' },
          { id: 'orders', label: `Orders (${orders.length})` },
          { id: 'inventory', label: 'Live Stock & Restock' },
          { id: 'products', label: `Products (${products.length})` },
          { id: 'coupons', label: 'Coupons' },
          { id: 'customers', label: `Customers (${customers.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider shrink-0 transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: ORDERS MANAGEMENT */}
      {(activeTab === 'orders' || activeTab === 'overview') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              Customer Orders & Shipments
            </h3>
          </div>

          <div className="bg-[#121215] border border-zinc-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Destination (UP / India)</th>
                  <th className="p-4 font-semibold">Payment</th>
                  <th className="p-4 font-semibold">Items</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                      {order.orderNumber}
                      <span className="block text-[10px] text-zinc-500 font-sans">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white">{order.customerName}</p>
                      <p className="text-zinc-400 text-[11px]">{order.customerPhone}</p>
                      <p className="text-zinc-500 text-[10px]">{order.customerEmail}</p>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="line-clamp-1">{order.shippingAddress.addressLine1}</p>
                      <p className="text-zinc-400 text-[11px] font-semibold">
                        {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-semibold text-white">{order.paymentMethod}</span>
                      <span className={`block text-[10px] font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white">{order.items.length} items</span>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        {order.items.map(i => `${i.title} (${i.size})`).join(', ')}
                      </p>
                    </td>
                    <td className="p-4 font-display font-bold text-white whitespace-nowrap">
                      ₹{order.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <select
                        value={order.orderStatus}
                        onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 text-xs font-bold text-white py-1 px-2 uppercase rounded focus:outline-none focus:border-white"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=Hello%20${order.customerName}%2C%20update%20regarding%20your%20Trend%20Street%20Order%20${order.orderNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 text-[11px] font-semibold rounded inline-block"
                      >
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: INVENTORY CONTROLLER */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                Variant-Level Inventory Manager
              </h3>
              <p className="text-xs text-zinc-400">
                Update stock counts directly with reasons. Deductions automatically occur when orders are placed.
              </p>
            </div>
          </div>

          <div className="bg-[#121215] border border-zinc-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider">
                  <th className="p-4 font-semibold">SKU</th>
                  <th className="p-4 font-semibold">Garment Title</th>
                  <th className="p-4 font-semibold">Color & Size</th>
                  <th className="p-4 font-semibold">Price (INR)</th>
                  <th className="p-4 font-semibold">Units in Stock</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {products.flatMap(p =>
                  p.variants.map(v => (
                    <tr key={v.id} className="hover:bg-zinc-900/40">
                      <td className="p-4 font-mono font-bold text-white">{v.sku}</td>
                      <td className="p-4 font-semibold text-white">{p.title}</td>
                      <td className="p-4">
                        <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 border border-zinc-700" style={{ backgroundColor: v.colorHex }} />
                        {v.color} • <strong className="text-white">{v.size}</strong>
                      </td>
                      <td className="p-4 font-bold text-white">₹{v.price.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-display font-black text-sm text-white">{v.stock}</td>
                      <td className="p-4">
                        {v.stock === 0 ? (
                          <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold uppercase">
                            Out of Stock
                          </span>
                        ) : v.stock <= 5 ? (
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold uppercase">
                            Low Stock ({v.stock})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase">
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setAdjustModalVariant({ id: v.id, title: p.title, sku: v.sku, stock: v.stock });
                            setNewStockInput(v.stock);
                          }}
                          className="px-3 py-1 bg-zinc-800 hover:bg-white hover:text-zinc-950 text-zinc-200 text-[11px] font-bold uppercase transition-colors"
                        >
                          Change Stock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Audit Logs */}
          <div className="pt-6">
            <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-400 mb-3">Recent Stock Movement Logs</h4>
            <div className="bg-[#121215] border border-zinc-800 p-4 divide-y divide-zinc-800/80 max-h-60 overflow-y-auto text-xs">
              {inventoryLogs.map(log => (
                <div key={log.id} className="py-2 flex justify-between items-center text-zinc-400">
                  <div>
                    <span className="font-bold text-white font-mono">{log.variantTitle}</span>: Changed from {log.oldStock} to {log.newStock} ({log.change > 0 ? `+${log.change}` : log.change})
                    <p className="text-[11px] text-zinc-500">{log.reason} • By {log.admin}</p>
                  </div>
                  <span className="text-[11px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              Garments & Catalog Management
            </h3>
            <button
              onClick={() => setIsNewProductOpen(true)}
              className="px-4 py-2.5 bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Garment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(prod => (
              <div key={prod.id} className="bg-[#121215] border border-zinc-800 p-4 space-y-3">
                <div className="aspect-[3/4] bg-zinc-950 overflow-hidden">
                  <img src={prod.images[0]?.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{prod.category}</span>
                  <h4 className="font-bold text-white text-sm line-clamp-1">{prod.title}</h4>
                  <p className="text-white font-display font-bold text-sm mt-1">₹{prod.basePrice.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-xs">
                  <span className="text-zinc-400">{prod.variants.reduce((s, v) => s + v.stock, 0)} units total</span>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
            Active Discount Coupons
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map(coupon => (
              <div key={coupon.id} className="bg-[#121215] border border-zinc-800 p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-base text-amber-400 tracking-wider bg-amber-950/40 border border-amber-800/80 px-2.5 py-1">
                    {coupon.code}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold uppercase">ACTIVE</span>
                </div>
                <div className="text-xs space-y-1 text-zinc-400">
                  <p>Discount: <strong className="text-white">{coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}</strong></p>
                  <p>Minimum Order: <strong className="text-white">₹{coupon.minimumOrder}</strong></p>
                  <p>Times Used: <strong className="text-white">{coupon.usedCount} times</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
            Client Directory ({customers.length})
          </h3>
          <div className="bg-[#121215] border border-zinc-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Mobile</th>
                  <th className="p-4 font-semibold">City / State</th>
                  <th className="p-4 font-semibold">Orders Count</th>
                  <th className="p-4 font-semibold">Lifetime Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-900/40">
                    <td className="p-4 font-bold text-white">{c.name}</td>
                    <td className="p-4 text-zinc-400">{c.email}</td>
                    <td className="p-4 font-mono">{c.phone}</td>
                    <td className="p-4">{c.city}, {c.state}</td>
                    <td className="p-4 font-bold text-white">{c.ordersCount}</td>
                    <td className="p-4 font-display font-bold text-white">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustModalVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-zinc-800 max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-display font-bold text-base text-white uppercase">
              Adjust Stock for SKU: {adjustModalVariant.sku}
            </h3>
            <p className="text-zinc-400">{adjustModalVariant.title}</p>

            <div>
              <label className="block text-zinc-400 mb-1">New Total Stock Units</label>
              <input
                type="number"
                min={0}
                value={newStockInput}
                onChange={e => setNewStockInput(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Reason for Adjustment</label>
              <select
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
              >
                <option value="Physical stock arrival from Mainpuri workshop">Physical stock arrival from Mainpuri workshop</option>
                <option value="Stock audit correction">Stock audit correction</option>
                <option value="Damaged pieces written off">Damaged pieces written off</option>
                <option value="Returned item inspected and restocked">Returned item inspected and restocked</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveStockAdjust}
                className="flex-1 py-2.5 bg-white text-zinc-950 font-bold uppercase tracking-wider"
              >
                Save Stock Update
              </button>
              <button
                onClick={() => setAdjustModalVariant(null)}
                className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isNewProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#121215] border border-zinc-800 max-w-2xl w-full p-6 space-y-4 text-xs my-auto">
            <h3 className="font-display font-bold text-base text-white uppercase">Add New Garment to Catalog</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Garment Title</label>
                  <input
                    type="text"
                    required
                    value={newProductData.title}
                    onChange={e => setNewProductData({ ...newProductData, title: e.target.value })}
                    placeholder="e.g. Heavyweight Mineral Wash Tee"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={newProductData.category}
                    onChange={e => setNewProductData({ ...newProductData, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  >
                    <option value="t-shirts">T-Shirts</option>
                    <option value="shirts">Shirts</option>
                    <option value="jeans">Jeans & Denim</option>
                    <option value="trousers">Trousers</option>
                    <option value="jackets">Jackets</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="polos">Polos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Base Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newProductData.basePrice}
                    onChange={e => setNewProductData({ ...newProductData, basePrice: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Compare-At Price (INR)</label>
                  <input
                    type="number"
                    value={newProductData.compareAtPrice}
                    onChange={e => setNewProductData({ ...newProductData, compareAtPrice: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Fabric & GSM</label>
                  <input
                    type="text"
                    value={newProductData.material}
                    onChange={e => setNewProductData({ ...newProductData, material: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    value={newProductData.stock}
                    onChange={e => setNewProductData({ ...newProductData, stock: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">High-Res Image URL</label>
                  <input
                    type="url"
                    required
                    value={newProductData.primaryImage}
                    onChange={e => setNewProductData({ ...newProductData, primaryImage: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white text-zinc-950 font-bold uppercase tracking-wider"
                >
                  Publish Garment
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
