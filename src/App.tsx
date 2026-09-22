import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { WishlistProvider } from './context/WishlistContext.js';
import { CartProvider } from './context/CartContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { QuickViewModal } from './components/QuickViewModal.js';
import { Product } from './types/index.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { AccountPage } from './pages/AccountPage.js';
import { WishlistPage } from './pages/WishlistPage.js';
import { SearchPage } from './pages/SearchPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage.js';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage.js';
import { PrivacyPolicyPage, TermsPage } from './pages/PoliciesPage.js';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Global event listener for Quick View from product cards
  useEffect(() => {
    const handleQuickViewEvent = (e: any) => {
      if (e.detail?.product) {
        setQuickViewProduct(e.detail.product);
      }
    };

    window.addEventListener('open-quick-view', handleQuickViewEvent);
    return () => {
      window.removeEventListener('open-quick-view', handleQuickViewEvent);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-[#0c0c0e] text-zinc-100 selection:bg-white selection:text-zinc-950 font-sans antialiased">
              <Header />

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/shop/:category" element={<ShopPage />} />
                  <Route path="/collections/:collectionSlug" element={<ShopPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/account/orders" element={<AccountPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                  <Route path="/returns" element={<ReturnPolicyPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLoginPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />

                  {/* Fallback */}
                  <Route path="*" element={<ShopPage />} />
                </Routes>
              </main>

              <Footer />

              {/* Global Overlays */}
              <CartDrawer />
              <QuickViewModal
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
              />
            </div>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
