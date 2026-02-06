'use client'

import { useDashboardStore } from '@/lib/store/dashboard'

const JEWELRY_ITEMS = [
  { id: 'diamond-solitaire', name: 'Diamond Solitaire Ring', icon: '💍', category: 'ring' },
  { id: 'pearl-necklace', name: 'Pearl Necklace', icon: '📿', category: 'necklace' },
  { id: 'gold-bracelet', name: 'Gold Bracelet', icon: '⌚', category: 'bracelet' },
  { id: 'emerald-earrings', name: 'Emerald Earrings', icon: '💎', category: 'earrings' },
]

export function JewelrySelector() {
  const { selectedJewelry, selectJewelry } = useDashboardStore()

  const toggleJewelry = (id: string) => {
    if (selectedJewelry.includes(id)) {
      selectJewelry(selectedJewelry.filter((j) => j !== id))
    } else {
      selectJewelry([...selectedJewelry, id])
    }
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wide">
        Jewelry (Product-Linked)
      </h3>
      <div className="space-y-2">
        {JEWELRY_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleJewelry(item.id)}
            className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
              selectedJewelry.includes(item.id)
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">{item.category}</p>
            </div>
            {selectedJewelry.includes(item.id) && (
              <span className="text-secondary">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

