/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Export API — image, video, audio, Shopify, share
 */

import { apiPost } from './client'

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
  shopify_product_id: string
  shopify_url: string
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
): Promise<ExportImageResponse> {
  return apiPost<ExportImageResponse>('/export/image', {
    scene_id: sceneId,
    format,
    ...(quality != null && { quality }),
  })
}

export async function exportVideo(sceneId: string): Promise<ExportVideoResponse> {
  return apiPost<ExportVideoResponse>('/export/video', {
    scene_id: sceneId,
    format: 'mp4',
  })
}

export async function exportAudio(sceneId: string): Promise<ExportAudioResponse> {
  return apiPost<ExportAudioResponse>('/export/audio', {
    scene_id: sceneId,
    format: 'mp3',
  })
}

export async function exportToShopify(
  sceneId: string,
  productTitle: string,
  description?: string
): Promise<ExportShopifyResponse> {
  return apiPost<ExportShopifyResponse>('/export/shopify', {
    scene_id: sceneId,
    product_title: productTitle,
    ...(description != null && description !== '' && { description }),
  })
}

export async function exportShare(sceneId: string): Promise<ExportShareResponse> {
  return apiPost<ExportShareResponse>('/export/share', { scene_id: sceneId })
}
