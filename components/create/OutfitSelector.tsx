'use client'

import { useDashboardStore } from '@/lib/store/dashboard'

const OUTFITS = [
  { id: 'outfit-elegant', name: 'Elegant Evening', icon: '👗' },
  { id: 'outfit-casual', name: 'Casual Chic', icon: '👚' },
  { id: 'outfit-seasonal', name: 'Seasonal', icon: '🎄' },
  { id: 'outfit-formal', name: 'Formal', icon: '🤵' },
]

export function OutfitSelector() {
  const { selectedOutfit, selectOutfit } = useDashboardStore()

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wide">
        Outfits
      </h3>
      <div className="space-y-2">
        {OUTFITS.map((outfit) => (
          <button
            key={outfit.id}
            onClick={() => selectOutfit(outfit.id)}
            className={`
              w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3
              ${
                selectedOutfit === outfit.id
                  ? 'border-secondary bg-secondary/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }
            `}
          >
            <span className="text-2xl">{outfit.icon}</span>
            <span className="text-sm text-gray-300">{outfit.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

