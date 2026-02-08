'use client'

import { useState } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import type { SceneConfig, BackgroundPreset, CameraAngle, LightingMood, JewelryPosition } from '@/lib/types/scene'

const BACKGROUNDS: { value: BackgroundPreset; label: string }[] = [
  { value: 'jewelry_studio', label: 'Jewelry Studio' },
  { value: 'luxury_showroom', label: 'Luxury Showroom' },
  { value: 'garden_terrace', label: 'Garden Terrace' },
  { value: 'marble_gallery', label: 'Marble Gallery' },
  { value: 'velvet_backdrop', label: 'Velvet Backdrop' },
  { value: 'sunset_balcony', label: 'Sunset Balcony' },
  { value: 'winter_lodge', label: 'Winter Lodge' },
  { value: 'beach_pavilion', label: 'Beach Pavilion' },
]

const CAMERAS: { value: CameraAngle; label: string }[] = [
  { value: 'close_up', label: 'Close-Up' },
  { value: 'medium_shot', label: 'Medium Shot' },
  { value: 'wide_shot', label: 'Wide Shot' },
  { value: 'overhead', label: 'Overhead' },
  { value: 'rotating_360', label: '360° Rotating' },
]

const LIGHTING: { value: LightingMood; label: string }[] = [
  { value: 'warm_golden', label: 'Warm Golden' },
  { value: 'cool_silver', label: 'Cool Silver' },
  { value: 'dramatic_shadow', label: 'Dramatic Shadow' },
  { value: 'soft_diffused', label: 'Soft Diffused' },
  { value: 'sunset_glow', label: 'Sunset Glow' },
  { value: 'studio_bright', label: 'Studio Bright' },
]

const POSITIONS: { value: JewelryPosition; label: string }[] = [
  { value: 'center_pedestal', label: 'Center Pedestal' },
  { value: 'hand_model', label: 'Hand Model' },
  { value: 'neck_model', label: 'Neck Model' },
  { value: 'flat_lay', label: 'Flat Lay' },
  { value: 'gift_box', label: 'Gift Box' },
]

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-700 text-gray-300',
  ready: 'bg-blue-900 text-blue-300',
  rendering: 'bg-yellow-900 text-yellow-300',
  complete: 'bg-green-900 text-green-300',
}

export default function ScenesPage() {
  const { scenes, currentScene, setCurrentScene, addScene, updateScene } = useSceneStore()
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBg, setNewBg] = useState<BackgroundPreset>('jewelry_studio')
  const [newCam, setNewCam] = useState<CameraAngle>('close_up')
  const [newLight, setNewLight] = useState<LightingMood>('warm_golden')
  const [newPos, setNewPos] = useState<JewelryPosition>('center_pedestal')
  const [newDuration, setNewDuration] = useState(15)

  const handleCreate = () => {
    const scene: SceneConfig = {
      id: `scene-${Date.now()}`,
      name: newName || 'Untitled Scene',
      background: newBg,
      camera: newCam,
      lighting: newLight,
      jewelry_position: newPos,
      duration_seconds: newDuration,
      created_at: new Date().toISOString(),
      status: 'draft',
    }
    addScene(scene)
    setShowNew(false)
    setNewName('')
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Scene List */}
      <div className="w-80 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Scene Builder</h1>
          <button
            onClick={() => setShowNew(!showNew)}
            className="px-3 py-1 bg-[#D4AF37] text-black rounded text-sm font-medium hover:bg-[#C4A030]"
          >
            + New
          </button>
        </div>

        {showNew && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4 space-y-3">
            <input
              type="text"
              placeholder="Scene name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
            />
            <button
              onClick={handleCreate}
              className="w-full px-3 py-2 bg-[#D4AF37] text-black rounded text-sm font-medium"
            >
              Create Scene
            </button>
          </div>
        )}

        <div className="space-y-2">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => setCurrentScene(scene)}
              className={`w-full text-left bg-gray-900 border rounded-lg p-3 transition-colors ${
                currentScene?.id === scene.id
                  ? 'border-[#D4AF37]'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{scene.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[scene.status]}`}>
                  {scene.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {scene.background.replace(/_/g, ' ')} · {scene.camera.replace(/_/g, ' ')} · {scene.duration_seconds}s
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Scene Editor */}
      <div className="flex-1">
        {currentScene ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{currentScene.name}</h2>
              <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[currentScene.status]}`}>
                {currentScene.status}
              </span>
            </div>

            {/* Preview Placeholder */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Scene Preview</p>
                <p className="text-gray-600 text-xs mt-1">Connects to Unreal Engine in Phase 8</p>
              </div>
            </div>

            {/* Controls Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Background</label>
                <select
                  value={currentScene.background}
                  onChange={(e) => updateScene(currentScene.id, { background: e.target.value as BackgroundPreset })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                >
                  {BACKGROUNDS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Camera Angle</label>
                <select
                  value={currentScene.camera}
                  onChange={(e) => updateScene(currentScene.id, { camera: e.target.value as CameraAngle })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                >
                  {CAMERAS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Lighting</label>
                <select
                  value={currentScene.lighting}
                  onChange={(e) => updateScene(currentScene.id, { lighting: e.target.value as LightingMood })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                >
                  {LIGHTING.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Jewelry Position</label>
                <select
                  value={currentScene.jewelry_position}
                  onChange={(e) => updateScene(currentScene.id, { jewelry_position: e.target.value as JewelryPosition })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Jewelry SKU (optional)</label>
                <input
                  type="text"
                  value={currentScene.jewelry_sku || ''}
                  onChange={(e) => updateScene(currentScene.id, { jewelry_sku: e.target.value })}
                  placeholder="MJ-RING-001"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  value={currentScene.duration_seconds}
                  onChange={(e) => updateScene(currentScene.id, { duration_seconds: parseInt(e.target.value) || 10 })}
                  min={5}
                  max={60}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {currentScene.status === 'draft' && (
                <button
                  onClick={() => updateScene(currentScene.id, { status: 'ready' })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
                >
                  Mark Ready
                </button>
              )}
              {currentScene.status === 'ready' && (
                <button
                  onClick={() => updateScene(currentScene.id, { status: 'rendering' })}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded text-sm font-medium"
                >
                  Send to Render
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-600">
            Select a scene or create a new one
          </div>
        )}
      </div>
    </div>
  )
}
