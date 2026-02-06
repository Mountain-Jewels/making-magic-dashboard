'use client'

import { useDashboardStore } from '@/lib/store/dashboard'

export function RightRail() {
  const { activeScreen } = useDashboardStore()
  
  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 text-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-secondary">
        {activeScreen === 'create' ? 'Inspector' : 'Deploy Controls'}
      </h2>
      
      {activeScreen === 'create' ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-400">AVATAR STATE</h3>
            <div className="text-sm text-gray-500">No avatar selected</div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-400">VOICE</h3>
            <div className="text-sm text-gray-500">No voice selected</div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-400">SAFETY</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-300">All systems ready</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-400">WHERE</h3>
            <div className="text-sm text-gray-500">Select publish target</div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-400">WHEN</h3>
            <div className="text-sm text-gray-500">Select schedule</div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-400">HOW</h3>
            <div className="text-sm text-gray-500">Select format</div>
          </div>
        </div>
      )}
    </div>
  )
}

