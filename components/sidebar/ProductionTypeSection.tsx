/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { Film } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { id: 'still_image', label: 'Still Image' },
  { id: '2d_video', label: '2D Video' },
  { id: '3d_video', label: '3D Video' },
  { id: 'interactive', label: 'Interactive Video' },
] as const

export function ProductionTypeSection({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-1.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
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
      ))}
    </div>
  )
}
