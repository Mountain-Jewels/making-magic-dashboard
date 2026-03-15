/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Mountain,
  Sun,
  Camera,
  Sparkles,
  Play,
  Globe,
} from 'lucide-react'
import { loadScene, sendCommand } from '@/lib/api/scene-control'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { LightingAdvisor } from '@/components/studio/LightingAdvisor'
import { getCurrentLighting } from '@/lib/api/lighting'
import type { LightingState } from '@/lib/types/lighting-engine'

interface Environment {
  id: string
  label: string
  desc: string
  gradient: string
  preview_url?: string
}

const ENVIRONMENTS: Environment[] = [
  { id: 'landing', label: 'Landing Mountain', desc: 'Hero mountain landscape with golden hour lighting', gradient: 'from-amber-900/40 via-stone-800/30 to-sky-900/40' },
  { id: 'cave', label: "Merlin's Cave", desc: 'Intimate crystal cave with warm torch lighting', gradient: 'from-purple-900/40 via-indigo-900/30 to-amber-900/30' },
  { id: 'studio', label: 'Photo Studio', desc: 'Clean studio backdrop for product photography', gradient: 'from-neutral-700/40 via-neutral-600/30 to-neutral-500/20' },
  { id: 'yacht', label: 'Luxury Yacht', desc: 'Deck scene with ocean horizon and soft sunset', gradient: 'from-blue-900/40 via-cyan-800/30 to-orange-800/30' },
  { id: 'garden', label: 'Secret Garden', desc: 'Lush greenery with natural dappled light', gradient: 'from-emerald-900/40 via-green-800/30 to-lime-900/30' },
]

const LIGHTING_PRESETS = [
  { id: 'warm_intimate', label: 'Warm Intimate', desc: '3200K, soft, low ratio', tip: 'Best for couple scenes and emotional moments' },
  { id: 'dramatic_high_contrast', label: 'Dramatic', desc: 'Hard key, 8:1 ratio', tip: 'Best for single product hero shots' },
  { id: 'soft_beauty', label: 'Soft Beauty', desc: '4500K, diffused, 2:1', tip: 'Best for avatar portraits and jewelry on skin' },
  { id: 'jewelry_showcase', label: 'Jewelry Showcase', desc: 'Point lights, IOR 2.42', tip: 'Diamonds need small intense lights for fire and brilliance' },
  { id: 'golden_hour', label: 'Golden Hour', desc: '2800K, directional', tip: 'Natural warm light for outdoor scenes' },
]

const CAMERA_PRESETS = [
  { id: 'slow_push_in', label: 'Slow Push In', desc: '50mm, subtle forward dolly' },
  { id: 'orbit_product', label: 'Orbit Product', desc: '85mm, 360° product orbit' },
  { id: 'dramatic_reveal', label: 'Dramatic Reveal', desc: '35mm, crane + push' },
  { id: 'static_closeup', label: 'Static Close-Up', desc: '85mm, f/2.0, shallow DOF' },
  { id: 'establishing_wide', label: 'Establishing Wide', desc: '24mm, full scene' },
  { id: 'crane_down', label: 'Crane Down', desc: '50mm, overhead descend' },
]

const ENV_TO_VM_ROLE: Record<string, string> = {
  landing: 'landing',
  cave: 'cave',
  studio: 'avatar',
  yacht: 'landing',
  garden: 'landing',
}

