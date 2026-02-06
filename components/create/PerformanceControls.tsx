'use client'

import { useDashboardStore } from '@/lib/store/dashboard'

const PERFORMANCE_MODES = [
  { id: 'speaking', name: 'Speaking', icon: '🗣️', description: 'Dialogue performance' },
  { id: 'singing', name: 'Singing', icon: '🎤', description: 'Musical performance' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬', description: 'Silent beauty' },
] as const

export function PerformanceControls() {
  const { performanceMode, setPerformanceMode } = useDashboardStore()

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wide">
        Performance Mode
      </h3>
      <div className="space-y-2">
        {PERFORMANCE_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setPerformanceMode(mode.id)}
            className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
              performanceMode === mode.id
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            <span className="text-2xl">{mode.icon}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{mode.name}</p>
              <p className="text-xs text-gray-500">{mode.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

