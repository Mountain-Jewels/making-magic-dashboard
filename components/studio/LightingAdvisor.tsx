/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Sun, Sparkles, Lightbulb, ChevronDown, ChevronRight, Zap } from 'lucide-react'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { useAssetRegistryStore } from '@/lib/stores/asset-registry-store'
import { sendCommand } from '@/lib/api/scene-control'
import { computeLightingRecommendation } from '@/lib/services/avatar-lighting-advisor'
import type { LightingRecommendation } from '@/lib/services/avatar-lighting-advisor'

export function LightingAdvisor() {
  const { scene, avatar, lighting, jewelry, wardrobe, setLighting } = useSceneStateStore()
  const { metahumans } = useAssetRegistryStore()
  const [applying, setApplying] = useState(false)
  const [showAlternatives, setShowAlternatives] = useState(false)

  const currentAvatar = useMemo(
    () => metahumans.find((m) => m.name === avatar) ?? null,
    [metahumans, avatar]
  )

  const recommendation = useMemo<LightingRecommendation>(
    () =>
      computeLightingRecommendation(currentAvatar, {
        environment: scene,
        jewelry,
        wardrobe,
      }),
    [currentAvatar, scene, jewelry, wardrobe]
  )

  const isActive = lighting === recommendation.preset

  async function applyRecommendation(preset: string) {
    setApplying(true)
    try {
      await sendCommand('set_lighting', { preset })
      setLighting(preset)
      toast.success(`Lighting set to ${preset.replace(/_/g, ' ')}`)
    } catch {
      toast.error('Failed to apply lighting')
    } finally {
      setApplying(false)
    }
  }

  const confidenceColor =
    recommendation.confidence >= 0.8
      ? 'text-success'
      : recommendation.confidence >= 0.6
        ? 'text-gold'
        : 'text-white/40'

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-gold" />
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">
          Lighting Advisor
        </h3>
        {avatar && (
          <span className="text-[9px] text-white/30 ml-auto">
            for {avatar}
          </span>
        )}
      </div>

      {!avatar && !scene ? (
        <p className="text-[11px] text-white/20">
          Load a scene or select an avatar for lighting recommendations
        </p>
      ) : (
        <>
          {/* Primary recommendation */}
          <div
            className={`p-3 rounded-lg border transition-colors ${
              isActive
                ? 'border-success/30 bg-success/5'
                : 'border-gold/20 bg-gold/5'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="text-[12px] font-semibold text-white/80">
                  {recommendation.preset_label}
                </span>
                {isActive && (
                  <span className="text-[8px] bg-success/20 text-success px-1.5 py-0.5 rounded">
                    Active
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-mono ${confidenceColor}`}>
                {Math.round(recommendation.confidence * 100)}%
              </span>
            </div>

            {/* Technical specs */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/35">Color Temp</span>
                <span className="text-white/60 font-mono">{recommendation.color_temp}K</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/35">Key:Fill</span>
                <span className="text-white/60 font-mono">{recommendation.key_fill_ratio}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/35">Rim</span>
                <span className="text-white/60 font-mono">{recommendation.rim_intensity.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/35">Specular</span>
                <span className="text-white/60 font-mono">{recommendation.jewelry_specular_boost.toFixed(1)}x</span>
              </div>
            </div>

            {/* Rationale */}
            <p className="text-[10px] text-white/30 leading-relaxed">
              {recommendation.rationale}
            </p>

            {/* Apply button */}
            {!isActive && (
              <button
                onClick={() => applyRecommendation(recommendation.preset)}
                disabled={applying}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-gold text-black text-[11px] font-semibold rounded hover:bg-gold-hover disabled:opacity-40 transition-colors"
              >
                <Zap className="h-3 w-3" />
                {applying ? 'Applying...' : 'Apply Recommendation'}
              </button>
            )}
          </div>

          {/* Alternatives */}
          {recommendation.alternatives.length > 0 && (
            <div>
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="flex items-center gap-1 text-[10px] font-semibold text-white/40 uppercase tracking-wide py-1 hover:text-white/60"
              >
                {showAlternatives ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Alternatives ({recommendation.alternatives.length})
              </button>
              {showAlternatives && (
                <div className="space-y-1.5">
                  {recommendation.alternatives.map((alt) => (
                    <div
                      key={alt.preset}
                      className="flex items-center justify-between p-2 rounded border border-surface-border bg-surface hover:border-white/20 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white/60">
                          {alt.preset.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[9px] text-white/25">{alt.reason}</p>
                      </div>
                      <button
                        onClick={() => applyRecommendation(alt.preset)}
                        disabled={applying || lighting === alt.preset}
                        className="px-2 py-1 bg-white/5 text-white/40 text-[10px] rounded hover:bg-white/10 hover:text-white/60 disabled:opacity-30 shrink-0 ml-2"
                      >
                        {lighting === alt.preset ? 'Active' : 'Apply'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
