/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/lib/auth/useAuth'
import {
  getAssetsOverview,
  getIngestJobs,
  getAssets,
  createIngestJob,
  completeIngestJob,
  promoteIngestJob,
  deactivateAsset,
  syncMetahumans,
} from '@/lib/api/asset-ingest'
import type {
  AssetsOverview,
  AssetIngestJob,
  AssetRecord,
  CreateIngestJobPayload,
} from '@/lib/types/asset-ingest'
import { ApiError } from '@/lib/api/client'
import { AssetsOverviewSection } from './AssetsOverviewSection'
import { IngestJobsSection } from './IngestJobsSection'
import { AssetLibrarySection } from './AssetLibrarySection'
import { AssetsActionsSection } from './AssetsActionsSection'

const FEATURE_ENABLED = process.env.NEXT_PUBLIC_FEATURE_ASSETS_TAB !== 'false'

function extractRequestId(err: unknown): string | undefined {
  if (err instanceof ApiError && err.body && typeof err.body === 'object') {
    return (err.body as { request_id?: string }).request_id
  }
  return undefined
}

export default function AssetsPage() {
  const { getRoles } = useAuth()
  const [role, setRole] = useState<'admin' | 'user' | 'unknown'>('unknown')
  const [loadingRole, setLoadingRole] = useState(true)
  const [overview, setOverview] = useState<AssetsOverview | null>(null)
  const [jobs, setJobs] = useState<AssetIngestJob[]>([])
  const [assets, setAssets] = useState<AssetRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  // ── Load all data ─────────────────────────────────────────────────────────

  const loadAllData = useCallback(async () => {
    const [overviewData, jobsData, assetsData] = await Promise.all([
      getAssetsOverview(),
      getIngestJobs(),
      getAssets(),
    ])
    return { overview: overviewData, jobs: jobsData ?? [], assets: assetsData ?? [] }
  }, [])

  const refreshAll = useCallback(async () => {
    try {
      const data = await loadAllData()
      setOverview(data.overview)
      setJobs(data.jobs)
      setAssets(data.assets)
      setError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh data'
      const reqId = extractRequestId(err)
      setError(reqId ? `${msg} (request_id: ${reqId})` : msg)
    }
  }, [loadAllData])

  // ── Role resolution ───────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false
    void getRoles().then((roles) => {
      if (cancelled) return
      setRole(roles.includes('admin') ? 'admin' : 'user')
      setLoadingRole(false)
    })
    return () => {
      cancelled = true
    }
  }, [getRoles])

  // ── Initial data load ─────────────────────────────────────────────────────

  useEffect(() => {
    if (role !== 'admin') return

    let cancelled = false
    const load = async () => {
      try {
        const data = await loadAllData()
        if (!cancelled) {
          setOverview(data.overview)
          setJobs(data.jobs)
          setAssets(data.assets)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load asset pipeline data'
          )
        }
      }
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [role, loadAllData])

  // ── Mutation handlers ─────────────────────────────────────────────────────

  const handleCreateJob = useCallback(
    async (payload: CreateIngestJobPayload) => {
      try {
        await createIngestJob(payload)
        toast.success('Ingest job created')
        await refreshAll()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create ingest job'
        const reqId = extractRequestId(err)
        toast.error(reqId ? `${msg} (request_id: ${reqId})` : msg)
      }
    },
    [refreshAll]
  )

  const handleComplete = useCallback(
    async (jobId: string) => {
      try {
        await completeIngestJob(jobId, {})
        toast.success('Ingest job completed')
        await refreshAll()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to complete job'
        const reqId = extractRequestId(err)
        toast.error(reqId ? `${msg} (request_id: ${reqId})` : msg)
      }
    },
    [refreshAll]
  )

  const handlePromote = useCallback(
    async (jobId: string) => {
      try {
        await promoteIngestJob(jobId)
        toast.success('Ingest job promoted to active asset')
        await refreshAll()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to promote job'
        const reqId = extractRequestId(err)
        toast.error(reqId ? `${msg} (request_id: ${reqId})` : msg)
      }
    },
    [refreshAll]
  )

  const handleDeactivate = useCallback(
    async (assetId: string) => {
      try {
        await deactivateAsset(assetId)
        toast.success('Asset deactivated')
        await refreshAll()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to deactivate asset'
        const reqId = extractRequestId(err)
        toast.error(reqId ? `${msg} (request_id: ${reqId})` : msg)
      }
    },
    [refreshAll]
  )

  const handleSyncMetahumans = useCallback(async () => {
    try {
      const result = await syncMetahumans()
      toast.success(result.message ?? `Synced ${result.synced} MetaHuman(s)`)
      await refreshAll()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sync MetaHumans'
      const reqId = extractRequestId(err)
      toast.error(reqId ? `${msg} (request_id: ${reqId})` : msg)
    }
  }, [refreshAll])

  // ── Render guards ─────────────────────────────────────────────────────────

  if (!FEATURE_ENABLED) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6 text-white/80">
          Asset management is not enabled in this environment.
        </div>
      </div>
    )
  }

  if (loadingRole) {
    return <div className="p-6 text-sm text-white/70">Loading assets panel…</div>
  }

  if (role !== 'admin') {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6 text-white/80">
          Unauthorized — admin access only
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
          {error}
        </div>
      </div>
    )
  }

  if (!overview) {
    return <div className="p-6 text-sm text-white/70">Loading overview…</div>
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Asset Pipeline</h1>
        <p className="text-sm text-white/70 mt-1">
          Ingest, promote, and manage 3D assets across the studio
        </p>
      </div>

      <AssetsOverviewSection data={overview} />
      <AssetsActionsSection
        onCreateJob={handleCreateJob}
        onSyncMetahumans={handleSyncMetahumans}
      />
      <IngestJobsSection
        data={jobs}
        onComplete={handleComplete}
        onPromote={handlePromote}
      />
      <AssetLibrarySection data={assets} onDeactivate={handleDeactivate} />
    </div>
  )
}
