import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">CLIENT SERVICES</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight mt-1">
          7-DAY RETURNS & SIZE EXCHANGES
        </h1>
        <p className="text-xs text-zinc-400 mt-2">TREND STREET Customer Satisfaction Commitment</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <section className="bg-[#121215] border border-zinc-800 p-6 space-y-3">
          <h2 className="font-bold text-white uppercase text-base flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-white" />
            <span>Our Easy Exchange Guarantee</span>
          </h2>
          <p>
            We want you to feel confident in the fit and drape of every TREND STREET garment. If the size does not fit you perfectly, you can request a free size replacement within 7 calendar days of receiving your package.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-white uppercase text-base">Eligibility Conditions</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>Item must be unwashed, unworn, and unaltered.</li>
            <li>Original brand tags and dust bag packaging must be intact.</li>
            <li>Exchange request initiated within 7 days from the delivery date shown on courier tracking.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-white uppercase text-base">Step-by-Step Exchange Process</h2>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-900 border border-zinc-800">
              <p className="font-bold text-white">1. Initiate via WhatsApp or Order History</p>
              <p className="text-zinc-400 text-xs mt-1">
                Go to <strong className="text-white">My Account & Orders</strong> or message our WhatsApp concierge at <strong className="text-white">+91 98765 43210</strong> with your order number and desired size.
              </p>
            </div>
            <div className="p-4 bg-zinc-900 border border-zinc-800">
              <p className="font-bold text-white">2. Doorstep Pickup</p>
              <p className="text-zinc-400 text-xs mt-1">
                Our logistics partner will arrange a doorstep reverse pickup from your original delivery address within 24–48 hours.
              </p>
            </div>
            <div className="p-4 bg-zinc-900 border border-zinc-800">
              <p className="font-bold text-white">3. Fast Replacement Dispatch</p>
              <p className="text-zinc-400 text-xs mt-1">
                Once the pickup is scanned, our Mainpuri warehouse will immediately dispatch the replacement size with fresh express tracking.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-white uppercase text-base">Refunds for Returns</h2>
          <p>
            For verified returns without replacement, refunds for prepaid orders are credited back to your original source account via Razorpay within 3–5 banking days. For COD orders, refund is transferred to your UPI ID or Bank Account via NEFT.
          </p>
        </section>
      </div>
    </div>
  );
};
