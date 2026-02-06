'use client'

import { useDashboardStore } from '@/lib/store/dashboard'

export function MainCanvas() {
  const { activeScreen, setActiveScreen } = useDashboardStore()
  
  return (
    <div className="flex-1 bg-gray-100 flex flex-col">
      {/* Screen Switcher */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex gap-4">
        <button
          onClick={() => setActiveScreen('create')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeScreen === 'create'
              ? 'bg-secondary text-primary'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          CREATE
        </button>
        <button
          onClick={() => setActiveScreen('deploy')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeScreen === 'deploy'
              ? 'bg-secondary text-primary'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          DEPLOY
        </button>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {activeScreen === 'create' ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">CREATE</h1>
              <p className="text-gray-600">Build scenes, avatars, performances</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">DEPLOY</h1>
              <p className="text-gray-600">Orchestrate and publish</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

