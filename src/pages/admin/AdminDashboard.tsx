import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, AlertTriangle, Plus, RefreshCw, LogOut, Trash2, Pencil, ExternalLink, Copy, X, ImagePlus, ArrowUp, ArrowDown,
  Upload, Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { supabase } from '../../lib/supabase.js';
import { Product, Order, InventoryLog, Coupon, Category, AdminProductInput, AdminProductVariantInput, OrderStatus } from '../../types/index.js';
import { ProductImportModal } from './ProductImportModal.js';

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'];
const PRODUCT_STATUSES = ['active', 'draft', 'archived'] as const;

function emptyVariant(): AdminProductVariantInput {
  return { color: '', colorHex: '#18181b', size: 'M', price: 0, compareAtPrice: undefined, stock: 0 };
}

function emptyForm(): AdminProductInput {
  return {
    title: '', slug: '', brand: 'TREND STREET', shortDescription: '', description: '',
    categorySlug: '', subcategory: '', collectionSlug: '', gender: 'men',
    sku: '', basePrice: 0, compareAtPrice: undefined, discountPercentage: 0,
    status: 'active', tags: [], productType: '', material: '', fit: '', careInstructions: '',
    weightGrams: 350, videoUrl: '', seoTitle: '', seoDescription: '',
    isFeatured: false, isNewArrival: false, isBestSeller: false, isTrending: false,
    images: [], variants: [emptyVariant()],
  };
}

function productToFormData(p: Product): AdminProductInput {
  return {
    title: p.title, slug: p.slug, brand: p.brand, shortDescription: p.shortDescription, description: p.description,
    categorySlug: p.category, subcategory: p.subcategory, collectionSlug: p.collection, gender: p.gender,
    sku: p.sku, basePrice: p.basePrice, compareAtPrice: p.compareAtPrice, discountPercentage: p.discountPercentage,
    status: p.status, tags: p.tags, productType: p.productType, material: p.material, fit: p.fit,
    careInstructions: p.careInstructions, weightGrams: p.weightGrams, videoUrl: p.videoUrl,
    seoTitle: p.seoTitle, seoDescription: p.seoDescription,
    isFeatured: p.isFeatured, isNewArrival: p.isNewArrival, isBestSeller: p.isBestSeller, isTrending: p.isTrending,
    images: p.images.map(i => ({ id: i.id, url: i.url, altText: i.altText, isPrimary: i.isPrimary, color: i.color })),
    variants: p.variants.map(v => ({ id: v.id, color: v.color, colorHex: v.colorHex, size: v.size, price: v.price, compareAtPrice: v.compareAtPrice, stock: v.stock })),
  };
}

