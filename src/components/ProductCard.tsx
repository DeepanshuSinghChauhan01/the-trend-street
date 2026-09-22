import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product } from '../types/index.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickAddSuccess, setQuickAddSuccess] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isSaved = isInWishlist(product.id);
  const primaryImage = product.images[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const hoverImage = product.images[1]?.url || primaryImage;

  // Extract unique available sizes and colors
  const availableSizes = Array.from(new Set(product.variants.filter(v => v.stock > 0).map(v => v.size)));
  const uniqueColors = Array.from(
    new Map(product.variants.map(v => [v.color, { name: v.color, hex: v.colorHex }])).values()
  );

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const variant = product.variants.find(v => v.size === size && v.stock > 0);
    if (!variant) return;

    setIsQuickAdding(true);
    addToCart({
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      quantity: 1,
      image: primaryImage,
      slug: product.slug,
      maxStock: variant.stock,
    });

    setQuickAddSuccess(true);
    setTimeout(() => {
      setQuickAddSuccess(false);
      setSelectedSize(null);
      setIsQuickAdding(false);
    }, 1200);
  };

  return (
    <div
      className="group relative flex flex-col bg-[#111114] border border-zinc-800/80 rounded-none overflow-hidden transition-all duration-300 hover:border-zinc-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setSelectedSize(null);
      }}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && hoverImage ? hoverImage : primaryImage}
            alt={product.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <span className="px-2 py-0.5 bg-white text-zinc-950 text-[10px] font-bold uppercase tracking-wider">
              BESTSELLER
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="px-2 py-0.5 bg-zinc-900/90 text-white border border-zinc-700 text-[10px] font-semibold uppercase tracking-wider">
              NEW DROP
            </span>
          )}
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="px-2 py-0.5 bg-amber-500 text-zinc-950 text-[10px] font-extrabold uppercase tracking-wider">
              -{product.discountPercentage}%
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isSaved
              ? 'bg-white text-rose-600 shadow-md'
              : 'bg-black/40 text-zinc-300 hover:bg-white hover:text-zinc-950'
          }`}
          aria-label={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-3 left-3 hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/90 backdrop-blur-sm text-zinc-200 hover:text-white text-[11px] font-medium tracking-wider uppercase border border-zinc-700 transition-opacity duration-200 opacity-0 group-hover:opacity-100 z-10"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        )}

        {/* Quick Add Overlay on Hover (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 bg-zinc-950/90 backdrop-blur-md p-3 border-t border-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden sm:block z-20">
          {quickAddSuccess ? (
            <div className="flex items-center justify-center gap-1.5 py-1.5 text-emerald-400 text-xs font-semibold">
              <Check className="w-4 h-4" />
              <span>Added to Bag</span>
            </div>
          ) : (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-2 text-center">
                Select Size for Quick Add
              </p>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={e => handleQuickAdd(size, e)}
                    className="min-w-[32px] h-7 px-2 text-xs font-bold bg-zinc-900 hover:bg-white hover:text-zinc-950 text-zinc-200 border border-zinc-700 transition-colors uppercase"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Colors and Rating */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              {uniqueColors.slice(0, 4).map(c => (
                <span
                  key={c.name}
                  className="w-2.5 h-2.5 rounded-full border border-zinc-700"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              {uniqueColors.length > 4 && (
                <span className="text-[10px] text-zinc-500">+{uniqueColors.length - 4}</span>
              )}
            </div>

            {product.rating && (
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-zinc-600">({product.reviewCount})</span>
              </div>
            )}
          </div>

          <Link to={`/product/${product.slug}`} className="group-hover:text-zinc-200 transition-colors">
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
            {product.material.split('(')[0] || product.fit}
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-display font-bold text-sm sm:text-base text-white">
            ₹{product.basePrice.toLocaleString('en-IN')}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
            <span className="text-xs text-zinc-500 line-through">
              ₹{product.compareAtPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Mobile Quick Add Row */}
        <div className="sm:hidden pt-2 border-t border-zinc-900">
          <Link
            to={`/product/${product.slug}`}
            className="w-full py-2 bg-zinc-900 border border-zinc-800 text-white text-[11px] font-bold uppercase tracking-wider text-center block"
          >
            Select Size
          </Link>
        </div>
      </div>
    </div>
  );
};
