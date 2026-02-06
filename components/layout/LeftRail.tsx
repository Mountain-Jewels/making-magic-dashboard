'use client'

import { AvatarSelector } from '@/components/create/AvatarSelector'
import { OutfitSelector } from '@/components/create/OutfitSelector'
import { JewelrySelector } from '@/components/create/JewelrySelector'
import { BackgroundSelector } from '@/components/create/BackgroundSelector'
import { PerformanceControls } from '@/components/create/PerformanceControls'

export function LeftRail() {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 text-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-secondary">Creative Palette</h2>

      <AvatarSelector />
      <OutfitSelector />
      <JewelrySelector />
      <BackgroundSelector />
      <PerformanceControls />
    </div>
  )
}

