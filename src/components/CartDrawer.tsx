import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Truck,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    products,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    cartDiscount,
    cartCount,
    setIsCheckoutOpen
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 100;
  const isFreeShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD || appliedCoupon?.freeShipping;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const shippingCost = isFreeShipping ? 0 : (cart.length > 0 ? 9.99 : 0);
  const estimatedTax = Math.round((cartSubtotal - cartDiscount) * 0.08 * 100) / 100;
  const grandTotal = Math.max(0, Math.round((cartSubtotal - cartDiscount + shippingCost + estimatedTax) * 100) / 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    const res = applyCoupon(couponCodeInput);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCodeInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping Bag">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-800" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Shopping Bag
              </h3>
              <span className="bg-slate-100 text-slate-700 font-mono text-xs px-2 py-0.5 rounded">
                {cartCount}
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close shopping bag"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cart.length > 0 && (
            <div className="bg-slate-50 border-b border-slate-200 p-3 px-5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  {isFreeShipping ? (
                    <span className="text-slate-900 font-semibold">Free Express Shipping unlocked</span>
                  ) : (
                    <span>Add <strong className="font-mono text-slate-900">${amountNeededForFreeShipping.toFixed(2)}</strong> for Free Shipping</span>
                  )}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {Math.round(freeShippingProgress)}%
                </span>
              </div>
              <div className="w-full h-1 bg-slate-200 rounded overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
            {cart.length > 0 ? (
              cart.map((item) => {
                // Match against latest live product catalog stock
                const liveProd = products.find((p) => p.id === item.product.id) || item.product;
                const isItemSoldOut = liveProd.stock <= 0;
                const isMaxStockReached = item.quantity >= liveProd.stock;

                return (
                  <div key={item.product.id} className="py-3.5 flex gap-3.5 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className={`w-full h-full object-cover ${isItemSoldOut ? 'opacity-40 grayscale' : ''}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-slate-800 p-0.5 transition"
                            title="Remove item"
                            aria-label={`Remove ${item.product.name} from bag`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                          {item.product.category}
                        </span>

                        {isItemSoldOut ? (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Item now sold out. Please remove before checkout.</span>
                          </div>
                        ) : isMaxStockReached ? (
                          <p className="mt-0.5 text-[10px] text-slate-500 font-mono">
                            Max available units ({liveProd.stock}) in bag
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded bg-slate-50">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 hover:bg-slate-200 text-slate-600 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-medium text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            disabled={isMaxStockReached || isItemSoldOut}
                            className="px-2 py-0.5 hover:bg-slate-200 text-slate-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono text-xs font-bold text-slate-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Shopping bag is empty</h4>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xs leading-relaxed">
                    Explore curated studio audio, machined mechanical keyboards, and workspace hardware.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-md hover:bg-slate-800 transition"
                >
                  Browse Hardware
                </button>
              </div>
            )}
          </div>

          {/* Footer & Calculations */}
          {cart.length > 0 && (
            <div className="border-t border-slate-200 p-4 sm:p-5 bg-slate-50 space-y-3.5">
              
              {/* Promo code form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono font-bold">{appliedCoupon.code}</span>
                      <span className="text-[11px] text-emerald-700">({appliedCoupon.description})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-rose-600 font-semibold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Promo code (e.g. WELCOME10)"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="w-full bg-white text-xs pl-7 pr-2 py-1.5 rounded border border-slate-200 outline-none uppercase font-mono text-slate-800 placeholder:font-sans placeholder:normal-case focus:border-indigo-600"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                      >
                        Apply
                      </button>
                    </div>
                    {couponMessage && (
                      <p className={`text-[11px] font-medium ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {couponMessage.text}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Subtotal breakdown */}
              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900">${cartSubtotal.toFixed(2)}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Discount</span>
                    <span className="font-mono">-${cartDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono">
                    {isFreeShipping ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-mono">${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="font-mono text-indigo-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-md transition flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-slate-500" />
                    256-Bit Encrypted
                  </span>
                  <button
                    onClick={clearCart}
                    className="hover:text-slate-700 transition underline underline-offset-2"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
