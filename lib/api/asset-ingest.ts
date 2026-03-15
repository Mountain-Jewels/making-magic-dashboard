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

export async function getIngestJobs(params?: {
  status?: string
  source?: string
  limit?: number
}): Promise<AssetIngestJob[]> {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.source) query.set('source', params.source)
  if (params?.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  const url = qs ? `/assets/ingest?${qs}` : '/assets/ingest'
  const res = await apiGet<AssetIngestJob[] | { jobs: AssetIngestJob[] }>(url)
  return Array.isArray(res) ? res : (res as { jobs: AssetIngestJob[] }).jobs ?? []
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

// ── Assets ──────────────────────────────────────────────────────────────────

export async function getAssets(params?: {
  type?: string
  active?: boolean
  limit?: number
}): Promise<AssetRecord[]> {
  const query = new URLSearchParams()
  if (params?.type) query.set('type', params.type)
  if (params?.active !== undefined) query.set('active', String(params.active))
  if (params?.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  const url = qs ? `/assets?${qs}` : '/assets'
  const res = await apiGet<AssetRecord[] | { assets: AssetRecord[] }>(url)
  return Array.isArray(res) ? res : (res as { assets: AssetRecord[] }).assets ?? []
}

export async function getAsset(assetId: string): Promise<AssetRecord> {
  return apiGet<AssetRecord>(`/assets/${encodeURIComponent(assetId)}`)
}

export async function deactivateAsset(assetId: string): Promise<AssetRecord> {
  return apiPost<AssetRecord>(`/assets/${encodeURIComponent(assetId)}/deactivate`)
}

// ── Sync ────────────────────────────────────────────────────────────────────

export async function syncMetahumans(): Promise<{ synced: number; message?: string }> {
  return apiPost<{ synced: number; message?: string }>('/assets/sync/metahumans')
}

// ── Overview (computed client-side if backend doesn't provide) ──────────────

export async function getAssetsOverview(): Promise<AssetsOverview> {
  try {
    return await apiGet<AssetsOverview>('/assets/overview')
  } catch {
    // Compute from raw data if dedicated overview endpoint doesn't exist yet
    const [jobs, assets] = await Promise.all([getIngestJobs(), getAssets()])
    return {
      queued_jobs: jobs.filter((j) => j.status === 'queued').length,
      processing_jobs: jobs.filter((j) =>
        j.status === 'staging' || j.status === 'processing'
      ).length,
      failed_jobs: jobs.filter((j) =>
        j.status === 'failed' || j.status === 'validation_failed'
      ).length,
      complete_jobs: jobs.filter((j) => j.status === 'complete').length,
      promoted_jobs: jobs.filter((j) => j.status === 'promoted').length,
      active_assets: assets.filter((a) => a.active).length,
      metahuman_assets: assets.filter((a) => a.asset_type === 'metahuman').length,
    }
  }
}
