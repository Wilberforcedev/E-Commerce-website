import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { WishlistView } from './components/WishlistView';
import { OrderHistoryView } from './components/OrderHistoryView';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, currentUser, setActiveView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {activeView === 'shop' && (
          <>
            <HeroBanner />
            <ProductGrid />
          </>
        )}

        {/* Runtime security guard for Admin portal */}
        {activeView === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-lg mx-auto my-20 p-8 bg-white rounded-3xl border border-rose-100 shadow-xl text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Administrative Access Required</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                You do not have permission to view the Store Admin Dashboard. This area is restricted to authenticated store administrators.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveView('shop')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Catalog</span>
                </button>
              </div>
            </div>
          )
        )}

        {activeView === 'orders' && <OrderHistoryView />}

        {activeView === 'wishlist' && <WishlistView />}
      </main>

      <Footer />

      {/* Global Drawers & Modals */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <OrderTrackerModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}

export default App;
