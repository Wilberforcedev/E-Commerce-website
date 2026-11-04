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
      <div className={`mt-5 pt-4 border-t border-line/70 ${className}`}>
        <div className="flex items-center justify-center gap-1.5 text-xs text-ink-muted mb-2.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-ink-muted/80" />
          <span>Try one of your recent searches:</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {recentSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleSelectSearch(term)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface hover:bg-line/60 text-ink border border-line hover:border-line transition shadow-xs"
            >
              <Search className="w-3 h-3 text-ink-muted" />
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
      <div className={`space-y-2 pt-3 border-t border-line/70 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
            <Clock className="w-3 h-3 text-ink-muted/80" />
            <span>Recent Searches</span>
          </div>
          <button
            type="button"
            onClick={clearRecentSearches}
            className="text-[10px] text-ink-muted/80 hover:text-ink transition underline underline-offset-2"
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
                    ? 'bg-brand text-white font-medium shadow-xs'
                    : 'bg-surface hover:bg-surface text-ink'
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
                  <Search className={`w-3 h-3 shrink-0 ${isActive ? 'text-white/70' : 'text-ink-muted/80'}`} />
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
                      ? 'text-ink-muted/80 hover:text-white hover:bg-brand-dark'
                      : 'text-ink-muted/80 hover:text-ink hover:bg-line/60'
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
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
        <Clock className="w-3.5 h-3.5 text-ink-muted/80" />
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
                  ? 'bg-ink border-ink text-white shadow-xs'
                  : 'bg-white hover:bg-surface border-line text-ink hover:border-line'
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
              <Search className={`w-3 h-3 ${isActive ? 'text-white/70' : 'text-ink-muted/80'}`} />
              <span className="max-w-[130px] truncate">{term}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeRecentSearch(term);
                }}
                className={`p-0.5 rounded-full transition ${
                  isActive
                    ? 'text-white/70 hover:text-white hover:bg-brand-dark'
                    : 'text-ink-muted/80 hover:text-ink hover:bg-line/60'
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
          className="text-[11px] text-ink-muted/80 hover:text-ink-muted transition underline underline-offset-2 ml-1"
          title="Clear all recent searches"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
