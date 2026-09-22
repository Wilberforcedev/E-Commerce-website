import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Review } from '../types';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Share2,
  MessageSquarePlus,
  Send
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    activeProductDetail,
    setActiveProductDetail,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateProduct,
    addToast
  } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');

  // Customer Reviews State
  const [sampleReviews, setSampleReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      productId: activeProductDetail?.id || '',
      author: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
      rating: 5,
      date: '3 days ago',
      comment: 'Absolutely exceeded my expectations! Build quality is remarkably solid and performance is flawless.',
      verifiedPurchase: true
    },
    {
      id: 'rev-2',
      productId: activeProductDetail?.id || '',
      author: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
      rating: 5,
      date: '1 week ago',
      comment: 'Top tier craftsmanship. Shipped very fast in secure packaging. Would gladly buy again.',
      verifiedPurchase: true
    }
  ]);

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isAddingReview, setIsAddingReview] = useState(false);

  if (!activeProductDetail) return null;

  const product = activeProductDetail;
  const inWishlist = isInWishlist(product.id);
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setActiveProductDetail(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link Copied!', 'Product page link copied to clipboard.');
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: 'Just now',
      comment: newReviewComment.trim(),
      verifiedPurchase: true
    };

    setSampleReviews([newRev, ...sampleReviews]);

    // Update parent product rating and count
    const updatedCount = product.reviewCount + 1;
    const updatedRating = Math.round(((product.rating * product.reviewCount + newReviewRating) / updatedCount) * 10) / 10;
    
    updateProduct({
      ...product,
      rating: updatedRating,
      reviewCount: updatedCount
    });

    setNewReviewAuthor('');
    setNewReviewComment('');
    setIsAddingReview(false);
    addToast('Review Submitted', 'Thank you for your feedback!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setActiveProductDetail(null)}
      />

      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        
        {/* Header Action Bar */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Store</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">{product.category}</span>
            <span>/</span>
            <span className="text-slate-900 truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              title="Share Product"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveProductDetail(null)}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              aria-label="Close product details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Top Overview: Gallery & Buy Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Gallery Column */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {product.badge && (
                  <span className="absolute top-4 left-4 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        selectedImageIndex === idx
                          ? 'border-indigo-600 ring-2 ring-indigo-100'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Purchase Column */}
            <div className="flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({product.reviewCount} customer reviews)</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                {product.tagline && (
                  <p className="text-xs font-medium text-slate-500 mt-1 italic">
                    "{product.tagline}"
                  </p>
                )}

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-3xl font-black text-slate-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-base text-slate-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                {/* Stock indicator */}
                <div className="mt-3 flex items-center gap-2">
                  {product.stock > 0 ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>In Stock ({product.stock} units available)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Currently Out of Stock</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-white disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-extrabold text-sm text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-white disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-xl border transition flex items-center justify-center ${
                      inWishlist
                        ? 'border-rose-300 bg-rose-50 text-rose-600'
                        : 'border-slate-200 text-slate-600 hover:text-rose-500 hover:bg-rose-50'
                    }`}
                    title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full py-3.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 text-xs sm:text-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition disabled:opacity-50 text-xs sm:text-sm"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Free shipping &gt;$100</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30-Day returns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>2-Year warranty</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs: Features, Specs, Reviews */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-xs font-bold uppercase tracking-wider pb-1 transition ${
                  activeTab === 'overview'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Features & Highlights
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-xs font-bold uppercase tracking-wider pb-1 transition ${
                  activeTab === 'specs'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-xs font-bold uppercase tracking-wider pb-1 transition flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Reviews</span>
                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">
                  {product.reviewCount}
                </span>
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Specs */}
            {activeTab === 'specs' && (
              <div className="pt-4">
                {product.specs ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="grid grid-cols-3 p-3 text-xs">
                        <span className="font-semibold text-slate-500">{key}</span>
                        <span className="col-span-2 font-bold text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Standard manufacturer specifications apply.</p>
                )}
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="pt-4 space-y-6">
                
                {/* Review Header & Add Review Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-slate-900">{product.rating.toFixed(1)}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(product.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Based on {product.reviewCount} customer ratings</p>
                  </div>

                  <button
                    onClick={() => setIsAddingReview(!isAddingReview)}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>{isAddingReview ? 'Cancel Review' : 'Write a Review'}</span>
                  </button>
                </div>

                {/* Add Review Form */}
                {isAddingReview && (
                  <form onSubmit={handleAddReview} className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-900">Share Your Experience</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Rating</label>
                        <div className="flex items-center gap-1 pt-1">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              type="button"
                              key={num}
                              onClick={() => setNewReviewRating(num)}
                              className="p-1 text-slate-300 hover:text-amber-400 transition"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  num <= newReviewRating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Review</label>
                      <textarea
                        required
                        rows={3}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="What did you like or dislike about this product?"
                        className="w-full bg-white text-xs p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Review</span>
                    </button>
                  </form>
                )}

                {/* Review Cards */}
                <div className="space-y-3">
                  {sampleReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-slate-100 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                            alt={rev.author}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-800">{rev.author}</span>
                            {rev.verifiedPurchase && (
                              <span className="ml-2 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                      </div>

                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-current' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