export const AdminDashboard: React.FC = () => {
  const { adminToken, adminLogout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'products' | 'coupons' | 'customers'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjust Modal State
  const [adjustModalVariant, setAdjustModalVariant] = useState<{ id: string; title: string; sku: string; stock: number } | null>(null);
  const [newStockInput, setNewStockInput] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Physical stock arrival from Mainpuri workshop');

  // Product Modal State (shared by create + edit)
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminProductInput>(emptyForm());
  const [tagsInput, setTagsInput] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState('');

  // Product list filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Lock background scroll while a full-screen (mobile) modal is open
  useEffect(() => {
    const anyModalOpen = Boolean(productModalMode) || Boolean(adjustModalVariant) || isImportModalOpen;
    if (!anyModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [productModalMode, adjustModalVariant, isImportModalOpen]);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken || ''}`,
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
      const [mRes, oRes, pRes, cRes, custRes, invRes, catRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers: authHeaders }),
        fetch('/api/admin/orders', { headers: authHeaders }),
        fetch('/api/admin/products', { headers: authHeaders }),
        fetch('/api/coupons'),
        fetch('/api/admin/customers', { headers: authHeaders }),
        fetch('/api/admin/inventory', { headers: authHeaders }),
        fetch('/api/categories'),
      ]);

      const [mData, oData, pData, cData, custData, invData, catData] = await Promise.all([
        mRes.json(), oRes.json(), pRes.json(), cRes.json(), custRes.json(), invRes.json(), catRes.json(),
      ]);

      if (mData.success) setMetrics(mData.data);
      if (oData.success) setOrders(oData.data);
      if (pData.success) setProducts(pData.data);
      if (cData.success) setCoupons(cData.data);
      if (custData.success) setCustomers(custData.data);
      if (invData.success) setInventoryLogs(invData.logs || []);
      if (catData.success) setCategories(catData.data);
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
      } else {
        alert(data.message || 'Failed to update order status');
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
      } else {
        alert(data.message || 'Failed to adjust stock');
      }
    } catch {
      alert('Failed to adjust stock');
    }
  };

  // -----------------------------------------------------------
  // PRODUCT FORM
  // -----------------------------------------------------------
  const openCreateModal = () => {
    setFormData(emptyForm());
    setTagsInput('');
    setEditingProductId(null);
    setProductFormError('');
    setProductModalMode('create');
  };

  const openEditModal = (product: Product) => {
    const fd = productToFormData(product);
    setFormData(fd);
    setTagsInput((fd.tags || []).join(', '));
    setEditingProductId(product.id);
    setProductFormError('');
    setProductModalMode('edit');
  };

  const openDuplicateModal = (product: Product) => {
    const fd = productToFormData(product);
    fd.title = `${fd.title} (Copy)`;
    fd.slug = '';
    fd.sku = `${fd.sku}-COPY`;
    fd.images = fd.images.map(img => ({ ...img, id: undefined }));
    fd.variants = fd.variants.map(v => ({ ...v, id: undefined }));
    setFormData(fd);
    setTagsInput((fd.tags || []).join(', '));
    setEditingProductId(null);
    setProductFormError('');
    setProductModalMode('create');
  };

  const closeProductModal = () => {
    setProductModalMode(null);
    setEditingProductId(null);
  };

  // Images are a single flat array (formData.images), tagged per-item with an
  // optional `color`. `undefined` color = the default/fallback group (used as
  // the catalog thumbnail and shown when a color has no images of its own).
  // These handlers all operate on GLOBAL array indices but are scoped to a
  // single color group's items when called from that group's UI section.
  const handleImageFiles = async (files: FileList | null, color?: string) => {
    if (!files || !files.length) return;
    setIsUploadingImages(true);
    try {
      const uploaded: AdminProductInput['images'] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) {
          alert(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }
        const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
        uploaded.push({ url: pub.publicUrl, altText: file.name.replace(/\.[^.]+$/, ''), isPrimary: false, color });
      }
      setFormData(prev => {
        const combined = [...prev.images, ...uploaded];
        // Primary only ever applies within the default (no-color) group.
        let defaultSeen = false;
        const images = combined.map(img => {
          if (!img.color) {
            const isPrimary = !defaultSeen;
            defaultSeen = true;
            return { ...img, isPrimary };
          }
          return { ...img, isPrimary: false };
        });
        return { ...prev, images };
      });
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (idx: number) => {
    setFormData(prev => {
      const removed = prev.images[idx];
      const images = prev.images.filter((_, i) => i !== idx);
      if (!removed?.color) {
        const stillHasDefaultPrimary = images.some(i => !i.color && i.isPrimary);
        if (!stillHasDefaultPrimary) {
          const firstDefaultIdx = images.findIndex(i => !i.color);
          if (firstDefaultIdx !== -1) images[firstDefaultIdx] = { ...images[firstDefaultIdx], isPrimary: true };
        }
      }
      return { ...prev, images };
    });
  };

  const setPrimaryImage = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => (img.color ? img : { ...img, isPrimary: i === idx })),
    }));
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    setFormData(prev => {
      const images = [...prev.images];
      const groupColor = images[idx]?.color;
      const groupIndices = images.reduce<number[]>((acc, img, i) => {
        if ((img.color || undefined) === (groupColor || undefined)) acc.push(i);
        return acc;
      }, []);
      const posInGroup = groupIndices.indexOf(idx);
      const swapPos = posInGroup + dir;
      if (swapPos < 0 || swapPos >= groupIndices.length) return prev;
      const swapIdx = groupIndices[swapPos];
      [images[idx], images[swapIdx]] = [images[swapIdx], images[idx]];
      return { ...prev, images };
    });
  };

  const renderImageGroup = (color: string | undefined, label: string, hint?: string) => {
    const items = formData.images
      .map((img, idx) => ({ img, idx }))
      .filter(({ img }) => (img.color || undefined) === (color || undefined));
    return (
      <div key={color || 'default'} className="space-y-2">
        <div className="flex items-center gap-2">
          {color && <span className="w-3 h-3 rounded-full border border-zinc-700 shrink-0" style={{ backgroundColor: formData.variants.find(v => v.color === color)?.colorHex || '#71717a' }} />}
          <label className="block text-zinc-400 font-bold uppercase tracking-wider">{label}</label>
        </div>
        {hint && <p className="text-zinc-500 text-[11px]">{hint}</p>}
        <div className="flex flex-wrap gap-3">
          {items.map(({ img, idx }) => (
            <div key={idx} className="relative w-24 h-32 bg-zinc-950 border border-zinc-800 group">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {img.isPrimary && !img.color && <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-white text-zinc-950 text-[9px] font-bold uppercase">Primary</span>}
              <div className="absolute inset-x-0 bottom-0 bg-black/80 flex items-center justify-center gap-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => moveImage(idx, -1)} className="text-white p-0.5"><ArrowUp className="w-3 h-3" /></button>
                <button type="button" onClick={() => moveImage(idx, 1)} className="text-white p-0.5"><ArrowDown className="w-3 h-3" /></button>
                {!color && <button type="button" onClick={() => setPrimaryImage(idx)} className="text-white p-0.5 text-[9px] font-bold">★</button>}
                <button type="button" onClick={() => removeImage(idx)} className="text-rose-400 p-0.5"><X className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
          <label className="w-24 h-32 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-white hover:border-zinc-500 cursor-pointer transition-colors">
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px] text-center px-1">{isUploadingImages ? 'Uploading...' : 'Add Images'}</span>
            <input type="file" accept="image/*" multiple hidden disabled={isUploadingImages} onChange={e => handleImageFiles(e.target.files, color)} />
          </label>
        </div>
      </div>
    );
  };

  const updateVariant = (idx: number, patch: Partial<AdminProductVariantInput>) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)) }));
  };

  const addVariantRow = () => {
    setFormData(prev => ({ ...prev, variants: [...prev.variants, emptyVariant()] }));
  };

  const removeVariantRow = (idx: number) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');

    if (!formData.categorySlug) {
      setProductFormError('Please select a category.');
      return;
    }
    if (!formData.images.length) {
      setProductFormError('Add at least one product image.');
      return;
    }
    if (!formData.variants.length || formData.variants.some(v => !v.color || !v.size)) {
      setProductFormError('Every variant needs a color and a size.');
      return;
    }

    const payload: AdminProductInput = {
      ...formData,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    };

    setIsSavingProduct(true);
    try {
      const url = productModalMode === 'edit' && editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products';
      const method = productModalMode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        closeProductModal();
        loadAdminData();
      } else {
        setProductFormError(data.message || 'Failed to save product.');
      }
    } catch {
      setProductFormError('Failed to save product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleArchiveProduct = async (productId: string) => {
    if (!confirm('Archive this garment? It will be hidden from the storefront but kept in records.')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) loadAdminData();
      else alert(data.message || 'Failed to archive product');
    } catch {
      alert('Failed to archive product');
    }
  };

  const handleExportProducts = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/admin/products/export', { headers: authHeaders });
      if (!res.ok) {
        alert('Failed to export products.');
        return;
      }
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trend-street-products-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export products.');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (productStatusFilter !== 'all' && p.status !== productStatusFilter) return false;
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (productSearch && !`${p.title} ${p.sku}`.toLowerCase().includes(productSearch.toLowerCase())) return false;
    return true;
  });

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
              {metrics.pendingOrdersCount}
            </p>
            <p className="text-[11px] text-zinc-400">Ready for dispatch</p>
          </div>

          <div className="bg-[#121215] border border-zinc-800 p-5 space-y-2">
            <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">Low Stock Warnings</p>
            <p className={`font-display font-black text-2xl sm:text-3xl ${metrics.lowStockCount > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {metrics.lowStockCount}
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
                        {ORDER_STATUSES.map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
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
                {orders.length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-zinc-500">No orders yet.</td></tr>
                )}
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
              {inventoryLogs.length === 0 && <p className="text-zinc-500 py-2">No stock movement yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* TAB: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              Garments & Catalog Management
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportProducts}
                disabled={isExporting}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold uppercase tracking-wider hover:border-zinc-600 transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold uppercase tracking-wider hover:border-zinc-600 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Import Products</span>
              </button>
              <button
                onClick={openCreateModal}
                className="px-4 py-2.5 bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Garment</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              placeholder="Search by title or SKU..."
              className="flex-1 bg-zinc-950 border border-zinc-700 px-3 py-2 text-white text-xs placeholder-zinc-600"
            />
            <select
              value={productCategoryFilter}
              onChange={e => setProductCategoryFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 px-3 py-2 text-white text-xs"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <select
              value={productStatusFilter}
              onChange={e => setProductStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 px-3 py-2 text-white text-xs"
            >
              <option value="all">All Statuses</option>
              {PRODUCT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-[#121215] border border-zinc-800 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider">
                  <th className="p-3 font-semibold">Image</th>
                  <th className="p-3 font-semibold">Product</th>
                  <th className="p-3 font-semibold">SKU</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Price</th>
                  <th className="p-3 font-semibold">Inventory</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Featured</th>
                  <th className="p-3 font-semibold">Created</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredProducts.map(prod => {
                  const stockTotal = prod.variants.reduce((s, v) => s + v.stock, 0);
                  return (
                    <tr key={prod.id} className="hover:bg-zinc-900/40">
                      <td className="p-3">
                        <div className="w-12 h-16 bg-zinc-950 overflow-hidden">
                          {prod.images[0] && <img src={prod.images[0].url} alt="" className="w-full h-full object-cover" />}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-white max-w-[220px]">
                        <span className="line-clamp-2">{prod.title}</span>
                      </td>
                      <td className="p-3 font-mono text-zinc-400">{prod.sku}</td>
                      <td className="p-3 capitalize">{prod.category}</td>
                      <td className="p-3 font-bold text-white whitespace-nowrap">₹{prod.basePrice.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className={stockTotal === 0 ? 'text-rose-400 font-bold' : stockTotal <= 10 ? 'text-amber-400 font-bold' : 'text-white'}>
                          {stockTotal} units
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border rounded ${
                          prod.status === 'active' ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : prod.status === 'draft' ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                        }`}>
                          {prod.status}
                        </span>
                      </td>
                      <td className="p-3">{prod.isFeatured ? '★' : ''}</td>
                      <td className="p-3 whitespace-nowrap text-zinc-400">{new Date(prod.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(prod)} title="Edit" className="p-1.5 bg-zinc-800 hover:bg-white hover:text-zinc-950 text-zinc-300 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <a href={`/product/${prod.slug}`} target="_blank" rel="noreferrer" title="View live" className="p-1.5 bg-zinc-800 hover:bg-white hover:text-zinc-950 text-zinc-300 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button onClick={() => openDuplicateModal(prod)} title="Duplicate" className="p-1.5 bg-zinc-800 hover:bg-white hover:text-zinc-950 text-zinc-300 transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleArchiveProduct(prod.id)} title="Archive" className="p-1.5 bg-zinc-800 hover:bg-rose-600 hover:text-white text-rose-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={10} className="p-8 text-center text-zinc-500">No garments match these filters.</td></tr>
                )}
              </tbody>
            </table>
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
                    <td className="p-4 font-bold text-white">{c.ordersCount}</td>
                    <td className="p-4 font-display font-bold text-white">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No customers yet.</td></tr>
                )}
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

      {/* Create / Edit Product Modal */}
      {productModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-[#121215] border-0 sm:border sm:border-zinc-800 w-full h-full sm:h-auto sm:w-[92vw] sm:max-w-[960px] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky header */}
            <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800">
              <h3 className="font-display font-bold text-base text-white uppercase">
                {productModalMode === 'edit' ? 'Edit Garment' : 'Add New Garment'}
              </h3>
              <button onClick={closeProductModal} className="text-zinc-500 hover:text-white p-1 -mr-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-5 text-base sm:text-xs">
            {productFormError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{productFormError}</span>
              </div>
            )}

            <form id="admin-product-form" onSubmit={handleSaveProduct} className="space-y-5">
              {/* Core fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Garment Title *</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Slug (auto if blank)</label>
                  <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">SKU *</label>
                  <input required type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white font-mono" />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Category *</label>
                  <select required value={formData.categorySlug} onChange={e => setFormData({ ...formData, categorySlug: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white">
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Subcategory</label>
                  <input type="text" value={formData.subcategory || ''} onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g. Oversized" className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Gender *</label>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white">
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Brand</label>
                  <input type="text" value={formData.brand || ''} onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Base Price (INR) *</label>
                  <input required type="number" min={0} value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Compare-At Price (INR)</label>
                  <input type="number" min={0} value={formData.compareAtPrice ?? ''} onChange={e => setFormData({ ...formData, compareAtPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white font-mono" />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Product Type</label>
                  <input type="text" value={formData.productType || ''} onChange={e => setFormData({ ...formData, productType: e.target.value })}
                    placeholder="e.g. Oversized T-Shirt" className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Fit</label>
                  <input type="text" value={formData.fit || ''} onChange={e => setFormData({ ...formData, fit: e.target.value })}
                    placeholder="Oversized / Relaxed / Regular / Slim / Boxy" className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Material</label>
                  <input type="text" value={formData.material || ''} onChange={e => setFormData({ ...formData, material: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Weight (grams)</label>
                  <input type="number" min={0} value={formData.weightGrams ?? 350} onChange={e => setFormData({ ...formData, weightGrams: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white font-mono" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Short Description</label>
                  <input type="text" value={formData.shortDescription || ''} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Full Description *</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Care Instructions</label>
                  <input type="text" value={formData.careInstructions || ''} onChange={e => setFormData({ ...formData, careInstructions: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Tags (comma separated)</label>
                  <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                    placeholder="Oversized, Streetwear, Best Seller" className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white" />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white">
                    {PRODUCT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-4 flex-wrap pb-1">
                  {([
                    ['isFeatured', 'Featured'],
                    ['isNewArrival', 'New Arrival'],
                    ['isBestSeller', 'Best Seller'],
                    ['isTrending', 'Trending'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-1.5 text-zinc-300">
                      <input type="checkbox" checked={Boolean((formData as any)[key])} onChange={e => setFormData({ ...formData, [key]: e.target.checked })} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                {renderImageGroup(undefined, 'Default / Fallback Images *', "Used as the catalog thumbnail, and shown for any color below that doesn't have its own images.")}
              </div>

              {Array.from(new Set(formData.variants.map(v => v.color).filter(Boolean))).length > 0 && (
                <div className="space-y-4 pt-2 border-t border-zinc-800">
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider">Color-Specific Images (optional)</label>
                  <p className="text-zinc-500 text-[11px] -mt-2">
                    Add images for a specific color and the storefront gallery switches to them the instant that color is selected.
                  </p>
                  {Array.from(new Set(formData.variants.map(v => v.color).filter(Boolean))).map(color =>
                    renderImageGroup(color, color)
                  )}
                </div>
              )}

              {/* Variants */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider">Variants (Size / Color / Stock) *</label>
                  <button type="button" onClick={addVariantRow} className="px-2.5 py-1 bg-zinc-800 hover:bg-white hover:text-zinc-950 text-zinc-200 font-bold uppercase flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Variant
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="flex flex-wrap sm:grid sm:grid-cols-7 gap-2 items-center bg-zinc-950 border border-zinc-800 p-2">
                      <input type="text" placeholder="Color" value={v.color} onChange={e => updateVariant(idx, { color: e.target.value })}
                        className="flex-1 min-w-[110px] sm:min-w-0 sm:col-span-2 bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-white" />
                      <input type="color" value={v.colorHex} onChange={e => updateVariant(idx, { colorHex: e.target.value })}
                        className="w-12 h-9 sm:w-full sm:h-8 shrink-0 bg-zinc-900 border border-zinc-700" />
                      <select value={v.size} onChange={e => updateVariant(idx, { size: e.target.value })} className="flex-1 min-w-[72px] sm:min-w-0 bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-white">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input type="number" min={0} placeholder="Price" value={v.price} onChange={e => updateVariant(idx, { price: Number(e.target.value) })}
                        className="flex-1 min-w-[90px] sm:min-w-0 bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-white font-mono" />
                      <input type="number" min={0} placeholder="Stock" value={v.stock} onChange={e => updateVariant(idx, { stock: Number(e.target.value) })}
                        className="flex-1 min-w-[90px] sm:min-w-0 bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-white font-mono" />
                      <button type="button" onClick={() => removeVariantRow(idx)} className="shrink-0 text-rose-400 hover:text-rose-300 sm:justify-self-end p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </form>
            </div>

            {/* Sticky footer actions */}
            <div className="shrink-0 flex gap-3 px-4 sm:px-6 py-4 border-t border-zinc-800 text-sm sm:text-xs">
              <button type="submit" form="admin-product-form" disabled={isSavingProduct} className="flex-1 py-3 bg-white text-zinc-950 font-bold uppercase tracking-wider disabled:opacity-50">
                {isSavingProduct ? 'Saving...' : productModalMode === 'edit' ? 'Save Changes' : 'Publish Garment'}
              </button>
              <button type="button" onClick={closeProductModal} className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase tracking-wider">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <ProductImportModal
          adminToken={adminToken}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={loadAdminData}
        />
      )}
    </div>
  );
};
