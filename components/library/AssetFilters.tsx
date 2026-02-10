'use client'

import { Search } from 'lucide-react'

export type LibraryFilter = 'all' | 'scenes' | 'avatars' | 'singing' | 'videos'

const FILTERS: { value: LibraryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'scenes', label: 'Scenes' },
  { value: 'avatars', label: 'Avatars' },
  { value: 'singing', label: 'Singing' },
  { value: 'videos', label: 'Videos' },
]

interface AssetFiltersProps {
  filter: LibraryFilter
  onFilterChange: (filter: LibraryFilter) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function AssetFilters({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: AssetFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="search"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-border bg-surface-panel text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/50'
                : 'bg-surface-panel border border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
