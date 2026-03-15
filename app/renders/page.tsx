/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import {
  createRender,
  getRenderStatus,
  listJobs,
  getJob,
  downloadJobOutput,
} from '@/lib/api/renders'
import type { JobListItem, RenderStatusResponse } from '@/lib/api/renders'

const ENVIRONMENTS = ['landing', 'cave', 'avatar'] as const

export default function RendersPage() {
  const [recipeId, setRecipeId] = useState('')
  const [targetEnv, setTargetEnv] = useState<string>('landing')
  const [resolutionX, setResolutionX] = useState(1920)
  const [resolutionY, setResolutionY] = useState(1080)
  const [submitting, setSubmitting] = useState(false)
  const [activeRenders, setActiveRenders] = useState<RenderStatusResponse[]>([])
  const [jobs, setJobs] = useState<JobListItem[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [expandedJobDetails, setExpandedJobDetails] = useState<JobListItem | null>(null)

  const refreshJobs = useCallback(async () => {
    setLoadingJobs(true)
    try {
      setJobs(await listJobs())
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoadingJobs(false)
    }
  }, [])

  useEffect(() => {
    void refreshJobs()
  }, [refreshJobs])

  useEffect(() => {
    const interval = setInterval(async () => {
      const pending = activeRenders.filter(
        (r) => r.status !== 'complete' && r.status !== 'failed' && r.status !== 'error'
      )
      if (pending.length === 0) return
      try {
        const updated = await Promise.all(pending.map((r) => getRenderStatus(r.render_id)))
        const byId = new Map(updated.map((u) => [u.render_id, u]))
        setActiveRenders((prev) => {
          const next = prev.map((r) => byId.get(r.render_id) ?? r)
          const finished = next.filter(
            (r) => r.status === 'complete' || r.status === 'failed' || r.status === 'error'
          )
          if (finished.length > 0) void refreshJobs()
          return next.filter(
            (r) => r.status !== 'complete' && r.status !== 'failed' && r.status !== 'error'
          )
        })
      } catch {
        /* polling failure is non-fatal */
      }
    }, 5_000)
    return () => clearInterval(interval)
  }, [activeRenders, refreshJobs])

  const handleSubmit = async () => {
    if (!recipeId.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await createRender({
        recipe_id: recipeId.trim(),
        target_environment: targetEnv,
        resolution_x: resolutionX,
        resolution_y: resolutionY,
      })
      toast.success(`Render created: ${res.render_id}`)
      setActiveRenders((prev) => [
        ...prev,
        { render_id: res.render_id, status: res.status, progress: 0 },
      ])
      setRecipeId('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create render')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExpandJob = async (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
      setExpandedJobDetails(null)
      return
    }
    try {
      const details = await getJob(jobId)
      setExpandedJobId(jobId)
      setExpandedJobDetails(details)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load job details')
    }
  }

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Render Pipeline</h1>
          <p className="mt-1 text-sm text-white/50">
            Create jobs, monitor progress, download outputs
          </p>
        </div>

        {/* Create Render */}
        <Card title="Create Render">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/50">Recipe ID</label>
              <input
                type="text"
                value={recipeId}
                onChange={(e) => setRecipeId(e.target.value)}
                placeholder="recipe-id"
                className="w-48 bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Environment</label>
              <select
                value={targetEnv}
                onChange={(e) => setTargetEnv(e.target.value)}
                className="bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Resolution X</label>
              <input
                type="number"
                value={resolutionX}
                onChange={(e) => setResolutionX(Number(e.target.value) || 1920)}
                className="w-24 bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Resolution Y</label>
              <input
                type="number"
                value={resolutionY}
                onChange={(e) => setResolutionY(Number(e.target.value) || 1080)}
                className="w-24 bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !recipeId.trim()}
              className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </Card>

        {/* Active Renders */}
        {activeRenders.length > 0 && (
          <Card title="Active Renders" subtitle="Polling every 5s">
            <div className="space-y-4">
              {activeRenders.map((r) => (
                <div
                  key={r.render_id}
                  className="rounded-lg border border-surface-border bg-surface p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-white">{r.render_id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <span className="text-xs text-white/40">
                      {((r.progress ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar value={r.progress ?? 0} className="mt-3" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Job History */}
        <Card title="Job History">
          {loadingJobs ? (
            <div className="py-8 text-center text-sm text-white/40">Loading jobs…</div>
          ) : jobs.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/40">No jobs yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs uppercase text-white/50">
                    <th className="pb-2 pr-4">Job ID</th>
                    <th className="pb-2 pr-4">State</th>
                    <th className="pb-2 pr-4">Environment</th>
                    <th className="pb-2 pr-4">Created</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const jid = job.job_id ?? (String(job._file ?? '').replace(/\.json$/, '') || '—')
                    const state = String(job._state ?? job.status ?? '—')
                    const env = String(job.target_environment ?? job.environment ?? '—')
                    const created = String(job.created_at ?? job.started_at ?? '—')
                    const isComplete = state === 'complete' || state === 'done'
                    const isExpanded = expandedJobId === jid

                    return (
                      <React.Fragment key={jid}>
                        <tr
                          className="cursor-pointer border-b border-surface-border/50 hover:bg-surface-panel/50"
                          onClick={() => handleExpandJob(jid)}
                        >
                          <td className="py-2.5 pr-4 font-mono text-white">
                            {String(jid).slice(0, 12)}…
                          </td>
                          <td className="py-2.5 pr-4">
                            <StatusBadge status={state} />
                          </td>
                          <td className="py-2.5 pr-4 text-white/70">{env}</td>
                          <td className="py-2.5 pr-4 text-white/50">
                            {created !== '—' ? new Date(created).toLocaleString() : '—'}
                          </td>
                          <td className="py-2.5">
                            {isComplete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadJobOutput(jid)
                                }}
                                className="rounded-md bg-gold px-3 py-1 text-xs font-medium text-black hover:bg-gold-hover"
                              >
                                Download
                              </button>
                            )}
                          </td>
                        </tr>
                        {isExpanded && expandedJobDetails && (
                          <tr>
                            <td colSpan={5} className="border-b border-surface-border/50 bg-surface p-4">
                              <pre className="overflow-x-auto text-xs text-white/60">
                                {JSON.stringify(expandedJobDetails, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
