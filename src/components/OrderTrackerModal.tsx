import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const OrderTrackerModal: React.FC = () => {
  const {
    isOrderTrackerOpen,
    setIsOrderTrackerOpen,
    orders,
    setActiveProductDetail
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);

  if (!isOrderTrackerOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.id.toLowerCase().includes(query) ||
        o.trackingNumber?.toLowerCase().includes(query)
    );

    if (found) {
      setSelectedOrder(found);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Processing':
        return 1;
      case 'Shipped':
        return 2;
      case 'Delivered':
        return 3;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = selectedOrder ? getStepIndex(selectedOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="fixed inset-0" onClick={() => setIsOrderTrackerOpen(false)} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Live Order & Delivery Tracker
            </h3>
          </div>

          <button
            onClick={() => setIsOrderTrackerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            aria-label="Close tracker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Lookup Input */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter order number (e.g. NM-2026-8812) or tracking #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Lookup
            </button>
          </form>

          {selectedOrder ? (
            <div className="space-y-6 animate-fade-in">
              {/* Order Info Card */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tracking Package
                  </p>
                  <h4 className="text-base font-black text-slate-900 font-mono">
                    {selectedOrder.orderNumber}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Carrier: <strong>{selectedOrder.carrier || 'FedEx'}</strong> • Tracking: <span className="font-mono text-indigo-600">{selectedOrder.trackingNumber || 'Pending'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      selectedOrder.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedOrder.status === 'Shipped'
                        ? 'bg-indigo-100 text-indigo-800'
                        : selectedOrder.status === 'Processing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Est. Delivery: {selectedOrder.estimatedDelivery}</p>
                </div>
              </div>

              {/* Visual Progression Steps */}
              {selectedOrder.status !== 'Cancelled' ? (
                <div className="p-4 bg-white rounded-2xl border border-slate-100">
                  <div className="relative flex justify-between items-center text-center">
                    {/* Connecting progress bar */}
                    <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(0, currentStep * 33.3)}%` }}
                      />
                    </div>

                    {[
                      { label: 'Confirmed', icon: CheckCircle2 },
                      { label: 'Processing', icon: Clock },
                      { label: 'Shipped', icon: Truck },
                      { label: 'Delivered', icon: Package }
                    ].map((step, idx) => {
                      const Icon = step.icon;
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={step.label} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md'
                                : isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[11px] font-bold mt-2 ${
                              isCurrent
                                ? 'text-emerald-700'
                                : isCompleted
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold">
                  This order was cancelled. Please contact customer support if you need further help.
                </div>
              )}

              {/* Items in this order */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Items in this Shipment ({selectedOrder.items.length})
                </h5>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setIsOrderTrackerOpen(false);
                        setActiveProductDetail(item.product);
                      }}
                      className="p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition text-xs"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-slate-500 text-[11px]">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-slate-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Destination Address</p>
                  <p>{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No order found matching your inquiry. Try searching for "NM-2026-8812" or "NM-2026-8813".
            </div>
          )}

          {/* Quick Select from Orders List */}
          {orders.length > 1 && (
            <div className="pt-4 border-t border-slate-100">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Your Recent Orders
              </h5>
              <div className="space-y-1.5">
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                      selectedOrder?.id === ord.id
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono">{ord.orderNumber}</span>
                    <span className="text-[11px] text-slate-500">${ord.total.toFixed(2)}</span>
                    <span className="capitalize text-[11px] font-bold">{ord.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
