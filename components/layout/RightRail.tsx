'use client'

import { useDashboardStore } from '@/lib/store/dashboard'
import { HealthIndicator } from '@/components/shared/HealthIndicator'

function CreateInspector() {
  const { selectedAvatar, selectedOutfit, selectedJewelry, selectedBackground, performanceMode } = useDashboardStore()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-400">SELECTIONS</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Avatar:</span>
            <span className="text-gray-300">{selectedAvatar || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Outfit:</span>
            <span className="text-gray-300">{selectedOutfit || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Jewelry:</span>
            <span className="text-gray-300">{selectedJewelry.length} items</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Background:</span>
            <span className="text-gray-300">{selectedBackground || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Mode:</span>
            <span className="text-gray-300 capitalize">{performanceMode}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-400">READINESS</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${selectedAvatar ? 'bg-green-500' : 'bg-gray-600'}`}></div>
            <span className="text-sm text-gray-300">Avatar selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${selectedBackground ? 'bg-green-500' : 'bg-gray-600'}`}></div>
            <span className="text-sm text-gray-300">Background set</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-300">API connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeployInspector() {
  const { renderStatus, renderProgress, publishTarget } = useDashboardStore()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-400">RENDER STATUS</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status:</span>
            <span className="text-gray-300 capitalize">{renderStatus}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Progress:</span>
            <span className="text-gray-300">{renderProgress}%</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-400">PUBLISH TARGET</h3>
        <div className="text-sm text-gray-300 capitalize">
          {publishTarget || 'Not selected'}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-400">GOVERNANCE</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-300">All checks passed</span>
        </div>
      </div>
    </div>
  )
}

export function RightRail() {
  const { activeScreen } = useDashboardStore()

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 text-white p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-secondary">
          {activeScreen === 'create' ? 'Inspector' : 'Deploy Controls'}
        </h2>
        <HealthIndicator />
      </div>
      
      {activeScreen === 'create' ? (
        <CreateInspector />
      ) : (
        <DeployInspector />
      )}
    </div>
  )
}

