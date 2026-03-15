/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import { TabSwitcher } from '@/components/shared/TabSwitcher'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  getIngestJobs,
  createIngestJob,
  completeIngestJob,
  promoteIngestJob,
  getAssets,
  deactivateAsset,
  syncMetahumans,
  getAssetsOverview,
} from '@/lib/api/asset-ingest'
import { uploadAsset, listAssets } from '@/lib/api/assets'
import type { AssetIngestJob, AssetRecord, AssetsOverview, IngestSource, IngestAssetType } from '@/lib/types/asset-ingest'
import type { AssetType } from '@/lib/api/assets'

type Tab = 'overview' | 'ingest' | 'library'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'ingest', label: 'Ingest Pipeline' },
  { id: 'library', label: 'Asset Library' },
]

const SOURCES: IngestSource[] = ['upload', 'url', 'meshy', 'mac_sync', 'metahuman_import']
const ASSET_TYPES: IngestAssetType[] = ['mesh', 'metahuman', 'prop', 'jewelry', 'material']
const UPLOAD_TYPES: AssetType[] = ['avatar', 'music', 'background', 'generated', 'export']

const inputCls =
  'w-full bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm'
const btnCls =
  'bg-gold text-black font-medium rounded-md hover:bg-gold-hover disabled:opacity-50 px-4 py-2 text-sm'
const btnSmCls =
  'bg-gold text-black font-medium rounded-md hover:bg-gold-hover disabled:opacity-50 px-3 py-1.5 text-xs'
const btnDangerSmCls =
  'bg-red-600/80 text-white font-medium rounded-md hover:bg-red-600 disabled:opacity-50 px-3 py-1.5 text-xs'

export default function AssetsPage() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">Assets</h1>
        <p className="text-sm text-white/50 mt-1">Asset management &amp; ingest pipeline</p>
      </div>

      <TabSwitcher tabs={TABS} active={tab} onChange={setTab} />

      <div className="pt-2">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'ingest' && <IngestTab />}
        {tab === 'library' && <LibraryTab />}
      </div>
    </div>
  )
}

/* ─── Overview ────────────────────────────────────────────────────── */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-xs text-white/50 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-white mt-1">{value}</p>
    </Card>
  )
}

function OverviewTab() {
  const [data, setData] = useState<AssetsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAssetsOverview()
      .then(setData)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load overview'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center text-white/60 py-8">Loading overview…</div>
  if (!data) return <EmptyState title="No overview data" />

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <StatCard label="Queued" value={data.queued_jobs} />
      <StatCard label="Processing" value={data.processing_jobs} />
      <StatCard label="Failed" value={data.failed_jobs} />
      <StatCard label="Complete" value={data.complete_jobs} />
      <StatCard label="Promoted" value={data.promoted_jobs} />
      <StatCard label="Active Assets" value={data.active_assets} />
      <StatCard label="MetaHumans" value={data.metahuman_assets} />
    </div>
  )
}

/* ─── Ingest Pipeline ─────────────────────────────────────────────── */

