import React from 'react';
import { Truck, MapPin, ShieldCheck, Clock } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">STORE POLICIES</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight mt-1">
          SHIPPING & DELIVERY POLICY
        </h1>
        <p className="text-xs text-zinc-400 mt-2">Effective Date: January 1, 2026 • TREND STREET Mainpuri</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <section className="space-y-3 bg-[#121215] border border-zinc-800 p-6">
          <h2 className="font-bold text-white uppercase text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-white" />
            <span>Pan-India Shipping Coverage</span>
          </h2>
          <p>
            TREND STREET operates from our flagship fulfillment hub in Mainpuri, Uttar Pradesh. We ship to 26,000+ postal pin codes across all Indian states and Union Territories through tier-1 express logistics partners including Blue Dart, Delhivery, and DTDC.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-white uppercase text-base">Delivery Timelines</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 space-y-1">
              <p className="font-bold text-white">Mainpuri & Surrounding UP Districts</p>
              <p className="text-emerald-400 font-semibold">Same-Day to 2 Business Days</p>
              <p className="text-zinc-400 text-xs">Direct courier dispatch from Station Road store.</p>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 space-y-1">
              <p className="font-bold text-white">Delhi NCR, Lucknow, Kanpur, Agra</p>
              <p className="text-white font-semibold">2–3 Business Days</p>
              <p className="text-zinc-400 text-xs">Direct regional linehaul express.</p>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 space-y-1">
              <p className="font-bold text-white">Mumbai, Bangalore, Hyderabad, Chennai</p>
              <p className="text-white font-semibold">3–5 Business Days</p>
              <p className="text-zinc-400 text-xs">Air express shipping with live tracking.</p>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 space-y-1">
              <p className="font-bold text-white">Rest of India & Northeast</p>
              <p className="text-white font-semibold">4–6 Business Days</p>
              <p className="text-zinc-400 text-xs">Surface and air express combination.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-white uppercase text-base">Shipping Rates</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li><strong className="text-white">Orders above ₹1,999:</strong> Free Express Delivery across India.</li>
            <li><strong className="text-white">Orders below ₹1,999:</strong> Flat ₹99 standard shipping fee.</li>
            <li><strong className="text-white">Mainpuri Store Pickup:</strong> 100% Free with zero minimum order. Pick up within 2 hours at our Civil Lines flagship store.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-white uppercase text-base">Cash on Delivery (COD)</h2>
          <p>
            Cash on Delivery is available for all serviceable PIN codes up to an order value of ₹10,000. You may pay via Cash or UPI QR scan upon courier arrival at your doorstep.
          </p>
        </section>
      </div>
    </div>
  );
};
