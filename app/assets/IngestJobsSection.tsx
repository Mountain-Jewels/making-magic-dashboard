/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import type { AssetIngestJob, IngestJobStatus } from '@/lib/types/asset-ingest'

type IngestJobsSectionProps = {
  data: AssetIngestJob[]
  onComplete: (jobId: string) => Promise<void>
  onPromote: (jobId: string) => Promise<void>
}

const STATUS_COLORS: Record<IngestJobStatus, string> = {
  queued: 'text-blue-400',
  staging: 'text-blue-400',
  processing: 'text-blue-400',
  validation_failed: 'text-red-400',
  failed: 'text-red-400',
  complete: 'text-amber-400',
  promoted: 'text-green-400',
}

export function IngestJobsSection({ data, onComplete, onPromote }: IngestJobsSectionProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleAction = async (
    jobId: string,
    action: 'complete' | 'promote',
    handler: (id: string) => Promise<void>
  ) => {
    if (action === 'promote') {
      const confirmed = window.confirm('Promote this ingest job to an active asset?')
      if (!confirmed) return
    }
    setLoadingId(jobId)
    setLoadingAction(action)
    try {
      await handler(jobId)
    } finally {
      setLoadingId(null)
      setLoadingAction(null)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Ingest Jobs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#2A2A35]">
          <thead className="bg-[#111118] text-white/80">
            <tr>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Job ID</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Source</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Type</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Status</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Filename</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Created</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Error</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((job) => {
              const createdLabel = job.created_at
                ? new Date(job.created_at).toLocaleString()
                : '—'
              const statusColor = STATUS_COLORS[job.status] ?? 'text-white/60'
              const isLoading = loadingId === job.job_id
              const canComplete =
                job.status === 'processing' || job.status === 'staging'
              const canPromote = job.status === 'complete'

              return (
                <tr key={job.job_id} className="odd:bg-[#0f0f16]">
                  <td className="border border-[#2A2A35] px-3 py-2 text-white font-mono text-xs">
                    {job.job_id.slice(0, 8)}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">
                    {job.source}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">
                    {job.asset_type}
                  </td>
                  <td className={`border border-[#2A2A35] px-3 py-2 font-medium ${statusColor}`}>
                    {job.status}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">
                    {job.filename ?? '—'}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white/70 text-xs">
                    {createdLabel}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-red-300 text-xs max-w-[200px]">
                    {job.error_message ? (
                      <span title={job.error_message} className="truncate block">
                        {job.error_message}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2">
                    <div className="flex gap-1">
                      {canComplete && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleAction(job.job_id, 'complete', onComplete)}
                          className={`px-2 py-1 rounded text-white text-xs ${
                            isLoading && loadingAction === 'complete'
                              ? 'bg-amber-400 cursor-not-allowed'
                              : 'bg-amber-600 hover:bg-amber-500'
                          }`}
                        >
                          {isLoading && loadingAction === 'complete'
                            ? 'Completing…'
                            : 'Complete'}
                        </button>
                      )}
                      {canPromote && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleAction(job.job_id, 'promote', onPromote)}
                          className={`px-2 py-1 rounded text-white text-xs ${
                            isLoading && loadingAction === 'promote'
                              ? 'bg-green-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-500'
                          }`}
                        >
                          {isLoading && loadingAction === 'promote'
                            ? 'Promoting…'
                            : 'Promote'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {!data.length ? (
              <tr>
                <td
                  colSpan={8}
                  className="border border-[#2A2A35] px-3 py-6 text-center text-white/60"
                >
                  No ingest jobs
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
