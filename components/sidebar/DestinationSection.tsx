/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { cn } from '@/lib/utils'

const DESTINATION_OPTIONS = [
  { id: 'social_media', label: 'Social Media', sub: ['Instagram', 'TikTok', 'Facebook', 'Pinterest', 'YouTube'] },
  { id: 'web', label: 'Web (Shopify)', sub: ['Product Page', 'Landing Page', 'Homepage Banner'] },
  { id: 'email', label: 'Email', sub: ['Campaign', 'Moment', 'Newsletter'] },
  { id: 'events', label: 'Events' },
] as const

export function DestinationSection({
  selected,
  selectedSub,
  onSelect,
  onSubSelect,
}: {
  selected: string | null
  selectedSub: string | null
  onSelect: (id: string) => void
  onSubSelect: (id: string) => void
}) {
  return (
    <div className="space-y-1.5">
      {DESTINATION_OPTIONS.map((opt) => {
        const subOptions = 'sub' in opt ? opt.sub : null
        return (
        <div key={opt.id}>
          <button
            type="button"
            onClick={() => onSelect(opt.id)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
              selected === opt.id
                ? 'bg-brand-gold/20 text-brand-gold font-medium'
                : 'text-text-primary hover:bg-surface-elevated hover:text-brand-gold'
            )}
          >
            {opt.label}
          </button>
          {selected === opt.id && subOptions && (
            <div className="ml-3 mt-1 space-y-0.5 border-l border-surface-border pl-2">
              {subOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSubSelect(s)}
                  className={cn(
                    'w-full text-left px-2 py-1.5 rounded text-xs transition-colors',
                    selectedSub === s
                      ? 'text-brand-gold font-medium'
                      : 'text-text-primary hover:text-brand-gold'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )})}
    </div>
  )
}
