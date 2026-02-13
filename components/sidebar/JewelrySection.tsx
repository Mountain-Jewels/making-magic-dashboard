/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { cn } from '@/lib/utils'

const PRODUCT_CATEGORIES: Record<string, string[]> = {
  Necklaces: ['Tennis Necklace', 'Pendant Necklace', 'Chain Necklace', 'Choker'],
  Earrings: ['Studs', 'Drop Earrings', 'Hoop Earrings', 'Huggie Earrings'],
  Bracelets: ['Tennis Bracelet', 'Bangle', 'Chain Bracelet', 'Cuff'],
  Rings: ['Solitaire Ring', 'Three-Stone Ring', 'Eternity Band', 'Stackable Ring'],
}

const GOLD_COLORS = [
  { id: 'Y', label: 'Yellow' },
  { id: 'W', label: 'White' },
  { id: 'R', label: 'Rose' },
]

const SHAPE_OPTIONS = [
  'Round',
  'Pear',
  'Oval',
  'Emerald Cut',
  'Cushion',
  'Heart',
  'Marquise',
  'Princess',
  'Radiant',
  'Asscher',
]

const CARAT_OPTIONS = [
  '0.25',
  '0.50',
  '0.75',
  '1.00',
  '1.25',
  '1.50',
  '2.00',
  '2.50',
  '3.00',
  '4.00',
  '5.00',
]

export interface JewelryConfig {
  product: string
  color: string
  shape: string
  carat: string
  studShape?: string
  studCarat?: string
  topShape?: string
  topCarat?: string
  bottomShape?: string
  bottomCarat?: string
}

export function JewelrySection({
  product,
  color,
  shape,
  carat,
  studShape = 'Round',
  studCarat = '1.00',
  topShape = 'Round',
  topCarat = '1.00',
  bottomShape = 'Pear',
  bottomCarat = '3.00',
  onProductChange,
  onColorChange,
  onShapeChange,
  onCaratChange,
  onStudShapeChange,
  onStudCaratChange,
  onTopShapeChange,
  onTopCaratChange,
  onBottomShapeChange,
  onBottomCaratChange,
}: {
  product: string
  color: string
  shape: string
  carat: string
  studShape?: string
  studCarat?: string
  topShape?: string
  topCarat?: string
  bottomShape?: string
  bottomCarat?: string
  onProductChange: (v: string) => void
  onColorChange: (v: string) => void
  onShapeChange: (v: string) => void
  onCaratChange: (v: string) => void
  onStudShapeChange?: (v: string) => void
  onStudCaratChange?: (v: string) => void
  onTopShapeChange?: (v: string) => void
  onTopCaratChange?: (v: string) => void
  onBottomShapeChange?: (v: string) => void
  onBottomCaratChange?: (v: string) => void
}) {
  const isStuds = product === 'Studs'
  const isDropEarrings = product === 'Drop Earrings'
  const showEarringConfig = isStuds || isDropEarrings

  const labelClass = 'block text-xs font-medium text-text-primary mb-1'
  const selectClass = 'w-full bg-surface-elevated border-2 border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-gold focus:outline-none'

  const StoneConfig = ({
    label,
    shapeVal,
    caratVal,
    onShape,
    onCarat,
  }: {
    label: string
    shapeVal: string
    caratVal: string
    onShape: (v: string) => void
    onCarat: (v: string) => void
  }) => (
    <div className="space-y-2 rounded-lg border-2 border-surface-border p-2 bg-surface-elevated/50">
      <p className="text-xs font-semibold text-brand-gold">{label}</p>
      <div>
        <label className={labelClass}>Shape</label>
        <select
          value={shapeVal}
          onChange={(e) => onShape(e.target.value)}
          className={selectClass}
        >
          {SHAPE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Carat Size</label>
        <select
          value={caratVal}
          onChange={(e) => onCarat(e.target.value)}
          className={selectClass}
        >
          {CARAT_OPTIONS.map((c) => (
            <option key={c} value={c}>{c} ct</option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Product Type</label>
        <select
          value={product}
          onChange={(e) => onProductChange(e.target.value)}
          className={selectClass}
        >
          {Object.entries(PRODUCT_CATEGORIES).map(([cat, items]) => (
            <optgroup key={cat} label={cat}>
              {items.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Gold Color</label>
        <div className="flex gap-1.5">
          {GOLD_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onColorChange(c.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border-2',
                color === c.id
                  ? 'bg-brand-gold/30 text-brand-gold border-brand-gold'
                  : 'bg-surface-elevated border-surface-border text-text-primary hover:border-brand-gold hover:text-brand-gold'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {showEarringConfig ? (
        <div className="space-y-3">
          {isStuds && onStudShapeChange && onStudCaratChange && (
            <StoneConfig
              label="Stone"
              shapeVal={studShape}
              caratVal={studCarat}
              onShape={onStudShapeChange}
              onCarat={onStudCaratChange}
            />
          )}
          {isDropEarrings && onTopShapeChange && onTopCaratChange && onBottomShapeChange && onBottomCaratChange && (
            <>
              <StoneConfig
                label="Top Stone"
                shapeVal={topShape}
                caratVal={topCarat}
                onShape={onTopShapeChange}
                onCarat={onTopCaratChange}
              />
              <StoneConfig
                label="Bottom Drop Stone"
                shapeVal={bottomShape}
                caratVal={bottomCarat}
                onShape={onBottomShapeChange}
                onCarat={onBottomCaratChange}
              />
            </>
          )}
        </div>
      ) : (
        <>
          <div>
            <label className={labelClass}>Shape</label>
            <select
              value={shape}
              onChange={(e) => onShapeChange(e.target.value)}
              className={selectClass}
            >
              {SHAPE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Carat Size</label>
            <select
              value={carat}
              onChange={(e) => onCaratChange(e.target.value)}
              className={selectClass}
            >
              {CARAT_OPTIONS.map((c) => (
                <option key={c} value={c}>{c} ct</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  )
}
