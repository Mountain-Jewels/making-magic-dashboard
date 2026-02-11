'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const HAIR_STYLES = [
  'Short', 'Long', 'Curly', 'Straight', 'Updo',
  'Bob', 'Pixie', 'Wavy', 'Braided', 'Layered',
]

const MAKEUP_PRESETS = [
  'Natural', 'Glam', 'Evening', 'Minimal',
  'Soft Glow', 'Bold Lip', 'Smoky Eye', 'No-Makeup',
]

const HAIR_COLORS_BY_FAMILY: { family: string; colors: { label: string; hex: string }[] }[] = [
  {
    family: 'Blonde',
    colors: [
      { label: 'Platinum', hex: '#F5F5DC' },
      { label: 'Honey', hex: '#E6B87C' },
      { label: 'Golden', hex: '#D4A84B' },
      { label: 'Strawberry', hex: '#E8B4A0' },
      { label: 'Ash', hex: '#C9B896' },
    ],
  },
  {
    family: 'Brunette',
    colors: [
      { label: 'Light Brown', hex: '#8B4513' },
      { label: 'Medium Brown', hex: '#5C4033' },
      { label: 'Dark Brown', hex: '#3D2314' },
      { label: 'Chocolate', hex: '#4A3728' },
      { label: 'Auburn', hex: '#A52A2A' },
    ],
  },
  {
    family: 'Black',
    colors: [
      { label: 'Jet Black', hex: '#0D0D0D' },
      { label: 'Soft Black', hex: '#1C1C1C' },
      { label: 'Blue Black', hex: '#0A0A12' },
    ],
  },
  {
    family: 'Red',
    colors: [
      { label: 'Copper', hex: '#B87333' },
      { label: 'Auburn', hex: '#922724' },
      { label: 'Burgundy', hex: '#722F37' },
      { label: 'Ginger', hex: '#C9652C' },
    ],
  },
  {
    family: 'Gray & Silver',
    colors: [
      { label: 'Silver', hex: '#C0C0C0' },
      { label: 'Salt & Pepper', hex: '#6B6B6B' },
      { label: 'Pearl Gray', hex: '#9E9E9E' },
    ],
  },
]

function CollapsibleColorSection({
  family,
  colors,
  open,
  onToggle,
  selectedHex,
  onSelect,
}: {
  family: string
  colors: { label: string; hex: string }[]
  open: boolean
  onToggle: () => void
  selectedHex: string | null
  onSelect: (hex: string) => void
}) {
  return (
    <div className="border-2 border-brand-gold/40 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100"
      >
        {family}
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-2 flex flex-wrap gap-2 border-t border-brand-gold/40 bg-white">
          {colors.map(({ label, hex }) => (
            <button
              key={hex}
              type="button"
              onClick={() => onSelect(hex)}
              title={label}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-colors',
                selectedHex === hex ? 'border-brand-gold ring-2 ring-brand-gold/30' : 'border-brand-gold/40 hover:border-brand-gold/60'
              )}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function HairMakeupPanel() {
  const [expandedFamily, setExpandedFamily] = useState<string | null>('Blonde')
  const [selectedHairHex, setSelectedHairHex] = useState<string | null>(null)

  return (
    <div className="p-4 space-y-4">
      <Tabs defaultValue="hair">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hair">Hair</TabsTrigger>
          <TabsTrigger value="makeup">Makeup</TabsTrigger>
        </TabsList>
        <TabsContent value="hair" className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">Style</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HAIR_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  className="h-10 rounded-lg border-2 border-brand-gold/40 bg-gray-50 flex items-center justify-center text-sm text-gray-900 hover:border-brand-gold/60"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Color</p>
            <div className="space-y-2">
              {HAIR_COLORS_BY_FAMILY.map(({ family, colors }) => (
                <CollapsibleColorSection
                  key={family}
                  family={family}
                  colors={colors}
                  open={expandedFamily === family}
                  onToggle={() => setExpandedFamily((f) => (f === family ? null : family))}
                  selectedHex={selectedHairHex}
                  onSelect={setSelectedHairHex}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="makeup" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MAKEUP_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                className="h-12 border-brand-gold/40 hover:border-brand-gold/60"
              >
                {preset}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <p className="text-xs text-gray-500 text-center">
        Coming soon — requires avatar rendering engine
      </p>
    </div>
  )
}
