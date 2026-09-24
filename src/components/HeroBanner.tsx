import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { setFilters, openProductDetail, products } = useStore();

  const featuredProduct = products.find((p) => p.id === 'prod-1') || products[0];

  return (
    <section className="bg-slate-950 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Editorial Headline & Context (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
              <span>Autumn 2026 Collection</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">Desk & Field Hardware</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Tools and audio equipment built for focused work.
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
              We curate high-fidelity acoustic gear, machined desktop peripherals, and durable carry essentials. Every product is evaluated for acoustic response, tactile precision, and everyday serviceability.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setFilters((p) => ({ ...p, category: 'Audio' }))}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-md transition focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none"
              >
                <span>Browse Acoustic Hardware</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setFilters((p) => ({ ...p, inStockOnly: true, sortBy: 'featured' }))}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs px-4 py-3 rounded-md transition focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
              >
                <span>View Full Catalog</span>
              </button>
            </div>

            {/* Factual Guarantees */}
            <div className="pt-6 border-t border-slate-900 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-lg font-bold text-white tracking-tight">48-Hr</p>
                <p className="text-xs text-slate-400 mt-0.5">Order Dispatch</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white tracking-tight">24-Mo</p>
                <p className="text-xs text-slate-400 mt-0.5">Full Hardware Coverage</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white tracking-tight">30-Day</p>
                <p className="text-xs text-slate-400 mt-0.5">Trial Period</p>
              </div>
            </div>
          </div>

          {/* Asymmetric Spotlight Frame (5 cols) */}
          {featuredProduct && (
            <div className="lg:col-span-5">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">
                      Product In Focus
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    SKU: {featuredProduct.id}
                  </span>
                </div>

                <div
                  onClick={() => openProductDetail(featuredProduct)}
                  className="aspect-4/3 w-full bg-slate-950 rounded-md overflow-hidden mb-4 cursor-pointer relative group border border-slate-800/80"
                >
                  <img
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-slate-900/90 text-white text-[11px] font-medium px-2 py-1 rounded border border-slate-700">
                      Inspect Specs →
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-base font-bold text-white line-clamp-1">
                      {featuredProduct.name}
                    </h2>
                    <span className="text-base font-bold text-indigo-400 font-mono">
                      ${featuredProduct.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {featuredProduct.description}
                  </p>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      <span>Stock: </span>
                      <span className={featuredProduct.stock > 0 ? 'text-slate-200 font-medium' : 'text-rose-400 font-medium'}>
                        {featuredProduct.stock > 0 ? `${featuredProduct.stock} units available` : 'Sold out'}
                      </span>
                    </div>

                    <button
                      onClick={() => openProductDetail(featuredProduct)}
                      className="text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition"
                    >
                      Specifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Value Assurances */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-6 border-t border-slate-800/80">
          <div className="flex items-start gap-3">
            <Truck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-200">Insured Transport</p>
              <p className="text-[11px] text-slate-400">Tracked FedEx/DHL on all shipments</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-200">Direct Warranty</p>
              <p className="text-[11px] text-slate-400">24-month replacement protection</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-200">30-Day Testing</p>
              <p className="text-[11px] text-slate-400">Full refunds on undamaged gear</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Award className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-200">Bench-Tested</p>
              <p className="text-[11px] text-slate-400">Verified factory calibration</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
