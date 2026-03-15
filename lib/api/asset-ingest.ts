/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Asset Ingest Pipeline — API Adapter
 * Typed methods for the /assets/* ingest endpoints exposed by studio-engine.
 * Uses the shared apiGet/apiPost client helpers with JWT injection.
 */

import { apiGet, apiPost } from './client'
import type {
  AssetIngestJob,
  AssetRecord,
  AssetsOverview,
  CreateIngestJobPayload,
  CompleteIngestJobPayload,
} from '@/lib/types/asset-ingest'

// ── Ingest Jobs ─────────────────────────────────────────────────────────────
// Backend ingest pipeline endpoints are not yet deployed.
// All functions degrade gracefully by returning empty arrays.

export async function getIngestJobs(params?: {
  status?: string
  source?: string
  limit?: number
}): Promise<AssetIngestJob[]> {
  try {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.source) query.set('source', params.source)
    if (params?.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    const url = qs ? `/assets/ingest?${qs}` : '/assets/ingest'
    const res = await apiGet<AssetIngestJob[] | { jobs: AssetIngestJob[] }>(url)
    return Array.isArray(res) ? res : (res as { jobs: AssetIngestJob[] }).jobs ?? []
  } catch {
    return []
  }
}

export async function getIngestJob(jobId: string): Promise<AssetIngestJob> {
  return apiGet<AssetIngestJob>(`/assets/ingest/${encodeURIComponent(jobId)}`)
}

export async function createIngestJob(payload: CreateIngestJobPayload): Promise<AssetIngestJob> {
  return apiPost<AssetIngestJob>('/assets/ingest', payload)
}

export async function completeIngestJob(
  jobId: string,
  payload: CompleteIngestJobPayload
): Promise<AssetIngestJob> {
  return apiPost<AssetIngestJob>(
    `/assets/ingest/${encodeURIComponent(jobId)}/complete`,
    payload
  )
}

export async function promoteIngestJob(jobId: string): Promise<AssetIngestJob> {
  return apiPost<AssetIngestJob>(`/assets/promote/${encodeURIComponent(jobId)}`)
}

// ── Assets (uses /v1/assets/search which DOES exist) ────────────────────────

interface AssetSearchResult {
  asset_path: string
  asset_type: string
  tags: string[]
  thumbnail_url: string | null
}

export async function getAssets(params?: {
  type?: string
  active?: boolean
  limit?: number
}): Promise<AssetRecord[]> {
  try {
    const query = new URLSearchParams()
    if (params?.type) query.set('type', params.type)
    if (params?.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    const url = qs ? `/v1/assets/search?${qs}` : '/v1/assets/search'
    const res = await apiGet<{ results: AssetSearchResult[]; count: number }>(url)
    return (res.results || []).map((r, i) => ({
      asset_id: `idx-${i}`,
      asset_key: r.asset_path,
      asset_type: r.asset_type,
      source: 'reindex',
      current_version: 1,
      active: true,
      tags: r.tags,
      thumbnail_url: r.thumbnail_url ?? undefined,
      updated_at: new Date().toISOString(),
    }))
  } catch {
    return []
  }
}

export async function getAsset(assetId: string): Promise<AssetRecord> {
  return apiGet<AssetRecord>(`/assets/${encodeURIComponent(assetId)}`)
}

export async function deactivateAsset(assetId: string): Promise<AssetRecord> {
  return apiPost<AssetRecord>(`/assets/${encodeURIComponent(assetId)}/deactivate`)
}

// ── Sync (uses /v1/metahumans/seed which DOES exist) ────────────────────────

export async function syncMetahumans(): Promise<{ synced: number; message?: string }> {
  try {
    await apiPost('/v1/metahumans/seed')
    return { synced: 1, message: 'MetaHuman seed triggered' }
  } catch {
    return { synced: 0, message: 'Seed failed' }
  }
}

// ── Overview (computed client-side from available data) ──────────────────────

export async function getAssetsOverview(): Promise<AssetsOverview> {
  const [jobs, assets, metahumans] = await Promise.all([
    getIngestJobs().catch(() => [] as AssetIngestJob[]),
    getAssets().catch(() => [] as AssetRecord[]),
    apiGet<unknown[]>('/v1/metahumans').catch(() => []),
  ])
  const mhCount = Array.isArray(metahumans) ? metahumans.length : 0
  return {
    queued_jobs: jobs.filter((j) => j.status === 'queued').length,
    processing_jobs: jobs.filter((j) => j.status === 'staging' || j.status === 'processing').length,
    failed_jobs: jobs.filter((j) => j.status === 'failed' || j.status === 'validation_failed').length,
    complete_jobs: jobs.filter((j) => j.status === 'complete').length,
    promoted_jobs: jobs.filter((j) => j.status === 'promoted').length,
    active_assets: assets.length,
    metahuman_assets: mhCount,
  }
}
