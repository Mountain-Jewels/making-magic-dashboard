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
  { id: 'tennis_bracelets', label: 'Tennis Bracelets' },
  { id: 'tennis_necklaces', label: 'Tennis Necklaces' },
  { id: 'pendants', label: 'Pendants' },
  { id: 'diamond_studs', label: 'Diamond Studs' },
  { id: 'engagement_rings', label: 'Engagement Rings' },
]

const SHAPES = [
  { id: 'round', label: 'Round' },
  { id: 'emerald_cut', label: 'Emerald Cut' },
  { id: 'oval_cut', label: 'Oval Cut' },
  { id: 'cushion_cut', label: 'Cushion Cut' },
]

const CARAT_WEIGHTS: Record<string, number[]> = {
  eternity_bands: [7, 10, 12, 15, 20],
  tennis_bracelets: [8, 10, 15, 20, 25, 30],
  tennis_necklaces: [8, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80],
  pendants: [1, 2, 3, 5, 7, 10],
  diamond_studs: [1, 2, 3, 4, 5, 7, 10],
  engagement_rings: [1, 2, 3, 4, 5, 7, 10],
}

export function JewelryGallery() {
  const [category, setCategory] = useState('eternity_bands')
  const [shape, setShape] = useState('round')
  const [caratWeight, setCaratWeight] = useState<number | null>(null)

  useEffect(() => {
    setCaratWeight(null)
  }, [category])

  const availableWeights = CARAT_WEIGHTS[category] ?? []
  const selectionComplete = category && shape && caratWeight != null
  const shapeLabel = SHAPES.find((s) => s.id === shape)?.label
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label
  const selectionLabel = selectionComplete
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
          <SelectTrigger className="bg-white border-brand-gold/40 text-gray-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Shape</p>
        <Select value={shape} onValueChange={setShape}>
          <SelectTrigger className="bg-white border-brand-gold/40 text-gray-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHAPES.map((s) => (
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
          <SelectTrigger className="bg-white border-brand-gold/40 text-gray-900">
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

      {selectionComplete && (
        <div className="rounded-lg border border-brand-gold/40 p-4 space-y-2">
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
