/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Asset API — upload, list, delete, get URL
 */

import { apiDelete, apiGet, apiUpload } from './client'
import type { Asset, UploadAssetResponse } from './types'

export type AssetType = 'avatar' | 'music' | 'background' | 'generated' | 'export' | 'texture' | 'hdri' | 'animation' | 'voice' | 'mesh'

export async function uploadAsset(
  file: File | Blob,
  type: AssetType,
  options?: { onProgress?: (loaded: number, total: number) => void }
): Promise<UploadAssetResponse> {
  // type sent as query param; API routes to correct container
  return apiUpload<UploadAssetResponse>(`/assets/upload?type=${type}`, file, 'file', {
    onProgress: options?.onProgress,
  })
}

export async function listAssets(
  type?: AssetType
): Promise<Asset[]> {
  const res = await apiGet<{ assets?: Asset[] }>(
    type ? `/assets?type=${type}` : '/assets'
  )
  const arr = (res as { assets?: Asset[] })?.assets
  return Array.isArray(arr) ? arr : []
}

export async function deleteAsset(id: string): Promise<void> {
  await apiDelete(`/assets/${encodeURIComponent(id)}`)
}

export async function getAssetUrl(id: string): Promise<{ url: string; expires_at?: string }> {
  return apiGet<{ url: string; expires_at?: string }>(`/assets/${encodeURIComponent(id)}/url`)
}
