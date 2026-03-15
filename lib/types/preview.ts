/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

// ─── Video Preview ───

export type VideoStatus = 'processing' | 'ready' | 'error'
export type VideoSource = 'scene_render' | 'singing_avatar' | 'uploaded'

export interface PreviewVideo {
  id: string
  title: string
  source: VideoSource
  source_id: string  // scene or track ID
  mux_playback_id?: string
  thumbnail_url?: string
  duration_seconds: number
  resolution: string
  file_size_mb: number
  status: VideoStatus
  created_at: string
  metadata: Record<string, string>
}

// ─── Shopify PDP ───

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  vendor: string
  product_type: string
  price: number
  compare_at_price?: number
  currency: string
  images: string[]
  description: string
  sku: string
  metafields: { key: string; value: string; namespace: string }[]
}

// ─── Email Preview ───

export type EmailDevice = 'desktop' | 'mobile'

export interface EmailTemplate {
  id: string
  moment_type: string
  subject: string
  preview_text: string
  header_image_url: string
  body_html: string
  cta_label: string
  cta_url: string
  personalization: {
    recipient_name: string
    sender_name: string
    moment_date: string
    product_name?: string
    video_thumbnail_url?: string
  }
}
