import React from 'react';

interface ProductCardSkeletonProps {
  className?: string;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-white rounded-lg border border-line overflow-hidden flex flex-col animate-pulse select-none ${className}`}
      aria-hidden="true"
    >
      {/* Product Image Skeleton with Badge & Wishlist Placeholders */}
      <div className="relative aspect-square w-full bg-surface flex items-center justify-center overflow-hidden">
        {/* Shimmer gradient line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-line/60 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
        
        {/* Top-left badge placeholder */}
        <div className="absolute top-2.5 left-2.5 w-16 h-5 bg-line rounded" />
        
        {/* Top-right wishlist button placeholder */}
        <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded bg-line/80 border border-line" />
        
        {/* Center image placeholder glyph */}
        <div className="w-12 h-12 rounded-lg bg-line/60" />

        {/* Bottom hover bar placeholder */}
        <div className="absolute bottom-2.5 left-2.5 w-14 h-4 bg-line/70 rounded" />
      </div>

      {/* Product Information Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category & Star Rating Row */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-line rounded" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-line rounded-full" />
              <div className="h-3 w-10 bg-line rounded" />
            </div>
          </div>

          {/* Product Title (2 lines) */}
          <div className="h-4 w-5/6 bg-line rounded" />
          <div className="h-4 w-3/5 bg-surface rounded" />

          {/* Tagline / Subtitle */}
          <div className="h-3 w-11/12 bg-surface rounded pt-0.5" />
        </div>

        {/* Price & Action Button Row */}
        <div className="pt-3 border-t border-line/70 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-16 bg-line rounded" />
              <div className="h-3 w-10 bg-surface rounded" />
            </div>
            <div className="h-2.5 w-20 bg-surface rounded" />
          </div>

          {/* Add to Cart Button Skeleton */}
          <div className="h-7 w-20 bg-line rounded-md" />
        </div>
      </div>
    </div>
  );
};
