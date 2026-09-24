import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './skeletons/ProductGridSkeleton';
import { CATEGORIES } from '../data/initialData';
import { SortOption } from '../types';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Search
} from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { products, filters, setFilters, isProductsLoading } = useStore();
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {filters.category === 'All' ? 'Curated Catalog' : `${filters.category}`}
            </h2>
            <span className="bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[11px] px-2 py-0.5 rounded">
              {isProductsLoading ? 'Loading...' : `${filteredProducts.length} items`}
            </span>
          </div>
          {filters.search && (
            <p className="text-xs text-slate-500 mt-1">
              Showing results for "<span className="text-slate-900 font-medium">{filters.search}</span>"
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="sort-selector" className="text-xs text-slate-500 font-medium hidden sm:inline">
              Sort:
            </label>
            <select
              id="sort-selector"
              value={filters.sortBy}
              onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value as SortOption }))}
              aria-label="Sort products"
              className="bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-md px-3 py-1.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
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

      {/* Main Layout: Filters (Left) + Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5 sticky top-24 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-800">Filter By</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition ${
                        isSelected
                          ? 'bg-slate-900 text-white font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[11px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
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
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Upper Price Bound
                </h4>
                <span className="text-xs font-mono font-semibold text-slate-900">${filters.maxPrice}</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={filters.maxPrice}
                onChange={(e) => setFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
                aria-label="Upper price bound"
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>$20</span>
                <span>$500</span>
                <span>$1000</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Minimum Rating
              </h4>
              <div className="grid grid-cols-4 gap-1">
                {[0, 4.0, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilters((p) => ({ ...p, minRating: rating }))}
                    className={`py-1 text-xs rounded border transition ${
                      filters.minRating === rating
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {rating === 0 ? 'All' : `${rating}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Only Toggle */}
            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-700">In-Stock Only</span>
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
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No products found</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                No items match your active filters. Try expanding the price range or resetting all filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-md transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-5 shadow-xl overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Filter Products</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</h4>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilters((p) => ({ ...p, category: cat }))}
                    className={`w-full px-3 py-1.5 rounded-md text-xs text-left transition ${
                      filters.category === cat
                        ? 'bg-slate-900 text-white font-medium'
                        : 'bg-slate-50 text-slate-700'
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
                className="w-full accent-slate-900"
              />
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Min Rating</h4>
              <div className="grid grid-cols-4 gap-1">
                {[0, 4.0, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilters((p) => ({ ...p, minRating: rating }))}
                    className={`py-1 text-xs rounded border ${
                      filters.minRating === rating
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'border-slate-200 text-slate-700'
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
                  className="rounded text-indigo-600 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-800">In-Stock Only</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-md"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md"
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
