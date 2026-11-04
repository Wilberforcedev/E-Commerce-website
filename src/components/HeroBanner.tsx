import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { setFilters, openProductDetail, products } = useStore();

  const featuredProduct = products.find((p) => p.id === 'prod-1') || products[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-surface via-white to-white border-b border-line">
      {/* Soft brand wash */}
      <div className="pointer-events-none absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-brand-soft blur-3xl opacity-80" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full bg-accent-soft blur-3xl opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 lg:pt-20 lg:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Editorial Headline */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-line text-[12px] font-medium text-ink-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
              <span>Autumn 2026 Collection</span>
              <span className="text-line">/</span>
              <span>Desk &amp; Field Hardware</span>
            </div>

            <h1 className="mt-6 text-[42px] sm:text-[52px] lg:text-[60px] font-medium leading-[1.04] tracking-[-0.03em] text-ink">
              Tools for<br className="sm:hidden" /> focused work.
              <br />
              <span className="text-accent">Built to last.</span>
            </h1>

            <p className="mt-6 text-ink-muted text-[15px] sm:text-base max-w-xl leading-relaxed">
              High-fidelity acoustic gear, machined desktop peripherals, and durable carry essentials — evaluated for acoustic response, tactile precision, and everyday serviceability.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button
                onClick={() => setFilters((p) => ({ ...p, category: 'Audio' }))}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium text-sm px-6 py-3 rounded-full transition focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 outline-none"
              >
                <span>Browse Acoustic Hardware</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setFilters((p) => ({ ...p, inStockOnly: true, sortBy: 'featured' }))}
                className="inline-flex items-center gap-2 bg-white hover:bg-surface text-ink border border-line font-medium text-sm px-5 py-3 rounded-full transition focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 outline-none"
              >
                <span>View Full Catalog</span>
              </button>
            </div>

            {/* Factual Guarantees */}
            <div className="mt-10 pt-6 border-t border-line grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-[22px] font-semibold text-ink tracking-tight">48-Hr</p>
                <p className="text-[12px] text-ink-muted mt-0.5">Order dispatch</p>
              </div>
              <div className="pl-4 border-l border-line">
                <p className="text-[22px] font-semibold text-ink tracking-tight">24-Mo</p>
                <p className="text-[12px] text-ink-muted mt-0.5">Hardware coverage</p>
              </div>
              <div className="pl-4 border-l border-line">
                <p className="text-[22px] font-semibold text-ink tracking-tight">30-Day</p>
                <p className="text-[12px] text-ink-muted mt-0.5">Trial period</p>
              </div>
            </div>
          </div>

          {/* Spotlight Card */}
          {featuredProduct && (
            <div className="lg:col-span-5">
              <div className="bg-white border border-line rounded-panel p-4 shadow-[0_18px_50px_-30px_rgba(17,24,39,0.35)]">
                <div className="flex items-center justify-between px-1 mb-3">
                  <span className="eyebrow text-brand">Product in focus</span>
                  <span className="text-[11px] font-mono text-ink-muted">
                    SKU: {featuredProduct.id}
                  </span>
                </div>

                <div
                  onClick={() => openProductDetail(featuredProduct)}
                  className="aspect-4/3 w-full bg-surface rounded-card overflow-hidden mb-4 cursor-pointer relative group"
                >
                  <img
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white/95 text-ink text-[11px] font-medium px-3 py-1 rounded-full border border-line">
                      Inspect specs →
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 bg-white/95 text-brand text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    ${featuredProduct.price.toFixed(2)}
                  </span>
                </div>

                <div className="px-1 space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-lg font-semibold text-ink tracking-[-0.01em] line-clamp-1">
                      {featuredProduct.name}
                    </h2>
                  </div>

                  <p className="text-[13px] text-ink-muted line-clamp-2 leading-relaxed">
                    {featuredProduct.description}
                  </p>

                  <div className="pt-3 border-t border-line flex items-center justify-between">
                    <span className={`text-[12px] ${featuredProduct.stock > 0 ? 'text-brand font-medium' : 'text-rose-600 font-medium'}`}>
                      {featuredProduct.stock > 0 ? `${featuredProduct.stock} units available` : 'Sold out'}
                    </span>

                    <button
                      onClick={() => openProductDetail(featuredProduct)}
                      className="text-[13px] font-medium text-ink bg-surface hover:bg-brand hover:text-white px-4 py-2 rounded-full transition"
                    >
                      Specifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Value Assurances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 mt-12 pt-6 border-t border-line">
          <div className="flex items-start gap-3">
            <Truck className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-ink">Insured Transport</p>
              <p className="text-[12px] text-ink-muted">Tracked FedEx/DHL on all shipments</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-ink">Direct Warranty</p>
              <p className="text-[12px] text-ink-muted">24-month replacement protection</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-ink">30-Day Testing</p>
              <p className="text-[12px] text-ink-muted">Full refunds on undamaged gear</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Award className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-ink">Bench-Tested</p>
              <p className="text-[12px] text-ink-muted">Verified factory calibration</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
