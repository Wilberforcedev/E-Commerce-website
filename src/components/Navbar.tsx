import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data/initialData';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  SlidersHorizontal,
  Package,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Mic
} from 'lucide-react';
import { VoiceMicButton } from './VoiceMicButton';

export const Navbar: React.FC = () => {
  const {
    cartCount,
    wishlist,
    currentUser,
    setIsCartOpen,
    setIsAuthOpen,
    setIsOrderTrackerOpen,
    activeView,
    setActiveView,
    logout,
    filters,
    setFilters,
    addRecentSearch
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    if (activeView !== 'shop') {
      setActiveView('shop');
    }
  };

  const handleCategoryClick = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat }));
    if (activeView !== 'shop') {
      setActiveView('shop');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-slate-800">
        <span>Curated workspace & acoustic gear • Free express shipping on orders over $100</span>
        <button
          onClick={() => setIsOrderTrackerOpen(true)}
          className="ml-3 hidden md:inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded text-[11px] font-medium transition"
        >
          <Package className="w-3 h-3" />
          Track Order
        </button>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                setActiveView('shop');
                setFilters((prev) => ({ ...prev, category: 'All', search: '' }));
              }}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white font-mono font-bold text-xs">
                NM
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900">
                NovaMart
              </span>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, audio, hardware..."
                value={filters.search}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filters.search.trim()) {
                    addRecentSearch(filters.search.trim());
                  }
                }}
                className="w-full bg-slate-50 hover:bg-white focus:bg-white pl-9 pr-14 py-2 text-xs rounded-md border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition placeholder:text-slate-400 text-slate-900"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {filters.search && (
                  <button
                    onClick={() => setFilters((p) => ({ ...p, search: '' }))}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <VoiceMicButton
                  tooltip="Search with Voice (Gemini 3.5 Transcribe)"
                  title="Voice Search NovaMart"
                  subtitle="Speak a product name or category into your microphone"
                  onTranscribe={(text) => {
                    setFilters((prev) => ({ ...prev, search: text }));
                    addRecentSearch(text);
                    if (activeView !== 'shop') setActiveView('shop');
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Switchers */}
            <button
              onClick={() => setActiveView('shop')}
              className={`hidden sm:inline-flex px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeView === 'shop'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Catalog
            </button>

            {/* Admin Switcher / Badge */}
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => setActiveView(activeView === 'admin' ? 'shop' : 'admin')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition border ${
                  activeView === 'admin'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveView('admin')}
                className="hidden lg:inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition"
                title="Store Administrator Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => setActiveView('wishlist')}
              className={`relative p-2 rounded-md transition ${
                activeView === 'wishlist'
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
              }`}
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-md text-xs font-semibold transition"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="bg-indigo-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition"
                  aria-label="User Account Menu"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="hidden xl:block text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-900 truncate max-w-[100px]">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {isUserMenuOpen && currentUser && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveView('orders');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-indigo-500" />
                        My Order History
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsOrderTrackerOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                        Track Order by ID
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setActiveView('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-2 mt-1"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Store Admin Panel
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filters.search.trim()) {
                  addRecentSearch(filters.search.trim());
                }
              }}
              className="w-full bg-slate-100 pl-10 pr-14 py-2 text-sm rounded-full border border-transparent focus:border-indigo-500 focus:bg-white outline-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceMicButton
                tooltip="Voice Search (Gemini 3.5 Transcribe)"
                title="Voice Search NovaMart"
                subtitle="Speak a product name or category into your microphone"
                onTranscribe={(text) => {
                  setFilters((prev) => ({ ...prev, search: text }));
                  addRecentSearch(text);
                  if (activeView !== 'shop') setActiveView('shop');
                }}
              />
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 py-2 border-t border-slate-100 text-sm overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                filters.category === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto text-xs text-slate-400 flex items-center gap-3">
            <span>Free Returns within 30 Days</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">2-Year Warranty Included</span>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-4 animate-fade-in shadow-xl">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                    filters.category === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setActiveView('orders');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold"
            >
              <Package className="w-4 h-4 text-indigo-600" />
              My Orders & History
            </button>
            <button
              onClick={() => {
                setIsOrderTrackerOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              Track Any Order
            </button>
            <button
              onClick={() => {
                setActiveView('admin');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Store Admin Panel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
