/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  createPixelStreamSession,
  deletePixelStreamSession,
  stopSession,
  getCapacity,
  listSessions,
  getExperience,
} from '@/lib/api/streaming'
import type {
  CapacityResponse,
  CreatePixelStreamSessionBody,
  ExperienceResponse,
  PixelStreamSession,
} from '@/lib/api/streaming'
import { useSwitchoverStore } from '@/lib/stores/switchover-store'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { FEED_MODE_COLORS, FEED_MODE_LABELS } from '@/lib/types/cinematic'

const ENVIRONMENTS = ['landing', 'cave', 'avatar'] as const

export default function StreamingPage() {
  const [capacity, setCapacity] = useState<CapacityResponse | null>(null)
  const [sessions, setSessions] = useState<PixelStreamSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createProductId, setCreateProductId] = useState('')
  const [createEnvironment, setCreateEnvironment] = useState<string>('landing')
  const [experienceProductId, setExperienceProductId] = useState('')
  const [experienceResult, setExperienceResult] = useState<ExperienceResponse | null>(null)
  const [checkingExperience, setCheckingExperience] = useState(false)
  const [stoppingId, setStoppingId] = useState<string | null>(null)
  const [closingId, setClosingId] = useState<string | null>(null)

  const refreshCapacity = useCallback(async () => {
    try {
      setCapacity(await getCapacity())
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load capacity')
    }
  }, [])

  const refreshSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      setSessions(await listSessions())
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  useEffect(() => {
    void refreshCapacity()
    void refreshSessions()
    const interval = setInterval(refreshCapacity, 15_000)
    return () => clearInterval(interval)
  }, [refreshCapacity, refreshSessions])

  const handleCreateSession = async () => {
    if (creating) return
    setCreating(true)
    try {
      const body: CreatePixelStreamSessionBody = {}
      if (createProductId.trim()) body.product_id = createProductId.trim()
      if (createEnvironment) body.environment = createEnvironment
      const res = await createPixelStreamSession(body)
      toast.success(`Session created: ${res.session_id}`)
      void refreshSessions()
      void refreshCapacity()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create session')
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
      void refreshSessions()
      void refreshCapacity()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to stop session')
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
      void refreshSessions()
      void refreshCapacity()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to close session')
    } finally {
      setClosingId(null)
    }
  }

  const handleCheckExperience = async () => {
    if (!experienceProductId.trim() || checkingExperience) return
    setCheckingExperience(true)
    setExperienceResult(null)
    try {
      setExperienceResult(await getExperience(experienceProductId.trim()))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to check experience')
    } finally {
      setCheckingExperience(false)
    }
  }

  const capacityCards: { label: string; value: number | string }[] = [
    { label: 'Total Nodes', value: capacity?.total_nodes ?? '—' },
    { label: 'Available', value: capacity?.available_nodes ?? '—' },
    { label: 'Active Sessions', value: capacity?.active_sessions ?? '—' },
    { label: 'Max Sessions', value: capacity?.max_sessions ?? '—' },
  ]

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pixel Streaming</h1>
          <p className="mt-1 text-sm text-white/50">
            Session management, capacity, dual-mode preview
          </p>
        </div>

        {/* Switchover Status */}
        <StreamSwitchoverBar />

        {/* Capacity Cards */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Capacity</h2>
            <span className="text-xs text-white/40">Auto-refresh 15s</span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {capacityCards.map(({ label, value }) => (
              <Card key={label}>
                <div className="text-xs uppercase text-white/50">{label}</div>
                <div className="mt-1 text-2xl font-semibold text-gold">{value}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Sessions Table */}
        <Card title="Sessions">
          {loadingSessions ? (
            <div className="py-8 text-center text-sm text-white/40">Loading sessions…</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/40">No active sessions</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs uppercase text-white/50">
                    <th className="pb-2 pr-4">Session ID</th>
                    <th className="pb-2 pr-4">Environment</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Created</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.session_id} className="border-b border-surface-border/50">
                      <td className="py-2.5 pr-4 font-mono text-white">
                        {s.session_id.slice(0, 8)}…
                      </td>
                      <td className="py-2.5 pr-4 text-white/70">{s.environment ?? '—'}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-2.5 pr-4 text-white/50">
                        {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStopSession(s.session_id)}
                            disabled={!!stoppingId}
                            className="rounded-md border border-surface-border px-3 py-1 text-xs text-white hover:border-gold/50 disabled:opacity-50"
                          >
                            Stop
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCloseSession(s.session_id)}
                            disabled={!!closingId}
                            className="rounded-md border border-surface-border px-3 py-1 text-xs text-white hover:border-gold/50 disabled:opacity-50"
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
        </Card>

        {/* Create Session */}
        <Card title="Create Session">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/50">Product ID (optional)</label>
              <input
                type="text"
                value={createProductId}
                onChange={(e) => setCreateProductId(e.target.value)}
                placeholder="product-id"
                className="w-48 bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Environment</label>
              <select
                value={createEnvironment}
                onChange={(e) => setCreateEnvironment(e.target.value)}
                className="bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleCreateSession}
              disabled={creating}
              className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
        </Card>

        {/* Experience Check */}
        <Card title="Experience Check">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/50">Product ID</label>
              <input
                type="text"
                value={experienceProductId}
                onChange={(e) => setExperienceProductId(e.target.value)}
                placeholder="product-id"
                className="w-48 bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleCheckExperience}
              disabled={checkingExperience || !experienceProductId.trim()}
              className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50"
            >
              {checkingExperience ? 'Checking…' : 'Check'}
            </button>
          </div>
          {experienceResult && (
            <div className="mt-4 rounded-lg border border-surface-border bg-surface p-4">
              <div className="text-sm text-white">
                Mode: <span className="font-medium text-gold">{experienceResult.mode}</span>
              </div>
              {experienceResult.stream_url && (
                <div className="mt-2 text-xs text-white/60 break-all">
                  Stream URL: {experienceResult.stream_url}
                </div>
              )}
              {experienceResult.fallback_url && (
                <div className="mt-1 text-xs text-white/60 break-all">
                  Fallback URL: {experienceResult.fallback_url}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ────────────────────── Switchover Status Bar ────────────────────── */

function StreamSwitchoverBar() {
  const { feedMode, feedSince, environment, refreshFeedMode, captureSnapshot, lightingState, refreshLighting } = useSwitchoverStore()
  const sceneState = useSceneStateStore()
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    refreshFeedMode()
    refreshLighting()
    const interval = setInterval(() => { refreshFeedMode(); refreshLighting() }, 30_000)
    return () => clearInterval(interval)
  }, [refreshFeedMode, refreshLighting])

  const handleSnapshot = async () => {
    setCapturing(true)
    const snap = await captureSnapshot(
      { avatar: sceneState.avatar, emotion: sceneState.emotion },
      [],
      { camera: sceneState.camera, lighting: sceneState.lighting }
    )
    setCapturing(false)
    if (snap) toast.success(`Snapshot: ${snap.id.slice(0, 8)}`)
    else toast.error('Snapshot failed')
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-surface-border bg-surface">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full animate-pulse" style={{ backgroundColor: FEED_MODE_COLORS[feedMode] }} />
        <span className="text-sm font-medium" style={{ color: FEED_MODE_COLORS[feedMode] }}>
          {FEED_MODE_LABELS[feedMode]}
        </span>
        {feedSince && <span className="text-[10px] text-white/25">since {new Date(feedSince).toLocaleTimeString()}</span>}
      </div>
      <div className="h-5 w-px bg-surface-border" />
      <span className="text-xs text-white/40 capitalize">{environment}</span>
      {lightingState && (
        <>
          <div className="h-5 w-px bg-surface-border" />
          <span className="text-xs text-white/30">
            Sun {lightingState.sun.elevation.toFixed(0)}° · {lightingState.is_golden_hour ? 'Golden Hour' : lightingState.is_night ? 'Night' : 'Day'}
          </span>
        </>
      )}
      <div className="ml-auto">
        <button onClick={handleSnapshot} disabled={capturing} className="px-3 py-1.5 bg-gold/10 text-gold text-xs rounded hover:bg-gold/20 transition-colors disabled:opacity-40">
          {capturing ? 'Capturing…' : 'Capture Snapshot'}
        </button>
      </div>
    </div>
  )
}
