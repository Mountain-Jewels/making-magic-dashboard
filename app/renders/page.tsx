/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/lib/auth/useAuth'
import {
  createRender,
  downloadJobOutput,
  getJob,
  getRenderStatus,
  listJobs,
} from '@/lib/api/renders'
import type { JobListItem, RenderStatusResponse } from '@/lib/api/renders'

const ENVIRONMENTS = ['landing', 'cave', 'avatar'] as const

export default function RendersPage() {
  const { getRoles } = useAuth()
  const [role, setRole] = useState<'admin' | 'user' | 'unknown'>('unknown')
  const [loadingRole, setLoadingRole] = useState(true)
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

  useEffect(() => {
    void getRoles().then((roles) => {
      setRole(roles.includes('admin') ? 'admin' : 'user')
      setLoadingRole(false)
    })
  }, [getRoles])

  const refreshJobs = useCallback(async () => {
    setLoadingJobs(true)
    try {
      const data = await listJobs()
      setJobs(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load jobs'
      toast.error(msg)
    } finally {
      setLoadingJobs(false)
    }
  }, [])

  const pollActiveRenders = useCallback(async () => {
    setActiveRenders((prev) => {
      const stillActive = prev.filter(
        (r) => r.status !== 'complete' && r.status !== 'failed' && r.status !== 'error'
      )
      if (stillActive.length === 0) return prev
      void Promise.all(stillActive.map((r) => getRenderStatus(r.render_id))).then((updated) => {
        setActiveRenders((p) => {
          const byId = new Map(updated.map((u) => [u.render_id, u]))
          const next = p.map((r) => byId.get(r.render_id) ?? r)
          const done = updated.filter(
            (u) =>
              u.status === 'complete' || u.status === 'failed' || u.status === 'error'
          )
          if (done.length > 0) void refreshJobs()
          return next.filter(
            (r) => r.status !== 'complete' && r.status !== 'failed' && r.status !== 'error'
          )
        })
      })
      return prev
    })
  }, [refreshJobs])

  useEffect(() => {
    void refreshJobs()
  }, [refreshJobs])

  useEffect(() => {
    const interval = setInterval(pollActiveRenders, 5000)
    return () => clearInterval(interval)
  }, [pollActiveRenders])

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
        {
          render_id: res.render_id,
          status: res.status,
          progress: 0,
        },
      ])
      void refreshJobs()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create render'
      toast.error(msg)
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
      const msg = err instanceof Error ? err.message : 'Failed to load job details'
      toast.error(msg)
    }
  }

  if (loadingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
        <div className="text-white/60">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      <div className="mx-auto max-w-[1200px] space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-white">Render Pipeline</h1>
          <p className="mt-1 text-sm text-white/50">
            Create render jobs, monitor progress, download outputs
          </p>
        </div>

        {/* Create Render */}
        <section className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Create Render</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/50">Recipe ID</label>
              <input
                type="text"
                value={recipeId}
                onChange={(e) => setRecipeId(e.target.value)}
                placeholder="recipe-id"
                className="w-48 rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Target Environment</label>
              <select
                value={targetEnv}
                onChange={(e) => setTargetEnv(e.target.value)}
                className="rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white"
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Resolution X</label>
              <input
                type="number"
                value={resolutionX}
                onChange={(e) => setResolutionX(Number(e.target.value) || 1920)}
                className="w-24 rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Resolution Y</label>
              <input
                type="number"
                value={resolutionY}
                onChange={(e) => setResolutionY(Number(e.target.value) || 1080)}
                className="w-24 rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !recipeId.trim()}
              className="rounded bg-[#D4AF37] px-4 py-2 text-sm font-medium text-[#0A0A0F] hover:bg-[#D4AF37]/90 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </section>

        {/* Active Renders */}
        {activeRenders.length > 0 && (
          <section className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6">
            <h2 className="mb-4 text-lg font-medium text-white">Active Renders</h2>
            <div className="space-y-4">
              {activeRenders.map((r) => (
                <div
                  key={r.render_id}
                  className="rounded-lg border border-[#2A2A35] bg-[#0A0A0F] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm text-white">{r.render_id}</span>
                      <span className="ml-2 text-xs text-white/50">{r.status}</span>
                    </div>
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-[#2A2A35]">
                      <div
                        className="h-full rounded-full bg-[#D4AF37] transition-all"
                        style={{ width: `${((r.progress ?? 0) * 100).toFixed(0)}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-white/40">
                    Progress: {((r.progress ?? 0) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/40">Polling every 5s</p>
          </section>
        )}

        {/* Job History */}
        <section className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Job History</h2>
          {loadingJobs ? (
            <div className="py-8 text-center text-white/50">Loading jobs…</div>
          ) : jobs.length === 0 ? (
            <div className="py-8 text-center text-white/50">No jobs yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A35] text-left text-xs uppercase text-white/50">
                    <th className="pb-3 pr-4">Job ID</th>
                    <th className="pb-3 pr-4">State</th>
                    <th className="pb-3 pr-4">Environment</th>
                    <th className="pb-3 pr-4">Created</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const jid = job.job_id ?? (String(job._file ?? '').replace(/\.json$/, '') || '—')
                    const state = String(job._state ?? job.status ?? '—')
                    const env = String(job.target_environment ?? job.environment ?? '—')
                    const created = String(job.created_at ?? job.started_at ?? '—')
                    const isComplete =
                      state === 'complete' || job.status === 'complete' || job.status === 'done'
                    const isExpanded = expandedJobId === jid

                    return (
                      <React.Fragment key={jid}>
                        <tr
                          className="cursor-pointer border-b border-[#2A2A35]/50 hover:bg-[#0A0A0F]/50"
                          onClick={() => handleExpandJob(jid)}
                        >
                          <td className="py-3 pr-4 font-mono text-sm text-white">
                            {String(jid).slice(0, 12)}…
                          </td>
                          <td className="py-3 pr-4 text-sm text-white/80">{state}</td>
                          <td className="py-3 pr-4 text-sm text-white/80">{env}</td>
                          <td className="py-3 pr-4 text-sm text-white/60">
                            {typeof created === 'string'
                              ? new Date(created).toLocaleString()
                              : created}
                          </td>
                          <td className="py-3">
                            {isComplete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadJobOutput(jid)
                                }}
                                className="rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-1.5 text-xs text-[#D4AF37] hover:border-[#D4AF37]/50"
                              >
                                Download
                              </button>
                            )}
                          </td>
                        </tr>
                        {isExpanded && expandedJobDetails && (
                          <tr>
                            <td
                              colSpan={5}
                              className="border-b border-[#2A2A35]/50 bg-[#0A0A0F] p-4"
                            >
                              <pre className="overflow-x-auto text-xs text-white/70">
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
        </section>
      </div>
    </div>
  )
}
