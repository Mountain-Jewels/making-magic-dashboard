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

export async function getCurrentLighting(vmRole: string): Promise<LightingState | null> {
  try {
    return await apiGet<LightingState>(`/v1/lighting/current/${vmRole}`)
  } catch {
    return null
  }
}

export async function computeLighting(vmRole: string): Promise<LightingState | null> {
  try {
    return await apiGet<LightingState>(`/v1/lighting/compute/${vmRole}`)
  } catch {
    return null
  }
}

export async function generateDailyProfiles(
  vmRole: string,
  lat?: number,
  lon?: number,
  altitudeM?: number
): Promise<LightingProfile[]> {
  try {
    return await apiPost<LightingProfile[]>('/v1/lighting/profiles/generate', {
      vm_role: vmRole,
      lat,
      lon,
      altitude_m: altitudeM,
    })
  } catch {
    return []
  }
}

export async function getProfiles(vmRole: string): Promise<LightingProfile[]> {
  try {
    return await apiGet<LightingProfile[]>(`/v1/lighting/profiles/${vmRole}`)
  } catch {
    return []
  }
}

export async function createOverride(
  vmRole: string,
  startTime: string,
  endTime: string,
  reason?: string
): Promise<LightingOverride | null> {
  try {
    return await apiPost<LightingOverride>('/v1/lighting/overrides', {
      vm_role: vmRole,
      start_time: startTime,
      end_time: endTime,
      reason,
    })
  } catch {
    return null
  }
}

export async function getOverrides(vmRole: string): Promise<LightingOverride[]> {
  try {
    return await apiGet<LightingOverride[]>(`/v1/lighting/overrides/${vmRole}`)
  } catch {
    return []
  }
}

export async function deleteOverride(overrideId: string): Promise<{ status: string } | null> {
  try {
    return await apiDelete<{ status: string }>(`/v1/lighting/overrides/${overrideId}`)
  } catch {
    return null
  }
}