function IngestTab() {
  const [jobs, setJobs] = useState<AssetIngestJob[]>([])
  const [loading, setLoading] = useState(true)

  const [newSource, setNewSource] = useState<IngestSource>('upload')
  const [newType, setNewType] = useState<IngestAssetType>('mesh')
  const [newName, setNewName] = useState('')
  const [newBlob, setNewBlob] = useState('')
  const [creating, setCreating] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const data = await getIngestJobs()
      setJobs(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const handleCreate = useCallback(async () => {
    setCreating(true)
    try {
      await createIngestJob({
        source: newSource,
        asset_type: newType,
        filename: newName.trim() || undefined,
        url: newBlob.trim() || undefined,
      })
      toast.success('Ingest job created')
      setNewName('')
      setNewBlob('')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }, [newSource, newType, newName, newBlob, refresh])

  const handleComplete = useCallback(async (jobId: string) => {
    try {
      await completeIngestJob(jobId, {})
      toast.success('Job completed')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Complete failed')
    }
  }, [refresh])

  const handlePromote = useCallback(async (jobId: string) => {
    try {
      await promoteIngestJob(jobId)
      toast.success('Job promoted')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Promote failed')
    }
  }, [refresh])

  return (
    <div className="space-y-6">
      <Card title="Create Ingest Job">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-white/60">Source</span>
            <select className={inputCls} value={newSource} onChange={(e) => setNewSource(e.target.value as IngestSource)}>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-white/60">Asset Type</span>
            <select className={inputCls} value={newType} onChange={(e) => setNewType(e.target.value as IngestAssetType)}>
              {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <input className={inputCls} placeholder="Filename" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input className={inputCls} placeholder="Blob path / URL" value={newBlob} onChange={(e) => setNewBlob(e.target.value)} />
        </div>
        <button className={`${btnCls} mt-4`} disabled={creating} onClick={handleCreate}>
          {creating ? 'Creating…' : 'Create Job'}
        </button>
      </Card>

      <Card title="Ingest Jobs">
        {loading ? (
          <div className="text-center text-white/60 py-6">Loading…</div>
        ) : jobs.length === 0 ? (
          <EmptyState title="No ingest jobs found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-white/50 border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">ID</th>
                  <th className="pb-2 pr-4 font-medium">Source</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Created</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.job_id} className="border-b border-surface-border/50 text-white/80">
                    <td className="py-2 pr-4 font-mono text-xs">{j.job_id.slice(0, 8)}…</td>
                    <td className="py-2 pr-4">{j.source}</td>
                    <td className="py-2 pr-4">{j.asset_type}</td>
                    <td className="py-2 pr-4"><StatusBadge status={j.status} /></td>
                    <td className="py-2 pr-4 text-xs text-white/50">{new Date(j.created_at).toLocaleDateString()}</td>
                    <td className="py-2 flex gap-2">
                      {j.status !== 'complete' && j.status !== 'promoted' && (
                        <button className={btnSmCls} onClick={() => handleComplete(j.job_id)}>Complete</button>
                      )}
                      {j.status === 'complete' && (
                        <button className={btnSmCls} onClick={() => handlePromote(j.job_id)}>Promote</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/* ─── Asset Library ───────────────────────────────────────────────── */

function LibraryTab() {
  const [assets, setAssets] = useState<AssetRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [uploadType, setUploadType] = useState<AssetType>('generated')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await getAssets(typeFilter ? { type: typeFilter } : undefined)
      setAssets(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }, [typeFilter])

  useEffect(() => { void refresh() }, [refresh])

  const handleDeactivate = useCallback(async (id: string) => {
    try {
      await deactivateAsset(id)
      toast.success('Asset deactivated')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Deactivate failed')
    }
  }, [refresh])

  const handleSync = useCallback(async () => {
    setSyncing(true)
    try {
      const res = await syncMetahumans()
      toast.success(`Synced ${res.synced} metahumans`)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }, [refresh])

  const handleUpload = useCallback(async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadAsset(file, uploadType)
      toast.success('Asset uploaded')
      if (fileRef.current) fileRef.current.value = ''
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [uploadType, refresh])

  return (
    <div className="space-y-6">
      <Card title="Upload Asset">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="space-y-1">
            <span className="text-xs text-white/60">Type</span>
            <select className={inputCls} value={uploadType} onChange={(e) => setUploadType(e.target.value as AssetType)}>
              {UPLOAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <input ref={fileRef} type="file" className="text-sm text-white/60 file:mr-3 file:bg-surface file:border file:border-surface-border file:rounded-md file:px-3 file:py-1.5 file:text-sm file:text-white/70" />
          <button className={btnCls} disabled={uploading} onClick={handleUpload}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </Card>

      <Card title="Asset Library">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="space-y-1">
            <span className="text-xs text-white/60">Filter by type</span>
            <select className={inputCls} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All</option>
              {[...ASSET_TYPES, ...UPLOAD_TYPES].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <button className={btnCls} onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync MetaHumans'}
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white/60 py-6">Loading…</div>
        ) : assets.length === 0 ? (
          <EmptyState title="No assets found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-white/50 border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">ID</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Key</th>
                  <th className="pb-2 pr-4 font-medium">Active</th>
                  <th className="pb-2 pr-4 font-medium">Updated</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a.asset_id} className="border-b border-surface-border/50 text-white/80">
                    <td className="py-2 pr-4 font-mono text-xs">{a.asset_id.slice(0, 8)}…</td>
                    <td className="py-2 pr-4">{a.asset_type}</td>
                    <td className="py-2 pr-4 text-xs">{a.asset_key}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={a.active ? 'active' : 'offline'} />
                    </td>
                    <td className="py-2 pr-4 text-xs text-white/50">{new Date(a.updated_at).toLocaleDateString()}</td>
                    <td className="py-2">
                      {a.active && (
                        <button className={btnDangerSmCls} onClick={() => handleDeactivate(a.asset_id)}>
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
