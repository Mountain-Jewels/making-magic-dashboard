'use client'

import { useState } from 'react'

interface KillSwitchProps {
  name: string
  description: string
  initialState: boolean
}

export function KillSwitch({ name, description, initialState }: KillSwitchProps) {
  const [killed, setKilled] = useState(initialState)
  const [confirming, setConfirming] = useState(false)
  
  const handleToggle = () => {
    if (!killed) {
      setConfirming(true)
    } else {
      setKilled(false)
      // TODO: Call API to restore
    }
  }
  
  const confirmKill = () => {
    setKilled(true)
    setConfirming(false)
    // TODO: Call API to kill
  }
  
  return (
    <div className={`bg-gray-900 border rounded-lg p-4 ${killed ? 'border-red-500' : 'border-gray-800'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        {confirming ? (
          <div className="flex gap-2">
            <button onClick={confirmKill} className="px-3 py-1 bg-red-600 rounded text-sm">
              Confirm Kill
            </button>
            <button onClick={() => setConfirming(false)} className="px-3 py-1 bg-gray-700 rounded text-sm">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleToggle}
            className={`px-4 py-1 rounded text-sm font-medium ${
              killed ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {killed ? 'Restore' : 'Kill'}
          </button>
        )}
      </div>
      {killed && (
        <div className="mt-3 text-red-400 text-sm font-medium">
          ⚠️ KILLED — Service is disabled
        </div>
      )}
    </div>
  )
}
