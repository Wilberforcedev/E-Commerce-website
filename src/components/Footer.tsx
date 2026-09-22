import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Send,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { addToast, setFilters, setActiveView } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    addToast('Subscribed!', 'Thank you! You will receive 10% off coupon in your inbox.');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Newsletter Card */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-indigo-950/60 p-8 sm:p-10 rounded-3xl border border-indigo-500/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center md:text-left max-w-md">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center justify-center md:justify-start gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Member Exclusives
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Get $20 Off Your First Order
            </h3>
            <p className="text-xs text-slate-300">
              Subscribe to weekly releases, flash clearances, and product drops.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-slate-900/80 text-white text-xs px-4 py-3 rounded-xl border border-slate-700 outline-none focus:border-indigo-500 w-full sm:w-72 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg shrink-0 flex items-center gap-1.5"
            >
              <span>Join</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 4-Column Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-black text-lg text-white tracking-tight">NovaMart</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Curated premium hardware, audio systems, and lifestyle accessories designed for creators, developers, and enthusiasts.
            </p>
            <p className="text-[11px] text-slate-500">
              Global Headquarters: Silicon Valley, CA
            </p>
          </div>

          {/* Shop Categories */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-white text-xs">
              Collections
            </h4>
            <ul className="space-y-2">
              {['Audio', 'Electronics', 'Fashion', 'Home', 'Fitness'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      setFilters((p) => ({ ...p, category: cat }));
                      setActiveView('shop');
                    }}
                    className="hover:text-indigo-400 transition"
                  >
                    {cat} Series
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-white text-xs">
              Customer Care
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveView('orders')} className="hover:text-indigo-400 transition">
                  Track Packages
                </button>
              </li>
              <li>
                <span className="text-slate-400">Shipping & Delivery Rates</span>
              </li>
              <li>
                <span className="text-slate-400">30-Day Return Policy</span>
              </li>
              <li>
                <span className="text-slate-400">Warranty Registration</span>
              </li>
              <li>
                <span className="text-slate-400">Help & Support FAQ</span>
              </li>
            </ul>
          </div>

          {/* Security & Guarantees */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase tracking-wider text-white text-xs">
              Our Promise
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2-Year Manufacturer Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Express Courier Dispatch</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hassle-Free Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 NovaMart Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
