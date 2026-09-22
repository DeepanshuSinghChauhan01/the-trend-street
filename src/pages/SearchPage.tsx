import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    async function executeSearch() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }
    executeSearch();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">CATALOG SEARCH</span>
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search acid wash, raw denim, linen, oversized..."
            className="w-full bg-zinc-900 border border-zinc-700 py-3.5 pl-12 pr-28 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-2 bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
          >
            Search
          </button>
        </form>

        <p className="text-xs text-zinc-400">
          {isLoading ? 'Searching...' : `Found ${products.length} garments matching "${query}"`}
        </p>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-zinc-900 border border-zinc-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center space-y-4 border border-zinc-800 bg-[#121215] p-8 max-w-lg mx-auto">
          <h3 className="font-display font-bold text-lg text-white">No exact matches found</h3>
          <p className="text-xs text-zinc-400">
            Try searching for broader keywords like "t-shirts", "cotton", "black", or "jacket".
          </p>
          <Link to="/shop" className="px-6 py-2.5 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest inline-block">
            View All Garments
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
