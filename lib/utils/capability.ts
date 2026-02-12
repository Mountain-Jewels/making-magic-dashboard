/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Conversion gate and 2D → 3D capability helpers.
 * No scraping, governance, or deploy logic.
 */

import type { AssetVersion } from '@/lib/types/version'

export type CapabilityKey = 'two_d' | 'three_d' | 'interactive'

export type CapabilityState = AssetVersion['capability_state']

export function canUse3D(version: { capability_state: CapabilityState }): boolean {
  return version.capability_state.three_d === 'available'
}

export function canUse2D(version: { capability_state: CapabilityState }): boolean {
  return version.capability_state.two_d === 'available'
}

export function requiresConversion(
  version: { capability_state: CapabilityState },
  capability: CapabilityKey
): boolean {
  return version.capability_state[capability] === 'not_available'
}

export function getCapabilityLabels(state: CapabilityState): string[] {
  const labels: string[] = []
  if (state.two_d === 'available') labels.push('2D')
  if (state.three_d === 'available') labels.push('3D')
  if (state.interactive === 'available') labels.push('Interactive')
  return labels
}

/** Whether this capability key implies 3D (e.g. rotating_360, 3D scene). */
export function is3DRequiredContext(context: { camera?: string; mode?: string }): boolean {
  const threeDCameras = ['rotating_360', 'overhead']
  if (context.camera && threeDCameras.includes(context.camera)) return true
  if (context.mode === 'three_d') return true
  return false
}
