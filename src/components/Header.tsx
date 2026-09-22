import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, MapPin, Phone, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { itemCount, openCartDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'SHOP', path: '/shop' },
    { name: 'NEW ARRIVALS', path: '/collections/raw-minimal' },
    { name: 'T-SHIRTS', path: '/collections/t-shirts' },
    { name: 'SHIRTS', path: '/collections/shirts' },
    { name: 'JEANS', path: '/collections/jeans' },
    { name: 'TROUSERS', path: '/collections/trousers' },
    { name: 'JACKETS', path: '/collections/jackets' },
    { name: 'HOODIES', path: '/collections/hoodies' },
    { name: 'SALE', path: '/shop?sort=price-low' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800/80 text-[11px] uppercase tracking-widest text-zinc-400 py-2 px-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Free Express Pan-India Delivery Over ₹1,999</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-1">
              <MapPin className="w-3 h-3 text-zinc-300" />
              <span>Flagship Store: Mainpuri, UP</span>
            </Link>
            <span className="hidden md:inline text-zinc-600">|</span>
            <a
              href="https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20my%20Trend%20Street%20order."
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1 hover:text-emerald-400 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'bg-[#0c0c0e]/95 backdrop-blur-md border-b border-zinc-800/80 py-3 shadow-2xl'
            : 'bg-[#0c0c0e] border-b border-zinc-900 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-zinc-300 hover:text-white focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button
                id="mobile-search-btn"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-zinc-300 hover:text-white"
                aria-label="Open Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link to="/" className="inline-block group">
                <span className="font-display font-black text-2xl sm:text-3xl tracking-tighter text-white group-hover:text-zinc-200 transition-colors">
                  TREND STREET
                </span>
                <span className="block text-[9px] uppercase tracking-[0.28em] text-zinc-500 font-sans -mt-1 text-center lg:text-left">
                  MAINPURI • EST. 2026
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map(link => {
                const isActive = location.pathname === link.path;
                const isSale = link.name === 'SALE';
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-xs font-semibold tracking-wider transition-colors hover:text-white relative py-1 ${
                      isSale
                        ? 'text-amber-400 hover:text-amber-300 font-bold'
                        : isActive
                        ? 'text-white'
                        : 'text-zinc-400'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                id="desktop-search-btn"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden lg:flex p-2 text-zinc-300 hover:text-white transition-colors"
                aria-label="Search Catalog"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                id="header-wishlist-btn"
                to="/wishlist"
                className="p-2 text-zinc-300 hover:text-white transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-white text-zinc-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                id="header-account-btn"
                to={user ? '/account' : '/account'}
                className="p-2 text-zinc-300 hover:text-white transition-colors relative"
                aria-label="My Account"
              >
                <User className="w-5 h-5" />
                {isAdmin && (
                  <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </Link>

              <button
                id="header-cart-btn"
                onClick={openCartDrawer}
                className="p-2 text-zinc-300 hover:text-white transition-colors relative flex items-center"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-white text-zinc-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Search Drawer */}
        {isSearchOpen && (
          <div className="border-t border-zinc-800 bg-[#121215] px-4 py-4 sm:px-8 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  id="search-input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by product, category, SKU (e.g. Acid Wash Tee, Selvedge, Linen)..."
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-none py-3.5 pl-12 pr-24 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  Search
                </button>
              </form>
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
                <span className="text-zinc-500">Popular:</span>
                {['Acid Wash', 'Linen Shirt', 'Selvedge Jeans', 'Wide-Leg Trousers', 'French Terry'].map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(term)}`);
                      setIsSearchOpen(false);
                    }}
                    className="px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-[#121215] border-r border-zinc-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                <span className="font-display font-bold text-xl text-white">TREND STREET</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="block py-3 px-2 text-sm font-semibold tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-800/40 rounded transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <Link
                  to="/account"
                  className="flex items-center justify-between py-2.5 px-2 text-sm text-zinc-300 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>My Account & Orders</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between py-2.5 px-2 text-sm text-zinc-300 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-zinc-400" />
                    <span>Saved Items</span>
                  </span>
                  <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{wishlistCount}</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center justify-between py-2.5 px-2 text-sm text-amber-400 font-semibold hover:bg-zinc-800/60 rounded"
                  >
                    <span>Store Admin Portal</span>
                    <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded text-amber-300">ADMIN</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Footer info */}
            <div className="pt-6 border-t border-zinc-800 text-xs text-zinc-400 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-200">TREND STREET Mainpuri</p>
                  <p className="text-zinc-500 text-[11px]">Station Road, Civil Lines, Mainpuri, UP</p>
                </div>
              </div>
              <a
                href="https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20my%20Trend%20Street%20order."
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 rounded text-xs font-semibold"
              >
                <Phone className="w-4 h-4" />
                <span>Chat with Store on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
