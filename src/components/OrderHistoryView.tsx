import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Package,
  Calendar,
  Truck,
  RotateCcw,
  ArrowLeft,
  ChevronRight,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export const OrderHistoryView: React.FC = () => {
  const { orders, setActiveView, setIsOrderTrackerOpen, addToCart, addToast } = useStore();

  const handleReorder = (items: typeof orders[0]['items']) => {
    items.forEach((item) => {
      addToCart(item.product, item.quantity);
    });
    addToast('Items added to bag', 'Past order items were placed in your shopping bag.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <button
            onClick={() => setActiveView('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-brand mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-soft text-brand flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[32px] font-medium text-ink tracking-[-0.025em] leading-tight">
                Order history
              </h1>
              <p className="text-xs text-ink-muted">
                Track your active shipments and view invoices
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOrderTrackerOpen(true)}
          className="bg-accent hover:bg-accent-dark text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-md transition flex items-center gap-1.5 self-start sm:self-center"
        >
          <Truck className="w-4 h-4" />
          <span>Track by tracking number</span>
        </button>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-card border border-line overflow-hidden hover:border-brand-line transition"
            >
              {/* Order Header */}
              <div className="bg-surface/80 p-4 sm:p-5 border-b border-line/70 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <p className="text-ink-muted/80 text-[11px] font-bold uppercase tracking-wider">Order Number</p>
                    <p className="font-semibold text-sm text-ink font-mono">{order.orderNumber}</p>
                  </div>

                  <div>
                    <p className="text-ink-muted/80 text-[11px] font-bold uppercase tracking-wider">Date Placed</p>
                    <p className="font-semibold text-ink">{new Date(order.date).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-ink-muted/80 text-[11px] font-bold uppercase tracking-wider">Total Amount</p>
                    <p className="font-semibold text-ink text-sm">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Shipped'
                        ? 'bg-brand-soft text-brand-dark'
                        : order.status === 'Processing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-line text-ink'
                    }`}
                  >
                    {order.status}
                  </span>

                  <button
                    onClick={() => setIsOrderTrackerOpen(true)}
                    className="p-2 hover:bg-line/60 rounded-xl text-ink-muted transition"
                    title="Track Order"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-6 divide-y divide-line/70">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-line shrink-0 bg-surface"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-ink text-sm truncate">{item.product.name}</p>
                        <p className="text-ink-muted/80 text-[11px]">
                          Category: {item.product.category} • Qty: {item.quantity}
                        </p>
                        <p className="text-brand font-semibold mt-0.5">
                          ${item.product.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    <span className="font-semibold text-ink text-sm shrink-0">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer Info */}
              <div className="bg-surface/50 p-4 border-t border-line/70 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-muted">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand shrink-0" />
                  <span>
                    Carrier: <strong>{order.carrier || 'FedEx'}</strong> • Tracking: <span className="font-mono text-brand">{order.trackingNumber || 'Pending'}</span>
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReorder(order.items)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line hover:bg-surface rounded-xl font-bold text-ink transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-brand" />
                    <span>Buy Again</span>
                  </button>
                  <button
                    onClick={() => setIsOrderTrackerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-dark rounded-xl font-bold text-white transition shadow-xs"
                  >
                    <span>Track Live</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-panel border border-line p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface text-ink-muted/80 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-ink">No orders placed yet</h3>
            <p className="text-xs text-ink-muted mt-1">
              When you complete checkout, your order receipts and package tracking will appear right here.
            </p>
          </div>
          <button
            onClick={() => setActiveView('shop')}
            className="bg-brand text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-brand transition"
          >
            Start Browsing
          </button>
        </div>
      )}
    </div>
  );
};
