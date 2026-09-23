import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  CheckCircle,
  Package,
  Truck,
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const {
    activeOrderConfirmation,
    setActiveOrderConfirmation,
    setIsOrderTrackerOpen,
    setActiveView
  } = useStore();

  if (!activeOrderConfirmation) return null;

  const order = activeOrderConfirmation;

  const handleTrack = () => {
    setActiveOrderConfirmation(null);
    setIsOrderTrackerOpen(true);
  };

  const handleDone = () => {
    setActiveOrderConfirmation(null);
    setActiveView('shop');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <div className="fixed inset-0" onClick={handleDone} />

      <div className="relative bg-white rounded-lg max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden z-10 p-6 sm:p-7 space-y-5 text-center">
        
        {/* Success Icon */}
        <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
            Confirmed & Queued
          </span>
          <h2 id="order-success-title" className="text-xl font-bold text-slate-900 mt-2">
            Order Confirmed
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Order dispatch receipt and tracking details sent to <strong className="text-slate-800">{order.shippingAddress.email}</strong>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-50 rounded-md p-4 border border-slate-200 text-left space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
            <div>
              <p className="text-slate-400 text-[11px] font-mono">Order Number</p>
              <p className="font-mono font-bold text-xs sm:text-sm text-slate-900">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[11px]">Total Paid</p>
              <p className="font-mono font-bold text-xs sm:text-sm text-slate-900">${order.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase">Estimated Arrival</p>
                <p className="text-xs font-semibold text-slate-800">{order.estimatedDelivery}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase">Courier</p>
                <p className="text-xs font-semibold text-slate-800">{order.carrier || 'DHL Express'}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-slate-600 text-xs">
              <p className="font-semibold text-slate-800">Destination:</p>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleTrack}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-md border border-slate-300 flex items-center justify-center gap-1.5 transition"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </button>

          <button
            onClick={handleDone}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md transition flex items-center justify-center gap-1.5"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
