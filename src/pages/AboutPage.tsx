import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">THE BRAND ARCHITECTURE</span>
        <h1 className="font-display font-black text-3xl sm:text-6xl text-white uppercase tracking-tight">
          BORN IN MAINPURI.<br />CRAFTED FOR EVERY STREET.
        </h1>
        <div className="w-12 h-0.5 bg-white mx-auto mt-4" />
      </div>

      {/* Hero Visual */}
      <div className="aspect-[16/9] bg-zinc-950 border border-zinc-800 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85"
          alt="TREND STREET Studio Craft"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Narrative */}
      <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
        <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wide">
          The Origin of TREND STREET
        </h2>
        <p>
          TREND STREET was established in Mainpuri, Uttar Pradesh, with a singular and radical conviction: that world-class menswear, engineered silhouettes, and heavyweight organic textiles shouldn't be locked behind metro luxury boutiques or compromised by flimsy fast-fashion mall labels.
        </p>
        <p>
          We observed the Indian market flooded with thin 160 GSM synthetic poly-cotton blends that loose their shape after two washes. We set out to engineer clothing with substantial hand-feel, structural drape, and lifelong resilience.
        </p>

        <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wide pt-6">
          Our Three Fabric Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-[#121215] border border-zinc-800 p-5 space-y-2">
            <h3 className="font-bold text-white uppercase text-xs tracking-wider">1. Heavyweight Cottons</h3>
            <p className="text-xs text-zinc-400">
              We mill our basic tees at 240–260 GSM and our winter hoodies at 450 GSM French Terry. Structured, drop-shoulder silhouettes that don't cling.
            </p>
          </div>
          <div className="bg-[#121215] border border-zinc-800 p-5 space-y-2">
            <h3 className="font-bold text-white uppercase text-xs tracking-wider">2. Natural Breathability</h3>
            <p className="text-xs text-zinc-400">
              Zero polyester on your chest. We utilize 100% long-staple combed cottons, pure European flax linen, and custom twills tailored for Indian weather.
            </p>
          </div>
          <div className="bg-[#121215] border border-zinc-800 p-5 space-y-2">
            <h3 className="font-bold text-white uppercase text-xs tracking-wider">3. Artisanal Aging</h3>
            <p className="text-xs text-zinc-400">
              Enzyme stone washes, garment dyeing, and selvedge denim shuttle-loom weaving ensure each piece evolves uniquely with your body.
            </p>
          </div>
        </div>

        <div className="pt-8 bg-zinc-950 border border-zinc-800 p-8 text-center space-y-4">
          <h3 className="font-display font-bold text-xl text-white uppercase">Experience Our Flagship Store</h3>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Located in Civil Lines, Mainpuri, Uttar Pradesh. Come feel the fabrics, test silhouettes, and chat with our team.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
            >
              Store Location & Directions
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3 bg-zinc-900 border border-zinc-700 text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors"
            >
              Shop the Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
