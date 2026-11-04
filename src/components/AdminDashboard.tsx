import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, OrderStatus } from '../types';
import { CATEGORIES } from '../data/initialData';
import {
  Package,
  DollarSign,
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  ArrowLeft
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    setActiveView
  } = useStore();

  const [activeAdminTab, setActiveAdminTab] = useState<'products' | 'orders' | 'analytics'>('products');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [stock, setStock] = useState('20');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState<'SALE' | 'NEW' | 'BESTSELLER' | 'HOT' | ''>('');

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.total : sum), 0);
  const totalOrdersCount = orders.length;
  const lowStockCount = products.filter((p) => p.stock <= 10).length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  const handleOpenAdd = () => {
    setName('');
    setPrice('');
    setOriginalPrice('');
    setCategory('Electronics');
    setStock('20');
    setImageUrl('https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80');
    setDescription('');
    setBadge('');
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price.toString());
    setOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
    setCategory(prod.category);
    setStock(prod.stock.toString());
    setImageUrl(prod.images[0] || '');
    setDescription(prod.description);
    setBadge(prod.badge || '');
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price) || 0;
    const numOrig = originalPrice ? parseFloat(originalPrice) : undefined;
    const numStock = parseInt(stock, 10) || 0;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name,
        price: numPrice,
        originalPrice: numOrig,
        category,
        stock: numStock,
        images: [imageUrl, ...(editingProduct.images.slice(1))],
        description,
        badge: (badge as any) || undefined
      });
    } else {
      addProduct({
        name,
        price: numPrice,
        originalPrice: numOrig,
        category,
        stock: numStock,
        images: [imageUrl],
        description,
        rating: 5.0,
        reviewCount: 1,
        badge: (badge as any) || undefined,
        features: ['Premium craftsmanship', 'Standard warranty included', 'Eco-friendly packaging']
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand text-white p-6 sm:p-8 rounded-panel">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-full bg-white/15 text-white">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-[30px] font-medium tracking-[-0.02em]">NovaMart Store Management</h1>
          </div>
          <p className="text-[13px] text-white/70">
            Real-time catalog control, inventory management, and live order fulfillment.
          </p>
        </div>

        <button
          onClick={() => setActiveView('shop')}
          className="self-start sm:self-center inline-flex items-center gap-2 bg-white hover:bg-white/90 text-brand font-medium text-xs px-5 py-2.5 rounded-full transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-card border border-line shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted/80">Total Revenue</p>
            <p className="text-xl sm:text-2xl font-semibold text-ink">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-card border border-line shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted/80">Total Orders</p>
            <p className="text-xl sm:text-2xl font-semibold text-ink">{totalOrdersCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-card border border-line shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted/80">Products in Catalog</p>
            <p className="text-xl sm:text-2xl font-semibold text-ink">{products.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-card border border-line shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted/80">Low Stock Alert (&le;10)</p>
            <p className="text-xl sm:text-2xl font-semibold text-amber-600">{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveAdminTab('products')}
          className={`pb-3 transition ${
            activeAdminTab === 'products'
              ? 'text-brand border-b-2 border-brand'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`pb-3 transition ${
            activeAdminTab === 'orders'
              ? 'text-brand border-b-2 border-brand'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`pb-3 transition ${
            activeAdminTab === 'analytics'
              ? 'text-brand border-b-2 border-brand'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          Sales & Analytics
        </button>
      </div>

      {/* TAB: Products Management */}
      {activeAdminTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Manage inventory</h2>
            <button
              onClick={handleOpenAdd}
              className="bg-accent hover:bg-accent-dark text-white font-medium text-xs px-4 py-2.5 rounded-full flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-card border border-line overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-line text-ink-muted/80 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Badge</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-surface/80 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-line"
                        />
                        <div>
                          <p className="font-bold text-ink">{p.name}</p>
                          <p className="text-[11px] text-ink-muted/80">ID: {p.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-ink">{p.category}</td>
                      <td className="py-3 px-4 font-bold text-ink">${p.price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            p.stock > 10
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.stock > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.badge ? (
                          <span className="bg-surface text-ink font-semibold px-2 py-0.5 rounded text-[10px]">
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-line">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 hover:bg-surface text-ink-muted hover:text-brand rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-ink-muted/80 hover:text-rose-600 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Orders Management */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Manage Customer Orders</h2>

          <div className="bg-white rounded-card border border-line overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-line text-ink-muted/80 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status & Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-surface/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-ink">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-ink">{ord.shippingAddress.fullName}</p>
                        <p className="text-[11px] text-ink-muted/80">{ord.shippingAddress.city}, {ord.shippingAddress.state}</p>
                      </td>
                      <td className="py-3 px-4 text-ink-muted">
                        {new Date(ord.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-ink">
                        {ord.items.reduce((s, i) => s + i.quantity, 0)} items
                      </td>
                      <td className="py-3 px-4 font-semibold text-ink">
                        ${ord.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          aria-label="Update order status"
                          className="bg-surface border border-line font-semibold rounded-lg px-2.5 py-1 text-xs outline-none focus:border-brand-bright cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Sales & Analytics */}
      {activeAdminTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-card border border-line shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-ink uppercase tracking-wider">
              Category Distribution
            </h3>
            <div className="space-y-3">
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                const percentage = Math.round((count / products.length) * 100);

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-ink">
                      <span>{cat}</span>
                      <span>{count} products ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-line shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-ink uppercase tracking-wider">
              Sales Performance
            </h3>
            <div className="space-y-3 text-xs text-ink-muted">
              <div className="flex justify-between p-3 bg-surface rounded-xl">
                <span>Average Order Value (AOV)</span>
                <span className="font-bold text-ink">${avgOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 bg-surface rounded-xl">
                <span>Completed Orders</span>
                <span className="font-bold text-emerald-600">
                  {orders.filter((o) => o.status === 'Delivered' || o.status === 'Shipped').length}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-surface rounded-xl">
                <span>Processing in Warehouse</span>
                <span className="font-bold text-amber-600">
                  {orders.filter((o) => o.status === 'Processing' || o.status === 'Pending').length}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-surface rounded-xl">
                <span>Return / Cancellation Rate</span>
                <span className="font-bold text-ink">0.0%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/45 backdrop-blur-sm backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsAddModalOpen(false)} />

          <div className="relative bg-white rounded-panel max-w-lg w-full shadow-2xl p-6 sm:p-8 z-10 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-line/70">
              <h3 className="font-semibold text-base text-ink">
                {editingProduct ? 'Edit Product' : 'Add New Inventory Item'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface text-ink-muted/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pro Wireless Gaming Mouse"
                  className="w-full p-2.5 rounded-xl border border-line outline-none focus:border-brand-bright"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-line outline-none focus:border-brand-bright bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Promotional Badge</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-line outline-none focus:border-brand-bright bg-white"
                  >
                    <option value="">None</option>
                    <option value="SALE">SALE</option>
                    <option value="NEW">NEW</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="HOT">HOT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99.99"
                    className="w-full p-2.5 rounded-xl border border-line outline-none focus:border-brand-bright"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="129.99"
                    className="w-full p-2.5 rounded-xl border border-line outline-none focus:border-brand-bright"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="25"
                    className="w-full p-2.5 rounded-xl border border-line outline-none focus:border-brand-bright"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-line outline-none focus:border-brand-bright font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed specifications and key selling points..."
                  className="w-full p-2.5 rounded-xl border border-line outline-none focus:border-brand-bright"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface text-ink font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold shadow-md transition"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
