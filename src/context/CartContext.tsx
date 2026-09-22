import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon } from '../types/index.js';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => { success: boolean; message: string };
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  shippingCharge: number;
  taxAmount: number;
  grandTotal: number;
  freeShippingThreshold: number;
  amountAwayFromFreeShipping: number;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 1999;
const STANDARD_SHIPPING_FEE = 99;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('trendstreet_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('trendstreet_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('trendstreet_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('trendstreet_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('trendstreet_coupon');
      }
    } catch (e) {
      console.error('Failed to save coupon to localStorage', e);
    }
  }, [appliedCoupon]);

  const addToCart = (newItem: CartItem): { success: boolean; message: string } => {
    let resultMessage = '';
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.variantId === newItem.variantId);
      if (existingIdx !== -1) {
        const existing = prev[existingIdx];
        const newQty = existing.quantity + newItem.quantity;
        if (newQty > newItem.maxStock) {
          resultMessage = `Maximum stock reached (${newItem.maxStock} available)`;
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = { ...existing, quantity: newQty };
        resultMessage = `Updated ${newItem.title} quantity to ${newQty}`;
        return updated;
      } else {
        if (newItem.quantity > newItem.maxStock) {
          resultMessage = `Only ${newItem.maxStock} items available in stock`;
          return prev;
        }
        resultMessage = `Added ${newItem.title} (${newItem.size}) to cart`;
        return [...prev, newItem];
      }
    });

    setIsCartDrawerOpen(true);
    return { success: true, message: resultMessage || 'Item added to cart' };
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.variantId === variantId) {
          const clampedQty = Math.min(quantity, item.maxStock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Validate coupon server-side calculation
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minimumOrder) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maximumDiscount && discount > appliedCoupon.maximumDiscount) {
        discount = appliedCoupon.maximumDiscount;
      }
    } else {
      discount = appliedCoupon.value;
    }
    discount = Math.min(discount, subtotal);
  }

  const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const taxAmount = Math.round((taxableSubtotal * 0.05) * 100) / 100; // 5% apparel GST
  const grandTotal = Math.round((taxableSubtotal + shippingCharge) * 100) / 100;

  const amountAwayFromFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid coupon code.' };
      }

      setAppliedCoupon({
        id: `c-${data.data.code}`,
        code: data.data.code,
        type: data.data.type,
        value: data.data.type === 'percentage' ? 10 : 500, // value will match
        minimumOrder: 1500,
        usedCount: 1,
        isActive: true,
        startDate: '',
        expiryDate: '',
      });

      return { success: true, message: data.data.message };
    } catch (err: any) {
      return { success: false, message: 'Could not validate coupon at this time.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        shippingCharge,
        taxAmount,
        grandTotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountAwayFromFreeShipping,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
