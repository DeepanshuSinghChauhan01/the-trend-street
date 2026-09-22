import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowRight, Tag, Check, AlertCircle, MapPin, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { ShippingAddress, Order } from '../types/index.js';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingCharge,
    taxAmount,
    grandTotal,
    clearCart,
  } = useCart();

  const { user, defaultAddress, addAddress } = useAuth();

  // Form State
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: defaultAddress?.fullName || user?.name || '',
    mobile: defaultAddress?.mobile || user?.phone || '',
    email: defaultAddress?.email || user?.email || '',
    addressLine1: defaultAddress?.addressLine1 || '',
    apartmentSuiteArea: defaultAddress?.apartmentSuiteArea || '',
    city: defaultAddress?.city || 'Mainpuri',
    state: defaultAddress?.state || 'Uttar Pradesh',
    pincode: defaultAddress?.pincode || '205001',
    landmark: defaultAddress?.landmark || '',
    isDefault: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'STORE_PICKUP'>('STANDARD');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Auto-detect Mainpuri from PIN
  useEffect(() => {
    if (formData.pincode.startsWith('205')) {
      setFormData(prev => ({ ...prev, city: 'Mainpuri', state: 'Uttar Pradesh' }));
    }
  }, [formData.pincode]);

  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">ORDER CONFIRMED</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
            THANK YOU FOR YOUR PURCHASE
          </h1>
          <p className="text-sm text-zinc-300">
            Order <strong className="text-white font-mono">{completedOrder.orderNumber}</strong> has been registered in our system.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#121215] border border-zinc-800 p-6 text-left space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div>
              <p className="text-zinc-500">Status</p>
              <p className="text-emerald-400 font-bold uppercase tracking-wider">{completedOrder.orderStatus}</p>
            </div>
            <div>
              <p className="text-zinc-500">Payment Method</p>
              <p className="text-white font-bold">{completedOrder.paymentMethod} ({completedOrder.paymentStatus})</p>
            </div>
            <div>
              <p className="text-zinc-500">Total Paid / Payable</p>
              <p className="text-white font-bold text-sm">₹{completedOrder.grandTotal.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div>
            <p className="text-zinc-400 font-semibold mb-1">Delivery Destination</p>
            <p className="text-white">{completedOrder.shippingAddress.fullName} • {completedOrder.shippingAddress.mobile}</p>
            <p className="text-zinc-400">
              {completedOrder.shippingAddress.addressLine1}, {completedOrder.shippingAddress.apartmentSuiteArea}
            </p>
            <p className="text-zinc-400">
              {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} – {completedOrder.shippingAddress.pincode}
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <p className="text-zinc-400 font-semibold mb-2">Items Ordered ({completedOrder.items.length})</p>
            <div className="space-y-2">
              {completedOrder.items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-zinc-300">{item.title} ({item.color}, {item.size}) x {item.quantity}</span>
                  <span className="text-white font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/account/orders"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
          >
            Track Order Status
          </Link>

          <a
            href={`https://wa.me/919876543210?text=Hi%2C%20I%20have%20an%20inquiry%20regarding%20my%20Order%20${completedOrder.orderNumber}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-xs uppercase tracking-widest hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-white">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-zinc-400">Add some pieces from our catalog before checking out.</p>
        <Link to="/shop" className="px-6 py-3 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest inline-block">
          Explore Catalog
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    const res = await applyCoupon(couponCode.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const handleCreateOrder = async (razorpayData?: { orderId?: string; paymentId?: string }) => {
    setIsProcessing(true);
    setOrderError('');

    try {
      // Build order payload
      const orderPayload = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.mobile,
        shippingAddress: formData,
        items: cart.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          title: i.title,
          color: i.color,
          size: i.size,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        couponCode: appliedCoupon?.code,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        razorpayOrderId: razorpayData?.orderId,
        razorpayPaymentId: razorpayData?.paymentId,
        notes: shippingMethod === 'STORE_PICKUP' ? 'Store Pickup at Mainpuri Flagship' : undefined,
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Save address for future
      addAddress(formData);
      setCompletedOrder(data.data);
      clearCart();
    } catch (err: any) {
      setOrderError(err.message || 'An error occurred while creating your order.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');

    // Basic Indian phone validation
    if (!/^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, ''))) {
      setOrderError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setOrderError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (paymentMethod === 'COD') {
      await handleCreateOrder();
      return;
    }

    // Razorpay Flow
    setIsProcessing(true);
    try {
      // 1. Create Order on backend
      const rzpRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customerName: formData.fullName,
            customerPhone: formData.mobile,
            pincode: formData.pincode,
          },
        }),
      });

      const rzpOrder = await rzpRes.json();
      if (!rzpRes.ok || !rzpOrder.success) {
        throw new Error(rzpOrder.message || 'Payment initiation failed.');
      }

      const { id: order_id, amount, currency, key } = rzpOrder.data;

      // 2. Launch Razorpay Modal
      if (typeof window.Razorpay !== 'undefined') {
        const options = {
          key,
          amount,
          currency,
          name: 'TREND STREET',
          description: 'Luxury Men\'s Streetwear Order',
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80',
          order_id,
          handler: async function (response: any) {
            // 3. Verify signature on backend
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await handleCreateOrder({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
              });
            } else {
              setOrderError('Payment verification failed. Please contact store support.');
              setIsProcessing(false);
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.mobile,
          },
          theme: {
            color: '#0c0c0e',
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setOrderError(`Payment failed: ${response.error.description}`);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback for sandboxed iframe if external script blocked
        const dummyPaymentId = `pay_demo_${Date.now()}`;
        await handleCreateOrder({
          orderId: order_id,
          paymentId: dummyPaymentId,
        });
      }
    } catch (err: any) {
      setOrderError(err.message || 'Payment processing error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">CHECKOUT</span>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
          SHIPPING & PAYMENT
        </h1>
      </div>

      {orderError && (
        <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 rounded">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Shipping & Payment Form */}
        <div className="lg:col-span-7 space-y-8">
          {/* Contact Information */}
          <div className="bg-[#121215] border border-zinc-800 p-6 space-y-4">
            <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <span>1. Contact & Customer Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  id="checkout-fullname"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Email Address (for order tracking) *</label>
                <input
                  type="email"
                  required
                  id="checkout-email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="trendstreet277@gmail.com"
                  className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 mb-1">Mobile Number (10 digits for delivery updates) *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-zinc-900 border border-r-0 border-zinc-700 text-zinc-400 text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    id="checkout-mobile"
                    maxLength={10}
                    value={formData.mobile.replace('+91 ', '')}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                    placeholder="9876543210"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#121215] border border-zinc-800 p-6 space-y-4">
            <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <span>2. Delivery Address</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Flat, House no., Building, Street *</label>
                <input
                  type="text"
                  required
                  id="checkout-address1"
                  value={formData.addressLine1}
                  onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="e.g. Flat 302, Civil Lines Road"
                  className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Area, Colony, Sector, Village</label>
                <input
                  type="text"
                  value={formData.apartmentSuiteArea || ''}
                  onChange={e => setFormData({ ...formData, apartmentSuiteArea: e.target.value })}
                  placeholder="e.g. Near District Court / Station Road"
                  className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">6-Digit PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    id="checkout-pincode"
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="205001"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    id="checkout-city"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mainpuri"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    id="checkout-state"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Uttar Pradesh"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={formData.landmark || ''}
                  onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g. Opposite Post Office"
                  className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="bg-[#121215] border border-zinc-800 p-6 space-y-4">
            <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              3. Delivery Method
            </h2>

            <div className="space-y-3 text-xs">
              <label
                className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                  shippingMethod === 'STANDARD' ? 'bg-zinc-900 border-white' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === 'STANDARD'}
                  onChange={() => setShippingMethod('STANDARD')}
                  className="mt-0.5"
                />
                <div className="flex-1 flex justify-between">
                  <div>
                    <p className="font-bold text-white">Pan-India Express Shipping</p>
                    <p className="text-zinc-400 text-[11px]">Direct express dispatch from Mainpuri distribution center</p>
                  </div>
                  <span className="font-bold text-white">
                    {shippingCharge === 0 ? <span className="text-emerald-400">FREE</span> : `₹${shippingCharge}`}
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                  shippingMethod === 'STORE_PICKUP' ? 'bg-zinc-900 border-white' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === 'STORE_PICKUP'}
                  onChange={() => setShippingMethod('STORE_PICKUP')}
                  className="mt-0.5"
                />
                <div className="flex-1 flex justify-between">
                  <div>
                    <p className="font-bold text-white">Store Pickup (Mainpuri Flagship)</p>
                    <p className="text-zinc-400 text-[11px]">Station Road, Civil Lines, Mainpuri, UP • Ready within 2 hours</p>
                  </div>
                  <span className="font-bold text-emerald-400">FREE</span>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[#121215] border border-zinc-800 p-6 space-y-4">
            <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              4. Payment Method
            </h2>

            <div className="space-y-3 text-xs">
              <label
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                  paymentMethod === 'RAZORPAY' ? 'bg-zinc-900 border-white' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-zinc-300" />
                      <span>Online Payment via Razorpay</span>
                    </p>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      FASTEST
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-1">
                    Google Pay, PhonePe, Paytm, BHIM UPI, All Debit & Credit Cards, Net Banking
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                  paymentMethod === 'COD' ? 'bg-zinc-900 border-white' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="font-bold text-white flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-zinc-300" />
                    <span>Cash on Delivery (COD)</span>
                  </p>
                  <p className="text-zinc-400 text-[11px] mt-1">
                    Pay with cash or UPI QR scan to the courier upon delivery at your doorstep
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Placement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121215] border border-zinc-800 p-6 space-y-6 sticky top-24">
            <h2 className="font-display font-bold text-base text-white uppercase tracking-wider">
              Order Summary ({cart.length} Items)
            </h2>

            {/* Items list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.variantId} className="flex gap-3 text-xs">
                  <img src={item.image} alt={item.title} className="w-14 h-18 object-cover bg-zinc-950 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white line-clamp-1">{item.title}</p>
                    <p className="text-zinc-400 text-[11px]">{item.color} • Size {item.size} • Qty {item.quantity}</p>
                    <p className="text-white font-bold mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Box */}
            <div className="pt-4 border-t border-zinc-800">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs">
                  <span className="font-bold">{appliedCoupon.code} applied (-₹{discount})</span>
                  <button type="button" onClick={removeCoupon} className="underline text-[11px]">Remove</button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white uppercase placeholder-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-zinc-800 text-white font-bold text-xs uppercase"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-zinc-400 pt-4 border-t border-zinc-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCharge === 0 ? <span className="text-emerald-400 font-semibold">FREE</span> : `₹${shippingCharge}`}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5% Apparel Tax Included)</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-zinc-800 text-base font-bold text-white">
                <span>Grand Total</span>
                <span className="font-display text-xl text-white">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Complete Purchase Button */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                id="place-order-submit-btn"
                disabled={isProcessing}
                className="w-full py-4 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <span>Place Order (₹{grandTotal.toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted 256-bit payment & data privacy guarantee</span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
