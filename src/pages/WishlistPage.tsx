import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';
import { ProductCard } from '../components/ProductCard.js';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 border-b border-zinc-800 pb-4 flex justify-between items-end">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">SAVED PIECES</span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
            MY WISHLIST ({wishlist.length})
          </h1>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-24 text-center space-y-4 border border-zinc-800 bg-[#121215] p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-zinc-400">
            Save garments you love to track their stock and order them whenever you are ready.
          </p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors inline-block"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
