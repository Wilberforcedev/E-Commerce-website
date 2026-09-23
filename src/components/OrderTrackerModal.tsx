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
  MapPin
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracker-modal-title"
    >
      <div className="fixed inset-0" onClick={() => setIsOrderTrackerOpen(false)} />

      <div className="relative bg-white rounded-lg max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-800" />
            <h3 id="tracker-modal-title" className="font-bold text-sm sm:text-base text-slate-900">
              Order & Shipment Tracker
            </h3>
          </div>

          <button
            onClick={() => setIsOrderTrackerOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-800 transition"
            aria-label="Close tracker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Lookup Input */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order number (e.g. NM-2026-8812) or tracking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-md border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-md transition"
            >
              Search
            </button>
          </form>

          {selectedOrder ? (
            <div className="space-y-5">
              {/* Order Info Card */}
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Order Information
                  </p>
                  <h4 className="text-sm font-bold text-slate-900 font-mono">
                    {selectedOrder.orderNumber}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Carrier: <span className="font-medium text-slate-700">{selectedOrder.carrier || 'FedEx Express'}</span> • Tracking: <span className="font-mono text-slate-700">{selectedOrder.trackingNumber || 'Pending'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-slate-900 text-white">
                    {selectedOrder.status}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">Est. Delivery: {selectedOrder.estimatedDelivery}</p>
                </div>
              </div>

              {/* Visual Progression Steps */}
              {selectedOrder.status !== 'Cancelled' ? (
                <div className="p-4 bg-white rounded-md border border-slate-200">
                  <div className="relative flex justify-between items-center text-center">
                    {/* Connecting progress bar */}
                    <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                      <div
                        className="h-full bg-slate-900 transition-all duration-500"
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
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-slate-900 text-white ring-2 ring-slate-400'
                                : isCompleted
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-400 border border-slate-300'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-[10px] font-medium mt-1.5 ${
                              isCurrent
                                ? 'text-slate-900 font-semibold'
                                : isCompleted
                                ? 'text-slate-700'
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
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs">
                  This order was cancelled. Please contact customer support if you need further help.
                </div>
              )}

              {/* Items in this order */}
              <div>
                <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Items in Shipment ({selectedOrder.items.length})
                </h5>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden bg-white">
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
                        className="w-10 h-10 rounded object-cover border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-slate-500 text-[11px] font-mono">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono text-slate-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Delivery Address:</p>
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
            <div className="pt-3 border-t border-slate-100">
              <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Recent Orders in Catalog
              </h5>
              <div className="space-y-1.5">
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-xs transition ${
                      selectedOrder?.id === ord.id
                        ? 'bg-slate-900 text-white font-medium'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono">{ord.orderNumber}</span>
                    <span className="text-[11px] font-mono">${ord.total.toFixed(2)}</span>
                    <span className="capitalize text-[11px]">{ord.status}</span>
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
