import React from 'react';
import { useStore } from '../context/StoreContext';
import { Clock, X, Search, Sparkles } from 'lucide-react';

interface RecentSearchesProps {
  className?: string;
  variant?: 'chips' | 'sidebar' | 'empty-state';
  onSelect?: (query: string) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  className = '',
  variant = 'chips',
  onSelect
}) => {
  const {
    recentSearches,
    removeRecentSearch,
    clearRecentSearches,
    filters,
    setFilters,
    setActiveView,
    activeView
  } = useStore();

  if (!recentSearches || recentSearches.length === 0) {
    return null;
  }

  const handleSelectSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
    if (activeView !== 'shop') {
      setActiveView('shop');
    }
    if (onSelect) {
      onSelect(query);
    }
  };

  // 1. Variant for Empty Search Results State
  if (variant === 'empty-state') {
    return (
      <div className={`mt-5 pt-4 border-t border-slate-100 ${className}`}>
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-2.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Try one of your recent searches:</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {recentSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleSelectSearch(term)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 hover:border-slate-300 transition shadow-xs"
            >
              <Search className="w-3 h-3 text-slate-500" />
              <span>{term}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Variant for Sidebar Filters (Desktop & Mobile Drawer)
  if (variant === 'sidebar') {
    return (
      <div className={`space-y-2 pt-3 border-t border-slate-100 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Recent Searches</span>
          </div>
          <button
            type="button"
            onClick={clearRecentSearches}
            className="text-[10px] text-slate-400 hover:text-slate-700 transition underline underline-offset-2"
            title="Clear recent searches history"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {recentSearches.map((term) => {
            const isActive = filters.search.toLowerCase().trim() === term.toLowerCase().trim();
            return (
              <div
                key={term}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-medium shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
                onClick={() => handleSelectSearch(term)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectSearch(term);
                  }
                }}
              >
                <div className="flex items-center gap-2 truncate">
                  <Search className={`w-3 h-3 shrink-0 ${isActive ? 'text-slate-300' : 'text-slate-400'}`} />
                  <span className="truncate">{term}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentSearch(term);
                  }}
                  className={`p-0.5 rounded transition ml-1 shrink-0 ${
                    isActive
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                  aria-label={`Remove "${term}" from recent searches`}
                  title="Remove query"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Default 'chips' variant for top controls bar in product grid
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      aria-label="Recent search queries"
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">Recent searches:</span>
        <span className="sm:hidden">Recent:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {recentSearches.map((term) => {
          const isActive = filters.search.toLowerCase().trim() === term.toLowerCase().trim();
          return (
            <div
              key={term}
              onClick={() => handleSelectSearch(term)}
              className={`group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer select-none ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
              title={`Quick search for "${term}"`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectSearch(term);
                }
              }}
            >
              <Search className={`w-3 h-3 ${isActive ? 'text-slate-300' : 'text-slate-400'}`} />
              <span className="max-w-[130px] truncate">{term}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeRecentSearch(term);
                }}
                className={`p-0.5 rounded-full transition ${
                  isActive
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                }`}
                aria-label={`Remove "${term}" from recent searches`}
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={clearRecentSearches}
          className="text-[11px] text-slate-400 hover:text-slate-600 transition underline underline-offset-2 ml-1"
          title="Clear all recent searches"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
