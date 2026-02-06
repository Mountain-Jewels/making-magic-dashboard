'use client'

import { useDashboardStore } from '@/lib/store/dashboard'

const EMOTIONS = [
  { value: 'joyful', label: 'Joyful', color: 'bg-yellow-500' },
  { value: 'romantic', label: 'Romantic', color: 'bg-pink-500' },
  { value: 'serene', label: 'Serene', color: 'bg-blue-500' },
  { value: 'celebratory', label: 'Celebratory', color: 'bg-purple-500' },
  { value: 'grateful', label: 'Grateful', color: 'bg-green-500' },
]

export function EmotionSlider() {
  const { emotionalTone, emotionIntensity, setEmotionalTone, setEmotionIntensity } = useDashboardStore()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-3 text-gray-700">
          Emotional Tone
        </label>
        <div className="flex gap-2">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.value}
              onClick={() => setEmotionalTone(emotion.value)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                emotionalTone === emotion.value
                  ? `${emotion.color} text-white`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {emotion.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Intensity: {emotionIntensity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={emotionIntensity}
          onChange={(e) => setEmotionIntensity(Number(e.target.value))}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-secondary"
        />
      </div>
    </div>
  )
}

