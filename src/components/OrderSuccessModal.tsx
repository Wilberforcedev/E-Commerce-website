import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  CheckCircle,
  Package,
  Truck,
  ArrowRight,
  ExternalLink,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="fixed inset-0" onClick={handleDone} />

      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6 text-center">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Payment Confirmed
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            Thank You for Your Order!
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Order confirmation receipt has been sent to <strong>{order.shippingAddress.email}</strong>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-left space-y-3.5 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <p className="text-slate-400 font-semibold text-[11px]">Order Number</p>
              <p className="font-extrabold text-sm text-slate-900">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 font-semibold text-[11px]">Total Paid</p>
              <p className="font-extrabold text-sm text-indigo-600">${order.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 text-[11px]">Estimated Arrival</p>
                <p className="font-bold text-slate-800">{order.estimatedDelivery}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 text-[11px]">Shipping Method</p>
                <p className="font-bold text-slate-800">{order.carrier || 'DHL Express'}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-slate-600">
              <p className="font-bold text-slate-800">Delivering To:</p>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleTrack}
            className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <button
            onClick={handleDone}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
