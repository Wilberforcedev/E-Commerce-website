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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Accessible keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:text-xs focus:font-semibold focus:rounded-md focus:shadow-md focus:outline-none"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
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
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-lg border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Administrator Access Required</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your current account is authenticated as a customer. The inventory management portal is restricted to authorized store administrators.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveView('shop')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
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