export function SceneBuilder() {
  const sceneStore = useSceneStateStore()
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null)
  const [selectedLighting, setSelectedLighting] = useState<string | null>(null)
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sceneLighting, setSceneLighting] = useState<LightingState | null>(null)

  useEffect(() => {
    if (!selectedEnv) { setSceneLighting(null); return }
    const vmRole = ENV_TO_VM_ROLE[selectedEnv] || 'landing'
    getCurrentLighting(vmRole)
      .then(setSceneLighting)
      .catch(() => setSceneLighting(null))
  }, [selectedEnv])

  const handleLoadScene = useCallback(async () => {
    if (!selectedEnv) return
    setBusy(true)
    try {
      await loadScene(selectedEnv)
      sceneStore.setScene(selectedEnv)
      toast.success(`Scene "${selectedEnv}" loaded`)
    } catch { toast.error('Failed to load scene') }
    finally { setBusy(false) }
  }, [selectedEnv, sceneStore])

  const handleApplyLighting = useCallback(async () => {
    if (!selectedLighting) return
    setBusy(true)
    try {
      await sendCommand('set_lighting', { preset: selectedLighting })
      sceneStore.setLighting(selectedLighting)
      toast.success(`Lighting "${selectedLighting}" applied`)
    } catch { toast.error('Failed to apply lighting') }
    finally { setBusy(false) }
  }, [selectedLighting, sceneStore])

  const handleApplyCamera = useCallback(async () => {
    if (!selectedCamera) return
    setBusy(true)
    try {
      await sendCommand('set_camera', { preset: selectedCamera })
      sceneStore.setCamera(selectedCamera)
      toast.success(`Camera "${selectedCamera}" applied`)
    } catch { toast.error('Failed to apply camera') }
    finally { setBusy(false) }
  }, [selectedCamera, sceneStore])

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">Scene Builder</h2>
        <p className="text-[11px] text-white/30">AI-powered environment, lighting, and camera composition</p>
      </div>

      {/* Environments */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Mountain className="h-4 w-4 text-gold" />
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Environment</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ENVIRONMENTS.map((env) => (
            <button
              key={env.id}
              onClick={() => setSelectedEnv(env.id)}
              className={`flex flex-col items-start p-3 rounded-lg border transition-colors text-left ${
                selectedEnv === env.id
                  ? 'border-gold bg-gold/5'
                  : 'border-surface-border hover:border-white/20 bg-surface-panel'
              }`}
            >
              <div className={`h-16 w-full rounded mb-2 flex items-center justify-center bg-gradient-to-br ${env.gradient} overflow-hidden`}>
                {env.preview_url ? (
                  <img src={env.preview_url} alt={env.label} className="h-full w-full object-cover" />
                ) : (
                  <Mountain className="h-6 w-6 text-white/20" />
                )}
              </div>
              <p className="text-[11px] font-medium text-white/70">{env.label}</p>
              <p className="text-[9px] text-white/25 mt-0.5">{env.desc}</p>
            </button>
          ))}
        </div>
        {selectedEnv && (
          <button
            onClick={handleLoadScene}
            disabled={busy}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-gold text-black text-[11px] font-semibold rounded hover:bg-gold-hover disabled:opacity-40"
          >
            <Play className="h-3 w-3" />
            Load Scene
          </button>
        )}
      </section>

      {/* Scene Lighting Intelligence */}
      {sceneLighting && selectedEnv && (
        <section className="p-3 rounded-lg border border-surface-border bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-3.5 w-3.5 text-gold/60" />
            <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">
              Scene Lighting — {selectedEnv}
            </span>
            <span className="text-[9px] text-white/25 ml-auto">
              {sceneLighting.is_golden_hour ? 'Golden Hour' : sceneLighting.is_night ? 'Night' : 'Daylight'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <p className="text-[9px] text-white/30">Sun</p>
              <p className="text-[10px] text-white/60 font-mono">
                {sceneLighting.sun.elevation.toFixed(0)}° {sceneLighting.sun.intensity.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-white/30">Color</p>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full border border-white/10" style={{ backgroundColor: sceneLighting.sun.color }} />
                <p className="text-[10px] text-white/60 font-mono">
                  {sceneLighting.sun.color_temperature_k ? `${sceneLighting.sun.color_temperature_k}K` : sceneLighting.sun.color}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[9px] text-white/30">Fog</p>
              <p className="text-[10px] text-white/60 font-mono">{sceneLighting.fog.density.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/30">Ambient</p>
              <p className="text-[10px] text-white/60 font-mono">{sceneLighting.ambient.intensity.toFixed(3)}</p>
            </div>
          </div>
          {sceneLighting.cave && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sceneLighting.cave.torch_color }} />
                <span className="text-[9px] text-white/30">Torch</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sceneLighting.cave.crystal_color }} />
                <span className="text-[9px] text-white/30">Crystal</span>
              </div>
              <span className="text-[9px] text-white/20">Bleed: {sceneLighting.cave.entrance_light_bleed.toFixed(3)}</span>
            </div>
          )}
        </section>
      )}

      {/* Lighting */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sun className="h-4 w-4 text-gold" />
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Lighting</h3>
          <span className="text-[9px] text-gold/50 ml-auto">AI-recommended presets</span>
        </div>
        <div className="space-y-1.5">
          {LIGHTING_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedLighting(preset.id)}
              className={`flex items-start gap-3 w-full p-2.5 rounded-lg border text-left transition-colors ${
                selectedLighting === preset.id
                  ? 'border-gold bg-gold/5'
                  : 'border-surface-border hover:border-white/20 bg-surface-panel'
              }`}
            >
              <Sun className="h-4 w-4 text-white/20 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white/70">{preset.label}</p>
                <p className="text-[9px] text-white/30">{preset.desc}</p>
                <p className="text-[9px] text-gold/40 mt-0.5 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  {preset.tip}
                </p>
              </div>
            </button>
          ))}
        </div>
        {selectedLighting && (
          <button
            onClick={handleApplyLighting}
            disabled={busy}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-gold text-black text-[11px] font-semibold rounded hover:bg-gold-hover disabled:opacity-40"
          >
            <Sun className="h-3 w-3" />
            Apply Lighting
          </button>
        )}
      </section>

      {/* AI Lighting Advisor */}
      <section className="bg-surface-panel rounded-lg border border-gold/10">
        <LightingAdvisor />
      </section>

      {/* Camera */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-4 w-4 text-gold" />
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Camera</h3>
          <span className="text-[9px] text-gold/50 ml-auto">Cinematography presets</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedCamera(preset.id)}
              className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-colors ${
                selectedCamera === preset.id
                  ? 'border-gold bg-gold/5'
                  : 'border-surface-border hover:border-white/20 bg-surface-panel'
              }`}
            >
              <p className="text-[11px] font-medium text-white/70">{preset.label}</p>
              <p className="text-[9px] text-white/30">{preset.desc}</p>
            </button>
          ))}
        </div>
        {selectedCamera && (
          <button
            onClick={handleApplyCamera}
            disabled={busy}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-gold text-black text-[11px] font-semibold rounded hover:bg-gold-hover disabled:opacity-40"
          >
            <Camera className="h-3 w-3" />
            Apply Camera
          </button>
        )}
      </section>
    </div>
  )
}
