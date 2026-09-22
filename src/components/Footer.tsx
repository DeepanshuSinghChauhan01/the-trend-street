import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowRight, ShieldCheck, Truck, RefreshCw, CreditCard, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#09090b] border-t border-zinc-900 text-zinc-400 text-sm">
      {/* Value Proposition Bar */}
      <div className="border-b border-zinc-800/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white shrink-0 border border-zinc-800">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Express Pan-India</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Free delivery on orders over ₹1,999</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white shrink-0 border border-zinc-800">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Easy 7-Day Exchange</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Hassle-free size replacement</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white shrink-0 border border-zinc-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs tracking-wider uppercase">100% Authentic</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Heavyweight curated fabrics</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white shrink-0 border border-zinc-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs tracking-wider uppercase">COD & Razorpay</h4>
              <p className="text-xs text-zinc-400 mt-0.5">UPI, Cards, EMI & Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mainpuri Store */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-display font-black text-2xl tracking-tighter text-white">
                TREND STREET
              </span>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-zinc-400">
                LUXURY MEN'S STREETWEAR
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Rooted in Mainpuri, Uttar Pradesh. TREND STREET designs high-density cottons, tailored silhouettes, and relaxed streetwear essentials for the discerning modern Indian man.
            </p>

            <div className="pt-2 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                <span className="text-zinc-300">Station Road, Near Civil Lines, Mainpuri, Uttar Pradesh 205001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-zinc-300 shrink-0" />
                <span className="text-zinc-400">Store Hours: Monday – Sunday: 10:30 AM – 9:30 PM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-zinc-300 shrink-0" />
                <a href="tel:+919876543210" className="text-zinc-300 hover:text-white transition-colors">+91 98765 43210</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-zinc-300 shrink-0" />
                <a href="mailto:trendstreet277@gmail.com" className="text-zinc-300 hover:text-white transition-colors">trendstreet277@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">COLLECTIONS</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/collections/t-shirts" className="hover:text-white transition-colors">Oversized T-Shirts</Link></li>
              <li><Link to="/collections/shirts" className="hover:text-white transition-colors">Resort & Linen Shirts</Link></li>
              <li><Link to="/collections/jeans" className="hover:text-white transition-colors">Selvedge & Baggy Jeans</Link></li>
              <li><Link to="/collections/trousers" className="hover:text-white transition-colors">Tailored Pleated Trousers</Link></li>
              <li><Link to="/collections/jackets" className="hover:text-white transition-colors">Jackets & Bombers</Link></li>
              <li><Link to="/collections/hoodies" className="hover:text-white transition-colors">450 GSM Heavy Hoodies</Link></li>
              <li><Link to="/collections/polos" className="hover:text-white transition-colors">Mercerized Knit Polos</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">CLIENT SERVICES</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/account/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping & Delivery Terms</Link></li>
              <li><Link to="/return-policy" className="hover:text-white transition-colors">Returns & Size Exchanges</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Visit Mainpuri Store</Link></li>
              <li>
                <a
                  href="https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20my%20Trend%20Street%20order."
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <span>WhatsApp Concierge</span>
                </a>
              </li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">DROP ALERTS</h4>
            <p className="text-xs text-zinc-400 mb-3">
              Subscribe for private drop notifications, seasonal archive sales, and Mainpuri store events.
            </p>
            {isSubscribed ? (
              <div className="p-3 bg-zinc-900 border border-emerald-800/60 rounded text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>You are on the priority list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    id="newsletter-email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-none py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-white text-zinc-950 hover:bg-zinc-200 transition-colors text-xs font-semibold flex items-center justify-center"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400">No spam. Only limited release drops.</p>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-zinc-900">
              <Link
                to="/admin/login"
                className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors inline-block"
              >
                Store Administration
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Payment Badges */}
      <div className="border-t border-zinc-900/90 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
          <p>© 2026 TREND STREET. All rights reserved. Mainpuri, Uttar Pradesh, India.</p>
          <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">Razorpay Verified</span>
            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">UPI / NetBanking</span>
            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
