import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext.js';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    closeCartDrawer,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingCharge,
    taxAmount,
    grandTotal,
    amountAwayFromFreeShipping,
    freeShippingThreshold,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setIsApplyingCoupon(true);

    const res = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCartDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
        <div className="w-screen max-w-md bg-[#121215] border-l border-zinc-800 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-zinc-300" />
              <h2 className="font-display font-bold text-lg text-white">SHOPPING BAG</h2>
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-semibold">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={closeCartDrawer}
              className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-zinc-950 px-5 py-3 border-b border-zinc-800 text-xs">
            {amountAwayFromFreeShipping > 0 ? (
              <div>
                <p className="text-zinc-300 mb-1.5 font-medium">
                  Add <span className="text-white font-bold">₹{amountAwayFromFreeShipping}</span> more for <span className="text-emerald-400 font-bold">FREE EXPRESS SHIPPING</span>
                </p>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span>🎉</span> You qualify for Free Express Shipping across India!
              </p>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">Your bag is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Explore our latest drops, heavyweight acid-washed tees, and tailored trousers.
                </p>
                <Link
                  to="/shop"
                  onClick={closeCartDrawer}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-zinc-950 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-none relative"
                >
                  <Link to={`/product/${item.slug}`} onClick={closeCartDrawer} className="shrink-0 w-20 h-24 bg-zinc-950">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeCartDrawer}
                          className="text-xs font-semibold text-white hover:text-zinc-300 line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {item.color} • Size {item.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-zinc-700 bg-zinc-950">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2 py-1 text-zinc-400 hover:text-white"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2 py-1 text-zinc-400 hover:text-white"
                          disabled={item.quantity >= item.maxStock}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-display font-bold text-xs sm:text-sm text-white">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Calculations */}
          {cart.length > 0 && (
            <div className="p-5 bg-zinc-950 border-t border-zinc-800 space-y-4">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-950/40 border border-emerald-800/80 text-emerald-400 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <div>
                        <span className="font-bold tracking-wider">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-emerald-300 ml-1">(-₹{discount.toFixed(0)})</span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-zinc-400 hover:text-white text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon (e.g. TREND10, STREET500)"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white uppercase placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingCoupon}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                  </form>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs border-t border-zinc-900 pt-3 text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCharge === 0 ? <span className="text-emerald-400 font-semibold">FREE</span> : `₹${shippingCharge}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (5% GST included)</span>
                  <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-zinc-800 text-sm font-bold text-white">
                  <span>Grand Total</span>
                  <span className="font-display text-base text-white">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2">
                <button
                  id="cart-drawer-checkout-btn"
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/checkout');
                  }}
                  className="w-full py-3.5 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secure 256-Bit SSL Checkout • Razorpay & COD</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
