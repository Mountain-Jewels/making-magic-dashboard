/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { cn } from '@/lib/utils'

const ASSET_TABS = [
  { id: 'backgrounds', label: 'Backgrounds' },
  { id: 'uploads', label: 'Uploads' },
  { id: 'generated', label: 'Generated' },
  { id: 'purchased', label: 'Purchased' },
]

export function AssetsSection({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {ASSET_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
              activeTab === t.id
                ? 'bg-brand-gold/20 text-brand-gold'
                : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-text-muted">Asset browser — {activeTab}</p>
    </div>
  )
}
