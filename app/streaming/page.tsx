/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/lib/auth/useAuth'
import {
  createPixelStreamSession,
  deletePixelStreamSession,
  getCapacity,
  getExperience,
  listSessions,
  stopSession,
} from '@/lib/api/streaming'
import type { CapacityResponse, CreatePixelStreamSessionBody } from '@/lib/api/streaming'

const ENVIRONMENTS = ['landing', 'cave', 'avatar'] as const

interface StreamSessionRow {
  session_id: string
  environment?: string
  status: string
  created_at?: string
}

export default function StreamingPage() {
  const { getRoles } = useAuth()
  const [role, setRole] = useState<'admin' | 'user' | 'unknown'>('unknown')
  const [loadingRole, setLoadingRole] = useState(true)
  const [capacity, setCapacity] = useState<CapacityResponse | null>(null)
  const [sessions, setSessions] = useState<StreamSessionRow[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createProductId, setCreateProductId] = useState('')
  const [createEnvironment, setCreateEnvironment] = useState<string>('landing')
  const [experienceProductId, setExperienceProductId] = useState('')
  const [experienceResult, setExperienceResult] = useState<{
    mode: 'streaming' | 'fallback'
    stream_url?: string
    fallback_url?: string
  } | null>(null)
  const [checkingExperience, setCheckingExperience] = useState(false)
  const [stoppingId, setStoppingId] = useState<string | null>(null)
  const [closingId, setClosingId] = useState<string | null>(null)

  useEffect(() => {
    void getRoles().then((roles) => {
      setRole(roles.includes('admin') ? 'admin' : 'user')
      setLoadingRole(false)
    })
  }, [getRoles])

  const refreshCapacity = useCallback(async () => {
    try {
      const data = await getCapacity()
      setCapacity(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load capacity'
      toast.error(msg)
    }
  }, [])

  const refreshSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      const data = await listSessions()
      setSessions(
        data.map((s) => ({
          session_id: s.session_id,
          environment: s.environment,
          status: s.status,
          created_at: s.created_at,
        }))
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load sessions'
      toast.error(msg)
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  useEffect(() => {
    void refreshCapacity()
  }, [refreshCapacity])

  useEffect(() => {
    const interval = setInterval(refreshCapacity, 15_000)
    return () => clearInterval(interval)
  }, [refreshCapacity])

  useEffect(() => {
    void refreshSessions()
  }, [refreshSessions])

  const handleCreateSession = async () => {
    if (creating) return
    setCreating(true)
    try {
      const body: CreatePixelStreamSessionBody = {}
      if (createProductId.trim()) body.product_id = createProductId.trim()
      if (createEnvironment) body.environment = createEnvironment
      const res = await createPixelStreamSession(body)
      if (!res) throw new Error('Session creation returned empty')
      toast.success(`Session created: ${res.session_id}`)
      setSessions((prev) => [
        ...prev,
        {
          session_id: res.session_id,
          environment: createEnvironment,
          status: res.status,
          created_at: new Date().toISOString(),
        },
      ])
      void refreshCapacity()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create session'
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleStopSession = async (sessionId: string) => {
    if (stoppingId) return
    setStoppingId(sessionId)
    try {
      await stopSession(sessionId)
      toast.success('Session stopped')
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
      void refreshCapacity()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to stop session'
      toast.error(msg)
    } finally {
      setStoppingId(null)
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    if (closingId) return
    setClosingId(sessionId)
    try {
      await deletePixelStreamSession(sessionId)
      toast.success('Session closed')
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
      void refreshCapacity()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to close session'
      toast.error(msg)
    } finally {
      setClosingId(null)
    }
  }

  const handleCheckExperience = async () => {
    if (!experienceProductId.trim() || checkingExperience) return
    setCheckingExperience(true)
    setExperienceResult(null)
    try {
      const res = await getExperience(experienceProductId.trim())
      setExperienceResult(res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to check experience'
      toast.error(msg)
    } finally {
      setCheckingExperience(false)
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
          <h1 className="text-2xl font-semibold text-white">Pixel Streaming</h1>
          <p className="mt-1 text-sm text-white/50">
            Session management, capacity monitoring, dual-mode preview
          </p>
        </div>

        {/* Capacity Overview */}
        <section className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Capacity Overview</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-[#2A2A35] bg-[#0A0A0F] p-4">
              <div className="text-xs uppercase text-white/50">Total Nodes</div>
              <div className="mt-1 text-2xl font-semibold text-[#D4AF37]">
                {capacity?.total_nodes ?? '—'}
              </div>
            </div>
            <div className="rounded-lg border border-[#2A2A35] bg-[#0A0A0F] p-4">
              <div className="text-xs uppercase text-white/50">Available</div>
              <div className="mt-1 text-2xl font-semibold text-[#D4AF37]">
                {capacity?.available_nodes ?? '—'}
              </div>
            </div>
            <div className="rounded-lg border border-[#2A2A35] bg-[#0A0A0F] p-4">
              <div className="text-xs uppercase text-white/50">Active Sessions</div>
              <div className="mt-1 text-2xl font-semibold text-[#D4AF37]">
                {capacity?.active_sessions ?? '—'}
              </div>
            </div>
            <div className="rounded-lg border border-[#2A2A35] bg-[#0A0A0F] p-4">
              <div className="text-xs uppercase text-white/50">Max Sessions</div>
              <div className="mt-1 text-2xl font-semibold text-[#D4AF37]">
                {capacity?.max_sessions ?? capacity?.total_nodes ?? '—'}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-white/40">Auto-refresh every 15s</p>
        </section>

        {/* Sessions Table */}
        <section className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Sessions</h2>
          {loadingSessions ? (
            <div className="py-8 text-center text-white/50">Loading sessions…</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-white/50">No active sessions</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A35] text-left text-xs uppercase text-white/50">
                    <th className="pb-3 pr-4">Session ID</th>
                    <th className="pb-3 pr-4">Environment</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Created</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.session_id} className="border-b border-[#2A2A35]/50">
                      <td className="py-3 pr-4 font-mono text-sm text-white">
                        {s.session_id.slice(0, 8)}…
                      </td>
                      <td className="py-3 pr-4 text-sm text-white/80">
                        {s.environment ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-sm text-white/80">{s.status}</td>
                      <td className="py-3 pr-4 text-sm text-white/60">
                        {s.created_at
                          ? new Date(s.created_at).toLocaleString()
                          : '—'}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStopSession(s.session_id)}
                            disabled={!!stoppingId}
                            className="rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-1.5 text-xs text-white hover:border-[#D4AF37]/50 disabled:opacity-50"
                          >
                            Stop
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCloseSession(s.session_id)}
                            disabled={!!closingId}
                            className="rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-1.5 text-xs text-white hover:border-[#D4AF37]/50 disabled:opacity-50"
                          >
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Create Session */}
        <section className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Create Session</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/50">Product ID (optional)</label>
              <input
                type="text"
                value={createProductId}
                onChange={(e) => setCreateProductId(e.target.value)}
                placeholder="product-id"
                className="w-48 rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Environment</label>
              <select
                value={createEnvironment}
                onChange={(e) => setCreateEnvironment(e.target.value)}
                className="rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white"
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleCreateSession}
              disabled={creating}
              className="rounded bg-[#D4AF37] px-4 py-2 text-sm font-medium text-[#0A0A0F] hover:bg-[#D4AF37]/90 disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
        </section>

        {/* Experience Check */}
        <section className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Experience Check</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/50">Product ID</label>
              <input
                type="text"
                value={experienceProductId}
                onChange={(e) => setExperienceProductId(e.target.value)}
                placeholder="product-id"
                className="w-48 rounded border border-[#2A2A35] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-white/30"
              />
            </div>
            <button
              type="button"
              onClick={handleCheckExperience}
              disabled={checkingExperience || !experienceProductId.trim()}
              className="rounded bg-[#D4AF37] px-4 py-2 text-sm font-medium text-[#0A0A0F] hover:bg-[#D4AF37]/90 disabled:opacity-50"
            >
              {checkingExperience ? 'Checking…' : 'Check'}
            </button>
          </div>
          {experienceResult && (
            <div className="mt-4 rounded-lg border border-[#2A2A35] bg-[#0A0A0F] p-4">
              <div className="text-sm text-white">
                Mode:{' '}
                <span className="font-medium text-[#D4AF37]">{experienceResult.mode}</span>
              </div>
              {experienceResult.stream_url && (
                <div className="mt-2 text-xs text-white/70">
                  Stream URL: {experienceResult.stream_url}
                </div>
              )}
              {experienceResult.fallback_url && (
                <div className="mt-1 text-xs text-white/70">
                  Fallback URL: {experienceResult.fallback_url}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
