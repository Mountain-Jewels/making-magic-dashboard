'use client'

import { useState } from 'react'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import type { AvatarDirection, VoiceTone } from '@/lib/types/avatar'

const VOICE_TONES: { value: VoiceTone; label: string }[] = [
  { value: 'warm_intimate', label: 'Warm & Intimate' },
  { value: 'celebratory', label: 'Celebratory' },
  { value: 'sincere', label: 'Sincere' },
  { value: 'joyful', label: 'Joyful' },
  { value: 'reverent', label: 'Reverent' },
]

const MOMENT_TYPES = ['anniversary', 'birthday', 'wedding', 'graduation', 'property', 'legacy', 'gratitude']
const EMOTIONAL_TONES = ['romantic', 'celebratory', 'grateful', 'legacy', 'milestone']

const STYLE_COLORS: Record<string, string> = {
  elegant: 'border-purple-500/40',
  warm: 'border-orange-500/40',
  professional: 'border-blue-500/40',
  youthful: 'border-green-500/40',
  regal: 'border-[#D4AF37]/40',
}

export default function AvatarsPage() {
  const { presets, directions, selectedPreset, setSelectedPreset, currentDirection, setCurrentDirection, addDirection, updateDirection } = useAvatarStore()
  const [showNewDirection, setShowNewDirection] = useState(false)
  const [newMoment, setNewMoment] = useState('birthday')
  const [newTone, setNewTone] = useState('celebratory')

  const handleCreateDirection = () => {
    if (!selectedPreset) return
    const direction: AvatarDirection = {
      id: `dir-${Date.now()}`,
      avatar_id: selectedPreset.id,
      moment_type: newMoment,
      emotional_tone: newTone,
      voice_tone: selectedPreset.default_voice_tone,
      script: '',
      script_status: 'draft',
      created_at: new Date().toISOString(),
    }
    addDirection(direction)
    setCurrentDirection(direction)
    setShowNewDirection(false)
  }

  const handleGenerateScript = () => {
    if (!currentDirection) return
    const mockScript = `A beautiful ${currentDirection.moment_type} moment, filled with ${currentDirection.emotional_tone} energy. This piece tells a story of connection, crafted with care and delivered with love.`
    updateDirection(currentDirection.id, { script: mockScript, script_status: 'generated' })
    setCurrentDirection({ ...currentDirection, script: mockScript, script_status: 'generated' })
  }

  const avatarDirections = selectedPreset
    ? directions.filter((d) => d.avatar_id === selectedPreset.id)
    : []

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Avatar Director</h1>

      {/* Avatar Grid */}
      <div className="grid grid-cols-5 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => { setSelectedPreset(preset); setCurrentDirection(null) }}
            className={`bg-gray-900 border-2 rounded-lg p-4 text-left transition-colors ${
              selectedPreset?.id === preset.id
                ? 'border-[#D4AF37]'
                : `${STYLE_COLORS[preset.style]} hover:border-gray-600`
            }`}
          >
            <div className="w-12 h-12 bg-gray-800 rounded-full mb-3 flex items-center justify-center text-lg">
              {preset.gender === 'female' ? '👩' : '👨'}
            </div>
            <h3 className="font-semibold text-white text-sm">{preset.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{preset.style}</p>
          </button>
        ))}
      </div>

      {selectedPreset && (
        <div className="flex gap-6">
          {/* Directions List */}
          <div className="w-72 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-400">{selectedPreset.name}&apos;s Directions</h2>
              <button
                onClick={() => setShowNewDirection(!showNewDirection)}
                className="px-2 py-1 bg-[#D4AF37] text-black rounded text-xs font-medium"
              >
                + New
              </button>
            </div>

            {showNewDirection && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-3 space-y-2">
                <select
                  value={newMoment}
                  onChange={(e) => setNewMoment(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
                >
                  {MOMENT_TYPES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={newTone}
                  onChange={(e) => setNewTone(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
                >
                  {EMOTIONAL_TONES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  onClick={handleCreateDirection}
                  className="w-full px-2 py-1.5 bg-[#D4AF37] text-black rounded text-xs font-medium"
                >
                  Create Direction
                </button>
              </div>
            )}

            <div className="space-y-2">
              {avatarDirections.map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => setCurrentDirection(dir)}
                  className={`w-full text-left bg-gray-900 border rounded-lg p-3 transition-colors ${
                    currentDirection?.id === dir.id ? 'border-[#D4AF37]' : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <span className="text-sm text-white capitalize">{dir.moment_type}</span>
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                    dir.script_status === 'approved' ? 'bg-green-900 text-green-300' :
                    dir.script_status === 'generated' ? 'bg-blue-900 text-blue-300' :
                    'bg-gray-700 text-gray-400'
                  }`}>{dir.script_status}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direction Editor */}
          <div className="flex-1">
            {currentDirection ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Moment Type</label>
                    <p className="text-sm text-white capitalize">{currentDirection.moment_type}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Emotional Tone</label>
                    <p className="text-sm text-white capitalize">{currentDirection.emotional_tone}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Voice Tone</label>
                    <select
                      value={currentDirection.voice_tone}
                      onChange={(e) => {
                        updateDirection(currentDirection.id, { voice_tone: e.target.value as VoiceTone })
                        setCurrentDirection({ ...currentDirection, voice_tone: e.target.value as VoiceTone })
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
                    >
                      {VOICE_TONES.map((v) => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Script</label>
                  <textarea
                    value={currentDirection.script}
                    onChange={(e) => {
                      updateDirection(currentDirection.id, { script: e.target.value })
                      setCurrentDirection({ ...currentDirection, script: e.target.value })
                    }}
                    rows={6}
                    placeholder="Write or generate a script..."
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  {currentDirection.script_status === 'draft' && (
                    <button
                      onClick={handleGenerateScript}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium"
                    >
                      Generate Script (AI)
                    </button>
                  )}
                  {currentDirection.script_status === 'generated' && (
                    <button
                      onClick={() => {
                        updateDirection(currentDirection.id, { script_status: 'approved' })
                        setCurrentDirection({ ...currentDirection, script_status: 'approved' })
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
                    >
                      Approve Script
                    </button>
                  )}
                  <p className="text-xs text-gray-600 self-center">AI script generation connects when service is available</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-600 text-sm">
                Select a direction or create a new one
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
