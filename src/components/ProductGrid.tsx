import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './skeletons/ProductGridSkeleton';
import { RecentSearches } from './RecentSearches';
import { CATEGORIES } from '../data/initialData';
import { SortOption } from '../types';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Search
} from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { products, filters, setFilters, isProductsLoading, addRecentSearch } = useStore();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category match
      if (filters.category !== 'All' && product.category !== filters.category) {
        return false;
      }

      // Search match
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const inName = product.name.toLowerCase().includes(query);
        const inDesc = product.description.toLowerCase().includes(query);
        const inCat = product.category.toLowerCase().includes(query);
        const inTag = product.tagline?.toLowerCase().includes(query);
        if (!inName && !inDesc && !inCat && !inTag) return false;
      }

      // Price filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }

      // Rating filter
      if (product.rating < filters.minRating) {
        return false;
      }

      // In stock only
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'featured':
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
  }, [products, filters]);

  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      search: '',
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      inStockOnly: false,
      sortBy: 'featured'
    });
  };

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.search !== '' ||
    filters.minPrice > 0 ||
    filters.maxPrice < 1000 ||
    filters.minRating > 0 ||
    filters.inStockOnly;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
      
      {/* Top Controls Bar */}
      <div className="pb-6 border-b border-line">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="eyebrow text-brand">The catalog</span>
            <div className="flex items-center gap-3 mt-1.5">
              <h2 className="text-[30px] sm:text-[36px] font-medium text-ink tracking-[-0.025em] leading-tight">
                {filters.category === 'All' ? 'Curated catalog' : `${filters.category}`}
              </h2>
              <span className="bg-white border border-line text-ink-muted text-[11px] font-medium px-2.5 py-1 rounded-full">
                {isProductsLoading ? 'Loading...' : `${filteredProducts.length} items`}
              </span>
            </div>
            {filters.search && (
              <p className="text-[13px] text-ink-muted mt-2">
                Showing results for "<span className="text-ink font-medium">{filters.search}</span>"
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-white border border-line text-ink px-4 py-2 rounded-full text-xs font-medium hover:bg-surface"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-ink" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              )}
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 ml-auto">
              <label htmlFor="sort-selector" className="text-xs text-ink-muted font-medium hidden sm:inline">
                Sort:
              </label>
              <select
                id="sort-selector"
                value={filters.sortBy}
                onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value as SortOption }))}
                aria-label="Sort products"
                className="bg-white border border-line text-ink text-xs font-medium rounded-full px-3.5 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Additions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recent Searches Quick Navigation Chips */}
        <RecentSearches className="mt-4 pt-4 border-t border-line/70" variant="chips" />
      </div>

      {/* Main Layout: Filters (Left) + Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white rounded-card border border-line p-5 sticky top-28 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-ink" />
                <h3 className="eyebrow text-ink">Filter by</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-medium text-ink-muted hover:text-brand flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <h4 className="eyebrow text-ink-muted mb-1.5">
                Keyword search
              </h4>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ink-muted/80 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter catalog..."
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filters.search.trim()) {
                      addRecentSearch(filters.search.trim());
                    }
                  }}
                  className="w-full bg-surface border border-line focus:bg-white focus:border-brand text-xs rounded-full pl-8 pr-7 py-2 outline-none transition text-ink placeholder:text-ink-muted"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters((p) => ({ ...p, search: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted/80 hover:text-ink-muted p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Recent Searches Sidebar Section */}
            <RecentSearches variant="sidebar" />

            {/* Category Filter */}
            <div>
              <h4 className="eyebrow text-ink-muted mb-2">
                Department
              </h4>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const count = cat === 'All'
                    ? products.length
                    : products.filter((p) => p.category === cat).length;
                  const isSelected = filters.category === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => setFilters((p) => ({ ...p, category: cat }))}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-full text-xs transition ${
                        isSelected
                          ? 'bg-brand text-white font-medium'
                          : 'text-ink-muted hover:bg-surface hover:text-ink'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[11px] font-mono ${isSelected ? 'text-white/70' : 'text-ink-muted'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="eyebrow text-ink-muted">
                  Price ceiling
                </h4>
                <span className="text-xs font-mono font-semibold text-ink">${filters.maxPrice}</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={filters.maxPrice}
                onChange={(e) => setFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
                aria-label="Upper price bound"
                className="w-full h-1 bg-line rounded-full appearance-none cursor-pointer accent-brand"
              />
              <div className="flex justify-between text-[10px] text-ink-muted font-mono mt-1">
                <span>$20</span>
                <span>$500</span>
                <span>$1000</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="eyebrow text-ink-muted mb-2">
                Minimum rating
              </h4>
              <div className="grid grid-cols-4 gap-1">
                {[0, 4.0, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilters((p) => ({ ...p, minRating: rating }))}
                    className={`py-1.5 text-xs rounded-full border transition ${
                      filters.minRating === rating
                        ? 'bg-brand text-white border-brand font-medium'
                        : 'border-line text-ink-muted hover:bg-surface'
                    }`}
                  >
                    {rating === 0 ? 'All' : `${rating}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Only Toggle */}
            <div className="pt-3 border-t border-line">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))}
                  className="rounded text-brand focus:ring-brand w-3.5 h-3.5 accent-brand"
                />
                <span className="text-xs text-ink">In-stock only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Cards Grid or Skeleton Loader */}
        <div className="lg:col-span-3">
          {isProductsLoading ? (
            <ProductGridSkeleton count={6} />
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-card border border-line p-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 bg-surface text-ink-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-ink mb-1">No products found</h3>
              <p className="text-[13px] text-ink-muted mb-6 leading-relaxed">
                No items match your active filters. Try expanding the price range or resetting all filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 bg-ink hover:bg-brand text-white font-medium text-xs px-5 py-2.5 rounded-full transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
              <RecentSearches variant="empty-state" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-5 shadow-xl overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-base font-semibold text-ink">Filter products</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-surface"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Keyword Search in Mobile Drawer */}
            <div>
              <h4 className="eyebrow text-ink-muted mb-1.5">
                Keyword search
              </h4>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ink-muted/80 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter catalog..."
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filters.search.trim()) {
                      addRecentSearch(filters.search.trim());
                    }
                  }}
                  className="w-full bg-surface border border-line text-xs rounded-full pl-8 pr-7 py-2 outline-none text-ink"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters((p) => ({ ...p, search: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted/80 hover:text-ink-muted p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Recent Searches in Mobile Drawer */}
            <RecentSearches variant="sidebar" />

            {/* Category */}
            <div>
              <h4 className="eyebrow text-ink-muted mb-2">Category</h4>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilters((p) => ({ ...p, category: cat }))}
                    className={`w-full px-3 py-2 rounded-full text-xs text-left transition ${
                      filters.category === cat
                        ? 'bg-brand text-white font-medium'
                        : 'bg-surface text-ink'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Max Price:</span>
                <span className="font-mono">${filters.maxPrice}</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={filters.maxPrice}
                onChange={(e) => setFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
                className="w-full accent-brand"
              />
            </div>

            {/* Rating */}
            <div>
              <h4 className="eyebrow text-ink-muted mb-2">Min rating</h4>
              <div className="grid grid-cols-4 gap-1">
                {[0, 4.0, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilters((p) => ({ ...p, minRating: rating }))}
                    className={`py-1.5 text-xs rounded-full border ${
                      filters.minRating === rating
                        ? 'bg-brand text-white border-brand font-medium'
                        : 'border-line text-ink'
                    }`}
                  >
                    {rating === 0 ? 'All' : `${rating}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* In stock */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))}
                  className="rounded text-brand w-3.5 h-3.5 accent-brand"
                />
                <span className="text-xs text-ink">In-stock only</span>
              </label>
            </div>

            <div className="pt-4 border-t border-line flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 text-xs font-medium text-ink bg-surface rounded-full"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 text-xs font-medium text-white bg-ink hover:bg-brand rounded-full transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
