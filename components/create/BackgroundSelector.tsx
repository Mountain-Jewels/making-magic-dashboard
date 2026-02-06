'use client'

import { useDashboardStore } from '@/lib/store/dashboard'

const BACKGROUNDS = [
  { id: 'mountain', name: 'Mountain Vista', icon: '🏔️', description: 'Majestic peaks' },
  { id: 'cave', name: 'Crystal Cave', icon: '💎', description: 'Mystical depths' },
  { id: 'dream', name: 'Dream Ethereal', icon: '✨', description: 'Floating clouds' },
  { id: 'seasonal-winter', name: 'Winter Wonderland', icon: '❄️', description: 'Snowy magic' },
]

export function BackgroundSelector() {
  const { selectedBackground, selectBackground } = useDashboardStore()

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wide">
        Backgrounds / Worlds
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            onClick={() => selectBackground(bg.id)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedBackground === bg.id
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            <div className="text-3xl mb-2">{bg.icon}</div>
            <p className="text-xs font-medium mb-1">{bg.name}</p>
            <p className="text-xs text-gray-500">{bg.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

