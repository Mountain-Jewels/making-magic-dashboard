/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { cn } from '@/lib/utils'

const PRODUCT_TYPES = ['Tennis Necklace', 'Tennis Bracelet', 'Eternity Band', 'Solitaire', 'Halo Ring', 'Pendant']
const GOLD_COLORS = [
  { id: 'Y', label: 'Y' },
  { id: 'W', label: 'W' },
  { id: 'R', label: 'R' },
]
const SHAPES = [
  { id: 'Br', label: 'Br' },
  { id: 'P/S', label: 'P/S' },
  { id: 'Ov', label: 'Ov' },
  { id: 'E/C', label: 'E/C' },
  { id: 'Cus', label: 'Cus' },
  { id: 'H/S', label: 'H/S' },
]

export function JewelrySection({
  product,
  color,
  carat,
  shape,
  onProductChange,
  onColorChange,
  onCaratChange,
  onShapeChange,
}: {
  product: string
  color: string
  carat: string
  shape: string
  onProductChange: (v: string) => void
  onColorChange: (v: string) => void
  onCaratChange: (v: string) => void
  onShapeChange: (v: string) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Product Type</label>
        <select
          value={product}
          onChange={(e) => onProductChange(e.target.value)}
          className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary"
        >
          {PRODUCT_TYPES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Gold Color</label>
        <div className="flex gap-1.5">
          {GOLD_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onColorChange(c.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                color === c.id
                  ? 'bg-brand-gold/30 text-brand-gold border border-brand-gold/50'
                  : 'bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Carat</label>
        <input
          type="text"
          value={carat}
          onChange={(e) => onCaratChange(e.target.value)}
          placeholder="—"
          className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Shape</label>
        <div className="flex flex-wrap gap-1.5">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onShapeChange(s.id)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                shape === s.id
                  ? 'bg-brand-gold/30 text-brand-gold border border-brand-gold/50'
                  : 'bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
