import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">LEGAL & PRIVACY</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight mt-1">
          PRIVACY POLICY
        </h1>
        <p className="text-xs text-zinc-400 mt-2">TREND STREET • Mainpuri, Uttar Pradesh, India</p>
      </div>

      <p>
        At TREND STREET, we respect your privacy. This policy describes how we collect, process, and protect your personal information when you visit our website or make purchases from our store.
      </p>

      <section className="space-y-2">
        <h2 className="font-bold text-white uppercase text-base">1. Information We Collect</h2>
        <p>
          We collect your name, shipping address, mobile telephone number, email address, and IP address solely for order processing, logistics fulfillment, and fraud prevention.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-white uppercase text-base">2. Payment Data Security</h2>
        <p>
          All online card, net banking, and UPI payments are processed directly by <strong>Razorpay</strong> over bank-grade 256-bit SSL encrypted channels. TREND STREET never stores your CVV, credit card numbers, or UPI PINs on our servers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-white uppercase text-base">3. Contact Us</h2>
        <p>
          If you have questions about your personal data or wish to update your records, please contact our Data Protection representative at <strong className="text-white">trendstreet277@gmail.com</strong> or visit our store in Mainpuri, Uttar Pradesh.
        </p>
      </section>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">TERMS OF USE</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight mt-1">
          TERMS & CONDITIONS
        </h1>
        <p className="text-xs text-zinc-400 mt-2">Governing purchases and store operations at TREND STREET</p>
      </div>

      <p>
        Welcome to TREND STREET. By accessing our website, browsing collections, or placing orders, you agree to be bound by the following terms and conditions.
      </p>

      <section className="space-y-2">
        <h2 className="font-bold text-white uppercase text-base">1. Products & Pricing</h2>
        <p>
          All prices are quoted in Indian Rupees (INR) and include applicable taxes (GST). We reserve the right to modify prices or discontinue items without prior notice.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-white uppercase text-base">2. Order Acceptance</h2>
        <p>
          Receipt of an electronic order confirmation does not signify our final acceptance of your order. TREND STREET reserves the right to cancel orders in case of inventory discrepancies or fraudulent activities.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-white uppercase text-base">3. Jurisdiction</h2>
        <p>
          Any disputes arising from transactions on this platform shall be subject to the exclusive jurisdiction of the competent courts in Mainpuri, Uttar Pradesh, India.
        </p>
      </section>
    </div>
  );
};
