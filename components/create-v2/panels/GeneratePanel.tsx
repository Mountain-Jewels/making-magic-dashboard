'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STYLE_PRESETS = ['Photorealistic', 'Artistic', 'Cinematic', 'Jewelry Product Shot']

export function GeneratePanel() {
  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        placeholder="Describe what you want to create..."
        className="w-full rounded-lg border-2 border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-gold"
      />
      <div className="flex flex-wrap gap-2">
        {STYLE_PRESETS.map((style) => (
          <Badge key={style} variant="secondary" className="cursor-pointer hover:bg-gray-200">
            {style}
          </Badge>
        ))}
      </div>
      <Button disabled className="w-full">
        Generate — Coming soon (requires AI service)
      </Button>
      <div className="rounded-lg border-2 border-dashed border-brand-gold/40 p-6 text-center">
        <p className="text-sm text-gray-500">Result will appear here</p>
      </div>
    </div>
  )
}
