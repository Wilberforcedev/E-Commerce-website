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
    openProductDetail,
    setActiveProductDetail
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
      className="group bg-white rounded-lg border border-slate-200 hover:border-slate-400 transition-colors flex flex-col overflow-hidden cursor-pointer"
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
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isSoldOut ? 'opacity-50 grayscale' : 'group-hover:opacity-95'}`}
          loading="lazy"
        />

        {/* Consolidated Single Tag */}
        {consolidatedTag && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
              {consolidatedTag}
            </span>
          </div>
        )}

        {/* Wishlist Button - accessible and clean */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded flex items-center justify-center transition border ${
            inWishlist
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200'
          }`}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick view indicator on mobile & desktop */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <span className="text-[11px] font-medium bg-slate-950/80 text-white px-2 py-1 rounded flex items-center gap-1 backdrop-blur-xs">
            <span>Details</span>
            <ArrowUpRight className="w-3 h-3 text-slate-300" />
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
              <Star className="w-3 h-3 fill-slate-900 text-slate-900" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
            {product.tagline || product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-sm sm:text-base font-bold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {isSoldOut ? (
              <p className="text-[11px] font-medium text-rose-600 mt-0.5">Sold Out</p>
            ) : product.stock <= 5 ? (
              <p className="text-[11px] font-medium text-slate-600 mt-0.5">Only {product.stock} remaining</p>
            ) : null}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            aria-label={isSoldOut ? 'Sold out' : `Add ${product.name} to cart`}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              isSoldOut
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : isAddedRecently
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-indigo-600 text-white'
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
