import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Plus, Check, Star, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    openProductDetail
  } = useStore();

  const [isAddedRecently, setIsAddedRecently] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Consolidate badge + discount into one deliberate, single status tag
  const consolidatedTag = discountPercent > 0
    ? `Save ${discountPercent}%`
    : product.badge
    ? product.badge
    : null;

  const isSoldOut = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    addToCart(product, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1400);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <article
      onClick={() => openProductDetail(product)}
      className="group bg-white rounded-card border border-line hover:border-brand-line hover:shadow-[0_18px_40px_-28px_rgba(17,24,39,0.4)] transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProductDetail(product);
        }
      }}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-surface">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
          loading="lazy"
        />

        {/* Consolidated Single Tag */}
        {consolidatedTag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full bg-white/95 text-brand">
              {consolidatedTag}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition border ${
            inWishlist
              ? 'bg-brand text-white border-brand'
              : 'bg-white/90 hover:bg-white text-ink-muted hover:text-ink border-line'
          }`}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick view indicator */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <span className="text-[11px] font-medium bg-white/95 text-ink px-2.5 py-1 rounded-full flex items-center gap-1">
            <span>Details</span>
            <ArrowUpRight className="w-3 h-3 text-brand" />
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.1em]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-ink font-medium">
              <Star className="w-3 h-3 fill-brand text-brand" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-ink-muted">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-semibold text-ink text-[15px] tracking-[-0.01em] line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-brand transition-colors">
            {product.name}
          </h3>

          <p className="text-[12px] text-ink-muted line-clamp-1 mt-1">
            {product.tagline || product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-semibold text-ink tracking-tight">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[12px] text-ink-muted line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {isSoldOut ? (
              <p className="text-[11px] font-medium text-rose-600 mt-0.5">Sold Out</p>
            ) : product.stock <= 5 ? (
              <p className="text-[11px] font-medium text-accent mt-0.5">Only {product.stock} remaining</p>
            ) : null}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            aria-label={isSoldOut ? 'Sold out' : `Add ${product.name} to cart`}
            className={`px-3.5 py-2 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition ${
              isSoldOut
                ? 'bg-surface text-ink-muted cursor-not-allowed'
                : isAddedRecently
                ? 'bg-brand text-white'
                : 'bg-ink hover:bg-accent text-white'
            }`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : isSoldOut ? (
              <span>Unavailable</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
