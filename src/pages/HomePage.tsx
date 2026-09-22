import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Star, MapPin, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { Product, Category, Collection, Review } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import { QuickViewModal } from '../components/QuickViewModal.js';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [prodRes, catRes, colRes, revRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/collections'),
          fetch('/api/reviews'),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const colData = await colRes.json();
        const revData = await revRes.json();

        if (prodData.success) setProducts(prodData.data);
        if (catData.success) setCategories(catData.data);
        if (colData.success) setCollections(colData.data);
        if (revData.success) setReviews(revData.data);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const trending = products.filter(p => p.isTrending).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO CAMPAIGN (Above the Fold) */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center bg-zinc-950 overflow-hidden">
        {/* Background Luxury Fashion Imagery */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=85"
            alt="TREND STREET Men's Luxury Streetwear Campaign"
            className="w-full h-full object-cover object-center brightness-[0.45] scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-12 pb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900/80 border border-zinc-700/80 backdrop-blur-md text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>DROP 01: MODERN LUXURY STREETWEAR</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter text-white uppercase leading-[0.95]">
            CONFIDENT.<br />URBAN. UNCOMPROMISED.
          </h1>

          <p className="text-zinc-300 text-sm sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            High-density 260 GSM combed cottons, tailored double-pleated wool drape, and authentic raw selvedge. Designed for men who command attention without shouting.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              id="hero-shop-men-cta"
              className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-950 text-xs font-extrabold uppercase tracking-widest hover:bg-zinc-200 transition-all duration-200 shadow-xl flex items-center justify-center gap-2 group"
            >
              <span>SHOP MEN</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/collections/raw-minimal"
              id="hero-explore-collection-cta"
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <span>EXPLORE COLLECTION</span>
            </Link>
          </div>

          {/* Quick Credibility Badges */}
          <div className="pt-8 flex items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-zinc-300" />
              <span>Flagship Store: Mainpuri, UP</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-zinc-300" />
              <span>Pan-India Express Delivery</span>
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-zinc-300" />
              <span>7-Day Hassle-Free Size Exchange</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES (Visual Row) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">CURATED EDIT</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
              SHOP BY CATEGORY
            </h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1 group">
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/collections/${category.slug}`}
              className="group relative aspect-[3/4] bg-zinc-900 border border-zinc-800/80 overflow-hidden"
            >
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <p className="font-display font-bold text-sm sm:text-base text-white tracking-wide uppercase">
                  {category.name}
                </p>
                <p className="text-[10px] text-zinc-400 tracking-wider uppercase mt-0.5">
                  Explore Drop
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS (Real Database Products) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">JUST RELEASED</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
              NEW ARRIVALS
            </h2>
          </div>
          <Link to="/collections/raw-minimal" className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1 group">
            <span>See New Drops</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      </section>

      {/* 4. PROMOTIONAL EDITORIAL CAMPAIGN BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-zinc-900 border border-zinc-800 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
              EDITORIAL CAMPAIGN • SS26
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tighter leading-none">
              RAW TEXTURE.<br />STRUCTURED DRAPE.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md">
              Every garment is engineered from scratch. From custom-milled 450 GSM loopback French terry to natural French linen weaves and Japanese selvedge denim. No synthetics touching your skin.
            </p>
            <div className="pt-2">
              <Link
                to="/shop?sort=best-selling"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-zinc-950 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                <span>SHOP BEST SELLERS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-auto h-full min-h-[340px] bg-zinc-950">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
              alt="TREND STREET Minimal Campaign"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS (Real Database Products) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">COMMUNITY FAVORITES</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
              BEST SELLERS
            </h2>
          </div>
          <Link to="/shop?sort=best-selling" className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1 group">
            <span>View All Bestsellers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      </section>

      {/* 6. BRAND STORY: MAINPURI, UTTAR PRADESH ORIGINS */}
      <section className="bg-zinc-950 border-y border-zinc-900 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            OUR PHILOSOPHY & CRAFT
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            BORN IN MAINPURI.<br />DEFINED BY SUBSTANCE.
          </h2>
          <div className="w-12 h-0.5 bg-white mx-auto"></div>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            TREND STREET began with a clear purpose: to bring uncompromising menswear craftsmanship to Uttar Pradesh and discerning men across India. We rejected flimsy mall polyester and flimsy fast-fashion tees. Instead, we source heavyweight organic ring-spun cottons, high-twist wool blends, and durable metal hardware that age with character.
          </p>
          <div className="pt-4 flex items-center justify-center gap-6">
            <Link
              to="/about"
              className="text-xs font-bold text-white uppercase tracking-widest border-b border-white pb-1 hover:text-zinc-300 hover:border-zinc-300 transition-colors"
            >
              Read Our Brand Story
            </Link>
            <Link
              to="/contact"
              className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              Visit Flagship Store
            </Link>
          </div>
        </div>
      </section>

      {/* 7. TRENDING STREETWEAR (Real Database Products) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">CURRENT WAVE</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
              TRENDING NOW
            </h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1 group">
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trending.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      </section>

      {/* 8. VERIFIED CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">TESTIMONIALS</span>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
            VERIFIED BUYER EXPERIENCES
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">Real feedback from clients who wear TREND STREET daily</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(review => (
            <div
              key={review.id}
              className="bg-[#121215] border border-zinc-800 p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Purchase</span>
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-sm">"{review.title}"</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{review.comment}</p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                <span className="font-semibold text-zinc-300">{review.userName}</span>
                <span>{new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. MAINPURI PHYSICAL STORE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-zinc-200" />
                <span>Shop Online or Visit Our Flagship Store</span>
              </div>

              <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight leading-none">
                TREND STREET<br />MAINPURI, UTTAR PRADESH
              </h2>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Experience our fabrics in person. Feel the weight of the 450 GSM terry, test our relaxed silhouettes in the trial rooms, and receive personalized fit consultations from our in-store stylists.
              </p>

              <div className="space-y-3 text-xs text-zinc-300 pt-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Store Address</p>
                    <p className="text-zinc-400">Station Road, Near Civil Lines, Mainpuri, Uttar Pradesh 205001</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">In-Store Assistance & Phone</p>
                    <p className="text-zinc-400">+91 98765 43210 (10:30 AM – 9:30 PM)</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="https://maps.google.com/?q=Mainpuri+Uttar+Pradesh"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Google Maps Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20my%20Trend%20Street%20order."
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>
            </div>

            <div className="relative aspect-[4/3] bg-zinc-950 border border-zinc-800 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=85"
                alt="TREND STREET Flagship Store Interior"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 border border-zinc-800 text-[11px] text-zinc-300">
                Mainpuri Flagship Store • UP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. INSTAGRAM / STREET CULTURE GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">STREETWEAR COMMUNITY</span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            TAG @TRENDSTREET_OFFICIAL
          </h2>
          <p className="text-xs text-zinc-400">Captured on streets across Uttar Pradesh, Delhi NCR, and Mumbai</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
          ].map((url, i) => (
            <div key={i} className="relative aspect-square bg-zinc-900 overflow-hidden group">
              <img
                src={url}
                alt="TREND STREET Customer fit"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                #TrendStreetMen
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
