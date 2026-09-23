import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Heart, Check, ArrowRight } from 'lucide-react';
import { Product } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { getGalleryImages } from '../lib/productImages.js';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || '');
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || '');
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  // Switching colors shows that color's own gallery; reset to its first image.
  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor]);

  const isSaved = isInWishlist(product.id);

  // Available variants for selected color
  const colorVariants = product.variants.filter(v => v.color === selectedColor);
  const selectedVariant = product.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  ) || colorVariants[0] || product.variants[0];

  const uniqueColors = Array.from(
    new Map(product.variants.map(v => [v.color, { name: v.color, hex: v.colorHex }])).values()
  );

  const galleryImages = getGalleryImages(product.images, selectedColor);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].filter(s =>
    product.variants.some(v => v.size === s)
  );

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      color: selectedVariant.color,
      size: selectedVariant.size,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      compareAtPrice: selectedVariant.compareAtPrice,
      quantity: 1,
      image: galleryImages[activeImage]?.url || galleryImages[0]?.url,
      slug: product.slug,
      maxStock: selectedVariant.stock,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#121215] border border-zinc-800 shadow-2xl z-10 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-zinc-400 hover:text-white bg-black/40 rounded-full backdrop-blur-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Stage */}
          <div className="relative aspect-[3/4] bg-zinc-950">
            <img
              src={galleryImages[activeImage]?.url || galleryImages[0]?.url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {galleryImages.length > 1 && (
              <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto py-1">
                {galleryImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`w-12 h-14 border shrink-0 overflow-hidden ${
                      activeImage === i ? 'border-white' : 'border-zinc-800 opacity-60'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="uppercase tracking-widest font-semibold">{product.brand}</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-white font-bold">{product.rating}</span>
                  <span className="text-zinc-500">({product.reviewCount} reviews)</span>
                </div>
              </div>

              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                {product.title}
              </h2>

              <div className="flex items-baseline gap-3">
                <span className="font-display font-black text-2xl text-white">
                  ₹{selectedVariant?.price.toLocaleString('en-IN') || product.basePrice.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-zinc-500 line-through">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discountPercentage ? (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold uppercase">
                    Save {product.discountPercentage}%
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Color Selector */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Color:</span>
                  <span className="text-white font-medium">{selectedColor}</span>
                </div>
                <div className="flex gap-2">
                  {uniqueColors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedColor(c.name);
                        const matchSize = product.variants.find(v => v.color === c.name && v.size === selectedSize);
                        if (!matchSize) {
                          const firstAvail = product.variants.find(v => v.color === c.name && v.stock > 0);
                          if (firstAvail) setSelectedSize(firstAvail.size);
                        }
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === c.name ? 'border-white scale-110' : 'border-zinc-700 hover:border-zinc-500'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Size:</span>
                  <span className="text-white font-medium">{selectedSize}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {availableSizes.map(size => {
                    const variant = product.variants.find(v => v.color === selectedColor && v.size === size);
                    const inStock = variant && variant.stock > 0;
                    return (
                      <button
                        key={size}
                        disabled={!inStock}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-xs font-bold border transition-all ${
                          selectedSize === size
                            ? 'bg-white text-zinc-950 border-white'
                            : inStock
                            ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-zinc-500'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-600 line-through cursor-not-allowed'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && (
                  <p className="text-[11px] text-zinc-400">
                    {selectedVariant.stock <= 5 && selectedVariant.stock > 0 ? (
                      <span className="text-amber-400 font-semibold">Low stock: Only {selectedVariant.stock} items left</span>
                    ) : selectedVariant.stock > 0 ? (
                      <span className="text-emerald-400 font-semibold">In stock and ready to ship from Mainpuri</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">Currently sold out</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                  className="flex-1 py-3.5 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 border border-zinc-700 transition-colors ${
                    isSaved ? 'bg-white text-rose-600 border-white' : 'hover:border-zinc-500 text-zinc-300'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="w-full py-2.5 text-center text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
              >
                <span>View Full Product Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
