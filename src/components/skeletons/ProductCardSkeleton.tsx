import React from 'react';

interface ProductCardSkeletonProps {
  className?: string;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col animate-pulse select-none ${className}`}
      aria-hidden="true"
    >
      {/* Product Image Skeleton with Badge & Wishlist Placeholders */}
      <div className="relative aspect-square w-full bg-slate-100 flex items-center justify-center overflow-hidden">
        {/* Shimmer gradient line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/40 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
        
        {/* Top-left badge placeholder */}
        <div className="absolute top-2.5 left-2.5 w-16 h-5 bg-slate-200 rounded" />
        
        {/* Top-right wishlist button placeholder */}
        <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded bg-slate-200/80 border border-slate-200" />
        
        {/* Center image placeholder glyph */}
        <div className="w-12 h-12 rounded-lg bg-slate-200/60" />

        {/* Bottom hover bar placeholder */}
        <div className="absolute bottom-2.5 left-2.5 w-14 h-4 bg-slate-200/70 rounded" />
      </div>

      {/* Product Information Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category & Star Rating Row */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-slate-200 rounded-full" />
              <div className="h-3 w-10 bg-slate-200 rounded" />
            </div>
          </div>

          {/* Product Title (2 lines) */}
          <div className="h-4 w-5/6 bg-slate-200 rounded" />
          <div className="h-4 w-3/5 bg-slate-100 rounded" />

          {/* Tagline / Subtitle */}
          <div className="h-3 w-11/12 bg-slate-100 rounded pt-0.5" />
        </div>

        {/* Price & Action Button Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-16 bg-slate-200 rounded" />
              <div className="h-3 w-10 bg-slate-100 rounded" />
            </div>
            <div className="h-2.5 w-20 bg-slate-100 rounded" />
          </div>

          {/* Add to Cart Button Skeleton */}
          <div className="h-7 w-20 bg-slate-200 rounded-md" />
        </div>
      </div>
    </div>
  );
};
