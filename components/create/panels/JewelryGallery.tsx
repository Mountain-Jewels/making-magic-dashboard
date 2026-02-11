'use client'

import { useState, useEffect } from 'react'
import { Gem } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const CATEGORIES = [
  { id: 'eternity_bands', label: 'Eternity Bands' },
  { id: 'tennis_necklaces', label: 'Tennis Necklaces' },
  { id: 'tennis_bracelets', label: 'Tennis Bracelets' },
  { id: 'diamond_earrings', label: 'Diamond Earrings' },
  { id: 'studs_combos', label: 'Studs & Combos' },
  { id: 'engagement_rings', label: 'Engagement Rings' },
  { id: 'pendants', label: 'Pendants' },
  { id: 'custom_design', label: 'Custom Design' },
]

const DIAMOND_SHAPES_LIMITED = [
  { id: 'round', label: 'Round' },
  { id: 'oval', label: 'Oval' },
  { id: 'emerald_cut', label: 'Emerald Cut' },
  { id: 'cushion', label: 'Cushion' },
]

const CARAT_WEIGHTS: Record<string, number[]> = {
  eternity_bands: [7, 10, 12, 15, 20],
  tennis_necklaces: [8, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80],
  tennis_bracelets: [8, 10, 15, 20, 25, 30],
  diamond_earrings: [1, 2, 3, 4, 5, 7, 10],
  studs_combos: [1, 2, 3, 4, 5, 7, 10],
  engagement_rings: [1, 2, 3, 4, 5, 7, 10],
  pendants: [1, 2, 3, 5, 7, 10],
  custom_design: [],
}

export function JewelryGallery() {
  const [category, setCategory] = useState('eternity_bands')
  const [shape, setShape] = useState('round')
  const [caratWeight, setCaratWeight] = useState<number | null>(null)
  const [customDesignText, setCustomDesignText] = useState('')

  useEffect(() => {
    setCaratWeight(null)
  }, [category])

  const isCustomDesign = category === 'custom_design'
  const availableWeights = CARAT_WEIGHTS[category] ?? []
  const selectionComplete = isCustomDesign
    ? customDesignText.trim().length > 0
    : category && shape && caratWeight != null
  const shapeLabel = DIAMOND_SHAPES_LIMITED.find((s) => s.id === shape)?.label
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label
  const selectionLabel = isCustomDesign
    ? `Custom: ${customDesignText.trim().slice(0, 40)}${customDesignText.trim().length > 40 ? '…' : ''}`
    : shapeLabel && categoryLabel && caratWeight != null
      ? `${shapeLabel} • ${caratWeight}ct ${categoryLabel}`
      : null

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Gem className="h-5 w-5 text-brand-gold" />
        <h3 className="text-sm font-semibold text-gray-900">Jewelry Selection</h3>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Category</p>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-white border-2 border-brand-gold/40 text-gray-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isCustomDesign ? (
        <div>
          <p className="text-xs text-gray-500 mb-2">Describe your custom design</p>
          <textarea
            value={customDesignText}
            onChange={(e) => setCustomDesignText(e.target.value)}
            placeholder="Describe your custom design..."
            className="w-full min-h-[80px] rounded-md border-2 border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-gold resize-y"
          />
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs text-gray-500 mb-2">Diamond Shape</p>
            <Select value={shape} onValueChange={setShape}>
              <SelectTrigger className="bg-white border-2 border-brand-gold/40 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIAMOND_SHAPES_LIMITED.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Carat Weight</p>
            <Select
              value={caratWeight?.toString() ?? ''}
              onValueChange={(v) => setCaratWeight(v ? Number(v) : null)}
            >
              <SelectTrigger className="bg-white border-2 border-brand-gold/40 text-gray-900">
                <SelectValue placeholder="Select carat weight..." />
              </SelectTrigger>
              <SelectContent>
                {availableWeights.map((w) => (
                  <SelectItem key={w} value={w.toString()}>
                    {w} carats
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {selectionComplete && (
        <div className="rounded-lg border-2 border-brand-gold/40 p-4 space-y-2">
          <div className="h-32 rounded-lg bg-gray-100 flex items-center justify-center">
            <p className="text-xs text-gray-400">AI-generated image will appear here</p>
          </div>
          <p className="text-sm font-medium text-gray-900 text-center">{selectionLabel}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        All jewelry images are AI generated — powered by GPT-4o (Phase 7)
      </p>

      {selectionComplete && (
        <Button className="w-full bg-brand-gold text-black hover:bg-brand-gold/90">
          Add to Scene
        </Button>
      )}
    </div>
  )
}
