'use client'

import * as React from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import type { LightingMood } from '@/lib/types/scene'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PRESETS: { id: LightingMood; label: string; emoji: string }[] = [
  { id: 'warm_golden', label: 'Warm Golden', emoji: '🌅' },
  { id: 'cool_silver', label: 'Cool Studio', emoji: '❄️' },
  { id: 'soft_diffused', label: 'Natural Daylight', emoji: '☀️' },
  { id: 'dramatic_shadow', label: 'Dramatic', emoji: '🎭' },
  { id: 'sunset_glow', label: 'Sunset', emoji: '🌇' },
  { id: 'studio_bright', label: 'Studio Bright', emoji: '💡' },
  { id: 'sunrise', label: 'Sunrise', emoji: '🌄' },
  { id: 'dark_scary', label: 'Dark Scary (Halloween)', emoji: '🎃' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'ballroom', label: 'Ballroom', emoji: '💃' },
  { id: 'moonlight', label: 'Moonlight', emoji: '🌙' },
  { id: 'candlelight', label: 'Candlelight', emoji: '🕯️' },
  { id: 'neon', label: 'Neon', emoji: '💜' },
  { id: 'underwater', label: 'Underwater', emoji: '🌊' },
  { id: 'fireplace', label: 'Fireplace', emoji: '🔥' },
  { id: 'spotlight', label: 'Spotlight', emoji: '🔦' },
]

const DIRECTIONS = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'top', label: 'Top' },
]

export function LightingPanel() {
  const { currentScene, scenes, setCurrentScene, addScene, updateScene } = useSceneStore()
  const [intensity, setIntensity] = React.useState(80)
  const [temperature, setTemperature] = React.useState(50)
  const [direction, setDirection] = React.useState('front')

  const ensureScene = () => {
    if (currentScene) return currentScene.id
    const scene = {
      id: `scene-${Date.now()}`,
      name: 'Untitled Scene',
      background: 'jewelry_studio' as const,
      camera: 'close_up' as const,
      lighting: 'warm_golden' as LightingMood,
      jewelry_position: 'center_pedestal' as const,
      duration_seconds: 15,
      created_at: new Date().toISOString(),
      status: 'draft' as const,
    }
    addScene(scene)
    setCurrentScene(scene)
    return scene.id
  }

  const handlePreset = (lighting: LightingMood) => {
    const id = ensureScene()
    updateScene(id, { lighting })
  }

  const currentLighting = currentScene?.lighting ?? 'warm_golden'

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-600">Presets</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(({ id, label, emoji }) => (
            <Button
              key={id}
              variant={currentLighting === id ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'justify-start text-left',
                currentLighting === id ? 'bg-brand-gold text-black hover:bg-brand-gold/90' : ''
              )}
              onClick={() => handlePreset(id)}
            >
              {emoji} {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-brand-gold/40 bg-gray-50 p-3">
        <p className="text-xs font-medium text-gray-600">Custom</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">Intensity</div>
            <Slider value={[intensity]} onValueChange={(v) => setIntensity(v[0] ?? 80)} min={0} max={100} />
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">Color temp (warm ↔ cool)</div>
            <Slider value={[temperature]} onValueChange={(v) => setTemperature(v[0] ?? 50)} min={0} max={100} />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-2">Direction</div>
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger className="bg-white border-brand-gold/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
