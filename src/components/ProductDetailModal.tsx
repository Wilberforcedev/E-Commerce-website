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
  Send,
  Mic
} from 'lucide-react';
import { VoiceMicButton } from './VoiceMicButton';
import { ProductDetailSkeleton } from './skeletons/ProductDetailSkeleton';

export const ProductDetailModal: React.FC = () => {
  const {
    activeProductDetail,
    setActiveProductDetail,
    isProductDetailLoading,
    setIsProductDetailLoading,
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

  if (!activeProductDetail && !isProductDetailLoading) return null;

  if (isProductDetailLoading || !activeProductDetail) {
    return (
      <ProductDetailSkeleton
        onClose={() => {
          setActiveProductDetail(null);
          setIsProductDetailLoading(false);
        }}
      />
    );
  }

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setActiveProductDetail(null)}
      />

      <div className="relative bg-white rounded-panel max-w-4xl w-full border border-line shadow-xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        
        {/* Header Action Bar */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-line bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-ink-muted font-mono">
            <span>Hardware</span>
            <span>/</span>
            <span className="text-ink font-semibold">{product.category}</span>
            <span>/</span>
            <span className="text-ink-muted truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-1.5 text-ink-muted hover:text-ink rounded transition"
              title="Share Product"
              aria-label="Share product link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveProductDetail(null)}
              className="p-1.5 text-ink-muted/80 hover:text-ink rounded transition"
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
            
            {/* Gallery Column */}
            <div className="space-y-3">
              <div className="relative aspect-[4/3] md:aspect-square rounded-card overflow-hidden bg-surface border border-line">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {product.badge && (
                  <span className="absolute top-3 left-3 bg-brand text-white font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded overflow-hidden shrink-0 border transition ${
                        selectedImageIndex === idx
                          ? 'border-brand ring-1 ring-brand'
                          : 'border-line opacity-60 hover:opacity-100'
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
                  <span className="text-[11px] uppercase font-mono tracking-wider text-ink-muted">
                    {product.category}
                  </span>
                  <span className="text-line">•</span>
                  <div className="flex items-center gap-1 text-xs font-medium text-ink">
                    <Star className="w-3.5 h-3.5 fill-brand text-ink" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-ink-muted/80 font-normal">({product.reviewCount} reviews)</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight leading-snug">
                  {product.name}
                </h1>

                {product.tagline && (
                  <p className="text-xs text-ink-muted mt-1">
                    {product.tagline}
                  </p>
                )}

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-2xl sm:text-3xl font-semibold text-ink tracking-[-0.02em]">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-sm text-ink-muted/80 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-semibold text-brand bg-brand-soft px-2.5 py-1 rounded-full">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                {/* Stock indicator */}
                <div className="mt-3 flex items-center gap-2">
                  {product.stock > 0 ? (
                    <div className="flex items-center gap-1.5 text-xs text-ink">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                      <span>In Stock ({product.stock} units available)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" />
                      <span>Currently Out of Stock</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-ink-muted mt-3 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-4 border-t border-line">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-line rounded bg-surface">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-2.5 py-1 text-ink-muted hover:bg-line/60 transition disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-semibold text-ink">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="px-2.5 py-1 text-ink-muted hover:bg-line/60 transition disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2 rounded-xl border transition flex items-center justify-center ${
                      inWishlist
                        ? 'border-brand-line bg-brand-soft text-brand'
                        : 'border-line text-ink-muted hover:text-brand hover:bg-surface'
                    }`}
                    title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full py-2.5 px-4 bg-white hover:bg-surface text-ink font-semibold border border-line rounded-md flex items-center justify-center gap-1.5 transition disabled:opacity-40 text-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="w-full py-2.5 px-4 bg-accent hover:bg-accent-dark text-white font-semibold rounded-full transition disabled:opacity-40 text-xs"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-line text-[11px] text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  <span>Free shipping &gt;$100</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-ink-muted shrink-0" />
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
          <div className="pt-6 border-t border-line">
            <div className="flex items-center gap-4 border-b border-line pb-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-xs font-bold uppercase tracking-wider pb-1 transition ${
                  activeTab === 'overview'
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Features & Highlights
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-xs font-bold uppercase tracking-wider pb-1 transition ${
                  activeTab === 'specs'
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-xs font-bold uppercase tracking-wider pb-1 transition flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <span>Reviews</span>
                <span className="bg-surface text-ink px-1.5 py-0.5 rounded-full text-[10px]">
                  {product.reviewCount}
                </span>
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted/80">
                  Key Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-surface border border-line/70 text-xs font-semibold text-ink"
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
                  <div className="divide-y divide-line/70 border border-line rounded-xl overflow-hidden">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="grid grid-cols-3 p-3 text-xs">
                        <span className="font-semibold text-ink-muted">{key}</span>
                        <span className="col-span-2 font-bold text-ink">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-muted">Standard manufacturer specifications apply.</p>
                )}
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="pt-4 space-y-6">
                
                {/* Review Header & Add Review Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-line/70">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-semibold text-ink">{product.rating.toFixed(1)}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(product.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-line'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5">Based on {product.reviewCount} customer ratings</p>
                  </div>

                  <button
                    onClick={() => setIsAddingReview(!isAddingReview)}
                    className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>{isAddingReview ? 'Cancel Review' : 'Write a Review'}</span>
                  </button>
                </div>

                {/* Add Review Form */}
                {isAddingReview && (
                  <form onSubmit={handleAddReview} className="bg-brand-soft/50 p-4 rounded-card border border-brand-soft space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-brand-dark">Share Your Experience</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-ink block mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-line outline-none focus:border-brand-bright"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-ink block mb-1">Rating</label>
                        <div className="flex items-center gap-1 pt-1">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              type="button"
                              key={num}
                              onClick={() => setNewReviewRating(num)}
                              className="p-1 text-line hover:text-amber-400 transition"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  num <= newReviewRating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-line'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-ink">Your Review</label>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[10px] text-ink-muted/80">Speak review:</span>
                          <VoiceMicButton
                            mode="generic"
                            title="Speak Your Product Review"
                            subtitle="Speak your thoughts and Gemini 3.5 Transcribe will transcribe your review"
                            tooltip="Transcribe review with microphone (gemini-3.5-transcribe)"
                            buttonClassName="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-soft hover:bg-brand-soft text-brand text-[10px] font-bold transition"
                            onTranscribe={(transcribed) => {
                              setNewReviewComment((prev) => (prev ? `${prev} ${transcribed}` : transcribed));
                            }}
                          />
                        </div>
                      </div>
                      <textarea
                        required
                        rows={3}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="What did you like or dislike about this product? (Type or click the microphone to speak)"
                        className="w-full bg-white text-xs p-3 rounded-xl border border-line outline-none focus:border-brand-bright"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Review</span>
                    </button>
                  </form>
                )}

                {/* Review Cards */}
                <div className="space-y-3">
                  {sampleReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-line/70 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                            alt={rev.author}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-xs text-ink">{rev.author}</span>
                            {rev.verifiedPurchase && (
                              <span className="ml-2 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] text-ink-muted/80">{rev.date}</span>
                      </div>

                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-current' : 'text-line'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-ink-muted leading-relaxed">{rev.comment}</p>
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
