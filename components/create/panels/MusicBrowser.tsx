'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const MUSIC_CATEGORIES = [
  { id: 'country', label: 'Country', emoji: '🤠' },
  { id: 'classic_rock', label: 'Classic Rock', emoji: '🎸' },
  { id: 'pop', label: 'Pop', emoji: '🎤' },
  { id: 'latest_hits', label: 'Latest Hits', emoji: '🔥' },
  { id: 'event_songs', label: 'Event Songs', emoji: '🎉' },
  { id: 'custom', label: 'Custom', emoji: '📁' },
]

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  MUSIC_CATEGORIES.map((c) => [c.id, c.label])
)

export function MusicBrowser() {
  const [selectedCategory, setSelectedCategory] = useState<string>('country')
  const [uploadCategory, setUploadCategory] = useState<string>('country')

  const categoryLabel = CATEGORY_LABELS[selectedCategory] ?? selectedCategory

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">🎵 Music Library</h3>

      <div>
        <p className="text-xs text-gray-500 mb-2">Category</p>
        <div className="grid grid-cols-3 gap-2">
          {MUSIC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-0.5 text-sm font-medium transition-colors',
                selectedCategory === cat.id
                  ? 'border-brand-gold bg-brand-gold/10 text-gray-900'
                  : 'border-brand-gold/40 hover:border-brand-gold/60 text-gray-700 bg-white'
              )}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Songs in {categoryLabel}:</p>
        <div className="rounded-lg border-2 border-brand-gold/40 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No songs in this category — upload to add
        </div>
      </div>

      <div className="rounded-lg border-2 border-dashed border-brand-gold/40 p-4 space-y-3 bg-white">
        <p className="text-sm font-medium text-gray-900">📤 Upload Music</p>
        <p className="text-xs text-gray-500">.mp3, .wav, .m4a</p>
        <div>
          <p className="text-xs text-gray-500 mb-1">Assign to:</p>
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="w-full rounded-md border-2 border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-gold"
          >
            {MUSIC_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <label className="block">
          <input type="file" accept=".mp3,.wav,.m4a" className="hidden" />
          <span className="inline-block rounded-lg border-2 border-brand-gold/40 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
            Choose file
          </span>
        </label>
      </div>

      <div className="pt-2">
        <p className="text-xs text-gray-500 text-center mb-2">——— Or Import ———</p>
        <div className="space-y-2">
          <button
            type="button"
            className="w-full rounded-lg border-2 border-brand-gold/40 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Import from Spotify
          </button>
          <button
            type="button"
            className="w-full rounded-lg border-2 border-brand-gold/40 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Import from Apple Music
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">Coming soon — Phase 7</p>
      </div>
    </div>
  )
}
