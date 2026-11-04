import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShippingAddress } from '../types';
import {
  X,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    placeOrder,
    currentUser,
    setIsCartOpen
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Field validation error states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 1: Address Form
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: 'OR',
    postalCode: '',
    country: 'United States'
  });

  // Step 2: Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');

  // Step 3: Payment
  const [paymentType, setPaymentType] = useState<'card' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  if (!isCheckoutOpen || cart.length === 0) return null;

  const baseShipping = cartSubtotal >= 100 || appliedCoupon?.freeShipping ? 0 : 9.99;
  const shippingCost =
    shippingMethod === 'overnight'
      ? baseShipping + 19.99
      : shippingMethod === 'express'
      ? baseShipping + 9.99
      : baseShipping;

  const estimatedTax = Math.round((cartSubtotal - cartDiscount) * 0.08 * 100) / 100;
  const finalTotal = Math.max(0, Math.round((cartSubtotal - cartDiscount + shippingCost + estimatedTax) * 100) / 100);

  const validateAddress = (): boolean => {
    const errors: Record<string, string> = {};
    if (!address.fullName.trim() || address.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full legal name.';
    }
    if (!address.email.trim() || !/^\S+@\S+\.\S+$/.test(address.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    const cleanPhone = address.phone.replace(/\D/g, '');
    if (!address.phone.trim() || cleanPhone.length < 7) {
      errors.phone = 'Please enter a valid phone number (at least 7 digits).';
    }
    if (!address.address.trim()) {
      errors.address = 'Street address is required.';
    }
    if (!address.city.trim()) {
      errors.city = 'City is required.';
    }
    if (!address.postalCode.trim() || address.postalCode.trim().length < 3) {
      errors.postalCode = 'Postal code is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = (): boolean => {
    if (paymentType === 'paypal') return true;

    const errors: Record<string, string> = {};
    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length < 15) {
      errors.cardNumber = 'Please enter a complete 15 or 16-digit card number.';
    }
    if (!cardExpiry.trim() || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry.trim())) {
      errors.cardExpiry = 'Format must be MM/YY.';
    }
    if (!cardCvc.trim() || cardCvc.trim().length < 3) {
      errors.cardCvc = 'Enter 3 or 4 digits.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (step === 1) {
      if (validateAddress()) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (validatePayment()) {
        handleCompleteOrder();
      }
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      await placeOrder(address, paymentType, shippingMethod);
      setIsProcessing(false);
      setIsCheckoutOpen(false);
    } catch (err: any) {
      setIsProcessing(false);
      // Explicit stock-decrement / race-condition feedback in UI
      const errorMessage =
        err?.message ||
        'Unable to complete purchase. Another shopper may have bought the remaining stock or pricing was updated.';
      setCheckoutError(errorMessage);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="fixed inset-0" onClick={() => !isProcessing && setIsCheckoutOpen(false)} />

      <div className="relative bg-white rounded-panel max-w-4xl w-full border border-line shadow-xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-line flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-brand text-white flex items-center justify-center font-bold text-xs font-mono">
              NM
            </div>
            <div>
              <h2 id="checkout-modal-title" className="font-bold text-sm sm:text-base text-ink">
                Order Checkout
              </h2>
              <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Encrypted 256-Bit Transaction</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            disabled={isProcessing}
            aria-label="Close checkout"
            className="p-1.5 text-ink-muted/80 hover:text-ink rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="bg-surface border-b border-line px-6 py-2.5 flex items-center justify-center gap-3 sm:gap-6 text-xs font-medium">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-ink font-semibold' : 'text-ink-muted/80'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-brand text-white' : 'bg-line text-ink-muted'}`}>
              1
            </span>
            <span>Shipping</span>
          </div>
          <span className="text-line">/</span>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-ink font-semibold' : 'text-ink-muted/80'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-brand text-white' : 'bg-line text-ink-muted'}`}>
              2
            </span>
            <span>Method</span>
          </div>
          <span className="text-line">/</span>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-ink font-semibold' : 'text-ink-muted/80'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? 'bg-brand text-white' : 'bg-line text-ink-muted'}`}>
              3
            </span>
            <span>Payment</span>
          </div>
        </div>

        {/* Main Body */}
        <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Column */}
          <div className="lg:col-span-7">
            
            {/* Inline Error Banner (e.g. stock collision or server recalculation alert) */}
            {checkoutError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2.5" role="alert">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900">Checkout Notice</p>
                  <p className="mt-0.5 text-rose-700">{checkoutError}</p>
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setIsCartOpen(true);
                      }}
                      className="underline font-semibold hover:text-rose-950"
                    >
                      Review Shopping Cart
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Shipping Address with Inline Field Validation */}
            {step === 1 && (
              <form onSubmit={handleNextStep} noValidate className="space-y-3.5">
                <h3 className="font-bold text-sm text-ink">
                  1. Shipping Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={(e) => {
                        setAddress({ ...address, fullName: e.target.value });
                        if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
                      }}
                      placeholder="Jane Doe"
                      className={`w-full text-xs p-2 rounded-md border outline-none transition ${
                        fieldErrors.fullName
                          ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600'
                          : 'border-line focus:border-brand focus:ring-1 focus:ring-brand'
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={address.email}
                      onChange={(e) => {
                        setAddress({ ...address, email: e.target.value });
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      placeholder="jane@example.com"
                      className={`w-full text-xs p-2 rounded-md border outline-none transition ${
                        fieldErrors.email
                          ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600'
                          : 'border-line focus:border-brand focus:ring-1 focus:ring-brand'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">
                      Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.address}
                      onChange={(e) => {
                        setAddress({ ...address, address: e.target.value });
                        if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: '' });
                      }}
                      placeholder="123 Market Street, Apt 4"
                      className={`w-full text-xs p-2 rounded-md border outline-none transition ${
                        fieldErrors.address
                          ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600'
                          : 'border-line focus:border-brand focus:ring-1 focus:ring-brand'
                      }`}
                    />
                    {fieldErrors.address && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => {
                        setAddress({ ...address, phone: e.target.value });
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                      }}
                      placeholder="+1 (555) 019-2834"
                      className={`w-full text-xs p-2 rounded-md border outline-none transition ${
                        fieldErrors.phone
                          ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600'
                          : 'border-line focus:border-brand focus:ring-1 focus:ring-brand'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => {
                        setAddress({ ...address, city: e.target.value });
                        if (fieldErrors.city) setFieldErrors({ ...fieldErrors, city: '' });
                      }}
                      placeholder="Seattle"
                      className={`w-full text-xs p-2 rounded-md border outline-none transition ${
                        fieldErrors.city
                          ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600'
                          : 'border-line focus:border-brand focus:ring-1 focus:ring-brand'
                      }`}
                    />
                    {fieldErrors.city && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">State</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="WA"
                      className="w-full text-xs p-2 rounded-md border border-line outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">
                      Postal Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => {
                        setAddress({ ...address, postalCode: e.target.value });
                        if (fieldErrors.postalCode) setFieldErrors({ ...fieldErrors, postalCode: '' });
                      }}
                      placeholder="98101"
                      className={`w-full text-xs p-2 rounded-md border outline-none transition ${
                        fieldErrors.postalCode
                          ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600'
                          : 'border-line focus:border-brand focus:ring-1 focus:ring-brand'
                      }`}
                    />
                    {fieldErrors.postalCode && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="bg-accent hover:bg-accent-dark text-white font-semibold text-xs px-5 py-2.5 rounded-full transition flex items-center gap-1.5"
                  >
                    <span>Proceed to Delivery Method</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Shipping Method */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-ink">
                  2. Select Delivery Service
                </h3>

                <div className="space-y-2.5">
                  <label
                    onClick={() => setShippingMethod('standard')}
                    className={`flex items-center justify-between p-3.5 rounded-md border cursor-pointer transition ${
                      shippingMethod === 'standard'
                        ? 'border-brand bg-brand-soft'
                        : 'border-line hover:border-line'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-ink" />
                      <div>
                        <p className="font-semibold text-xs text-ink">Standard Ground Delivery</p>
                        <p className="text-[11px] text-ink-muted">Estimated 3-5 business days</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-ink">
                      {baseShipping === 0 ? 'FREE' : `$${baseShipping.toFixed(2)}`}
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethod('express')}
                    className={`flex items-center justify-between p-3.5 rounded-md border cursor-pointer transition ${
                      shippingMethod === 'express'
                        ? 'border-brand bg-brand-soft'
                        : 'border-line hover:border-line'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-ink" />
                      <div>
                        <p className="font-semibold text-xs text-ink">FedEx Express Courier</p>
                        <p className="text-[11px] text-ink-muted">Estimated 2 business days</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-ink">
                      +${(baseShipping + 9.99).toFixed(2)}
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethod('overnight')}
                    className={`flex items-center justify-between p-3.5 rounded-md border cursor-pointer transition ${
                      shippingMethod === 'overnight'
                        ? 'border-brand bg-brand-soft'
                        : 'border-line hover:border-line'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-ink" />
                      <div>
                        <p className="font-semibold text-xs text-ink">Priority Overnight Air</p>
                        <p className="text-[11px] text-ink-muted">Next-day morning delivery</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-ink">
                      +${(baseShipping + 19.99).toFixed(2)}
                    </span>
                  </label>
                </div>

                <div className="pt-3 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-ink-muted hover:text-ink font-medium text-xs flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Address
                  </button>

                  <button
                    onClick={() => setStep(3)}
                    className="bg-accent hover:bg-accent-dark text-white font-semibold text-xs px-5 py-2.5 rounded-full transition flex items-center gap-1.5"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment with Inline Validation */}
            {step === 3 && (
              <form onSubmit={handleNextStep} noValidate className="space-y-4">
                <h3 className="font-bold text-sm text-ink">
                  3. Payment Method
                </h3>

                {/* Method Selector */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentType('card')}
                    className={`p-2.5 rounded-md border text-xs font-medium flex items-center justify-center gap-2 transition ${
                      paymentType === 'card'
                        ? 'border-brand bg-brand text-white'
                        : 'border-line text-ink-muted hover:bg-surface'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('paypal')}
                    className={`p-2.5 rounded-md border text-xs font-medium flex items-center justify-center gap-2 transition ${
                      paymentType === 'paypal'
                        ? 'border-brand bg-brand text-white'
                        : 'border-line text-ink-muted hover:bg-surface'
                    }`}
                  >
                    <span className="font-mono font-bold">PayPal</span>
                  </button>
                </div>

                {paymentType === 'card' ? (
                  <div className="space-y-3 bg-surface p-4 rounded-md border border-line">
                    <div>
                      <label className="text-xs font-medium text-ink block mb-1">
                        Card Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          setCardNumber(e.target.value);
                          if (fieldErrors.cardNumber) setFieldErrors({ ...fieldErrors, cardNumber: '' });
                        }}
                        placeholder="4242 4242 4242 4242"
                        className={`w-full bg-white text-xs p-2 rounded-md border font-mono outline-none ${
                          fieldErrors.cardNumber ? 'border-rose-500' : 'border-line focus:border-brand'
                        }`}
                      />
                      {fieldErrors.cardNumber && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-ink block mb-1">
                          Expiry <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            setCardExpiry(e.target.value);
                            if (fieldErrors.cardExpiry) setFieldErrors({ ...fieldErrors, cardExpiry: '' });
                          }}
                          placeholder="MM/YY"
                          className={`w-full bg-white text-xs p-2 rounded-md border font-mono outline-none ${
                            fieldErrors.cardExpiry ? 'border-rose-500' : 'border-line focus:border-brand'
                          }`}
                        />
                        {fieldErrors.cardExpiry && (
                          <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.cardExpiry}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-medium text-ink block mb-1">
                          CVC <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => {
                            setCardCvc(e.target.value);
                            if (fieldErrors.cardCvc) setFieldErrors({ ...fieldErrors, cardCvc: '' });
                          }}
                          placeholder="123"
                          className={`w-full bg-white text-xs p-2 rounded-md border font-mono outline-none ${
                            fieldErrors.cardCvc ? 'border-rose-500' : 'border-line focus:border-brand'
                          }`}
                        />
                        {fieldErrors.cardCvc && (
                          <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.cardCvc}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-surface rounded-md border border-line text-center space-y-1">
                    <p className="text-xs font-semibold text-ink">PayPal Express Checkout</p>
                    <p className="text-[11px] text-ink-muted">
                      Transaction will be settled using your connected account ({address.email || 'guest'}).
                    </p>
                  </div>
                )}

                <div className="pt-3 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-ink-muted hover:text-ink font-medium text-xs flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="bg-brand hover:bg-brand-dark text-white font-semibold text-xs px-5 py-2.5 rounded-md transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying & Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Confirm Purchase (${finalTotal.toFixed(2)})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-5 bg-surface rounded-lg p-4 border border-line flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-ink-muted mb-3">
                Cart Items ({cart.length})
              </h4>

              {/* Items preview */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2.5 text-xs">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-10 h-10 rounded object-cover border border-line shrink-0 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink truncate">{item.product.name}</p>
                      <p className="text-ink-muted text-[11px] font-mono">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-mono text-ink">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation breakdown */}
              <div className="space-y-1.5 pt-3 mt-3 border-t border-line text-xs text-ink-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-ink">${cartSubtotal.toFixed(2)}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-ink">
                    <span>Discount</span>
                    <span className="font-mono">-${cartDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono text-ink">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-mono text-ink">${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-line text-xs font-bold text-ink">
                  <span>Total Amount</span>
                  <span className="font-mono text-brand">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded border border-line flex items-center gap-2 text-[11px] text-ink-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-ink shrink-0" />
              <span>Full warranty and 30-day testing window included.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
