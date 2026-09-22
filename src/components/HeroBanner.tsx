import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowRight, Shield, Truck, RotateCcw, Clock } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { setFilters, setActiveProductDetail, products } = useStore();

  const featuredHeadphones = products.find((p) => p.id === 'prod-1') || products[0];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-12 lg:py-16">
      {/* Decorative blurred background lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text / CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Next-Gen Precision Products
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Elevate Your Everyday <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Lifestyle & Tech.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Curated audio equipment, mechanical workspace gear, minimalist timepieces, and fitness essentials. Engineered for maximum longevity.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => setFilters((p) => ({ ...p, category: 'Audio' }))}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all flex items-center gap-2 group text-sm"
              >
                <span>Shop Audio & Sound</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setFilters((p) => ({ ...p, inStockOnly: true, sortBy: 'price-asc' }))}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-5 py-3.5 rounded-xl transition text-sm backdrop-blur-md"
              >
                View Best Values
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center lg:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">45k+</p>
                <p className="text-xs text-slate-400">Happy Shoppers</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">4.9/5</p>
                <p className="text-xs text-slate-400">Average Rating</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
                <p className="text-xs text-slate-400">Original Goods</p>
              </div>
            </div>
          </div>

          {/* Right Featured Hero Product Card */}
          {featuredHeadphones && (
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl transition hover:scale-[1.01]">
                <div className="absolute top-4 right-4 bg-amber-400 text-slate-950 font-extrabold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  Staff Pick
                </div>

                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950/40 mb-5 group cursor-pointer"
                  onClick={() => setActiveProductDetail(featuredHeadphones)}
                >
                  <img
                    src={featuredHeadphones.images[0]}
                    alt={featuredHeadphones.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-lg">
                      Quick View Details
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                      {featuredHeadphones.category}
                    </span>
                    <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                      ★ {featuredHeadphones.rating} ({featuredHeadphones.reviewCount})
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-white mb-1.5 line-clamp-1">
                    {featuredHeadphones.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-4">
                    {featuredHeadphones.tagline || featuredHeadphones.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <span className="text-2xl font-black text-white">
                        ${featuredHeadphones.price.toFixed(2)}
                      </span>
                      {featuredHeadphones.originalPrice && (
                        <span className="ml-2 text-xs text-slate-400 line-through">
                          ${featuredHeadphones.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveProductDetail(featuredHeadphones)}
                      className="bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow"
                    >
                      Shop Spotlight
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Value Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Free Fast Shipping</p>
              <p className="text-[11px] text-slate-400">On all orders over $100</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">2-Year Full Warranty</p>
              <p className="text-[11px] text-slate-400">100% replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">30-Day Easy Returns</p>
              <p className="text-[11px] text-slate-400">No questions asked</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">24/7 Dedicated Support</p>
              <p className="text-[11px] text-slate-400">Direct specialist assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
