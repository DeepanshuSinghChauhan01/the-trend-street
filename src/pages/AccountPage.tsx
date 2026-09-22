import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, User, Phone, CheckCircle2, Clock, Truck, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Order, ShippingAddress } from '../types/index.js';

export const AccountPage: React.FC = () => {
  const { user, login, logout, addresses, defaultAddress, addAddress, deleteAddress, setDefaultAddress } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [lookedUpOrder, setLookedUpOrder] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [isCancelling, setIsCancelling] = useState(false);

  // New address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<ShippingAddress>({
    fullName: '',
    mobile: '',
    email: '',
    addressLine1: '',
    apartmentSuiteArea: '',
    city: 'Mainpuri',
    state: 'Uttar Pradesh',
    pincode: '205001',
    landmark: '',
    isDefault: false,
  });

  useEffect(() => {
    async function loadUserOrders() {
      try {
        const res = await fetch('/api/admin/orders', {
          headers: { Authorization: 'Bearer trendstreet_admin_2026_secure' }
        });
        const data = await res.json();
        if (data.success) {
          // Filter by current user email or return all demo orders for this session
          const userOrders = data.data.filter(
            (o: Order) => !user?.email || o.customerEmail.toLowerCase() === user.email.toLowerCase()
          );
          setOrders(userOrders.length > 0 ? userOrders : data.data);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      }
    }
    loadUserOrders();
  }, [user]);

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupOrderNumber.trim()) return;
    setLookupError('');
    setLookedUpOrder(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(lookupOrderNumber.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLookupError(data.message || 'Order not found.');
      } else {
        setLookedUpOrder(data.data);
      }
    } catch {
      setLookupError('Could not track order at this moment.');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOrderId) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${cancelModalOrderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => (o.id === cancelModalOrderId ? data.data : o)));
        if (lookedUpOrder?.id === cancelModalOrderId) {
          setLookedUpOrder(data.data);
        }
        setCancelModalOrderId(null);
      } else {
        alert(data.message);
      }
    } catch {
      alert('Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(newAddr);
    setIsAddingAddress(false);
    setNewAddr({
      fullName: '',
      mobile: '',
      email: '',
      addressLine1: '',
      apartmentSuiteArea: '',
      city: 'Mainpuri',
      state: 'Uttar Pradesh',
      pincode: '205001',
      landmark: '',
      isDefault: false,
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
      case 'CANCELLED':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      default:
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
    }
  };

  const renderOrderTimeline = (status: string) => {
    const steps = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIdx = steps.indexOf(status);

    if (status === 'CANCELLED') {
      return (
        <div className="p-2.5 bg-rose-950/40 border border-rose-900 text-rose-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>This order was cancelled. Restocked in Mainpuri warehouse.</span>
        </div>
      );
    }

    return (
      <div className="pt-2 pb-1">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 relative">
          {steps.map((step, idx) => {
            const isCompleted = idx <= (currentIdx === -1 ? 0 : currentIdx);
            return (
              <div key={step} className="flex flex-col items-center flex-1 text-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                    isCompleted ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`mt-1 font-semibold text-[10px] ${isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Account Header */}
      <div className="mb-8 border-b border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">CLIENT ACCOUNT</span>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight mt-1">
            {user?.name ? `WELCOME, ${user.name.toUpperCase()}` : 'MY ACCOUNT & ORDERS'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Manage delivery addresses, order dispatches, and returns</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'orders' ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'addresses' ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Addresses ({addresses.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'profile' ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* TAB 1: ORDERS & TRACKING */}
      {activeTab === 'orders' && (
        <div className="space-y-8">
          {/* Fast Order Tracking Lookup */}
          <div className="bg-[#121215] border border-zinc-800 p-6">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-2">
              Track Any Order by ID
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter your TREND STREET order number (e.g. TS-98231) to view real-time shipping status and courier waybill.
            </p>

            <form onSubmit={handleLookupOrder} className="flex gap-2 max-w-lg">
              <input
                type="text"
                value={lookupOrderNumber}
                onChange={e => setLookupOrderNumber(e.target.value.toUpperCase())}
                placeholder="Enter TS-XXXXX"
                className="flex-1 bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-xs text-white uppercase font-mono placeholder-zinc-500 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Track
              </button>
            </form>

            {lookupError && <p className="text-xs text-rose-400 mt-2">{lookupError}</p>}

            {/* Single Looked up order card */}
            {lookedUpOrder && (
              <div className="mt-6 p-5 bg-zinc-900/60 border border-zinc-750 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-sm font-bold text-white">{lookedUpOrder.orderNumber}</span>
                    <p className="text-[11px] text-zinc-400">Placed on {new Date(lookedUpOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border ${getStatusBadgeColor(lookedUpOrder.orderStatus)}`}>
                    {lookedUpOrder.orderStatus}
                  </span>
                </div>

                {renderOrderTimeline(lookedUpOrder.orderStatus)}

                {/* Items */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  {lookedUpOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between text-xs text-zinc-300">
                      <span>{item.title} ({item.size}) x {item.quantity}</span>
                      <span className="text-white font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User's Order List */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
              Recent Order History
            </h3>

            {orders.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-[#121215] border border-zinc-800 p-8">
                <Package className="w-10 h-10 text-zinc-600 mx-auto" />
                <h4 className="font-display font-bold text-base text-white">No Orders Placed Yet</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Browse our collection of luxury streetwear and tailored staples.
                </p>
                <Link to="/shop" className="px-6 py-2.5 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest inline-block">
                  Shop Catalog
                </Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-[#121215] border border-zinc-800 p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm sm:text-base text-white">{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Payment: {order.paymentMethod} ({order.paymentStatus})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-black text-base text-white">
                        ₹{order.grandTotal.toLocaleString('en-IN')}
                      </span>

                      {/* Cancel button if pending or confirmed */}
                      {['CONFIRMED', 'PROCESSING'].includes(order.orderStatus) && (
                        <button
                          onClick={() => setCancelModalOrderId(order.id)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-rose-950 text-zinc-300 hover:text-rose-400 border border-zinc-700 text-[11px] font-semibold transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}

                      <a
                        href={`https://wa.me/919876543210?text=Hi%2C%20inquiry%20regarding%20my%20Order%20${order.orderNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Support</span>
                      </a>
                    </div>
                  </div>

                  {/* Visual Status Progress */}
                  {renderOrderTimeline(order.orderStatus)}

                  {/* Items in Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex gap-3 bg-zinc-900/50 p-3 border border-zinc-800/80">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-14 h-18 object-cover bg-zinc-950 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-semibold text-white line-clamp-1">{item.title}</p>
                          <p className="text-zinc-400 text-[11px] mt-0.5">{item.color} • Size {item.size} • Qty {item.quantity}</p>
                          <p className="text-white font-bold mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Destination */}
                  <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span>Delivering to: <strong className="text-white">{order.shippingAddress.fullName}</strong>, {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</span>
                    </div>
                    {order.trackingNumber && (
                      <span className="font-mono text-zinc-300">Courier Waybill: {order.trackingNumber}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
              Saved Delivery Addresses
            </h3>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-4 py-2 bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
            >
              {isAddingAddress ? 'Cancel' : '+ Add New Address'}
            </button>
          </div>

          {/* Add Address Form */}
          {isAddingAddress && (
            <form onSubmit={handleSaveAddress} className="bg-[#121215] border border-zinc-800 p-6 space-y-4 max-w-2xl">
              <h4 className="font-bold text-sm text-white uppercase">New Delivery Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddr.fullName}
                    onChange={e => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Mobile</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.mobile}
                    onChange={e => setNewAddr({ ...newAddr, mobile: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddr.addressLine1}
                    onChange={e => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={newAddr.pincode}
                    onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={e => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={newAddr.landmark || ''}
                    onChange={e => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-white text-zinc-950 font-bold uppercase tracking-wider text-xs"
              >
                Save Address
              </button>
            </form>
          )}

          {/* Addresses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr, idx) => (
              <div key={idx} className="bg-[#121215] border border-zinc-800 p-5 space-y-3 relative text-xs">
                {addr.isDefault && (
                  <span className="px-2 py-0.5 bg-zinc-800 text-white font-bold text-[10px] uppercase tracking-wider">
                    DEFAULT ADDRESS
                  </span>
                )}
                <div>
                  <p className="font-bold text-sm text-white">{addr.fullName}</p>
                  <p className="text-zinc-400">{addr.mobile}</p>
                  <p className="text-zinc-300 mt-2">{addr.addressLine1}</p>
                  {addr.apartmentSuiteArea && <p className="text-zinc-400">{addr.apartmentSuiteArea}</p>}
                  <p className="text-zinc-400">{addr.city}, {addr.state} – {addr.pincode}</p>
                  {addr.landmark && <p className="text-zinc-500 text-[11px]">Landmark: {addr.landmark}</p>}
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/80">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(idx)}
                      className="text-white hover:underline font-semibold"
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    onClick={() => deleteAddress(idx)}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-[#121215] border border-zinc-800 p-6 max-w-xl space-y-4 text-xs">
          <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
            Personal Information
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-zinc-400 mb-1">Name</label>
              <input
                type="text"
                disabled
                value={user?.name || 'Arjun Sharma'}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-300"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || 'trendstreet277@gmail.com'}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-300"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Phone</label>
              <input
                type="tel"
                disabled
                value={user?.phone || '+91 98765 43210'}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-300"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
            <button
              onClick={logout}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-zinc-800 max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-display font-bold text-base text-white uppercase">Cancel Order</h3>
            <p className="text-zinc-400">
              Are you sure you want to cancel this order? The inventory will be automatically restored to our Mainpuri warehouse.
            </p>

            <div>
              <label className="block text-zinc-400 mb-1">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-white"
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Ordered incorrect size">Ordered incorrect size</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-bold uppercase tracking-wider text-xs"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold uppercase tracking-wider text-xs"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
