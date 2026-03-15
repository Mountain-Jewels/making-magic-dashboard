/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Lighting engine API adapter.
 * Connects to studio-engine lighting endpoints.
 *
 * Default location: New York City (EST/EDT) — can be overridden
 * with customer geolocation for personalized time-of-day lighting.
 */

import { apiGet, apiPost } from './client'
import type {
  LightingState,
  LightingProfileRecord,
  LightingOverrideRecord,
  LightingEngagementRecord,
} from '@/lib/types/lighting-engine'

export const DEFAULT_LOCATION = {
  lat: 40.7128,
  lon: -74.006,
  altitude_m: 10,
  name: 'New York City (EST)',
} as const

export interface LightingLocationParams {
  lat?: number
  lon?: number
  altitude_m?: number
}

function locationQuery(loc?: LightingLocationParams): string {
  if (!loc) return `&lat=${DEFAULT_LOCATION.lat}&lon=${DEFAULT_LOCATION.lon}&altitude_m=${DEFAULT_LOCATION.altitude_m}`
  const lat = loc.lat ?? DEFAULT_LOCATION.lat
  const lon = loc.lon ?? DEFAULT_LOCATION.lon
  const alt = loc.altitude_m ?? DEFAULT_LOCATION.altitude_m
  return `&lat=${lat}&lon=${lon}&altitude_m=${alt}`
}

export async function getCurrentLighting(
  vmRole: string,
  location?: LightingLocationParams
): Promise<LightingState | null> {
  try {
    return await apiGet<LightingState>(
      `/v1/lighting/current?vm_role=${encodeURIComponent(vmRole)}${locationQuery(location)}`
    )
  } catch { return null }
}

export async function getLightingAtTime(
  vmRole: string,
  isoTime: string,
  location?: LightingLocationParams
): Promise<LightingState | null> {
  try {
    return await apiGet<LightingState>(
      `/v1/lighting/at-time?vm_role=${encodeURIComponent(vmRole)}&time=${encodeURIComponent(isoTime)}${locationQuery(location)}`
    )
  } catch { return null }
}

export async function generateDailyProfiles(vmRole: string): Promise<LightingProfileRecord[]> {
  try { return await apiPost<LightingProfileRecord[]>('/v1/lighting/generate-daily', { vm_role: vmRole }) }
  catch { return [] }
}

export async function getDailyProfiles(vmRole: string): Promise<LightingProfileRecord[]> {
  try { return await apiGet<LightingProfileRecord[]>(`/v1/lighting/profiles?vm_role=${encodeURIComponent(vmRole)}`) }
  catch { return [] }
}

export async function getEngagementLog(
  vmRole: string,
  limit = 50
): Promise<LightingEngagementRecord[]> {
  try {
    return await apiGet<LightingEngagementRecord[]>(
      `/v1/lighting/engagement?vm_role=${encodeURIComponent(vmRole)}&limit=${limit}`
    )
  } catch { return [] }
}

export async function getOverrides(vmRole: string): Promise<LightingOverrideRecord[]> {
  try {
    return await apiGet<LightingOverrideRecord[]>(
      `/v1/lighting/overrides?vm_role=${encodeURIComponent(vmRole)}`
    )
  } catch { return [] }
}

export async function createOverride(
  vmRole: string,
  overrideType: 'event' | 'manual' | 'ai',
  startTime: string,
  endTime: string,
  reason?: string,
  parameters?: Record<string, unknown>
): Promise<LightingOverrideRecord | null> {
  try {
    return await apiPost<LightingOverrideRecord>('/v1/lighting/overrides', {
      vm_role: vmRole,
      override_type: overrideType,
      start_time: startTime,
      end_time: endTime,
      reason,
      parameters_json: parameters,
    })
  } catch { return null }
}
