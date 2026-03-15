/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Asset Ingest Pipeline — Type Definitions
 * Used by the Assets admin tab and lib/api/asset-ingest.ts adapter.
 */

export type IngestSource = 'upload' | 'url' | 'meshy' | 'mac_sync' | 'metahuman_import' | 'fab' | 'epic_marketplace' | 'quixel_megascans' | 'blockade_labs'

export type IngestAssetType = 'mesh' | 'metahuman' | 'prop' | 'jewelry' | 'material'

export type IngestJobStatus =
  | 'queued'
  | 'staging'
  | 'processing'
  | 'validation_failed'
  | 'complete'
  | 'promoted'
  | 'failed'

export type AssetIngestJob = {
  job_id: string
  source: IngestSource
  asset_type: IngestAssetType
  status: IngestJobStatus
  filename?: string | null
  content_type?: string | null
  size_bytes?: number | null
  staging_path?: string | null
  error_message?: string | null
  created_at: string
  completed_at?: string | null
}

export type AssetRecord = {
  asset_id: string
  asset_key: string
  asset_type: string
  source: string
  current_version: number
  active: boolean
  tags?: string[]
  thumbnail_url?: string
  preview_url?: string
  mesh_path?: string
  updated_at: string
}

export type AssetsOverview = {
  queued_jobs: number
  processing_jobs: number
  failed_jobs: number
  complete_jobs: number
  promoted_jobs: number
  active_assets: number
  metahuman_assets: number
}

export type CreateIngestJobPayload = {
  source: IngestSource
  asset_type: IngestAssetType
  filename?: string
  url?: string
  metadata?: {
    tags?: string[]
    license?: string
  }
}

export type CompleteIngestJobPayload = {
  staging_path?: string
  content_type?: string
  size_bytes?: number
}
