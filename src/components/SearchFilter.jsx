import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '../utils';

export default function SearchFilter({ searchQuery, onSearchChange, filters, onFilterChange }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="input-field pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${
            showFilters ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : ''
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 glass-card p-3">
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="input-field w-auto text-xs"
          >
            <option value="">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="input-field w-auto text-xs"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="input-field w-auto text-xs"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          {(filters.priority || filters.category || filters.status) && (
            <button
              onClick={() => {
                onFilterChange('priority', '');
                onFilterChange('category', '');
                onFilterChange('status', '');
              }}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
