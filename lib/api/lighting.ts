/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiDelete, apiGet, apiPost } from './client'
import type {
  LightingOverride,
  LightingProfile,
  LightingState,
} from '@/lib/types/lighting'

export async function getCurrentLighting(vmRole: string): Promise<LightingState> {
  return apiGet<LightingState>(`/v1/lighting/current/${vmRole}`)
}

export async function computeLighting(vmRole: string): Promise<LightingState> {
  return apiGet<LightingState>(`/v1/lighting/compute/${vmRole}`)
}

export async function generateDailyProfiles(
  vmRole: string,
  lat?: number,
  lon?: number,
  altitudeM?: number
): Promise<LightingProfile[]> {
  return apiPost<LightingProfile[]>('/v1/lighting/profiles/generate', {
    vm_role: vmRole,
    lat,
    lon,
    altitude_m: altitudeM,
  })
}

export async function getProfiles(vmRole: string): Promise<LightingProfile[]> {
  return apiGet<LightingProfile[]>(`/v1/lighting/profiles/${vmRole}`)
}

export async function createOverride(
  vmRole: string,
  startTime: string,
  endTime: string,
  reason?: string
): Promise<LightingOverride> {
  return apiPost<LightingOverride>('/v1/lighting/overrides', {
    vm_role: vmRole,
    start_time: startTime,
    end_time: endTime,
    reason,
  })
}

export async function getOverrides(vmRole: string): Promise<LightingOverride[]> {
  return apiGet<LightingOverride[]>(`/v1/lighting/overrides/${vmRole}`)
}

export async function deleteOverride(overrideId: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/v1/lighting/overrides/${overrideId}`)
}
