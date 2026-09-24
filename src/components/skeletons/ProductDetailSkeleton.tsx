import React from 'react';
import { X, Share2 } from 'lucide-react';

interface ProductDetailSkeletonProps {
  onClose?: () => void;
}

export const ProductDetailSkeleton: React.FC<ProductDetailSkeletonProps> = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-label="Loading product details"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
    >
      {/* Background dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-lg max-w-4xl w-full border border-slate-200 shadow-xl overflow-hidden z-10 flex flex-col max-h-[92vh] animate-pulse">
        {/* Header Action Bar Skeleton */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-slate-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="h-3 w-14 bg-slate-200 rounded" />
            <span className="text-slate-300">/</span>
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <span className="text-slate-300">/</span>
            <div className="h-3 w-28 bg-slate-200 rounded" />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="p-1.5 text-slate-300 rounded cursor-not-allowed"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded transition"
              aria-label="Close product details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Top Overview: Gallery & Buy Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gallery Skeleton Column */}
            <div className="space-y-3">
              {/* Main large image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                <div className="w-16 h-16 rounded-xl bg-slate-200" />
                <div className="absolute top-3 left-3 w-16 h-5 bg-slate-200 rounded" />
              </div>

              {/* Thumbnails strip */}
              <div className="flex gap-2 overflow-hidden pb-1">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`thumb-skeleton-${idx}`}
                    className="w-16 h-16 rounded bg-slate-100 border border-slate-200 shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* Info & Purchase Skeleton Column */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category & Star Rating */}
                <div className="flex items-center gap-2">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 bg-slate-200 rounded" />
                    <div className="h-3 w-12 bg-slate-200 rounded" />
                    <div className="h-3 w-16 bg-slate-100 rounded" />
                  </div>
                </div>

                {/* Product Title (2 lines) */}
                <div className="space-y-2">
                  <div className="h-6 w-11/12 bg-slate-200 rounded" />
                  <div className="h-6 w-3/4 bg-slate-200 rounded" />
                </div>

                {/* Tagline */}
                <div className="h-4 w-4/5 bg-slate-100 rounded" />

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-2">
                  <div className="h-8 w-28 bg-slate-200 rounded" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                  <div className="h-5 w-20 bg-slate-100 rounded" />
                </div>

                {/* In Stock Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <div className="h-3.5 w-32 bg-slate-200 rounded" />
                </div>

                {/* Description Paragraph (3 lines) */}
                <div className="space-y-2 pt-1">
                  <div className="h-3.5 w-full bg-slate-100 rounded" />
                  <div className="h-3.5 w-11/12 bg-slate-100 rounded" />
                  <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
                </div>
              </div>

              {/* Quantity & CTA Buttons Skeleton */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="h-8 w-24 bg-slate-100 border border-slate-200 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>

                {/* Add to Cart & Buy Now Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-10 bg-slate-200 rounded-md" />
                  <div className="h-10 bg-slate-200 rounded-md" />
                </div>

                {/* Trust Badges Row */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`trust-skeleton-${i}`} className="flex items-center gap-2 p-2">
                      <div className="w-4 h-4 rounded bg-slate-200 shrink-0" />
                      <div className="space-y-1 w-full">
                        <div className="h-2.5 w-14 bg-slate-200 rounded" />
                        <div className="h-2 w-10 bg-slate-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lower Tabs Skeleton */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex gap-4 border-b border-slate-200 pb-2">
              <div className="h-6 w-24 bg-slate-200 rounded" />
              <div className="h-6 w-28 bg-slate-100 rounded" />
              <div className="h-6 w-20 bg-slate-100 rounded" />
            </div>
            <div className="space-y-2 py-2">
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-5/6 bg-slate-100 rounded" />
              <div className="h-4 w-2/3 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
