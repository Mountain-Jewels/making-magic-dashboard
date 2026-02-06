'use client'

import { useDashboardStore } from '@/lib/store/dashboard'
import { ScriptInput } from '@/components/create/ScriptInput'
import { EmotionSlider } from '@/components/create/EmotionSlider'

function CreateScreen() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">CREATE</h1>
        <p className="text-gray-600">Build scenes, avatars, performances</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <ScriptInput />
        <EmotionSlider />

        <div className="pt-6 border-t border-gray-200">
          <button className="w-full py-4 bg-primary text-accent font-bold rounded-lg hover:bg-gray-800 transition-all">
            Submit to Render Queue
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Unreal Viewport Preview</h2>
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Live preview coming soon...</p>
        </div>
      </div>
    </div>
  )
}

function DeployScreen() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">DEPLOY</h1>
        <p className="text-gray-600">Orchestrate and publish</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Event Timeline</h2>
        <p className="text-gray-600">Deploy controls coming soon...</p>
      </div>
    </div>
  )
}

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
      <div className="flex-1 p-8 overflow-y-auto">
        {activeScreen === 'create' ? (
          <CreateScreen />
        ) : (
          <DeployScreen />
        )}
      </div>
    </div>
  )
}

