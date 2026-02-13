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
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border-2',
              selected === opt.id
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-medium border-[#D4AF37]'
                : 'text-white border-[#3A3A4A] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#1A1A24]'
            )}
          >
            {opt.label}
          </button>
          {selected === opt.id && subOptions && (
            <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-[#3A3A4A] pl-2">
              {subOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSubSelect(s)}
                    className={cn(
                    'w-full text-left px-2 py-1.5 rounded text-xs transition-colors border-2',
                    selectedSub === s
                      ? 'text-[#D4AF37] font-medium border-[#D4AF37]'
                      : 'text-white border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/30'
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
