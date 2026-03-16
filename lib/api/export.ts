/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Export API — image, video, audio, Shopify, share, Mux upload
 */

import { apiGet, apiPost } from './client'

export interface ExportImageResponse {
  export_url: string
  format: string
  size: number
}

export interface ExportVideoResponse {
  export_url: string
  mux_playback_id?: string
  format: string
}

export interface ExportAudioResponse {
  export_url: string
  format: string
  duration: number
}

export interface ExportShopifyResponse {
  status: string
  product_id: string | null
  product_url: string | null
  admin_url: string | null
  message: string
  liquid_snippet: string | null
}

export interface ExportShareResponse {
  share_url: string
  token: string
  expires_at: string
}

export async function exportImage(
  sceneId: string,
  format: 'png' | 'jpg' = 'png',
  quality?: number
): Promise<ExportImageResponse | null> {
  try {
    return await apiPost<ExportImageResponse>('/export/image', {
      scene_id: sceneId,
      format,
      ...(quality != null && { quality }),
    })
  } catch {
    return null
  }
}

export async function exportVideo(sceneId: string): Promise<ExportVideoResponse | null> {
  try {
    return await apiPost<ExportVideoResponse>('/export/video', {
      scene_id: sceneId,
      format: 'mp4',
    })
  } catch {
    return null
  }
}

export async function exportAudio(sceneId: string): Promise<ExportAudioResponse | null> {
  try {
    return await apiPost<ExportAudioResponse>('/export/audio', {
      scene_id: sceneId,
      format: 'mp3',
    })
  } catch {
    return null
  }
}

export async function exportToShopify(
  productTitle: string,
  description?: string,
  options?: {
    scene_id?: string
    sku?: string
    price?: string
    video_playback_id?: string
    video_url?: string
    poster_url?: string
    image_urls?: string[]
    tags?: string[]
    product_type?: string
    liquid_template?: string
  },
): Promise<ExportShopifyResponse | null> {
  try {
    return await apiPost<ExportShopifyResponse>('/export/shopify', {
      product_title: productTitle,
      ...(description && { description }),
      ...options,
    })
  } catch (err) {
    console.error('[export] shopify deploy failed:', err)
    return null
  }
}

export async function exportShare(sceneId: string): Promise<ExportShareResponse | null> {
  try {
    return await apiPost<ExportShareResponse>('/export/share', { scene_id: sceneId })
  } catch {
    return null
  }
}

// --- Mux video upload & status ---

export interface MuxUploadResponse {
  asset_id: string
  playback_id?: string
  status: string
  stream_url?: string
  thumbnail_url?: string
}

export interface MuxAssetStatusResponse {
  asset_id: string
  playback_id?: string
  status: string
  duration?: number
  aspect_ratio?: string
}

export async function uploadVideoToMux(
  videoUrl: string,
  jobId?: string
): Promise<MuxUploadResponse | null> {
  try {
    return await apiPost<MuxUploadResponse>('/export/video', {
      video_url: videoUrl,
      ...(jobId != null && jobId !== '' && { job_id: jobId }),
    })
  } catch {
    return null
  }
}

export async function getMuxAssetStatus(assetId: string): Promise<MuxAssetStatusResponse | null> {
  try {
    return await apiGet<MuxAssetStatusResponse>(`/export/video/${encodeURIComponent(assetId)}`)
  } catch {
    return null
  }
}
