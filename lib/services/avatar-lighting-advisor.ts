/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Per-avatar lighting intelligence.
 *
 * Each MetaHuman carries material properties (skin tone, reflectance) and
 * may be wearing jewelry with known optical characteristics (diamond IOR 2.42,
 * gold roughness 0.25, etc.).  The lighting advisor merges all of this to
 * produce a context-aware recommendation for the current scene.
 *
 * The advisor can be called from the dashboard (client-side) for immediate
 * feedback, or proxied through the Director on the backend for deeper
 * AI reasoning.
 */

import type { MetaHuman, AvatarLightingProfile } from '@/lib/api/metahumans'

export interface LightingRecommendation {
  preset: string
  preset_label: string
  color_temp: number
  key_fill_ratio: string
  rim_intensity: number
  jewelry_specular_boost: number
  rationale: string
  confidence: number
  alternatives: { preset: string; reason: string }[]
}

interface SceneContext {
  environment: string | null
  jewelry: string[]
  wardrobe: string[]
}

const SKIN_TONE_PROFILES: Record<string, { base_temp: number; key_ratio: string; rim: number }> = {
  fair: { base_temp: 4200, key_ratio: '3:1', rim: 0.6 },
  light: { base_temp: 4000, key_ratio: '3:1', rim: 0.7 },
  medium: { base_temp: 3800, key_ratio: '2.5:1', rim: 0.8 },
  olive: { base_temp: 3600, key_ratio: '2:1', rim: 0.85 },
  brown: { base_temp: 3400, key_ratio: '2:1', rim: 1.0 },
  dark: { base_temp: 3200, key_ratio: '1.5:1', rim: 1.2 },
}

const ENV_ADJUSTMENTS: Record<string, { temp_offset: number; preset_bias: string }> = {
  landing: { temp_offset: -200, preset_bias: 'golden_hour' },
  cave: { temp_offset: +300, preset_bias: 'warm_intimate' },
  studio: { temp_offset: 0, preset_bias: 'soft_beauty' },
  yacht: { temp_offset: -100, preset_bias: 'golden_hour' },
  garden: { temp_offset: -150, preset_bias: 'soft_beauty' },
}

const PRESET_LABELS: Record<string, string> = {
  warm_intimate: 'Warm Intimate',
  dramatic_high_contrast: 'Dramatic High Contrast',
  soft_beauty: 'Soft Beauty',
  jewelry_showcase: 'Jewelry Showcase',
  golden_hour: 'Golden Hour',
}

export function computeLightingRecommendation(
  avatar: MetaHuman | null,
  context: SceneContext
): LightingRecommendation {
  const profile = avatar?.lighting_profile
  const skinTone = profile?.skin_tone || 'medium'
  const skinConfig = SKIN_TONE_PROFILES[skinTone] || SKIN_TONE_PROFILES.medium

  const envAdj = context.environment
    ? ENV_ADJUSTMENTS[context.environment] || { temp_offset: 0, preset_bias: 'soft_beauty' }
    : { temp_offset: 0, preset_bias: 'soft_beauty' }

  const hasJewelry = context.jewelry.length > 0
  const jewelryBoost = hasJewelry ? (profile?.jewelry_specular_boost ?? 1.5) : 1.0

  let bestPreset = envAdj.preset_bias

  if (hasJewelry && context.wardrobe.length === 0) {
    bestPreset = 'jewelry_showcase'
  } else if (skinTone === 'dark' || skinTone === 'brown') {
    bestPreset = hasJewelry ? 'warm_intimate' : 'soft_beauty'
  } else if (skinTone === 'fair' || skinTone === 'light') {
    bestPreset = hasJewelry ? 'soft_beauty' : envAdj.preset_bias
  }

  if (profile?.preferred_presets?.length) {
    bestPreset = profile.preferred_presets[0]
  }

  const colorTemp = (profile?.recommended_color_temp ?? skinConfig.base_temp) + envAdj.temp_offset
  const keyRatio = profile?.recommended_key_ratio ?? skinConfig.key_ratio
  const rimIntensity = profile?.rim_light_intensity ?? skinConfig.rim

  const rationale = buildRationale(skinTone, hasJewelry, context.environment, bestPreset)

  const alternatives = buildAlternatives(bestPreset, hasJewelry, skinTone)

  const confidence = profile ? 0.85 : 0.6

  return {
    preset: bestPreset,
    preset_label: PRESET_LABELS[bestPreset] || bestPreset,
    color_temp: colorTemp,
    key_fill_ratio: keyRatio,
    rim_intensity: rimIntensity,
    jewelry_specular_boost: jewelryBoost,
    rationale,
    confidence,
    alternatives,
  }
}

function buildRationale(
  skinTone: string,
  hasJewelry: boolean,
  env: string | null,
  preset: string
): string {
  const parts: string[] = []

  parts.push(`${skinTone} skin tone benefits from ${PRESET_LABELS[preset] || preset} lighting`)

  if (hasJewelry) {
    parts.push('jewelry requires controlled specular highlights for fire and brilliance')
  }

  if (env) {
    const envLabel = env.charAt(0).toUpperCase() + env.slice(1)
    parts.push(`${envLabel} environment provides natural base illumination`)
  }

  if (skinTone === 'dark' || skinTone === 'brown') {
    parts.push('warmer color temperature prevents ashy skin rendering — rim light boosted for definition')
  }

  if (skinTone === 'fair' || skinTone === 'light') {
    parts.push('softer key-fill ratio avoids blown highlights on lighter skin')
  }

  return parts.join('. ') + '.'
}

function buildAlternatives(
  primary: string,
  hasJewelry: boolean,
  skinTone: string
): { preset: string; reason: string }[] {
  const alts: { preset: string; reason: string }[] = []

  if (primary !== 'soft_beauty') {
    alts.push({ preset: 'soft_beauty', reason: 'Universally flattering for portraits' })
  }
  if (primary !== 'jewelry_showcase' && hasJewelry) {
    alts.push({ preset: 'jewelry_showcase', reason: 'Maximizes diamond fire and metal sheen' })
  }
  if (primary !== 'warm_intimate' && (skinTone === 'dark' || skinTone === 'brown')) {
    alts.push({ preset: 'warm_intimate', reason: 'Best warmth for deeper skin tones' })
  }
  if (primary !== 'golden_hour') {
    alts.push({ preset: 'golden_hour', reason: 'Natural warmth for outdoor or sunset scenes' })
  }

  return alts.slice(0, 3)
}
