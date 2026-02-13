/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

const PRESETS = [
  { id: 'jewelry_studio', label: 'Jewelry Studio' },
  { id: 'garden_terrace', label: 'Garden Terrace' },
  { id: 'velvet_backdrop', label: 'Velvet Backdrop' },
  { id: 'marble_gallery', label: 'Marble Gallery' },
  { id: 'sunset_balcony', label: 'Sunset Balcony' },
  { id: 'minimalist_white', label: 'Minimalist White' },
]

export function BackgroundSection({
  selected,
  onSelect,
  onGenerateNew,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onGenerateNew?: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              'aspect-video rounded-lg border-2 text-xs font-medium transition-colors flex items-center justify-center',
              selected === p.id
                ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                : 'border-[#3A3A4A] bg-[#1A1A24] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 text-white"
        onClick={onGenerateNew}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Generate New
      </Button>
    </div>
  )
}
