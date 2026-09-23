import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, MapPin, Check,
  ChevronRight, Ruler, AlertCircle, Sparkles, MessageSquare, ThumbsUp
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { ProductCard } from '../components/ProductCard.js';
import { getGalleryImages } from '../lib/productImages.js';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<(Product & { relatedProducts?: Product[]; reviews?: Review[] }) | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pincode checker state
  const [pincode, setPincode] = useState('205001');
  const [pincodeResult, setPincodeResult] = useState<any>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
          const firstVariant = data.data.variants[0];
          if (firstVariant) {
            setSelectedColor(firstVariant.color);
            setSelectedSize(firstVariant.size);
          }
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Switching colors shows that color's own gallery; reset to its first image
  // so we never end up pointing at an index that doesn't exist in the new set.
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColor]);

  // Run initial pincode check for default Mainpuri pin
  useEffect(() => {
    handleCheckPincode();
  }, []);

  const handleCheckPincode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setPincodeError('Please enter a valid 6-digit PIN code.');
      return;
    }
    setPincodeError('');
    setIsCheckingPincode(true);

    try {
      const res = await fetch('/api/delivery/check-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode }),
      });
      const data = await res.json();
      if (data.success) {
        setPincodeResult(data.data);
      } else {
        setPincodeError(data.message);
      }
    } catch {
      setPincodeError('Could not verify PIN code.');
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: reviewName,
          userEmail: reviewEmail,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess('Review published successfully!');
        setProduct(prev => prev ? { ...prev, reviews: [data.data, ...(prev.reviews || [])] } : null);
        setReviewTitle('');
        setReviewComment('');
      }
    } catch {
      console.error('Failed to post review');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-[3/4] bg-zinc-900 border border-zinc-800" />
          <div className="space-y-6">
            <div className="h-8 bg-zinc-900 w-3/4" />
            <div className="h-6 bg-zinc-900 w-1/4" />
            <div className="h-24 bg-zinc-900 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-white">Product Not Found</h2>
        <p className="text-zinc-400 text-xs">The requested garment could not be found or has been archived.</p>
        <Link to="/shop" className="px-6 py-3 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Selected Variant Resolution
  const selectedVariant = product.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  ) || product.variants[0];

  const uniqueColors = Array.from(
    new Map(product.variants.map(v => [v.color, { name: v.color, hex: v.colorHex }])).values()
  );

  const galleryImages = getGalleryImages(product.images, selectedColor);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].filter(s =>
    product.variants.some(v => v.color === selectedColor && v.size === s)
  );

  const isSaved = isInWishlist(product.id);

  const handleAddToBag = () => {
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
      quantity,
      image: galleryImages[activeImageIndex]?.url || galleryImages[0]?.url,
      slug: product.slug,
      maxStock: selectedVariant.stock,
    });
  };

  const handleBuyNow = () => {
    handleAddToBag();
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/shop?category=${product.category}`} className="hover:text-white transition-colors capitalize">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300 font-semibold line-clamp-1">{product.title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
            {galleryImages.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 sm:w-20 aspect-[3/4] bg-zinc-900 border transition-all overflow-hidden ${
                  activeImageIndex === idx ? 'border-white ring-1 ring-white' : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Stage Image */}
          <div className="flex-1 relative aspect-[3/4] bg-zinc-950 border border-zinc-800 overflow-hidden group">
            <img
              src={galleryImages[activeImageIndex]?.url || galleryImages[0]?.url}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            {product.discountPercentage && (
              <div className="absolute top-4 left-4 px-2.5 py-1 bg-amber-500 text-zinc-950 text-xs font-black uppercase tracking-wider">
                -{product.discountPercentage}% OFF
              </div>
            )}
            {product.isBestSeller && (
              <div className="absolute top-4 right-4 px-2.5 py-1 bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider">
                BESTSELLER
              </div>
            )}
          </div>
        </div>

        {/* Right: Garment Specifications & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title & Brand */}
          <div className="space-y-2 border-b border-zinc-800 pb-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-bold tracking-widest uppercase">{product.brand}</span>
              <span className="font-mono text-zinc-500">SKU: {selectedVariant?.sku}</span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              {product.title}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating) ? 'fill-current' : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-white">{product.rating}</span>
              <span className="text-xs text-zinc-500">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Price Presentation */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-display font-black text-2xl sm:text-3xl text-white">
                ₹{selectedVariant?.price.toLocaleString('en-IN') || product.basePrice.toLocaleString('en-IN')}
              </span>
              {selectedVariant?.compareAtPrice && (
                <span className="text-sm text-zinc-500 line-through">
                  ₹{selectedVariant.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                (Inclusive of all taxes & 5% apparel GST)
              </span>
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 uppercase tracking-wider font-semibold">Color:</span>
              <span className="text-white font-bold">{selectedColor}</span>
            </div>
            <div className="flex items-center gap-3">
              {uniqueColors.map(c => (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedColor(c.name);
                    const match = product.variants.find(v => v.color === c.name && v.size === selectedSize);
                    if (!match) {
                      const firstAvail = product.variants.find(v => v.color === c.name && v.stock > 0);
                      if (firstAvail) setSelectedSize(firstAvail.size);
                    }
                  }}
                  className={`w-9 h-9 rounded-full border-2 transition-all p-0.5 ${
                    selectedColor === c.name ? 'border-white scale-110 shadow-lg' : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                  title={c.name}
                >
                  <span
                    className="block w-full h-full rounded-full border border-black/20"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector & Size Guide */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 uppercase tracking-wider font-semibold">Select Size:</span>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-zinc-300 hover:text-white flex items-center gap-1 underline transition-colors"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size & Measurements Chart</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {availableSizes.map(size => {
                const variant = product.variants.find(v => v.color === selectedColor && v.size === size);
                const inStock = variant && variant.stock > 0;
                return (
                  <button
                    key={size}
                    disabled={!inStock}
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
                    className={`py-3 text-xs font-bold border transition-all uppercase ${
                      selectedSize === size
                        ? 'bg-white text-zinc-950 border-white ring-1 ring-white'
                        : inStock
                        ? 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-600'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-600 line-through cursor-not-allowed'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Live Stock Indicator */}
            {selectedVariant && (
              <div className="text-xs pt-1">
                {selectedVariant.stock <= 5 && selectedVariant.stock > 0 ? (
                  <p className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Low Stock Warning: Only {selectedVariant.stock} units remaining in Mainpuri hub</span>
                  </p>
                ) : selectedVariant.stock > 0 ? (
                  <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>In Stock — Ready for immediate dispatch</span>
                  </p>
                ) : (
                  <p className="text-rose-400 font-semibold">Currently Sold Out in this size</p>
                )}
              </div>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-zinc-700 bg-zinc-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-3 text-zinc-400 hover:text-white"
                  aria-label="Decrease"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-white min-w-[32px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
                  disabled={quantity >= (selectedVariant?.stock || 1)}
                  className="px-3.5 py-3 text-zinc-400 hover:text-white disabled:opacity-30"
                  aria-label="Increase"
                >
                  +
                </button>
              </div>

              {/* Add to Bag */}
              <button
                id="pdp-add-to-bag-btn"
                onClick={handleAddToBag}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="flex-1 py-3.5 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`px-4 border border-zinc-700 transition-colors ${
                  isSaved ? 'bg-white text-rose-600 border-white' : 'hover:border-zinc-500 text-zinc-300'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now (Direct Checkout) */}
            <button
              id="pdp-buy-now-btn"
              onClick={handleBuyNow}
              disabled={!selectedVariant || selectedVariant.stock <= 0}
              className="w-full py-3.5 bg-zinc-900 border border-zinc-700 text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              BUY NOW • FAST SECURE CHECKOUT
            </button>
          </div>

          {/* PINCODE & DELIVERY ESTIMATOR */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <Truck className="w-4 h-4 text-zinc-300" />
              <span>Check Delivery & COD in Your City</span>
            </div>

            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                id="pincode-checker-input"
                value={pincode}
                maxLength={6}
                onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Indian PIN code"
                className="flex-1 bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white font-mono"
              />
              <button
                type="submit"
                disabled={isCheckingPincode}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                {isCheckingPincode ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeError && <p className="text-[11px] text-rose-400">{pincodeError}</p>}

            {pincodeResult && (
              <div className="text-xs space-y-1.5 pt-1 text-zinc-300 border-t border-zinc-800">
                <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Delivery to {pincodeResult.pincode}: {pincodeResult.estimatedDelivery}</span>
                </p>
                <p className="text-zinc-400 text-[11px]">{pincodeResult.message}</p>
                <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1">
                  <span>Cash on Delivery: <strong className="text-white">Available</strong></span>
                  <span>Store Pickup: <strong className="text-white">{pincodeResult.storePickupAvailable ? 'Yes (Mainpuri)' : 'Standard Delivery'}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Product Fabric & Specifications Accordion */}
          <div className="border-t border-zinc-800 pt-4 space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-white uppercase tracking-wider mb-1">Fabric & Construction</h3>
              <p className="text-zinc-400 leading-relaxed">{product.material}</p>
            </div>

            <div>
              <h3 className="font-bold text-white uppercase tracking-wider mb-1">Fit & Silhouette</h3>
              <p className="text-zinc-400 leading-relaxed">{product.fit}</p>
            </div>

            <div>
              <h3 className="font-bold text-white uppercase tracking-wider mb-1">Care Guidelines</h3>
              <p className="text-zinc-400 leading-relaxed">{product.careInstructions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <section className="border-t border-zinc-800 pt-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">COMMUNITY EXPERIENCES</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
              CUSTOMER REVIEWS ({product.reviews?.length || 0})
            </h2>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2.5">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-display font-black text-lg text-white">{product.rating}</span>
            </div>
            <span className="text-xs text-zinc-400 border-l border-zinc-700 pl-3">Out of 5 Stars</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {(!product.reviews || product.reviews.length === 0) ? (
              <div className="p-8 bg-zinc-900/40 border border-zinc-800 text-center text-zinc-400 text-xs">
                No reviews yet for this garment. Be the first to share your fit review.
              </div>
            ) : (
              product.reviews.map(rev => (
                <div key={rev.id} className="p-5 bg-zinc-900/40 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm">"{rev.title}"</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{rev.comment}</p>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/60">
                    <span className="font-semibold text-zinc-300">{rev.userName}</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Form */}
          <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white uppercase">Write a Review</h3>
            <p className="text-xs text-zinc-400">Purchased this piece? Help our community with sizing and fabric feedback.</p>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs rounded">
                {reviewSuccess}
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Your Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-zinc-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={e => setReviewName(e.target.value)}
                    placeholder="e.g. Rohan Verma"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={reviewEmail}
                    onChange={e => setReviewEmail(e.target.value)}
                    placeholder="trendstreet277@gmail.com"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={e => setReviewTitle(e.target.value)}
                    placeholder="e.g. Unbeatable heavy GSM fabric and drape"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Your Thoughts on Fit & Quality</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Share how the fabric feels, fits around chest and shoulders..."
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-zinc-950 font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  Submit Verified Review
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="border-t border-zinc-800 pt-12">
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">COMPLETE THE LOOK</span>
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight mt-1">
              YOU MAY ALSO LIKE
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {product.relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-zinc-800 max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-display font-bold text-base text-white uppercase">Men's Apparel Size Chart</h3>
              <button onClick={() => setIsSizeGuideOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>
            <p className="text-zinc-400">Measurements are in inches. For oversized fits, we recommend taking your usual size.</p>

            <table className="w-full text-left border-collapse border border-zinc-800">
              <thead>
                <tr className="bg-zinc-900 text-white">
                  <th className="p-2 border border-zinc-800 font-bold">Size</th>
                  <th className="p-2 border border-zinc-800 font-bold">Chest (in)</th>
                  <th className="p-2 border border-zinc-800 font-bold">Length (in)</th>
                  <th className="p-2 border border-zinc-800 font-bold">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr><td className="p-2 border border-zinc-800 font-bold text-white">XS</td><td className="p-2 border border-zinc-800">38</td><td className="p-2 border border-zinc-800">27.5</td><td className="p-2 border border-zinc-800">19</td></tr>
                <tr><td className="p-2 border border-zinc-800 font-bold text-white">S</td><td className="p-2 border border-zinc-800">40</td><td className="p-2 border border-zinc-800">28.5</td><td className="p-2 border border-zinc-800">20</td></tr>
                <tr><td className="p-2 border border-zinc-800 font-bold text-white">M</td><td className="p-2 border border-zinc-800">42</td><td className="p-2 border border-zinc-800">29.5</td><td className="p-2 border border-zinc-800">21</td></tr>
                <tr><td className="p-2 border border-zinc-800 font-bold text-white">L</td><td className="p-2 border border-zinc-800">44</td><td className="p-2 border border-zinc-800">30.5</td><td className="p-2 border border-zinc-800">22</td></tr>
                <tr><td className="p-2 border border-zinc-800 font-bold text-white">XL</td><td className="p-2 border border-zinc-800">46</td><td className="p-2 border border-zinc-800">31.5</td><td className="p-2 border border-zinc-800">23</td></tr>
                <tr><td className="p-2 border border-zinc-800 font-bold text-white">XXL</td><td className="p-2 border border-zinc-800">48</td><td className="p-2 border border-zinc-800">32.5</td><td className="p-2 border border-zinc-800">24</td></tr>
              </tbody>
            </table>

            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full py-2.5 bg-white text-zinc-950 font-bold uppercase tracking-wider text-xs"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
