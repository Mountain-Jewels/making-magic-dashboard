'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { computeLighting, generateDailyProfiles, getOverrides } from '@/lib/api/lighting'
import type { LightingOverride, LightingState, SkyGradientStop } from '@/lib/types/lighting'

const ROLES = ['landing', 'cave', 'avatar'] as const

export function LightingPreviewSection() {
  const [selectedRole, setSelectedRole] = useState<string>('landing')
  const [state, setState] = useState<LightingState | null>(null)
  const [overrides, setOverrides] = useState<LightingOverride[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const loadLighting = useCallback(async () => {
    setLoading(true)
    try {
      const [lightingData, overrideData] = await Promise.all([
        computeLighting(selectedRole),
        getOverrides(selectedRole),
      ])
      setState(lightingData)
      setOverrides(overrideData)
    } catch {
      // Backend may not be connected
    } finally {
      setLoading(false)
    }
  }, [selectedRole])

  useEffect(() => {
    void loadLighting()
  }, [loadLighting])

  useEffect(() => {
    const interval = setInterval(loadLighting, 60_000)
    return () => clearInterval(interval)
  }, [loadLighting])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateDailyProfiles(selectedRole)
      toast.success(`Profiles generated for ${selectedRole}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate')
    } finally {
      setGenerating(false)
    }
  }

  const gradientCSS = (stops: SkyGradientStop[]) => {
    const parts = stops.map((s) => `${s.color} ${s.position * 100}%`)
    return `linear-gradient(to bottom, ${parts.join(', ')})`
  }

  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Dynamic Lighting Engine</h3>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${
                  selectedRole === role
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                    : 'bg-[#1a1a24] text-white/60 hover:text-white/80'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="px-3 py-1.5 rounded text-xs bg-[#D4AF37] text-black font-medium hover:bg-[#c4a030] disabled:opacity-50 transition-colors"
          >
            {generating ? 'Generating…' : 'Generate Profiles'}
          </button>
        </div>
      </div>

      {loading && !state ? (
        <div className="text-sm text-white/50 py-8 text-center">Loading lighting state…</div>
      ) : state ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div
              className="rounded-lg h-40 relative overflow-hidden"
              style={{
                background: state.sky?.gradient
                  ? gradientCSS(state.sky.gradient)
                  : state.ambient.color,
              }}
            >
              {state.is_night && state.stars_visible && (
                <div className="absolute inset-0 opacity-60">
                  {Array.from({ length: 30 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-white"
                      style={{
                        left: `${(i * 37) % 100}%`,
                        top: `${(i * 23) % 60}%`,
                        opacity: 0.3 + Math.random() * 0.7,
                      }}
                    />
                  ))}
                </div>
              )}

              {!state.is_night && (
                <div
                  className="absolute w-12 h-12 rounded-full blur-sm"
                  style={{
                    backgroundColor: state.sun.color,
                    left: `${((state.sun.azimuth % 360) / 360) * 100}%`,
                    bottom: `${Math.max(5, Math.min(80, state.sun.elevation + 10))}%`,
                    opacity: state.sun.intensity,
                    boxShadow: `0 0 30px ${state.sun.color}`,
                  }}
                />
              )}

              {state.fog.density > 0.1 && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1/3"
                  style={{
                    background: `linear-gradient(to top, ${state.fog.color}${Math.round(state.fog.density * 200).toString(16).padStart(2, '0')}, transparent)`,
                  }}
                />
              )}

              <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                <div className="text-xs text-white/80 font-mono">
                  {state.time ? new Date(state.time).toLocaleTimeString() : '—'}
                </div>
                <div className="flex gap-2">
                  {state.is_golden_hour && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300">Golden Hour</span>
                  )}
                  {state.is_night && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300">Night</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#1a1a24] rounded p-2.5">
                <div className="text-[10px] text-white/50">Sun Elevation</div>
                <div className="text-sm text-white font-mono">{state.sun.elevation.toFixed(1)}°</div>
              </div>
              <div className="bg-[#1a1a24] rounded p-2.5">
                <div className="text-[10px] text-white/50">Sun Azimuth</div>
                <div className="text-sm text-white font-mono">{state.sun.azimuth.toFixed(1)}°</div>
              </div>
              <div className="bg-[#1a1a24] rounded p-2.5">
                <div className="text-[10px] text-white/50">Intensity</div>
                <div className="text-sm text-white font-mono">{(state.sun.intensity * 100).toFixed(0)}%</div>
              </div>
              <div className="bg-[#1a1a24] rounded p-2.5">
                <div className="text-[10px] text-white/50">Color Temp</div>
                <div className="text-sm text-white font-mono">{state.sun.color_temperature_k ?? '—'}K</div>
              </div>
              <div className="bg-[#1a1a24] rounded p-2.5">
                <div className="text-[10px] text-white/50">Fog Density</div>
                <div className="text-sm text-white font-mono">{(state.fog.density * 100).toFixed(0)}%</div>
              </div>
              <div className="bg-[#1a1a24] rounded p-2.5">
                <div className="text-[10px] text-white/50">Ambient</div>
                <div className="text-sm text-white font-mono">{(state.ambient.intensity * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {state.cave && selectedRole === 'cave' && (
              <div className="bg-[#1a1a24] rounded p-3">
                <div className="text-xs text-white/60 mb-2">Cave Interior Lighting</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/50">Ambient:</span>{' '}
                    <span className="text-white">{(state.cave.interior_ambient * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-white/50">Entrance Bleed:</span>{' '}
                    <span className="text-white">{(state.cave.entrance_light_bleed * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/50">Torch:</span>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: state.cave.torch_color }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/50">Crystal:</span>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: state.cave.crystal_color }} />
                  </div>
                </div>
              </div>
            )}

            {state.metahuman && selectedRole === 'avatar' && (
              <div className="bg-[#1a1a24] rounded p-3">
                <div className="text-xs text-white/60 mb-2">MetaHuman Lighting</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/50">Rim:</span>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: state.metahuman.rim_light_color }} />
                    <span className="text-white">{(state.metahuman.rim_intensity * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-white/50">Key:Fill:</span>{' '}
                    <span className="text-white">{state.metahuman.key_fill_ratio.toFixed(1)}:1</span>
                  </div>
                  <div>
                    <span className="text-white/50">Shadow:</span>{' '}
                    <span className="text-white">{(state.metahuman.shadow_softness * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-white/50">Specular:</span>{' '}
                    <span className="text-white">{state.metahuman.jewelry_specular_boost}x</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#1a1a24] rounded p-3">
              <div className="text-xs text-white/60 mb-2">Active Overrides</div>
              {overrides.length === 0 ? (
                <div className="text-xs text-white/40">No active overrides</div>
              ) : (
                <div className="space-y-1.5">
                  {overrides.map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-xs">
                      <span className="text-white/80">
                        {o.start_time} — {o.end_time}
                      </span>
                      <span className="text-white/50 capitalize">{o.override_type}</span>
                      {o.reason && <span className="text-white/40">{o.reason}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#1a1a24] rounded p-3">
              <div className="text-xs text-white/60 mb-2">Location</div>
              <div className="text-xs text-white/80 font-mono">
                {state.sun.azimuth ? `${(state as unknown as Record<string, Record<string, number>>).location?.lat?.toFixed(2) ?? '46.50'}°N, ${(state as unknown as Record<string, Record<string, number>>).location?.lon?.toFixed(2) ?? '7.90'}°E` : 'Swiss Alps (default)'}
              </div>
              <div className="text-xs text-white/50 mt-0.5">
                Altitude: {(state as unknown as Record<string, Record<string, number>>).location?.altitude_m ?? 3000}m
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-white/50 py-8 text-center">
          Unable to compute lighting state. Connect to studio-engine to see live preview.
        </div>
      )}
    </div>
  )
}
