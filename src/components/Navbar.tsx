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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-line">
      {/* Top Banner */}
      <div className="bg-brand-soft text-brand-dark text-[12px] py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-brand-line/60">
        <span>Curated workspace &amp; acoustic gear<span className="hidden sm:inline"> • Free express shipping on orders over $100</span></span>
        <button
          onClick={() => setIsOrderTrackerOpen(true)}
          className="ml-3 hidden md:inline-flex items-center gap-1 bg-white hover:bg-brand-dark hover:text-white text-brand-dark border border-brand-line px-3 py-0.5 rounded-full text-[11px] font-semibold transition"
        >
          <Package className="w-3 h-3" />
          Track Order
        </button>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[76px] gap-4">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-ink hover:text-brand rounded-full hover:bg-surface transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                setActiveView('shop');
                setFilters((prev) => ({ ...prev, category: 'All', search: '' }));
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-[10px] bg-brand flex items-center justify-center text-white font-semibold text-sm">
                N
              </div>
              <span className="font-semibold text-[20px] tracking-[-0.03em] text-ink">
                NovaMart<span className="text-accent">.</span>
              </span>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted/80 pointer-events-none" />
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
                className="w-full bg-surface hover:bg-white focus:bg-white pl-9 pr-14 py-2.5 text-[13px] rounded-full border border-line focus:border-brand focus:ring-1 focus:ring-brand outline-none transition placeholder:text-ink-muted/70 text-ink"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {filters.search && (
                  <button
                    onClick={() => setFilters((p) => ({ ...p, search: '' }))}
                    className="p-1 text-ink-muted/80 hover:text-ink-muted rounded"
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Switchers */}
            <button
              onClick={() => setActiveView('shop')}
              className={`hidden sm:inline-flex px-3 py-2 text-[13px] font-medium rounded-full transition ${
                activeView === 'shop'
                  ? 'text-brand'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Catalog
            </button>

            {/* Admin Switcher / Badge */}
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => setActiveView(activeView === 'admin' ? 'shop' : 'admin')}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium transition border ${
                  activeView === 'admin'
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-ink border-line hover:border-brand hover:text-brand'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveView('admin')}
                className="hidden lg:inline-flex items-center gap-1 text-[13px] font-medium text-ink-muted hover:text-brand px-2 py-1 rounded-full transition"
                title="Store Administrator Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => setActiveView('wishlist')}
              className={`relative p-2.5 rounded-full transition ${
                activeView === 'wishlist'
                  ? 'bg-brand-soft text-brand'
                  : 'text-ink hover:text-brand hover:bg-surface'
              }`}
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-accent text-white font-semibold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-4 py-2.5 rounded-full text-[13px] font-medium transition"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="bg-white text-accent font-semibold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1.5 rounded-full hover:bg-surface text-ink transition"
                  aria-label="User Account Menu"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-line"
                  />
                  <div className="hidden xl:block text-left text-xs leading-tight">
                    <p className="font-semibold text-ink truncate max-w-[100px]">{currentUser.name}</p>
                    <p className="text-[10px] text-ink-muted capitalize">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted hidden sm:block" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-ink hover:text-brand px-3 py-2 rounded-full hover:bg-surface transition"
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
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-panel shadow-xl border border-line p-2 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-line">
                      <p className="text-xs text-ink-muted font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-ink truncate">{currentUser.name}</p>
                      <p className="text-xs text-ink-muted truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-brand-soft text-brand">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveView('orders');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-ink hover:bg-surface rounded-xl flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-brand-bright" />
                        My Order History
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsOrderTrackerOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-ink hover:bg-surface rounded-xl flex items-center gap-2"
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
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-brand-dark bg-brand-soft hover:bg-brand-line/50 rounded-xl flex items-center gap-2 mt-1"
                        >
                          <ShieldCheck className="w-4 h-4 text-brand" />
                          Store Admin Panel
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-line">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2"
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
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
              className="w-full bg-surface pl-10 pr-14 py-2.5 text-sm rounded-full border border-line focus:border-brand focus:bg-white outline-none"
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
        <nav className="hidden lg:flex items-center gap-1 py-2.5 border-t border-line/70 text-sm overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                filters.category === cat
                  ? 'bg-brand text-white'
                  : 'text-ink-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto text-[11px] text-ink-muted flex items-center gap-3">
            <span>Free Returns within 30 Days</span>
            <span>•</span>
            <span className="text-brand font-semibold">2-Year Warranty Included</span>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-line bg-white p-4 space-y-4 animate-fade-in shadow-xl">
          <div>
            <h4 className="eyebrow text-ink-muted mb-2">Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold text-left transition ${
                    filters.category === cat
                      ? 'bg-brand text-white'
                      : 'bg-surface text-ink hover:bg-brand-soft hover:text-brand-dark'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-line space-y-2">
            <button
              onClick={() => {
                setActiveView('orders');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-surface text-ink text-xs font-bold"
            >
              <Package className="w-4 h-4 text-brand" />
              My Orders & History
            </button>
            <button
              onClick={() => {
                setIsOrderTrackerOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-surface text-ink text-xs font-bold"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              Track Any Order
            </button>
            <button
              onClick={() => {
                setActiveView('admin');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-brand-soft text-brand-dark text-xs font-bold"
            >
              <ShieldCheck className="w-4 h-4 text-brand" />
              Store Admin Panel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
