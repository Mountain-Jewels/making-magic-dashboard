/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * User Asset API — upload, list, delete, get URL.
 * Points to /v1/assets/* endpoints on the studio engine.
 */

import { apiDelete, apiGet, apiUpload } from './client'

export type AssetType =
  | 'image'
  | 'video'
  | 'audio'
  | 'mesh'
  | 'texture'
  | 'hdri'
  | 'document'
  | 'avatar'
  | 'music'
  | 'background'
  | 'generated'
  | 'export'

export interface Asset {
  id: string
  filename: string
  asset_type: string
  url: string
  content_type?: string
  created_at: string
}

export interface UploadAssetResponse {
  id: string
  filename: string
  asset_type: string
  url: string
  content_type?: string
  size?: number
  size_bytes?: number
  created_at?: string
}

export async function uploadAsset(
  file: File | Blob,
  type: AssetType,
  options?: { onProgress?: (loaded: number, total: number) => void },
): Promise<UploadAssetResponse | null> {
  try {
    return await apiUpload<UploadAssetResponse>(
      `/v1/assets/upload?asset_type=${type}`,
      file,
      'file',
      { onProgress: options?.onProgress },
    )
  } catch (err) {
    console.error('[assets] upload failed:', err)
    return null
  }
}

export async function listAssets(type?: AssetType): Promise<Asset[]> {
  try {
    const params = type ? `?asset_type=${type}` : ''
    const res = await apiGet<{ assets?: Asset[] }>(`/v1/assets${params}`)
    return Array.isArray(res?.assets) ? res.assets : []
  } catch (err) {
    console.error('[assets] list failed:', err)
    return []
  }
}

export async function deleteAsset(id: string): Promise<void> {
  try {
    await apiDelete(`/v1/assets/${encodeURIComponent(id)}`)
  } catch (err) {
    console.error('[assets] delete failed:', err)
  }
}

export async function getAssetUrl(
  id: string,
): Promise<{ url: string } | null> {
  try {
    return await apiGet<{ url: string }>(
      `/v1/assets/${encodeURIComponent(id)}/url`,
    )
  } catch (err) {
    console.error('[assets] getUrl failed:', err)
    return null
  }
}
