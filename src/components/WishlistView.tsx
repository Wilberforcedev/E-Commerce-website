import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, products, setActiveView, addToCart } = useStore();

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistProducts.forEach((p) => {
      if (p.stock > 0) {
        addToCart(p, 1);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <button
            onClick={() => setActiveView('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                My Saved Wishlist
              </h1>
              <p className="text-xs text-slate-500">
                {wishlistProducts.length} items saved for later
              </p>
            </div>
          </div>
        </div>

        {wishlistProducts.length > 0 && (
          <button
            onClick={handleAddAllToCart}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-center"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add All In-Stock to Bag</span>
          </button>
        )}
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-800">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tap the heart icon on any product in the store to save it to your wishlist.
            </p>
          </div>
          <button
            onClick={() => setActiveView('shop')}
            className="bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-indigo-700 transition"
          >
            Explore Catalog
          </button>
        </div>
      )}
    </div>
  );
};
