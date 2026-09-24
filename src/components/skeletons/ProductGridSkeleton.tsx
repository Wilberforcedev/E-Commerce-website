import React from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 6,
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading product catalog..."
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`product-skeleton-${index}`} />
      ))}
      <span className="sr-only">Loading products...</span>
    </div>
  );
};
