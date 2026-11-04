import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
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
    <footer className="mt-20">
      {/* Brand CTA Band */}
      <div className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <span className="eyebrow text-white/70 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Member exclusives
            </span>
            <h3 className="mt-3 text-[32px] sm:text-[40px] font-medium leading-[1.1] tracking-[-0.025em]">
              Get $20 off your first order.
            </h3>
            <p className="mt-3 text-white/75 text-sm max-w-md leading-relaxed">
              Subscribe to weekly releases, flash clearances, and product drops. No noise, just the good stuff.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full max-w-md lg:ml-auto gap-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-white/10 text-white text-sm px-5 py-3.5 rounded-full border border-white/25 outline-none focus:border-white/70 w-full placeholder:text-white/55"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-accent-dark text-white font-medium text-sm px-6 py-3.5 rounded-full transition shrink-0 flex items-center gap-1.5"
            >
              <span>Join</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Directory */}
      <div className="bg-surface border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[13px]">

            {/* Brand Info */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-brand text-white flex items-center justify-center font-semibold text-sm">
                  N
                </div>
                <span className="font-semibold text-[20px] tracking-[-0.03em] text-ink">
                  NovaMart<span className="text-accent">.</span>
                </span>
              </div>
              <p className="text-ink-muted text-[13px] leading-relaxed max-w-xs">
                Curated premium hardware, audio systems, and lifestyle accessories designed for creators, developers, and enthusiasts.
              </p>
              <p className="text-[12px] text-ink-muted/80">
                Global Headquarters: Silicon Valley, CA
              </p>
            </div>

            {/* Shop Categories */}
            <div className="space-y-3">
              <h4 className="eyebrow text-ink">Collections</h4>
              <ul className="space-y-2 text-ink-muted">
                {['Audio', 'Electronics', 'Fashion', 'Home', 'Fitness'].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setFilters((p) => ({ ...p, category: cat }));
                        setActiveView('shop');
                      }}
                      className="hover:text-brand transition"
                    >
                      {cat} Series
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-3">
              <h4 className="eyebrow text-ink">Customer care</h4>
              <ul className="space-y-2 text-ink-muted">
                <li>
                  <button onClick={() => setActiveView('orders')} className="hover:text-brand transition">
                    Track Packages
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('wishlist')} className="hover:text-brand transition">
                    Saved Wishlist
                  </button>
                </li>
                <li><span>Shipping &amp; Delivery Rates</span></li>
                <li><span>30-Day Return Policy</span></li>
                <li><span>Warranty Registration</span></li>
                <li><span>Help &amp; Support FAQ</span></li>
              </ul>
            </div>

            {/* Security & Guarantees */}
            <div className="space-y-3">
              <h4 className="eyebrow text-ink">Our promise</h4>
              <div className="space-y-2.5 text-[12px]">
                <div className="flex items-center gap-2 text-ink-muted">
                  <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
                  <span>2-Year Manufacturer Warranty</span>
                </div>
                <div className="flex items-center gap-2 text-ink-muted">
                  <Truck className="w-4 h-4 text-brand shrink-0" />
                  <span>Express Courier Dispatch</span>
                </div>
                <div className="flex items-center gap-2 text-ink-muted">
                  <RotateCcw className="w-4 h-4 text-accent shrink-0" />
                  <span>Hassle-Free Returns</span>
                </div>
                <div className="flex items-center gap-2 text-ink-muted">
                  <Heart className="w-4 h-4 text-brand shrink-0" />
                  <span>Independently Owned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-ink-muted">
            <p>© 2026 NovaMart Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-ink cursor-pointer">Privacy Policy</span>
              <span className="text-line">•</span>
              <span className="hover:text-ink cursor-pointer">Terms of Service</span>
              <span className="text-line">•</span>
              <span className="hover:text-ink cursor-pointer">Cookie Preferences</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
