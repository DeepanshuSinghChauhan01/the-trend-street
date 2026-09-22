import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import { QuickViewModal } from '../components/QuickViewModal.js';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filters state from URL or defaults
  const categoryFilter = searchParams.get('category') || '';
  const sortFilter = searchParams.get('sort') || 'newest';
  const sizeFilter = searchParams.get('size') || '';
  const fitFilter = searchParams.get('fit') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const categories = [
    { id: '', label: 'All Garments' },
    { id: 't-shirts', label: 'T-Shirts' },
    { id: 'shirts', label: 'Shirts' },
    { id: 'jeans', label: 'Jeans & Denim' },
    { id: 'trousers', label: 'Pleated Trousers' },
    { id: 'jackets', label: 'Jackets & Outerwear' },
    { id: 'hoodies', label: 'Hoodies & Sweats' },
    { id: 'polos', label: 'Knit Polos' },
  ];

  const fits = ['Oversized', 'Relaxed Fit', 'Wide-Leg', 'Tailored Straight', 'Boxy Drop-Shoulder'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const priceRanges = [
    { label: 'Under ₹1,500', min: 0, max: 1499 },
    { label: '₹1,500 – ₹2,500', min: 1500, max: 2500 },
    { label: '₹2,500 – ₹4,000', min: 2500, max: 4000 },
    { label: 'Above ₹4,000', min: 4000, max: 10000 },
  ];

  useEffect(() => {
    async function fetchFilteredProducts() {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        if (categoryFilter) query.set('category', categoryFilter);
        if (sortFilter) query.set('sort', sortFilter);
        if (sizeFilter) query.set('size', sizeFilter);
        if (fitFilter) query.set('fit', fitFilter);
        if (minPrice) query.set('minPrice', minPrice);
        if (maxPrice) query.set('maxPrice', maxPrice);

        const res = await fetch(`/api/products?${query.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFilteredProducts();
  }, [categoryFilter, sortFilter, sizeFilter, fitFilter, minPrice, maxPrice]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = [categoryFilter, sizeFilter, fitFilter, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="mb-8 border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            MEN'S STREETWEAR & TAILORING
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight mt-1">
            ALL COLLECTIONS
          </h1>
        </div>

        {/* Sort & Mobile Filter Controls */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-filter-open-btn"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          <div className="relative flex items-center">
            <span className="hidden sm:inline text-xs text-zinc-500 uppercase tracking-wider mr-2 font-semibold">Sort By:</span>
            <select
              id="catalog-sort-select"
              value={sortFilter}
              onChange={e => updateParam('sort', e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold py-2.5 px-3 uppercase tracking-wider focus:outline-none focus:border-zinc-500 cursor-pointer"
            >
              <option value="newest">Newest Drops</option>
              <option value="best-selling">Bestsellers</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500">Active:</span>
          {categoryFilter && (
            <button
              onClick={() => updateParam('category', '')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 text-white text-xs rounded-none"
            >
              <span>Category: {categoryFilter}</span>
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          )}
          {sizeFilter && (
            <button
              onClick={() => updateParam('size', '')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 text-white text-xs rounded-none"
            >
              <span>Size: {sizeFilter}</span>
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          )}
          {fitFilter && (
            <button
              onClick={() => updateParam('fit', '')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 text-white text-xs rounded-none"
            >
              <span>Fit: {fitFilter}</span>
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          )}
          {(minPrice || maxPrice) && (
            <button
              onClick={() => {
                updateParam('minPrice', '');
                updateParam('maxPrice', '');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 text-white text-xs rounded-none"
            >
              <span>Price Range</span>
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-zinc-400 hover:text-white underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-8 pr-4 border-r border-zinc-850">
          {/* Categories */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-white mb-3">Categories</h3>
            <ul className="space-y-1.5 text-xs">
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateParam('category', cat.id)}
                    className={`text-left w-full py-1 transition-colors ${
                      categoryFilter === cat.id ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sizes */}
          <div className="pt-6 border-t border-zinc-800">
            <h3 className="font-bold text-xs uppercase tracking-widest text-white mb-3">Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map(s => (
                <button
                  key={s}
                  onClick={() => updateParam('size', sizeFilter === s ? '' : s)}
                  className={`py-2 text-xs font-bold border transition-colors uppercase ${
                    sizeFilter === s
                      ? 'bg-white text-zinc-950 border-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Fit Silhouette */}
          <div className="pt-6 border-t border-zinc-800">
            <h3 className="font-bold text-xs uppercase tracking-widest text-white mb-3">Silhouette / Fit</h3>
            <div className="space-y-1.5 text-xs">
              {fits.map(f => (
                <button
                  key={f}
                  onClick={() => updateParam('fit', fitFilter === f ? '' : f)}
                  className={`block w-full text-left py-1 transition-colors ${
                    fitFilter === f ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-6 border-t border-zinc-800">
            <h3 className="font-bold text-xs uppercase tracking-widest text-white mb-3">Price (INR)</h3>
            <div className="space-y-1.5 text-xs">
              {priceRanges.map(pr => {
                const isSelected = minPrice === String(pr.min) && maxPrice === String(pr.max);
                return (
                  <button
                    key={pr.label}
                    onClick={() => {
                      if (isSelected) {
                        updateParam('minPrice', '');
                        updateParam('maxPrice', '');
                      } else {
                        updateParam('minPrice', String(pr.min));
                        updateParam('maxPrice', String(pr.max));
                      }
                    }}
                    className={`block w-full text-left py-1 transition-colors ${
                      isSelected ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {pr.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex justify-between items-center text-xs text-zinc-400">
            <span>Showing {products.length} Garments</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-900 border border-zinc-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center space-y-4 border border-zinc-800 bg-zinc-950 p-8">
              <h3 className="font-display font-bold text-xl text-white">No Garments Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No products match the selected filters. Try broadening your criteria or reset filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-[#121215] border-l border-zinc-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <h3 className="font-display font-bold text-lg text-white">FILTERS</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-zinc-400 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Category</h4>
                <div className="space-y-1">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => updateParam('category', c.id)}
                      className={`block w-full text-left py-1.5 text-xs ${
                        categoryFilter === c.id ? 'text-white font-bold' : 'text-zinc-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Size</h4>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => updateParam('size', sizeFilter === s ? '' : s)}
                      className={`py-2 text-xs font-bold border uppercase ${
                        sizeFilter === s ? 'bg-white text-zinc-950 border-white' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest"
              >
                Apply Filters ({products.length} Products)
              </button>
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2.5 text-center text-xs text-zinc-400 underline"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Dialog */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
