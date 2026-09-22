import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink, Check, ArrowRight } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'Order Inquiry', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: 'Order Inquiry', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">CLIENT CONCIERGE</span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
          CONNECT WITH TREND STREET
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Visit our flagship store in Mainpuri, Uttar Pradesh or get in touch with our online support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Physical Store Info & Direct Channels */}
        <div className="lg:col-span-6 space-y-8">
          <div className="bg-[#121215] border border-zinc-800 p-8 space-y-6">
            <h2 className="font-display font-bold text-xl text-white uppercase tracking-wide">
              Mainpuri Flagship Store
            </h2>

            <div className="space-y-4 text-xs text-zinc-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Store Address</p>
                  <p className="text-zinc-400 leading-relaxed mt-0.5">
                    Station Road, Near Civil Lines Post Office<br />
                    Opposite District Court Complex<br />
                    Mainpuri, Uttar Pradesh 205001, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Visiting Hours</p>
                  <p className="text-zinc-400 mt-0.5">Monday through Sunday: 10:30 AM – 9:30 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Telephone Support</p>
                  <a href="tel:+919876543210" className="text-zinc-400 hover:text-white transition-colors block mt-0.5">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm">Email Address</p>
                  <a href="mailto:trendstreet277@gmail.com" className="text-zinc-400 hover:text-white transition-colors block mt-0.5">
                    trendstreet277@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/919876543210?text=Hi%2C%20I%20need%20assistance%20from%20Trend%20Street."
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Concierge</span>
              </a>

              <a
                href="https://maps.google.com/?q=Mainpuri+Uttar+Pradesh"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-850 text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-colors"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Message / Inquiry Form */}
        <div className="lg:col-span-6 bg-[#121215] border border-zinc-800 p-8 space-y-6">
          <h2 className="font-display font-bold text-xl text-white uppercase tracking-wide">
            Send an Online Inquiry
          </h2>
          <p className="text-xs text-zinc-400">
            Have questions about custom sizing, wholesale inquiries, or pending dispatches? Drop our team a message.
          </p>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs space-y-2">
              <p className="font-bold text-sm flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Message Received
              </p>
              <p className="text-zinc-300">
                Our Mainpuri customer concierge team will respond within 4 business hours to your email or WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aman Gupta"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="trendstreet277@gmail.com"
                  className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Inquiry Topic</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white focus:outline-none focus:border-white"
                >
                  <option value="Order Tracking">Order Tracking & Delivery</option>
                  <option value="Size Exchange">Size Exchange or Return</option>
                  <option value="Mainpuri Store Visit">Mainpuri Flagship Store Visit</option>
                  <option value="Bulk Order">Custom / Bulk Order</option>
                  <option value="General Question">General Brand Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Include any specific details or order numbers..."
                  className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-white text-zinc-950 font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
