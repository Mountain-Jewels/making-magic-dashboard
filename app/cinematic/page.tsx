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
  getActivePlaylist,
  getPlaylists,
  prepareCinematic,
  getClips,
  getBehaviorScripts,
  createBehaviorScript,
  deactivateScript,
} from '@/lib/api/cinematic'
import type {
  CinematicPlaylist,
  CinematicClip,
  AvatarBehaviorScript,
} from '@/lib/types/cinematic'
import { CLIP_STATUS_COLORS, PLAYLIST_STATUS_COLORS } from '@/lib/types/cinematic'

const ENVIRONMENTS = ['landing', 'cave', 'avatar'] as const
const TRIGGER_TYPES = ['time', 'event', 'default'] as const

export default function CinematicPage() {
  const [environment, setEnvironment] = useState<string>('landing')
  const [activePlaylist, setActivePlaylist] = useState<CinematicPlaylist | null>(null)
  const [loadingPlaylist, setLoadingPlaylist] = useState(false)
  const [clips, setClips] = useState<CinematicClip[]>([])
  const [loadingClips, setLoadingClips] = useState(false)
  const [scripts, setScripts] = useState<AvatarBehaviorScript[]>([])
  const [loadingScripts, setLoadingScripts] = useState(false)

  const [prepareStartTime, setPrepareStartTime] = useState('')
  const [prepareDuration, setPrepareDuration] = useState(4)
  const [preparing, setPreparing] = useState(false)

  const [scriptName, setScriptName] = useState('')
  const [scriptTriggerType, setScriptTriggerType] = useState<string>('time')
  const [scriptTimeline, setScriptTimeline] = useState('')
  const [scriptEnvironments, setScriptEnvironments] = useState<Set<string>>(new Set())
  const [creatingScript, setCreatingScript] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  const refreshPlaylist = useCallback(async () => {
    setLoadingPlaylist(true)
    try {
      const res = await getActivePlaylist(environment)
      if ('id' in res) {
        setActivePlaylist(res as CinematicPlaylist)
      } else {
        setActivePlaylist(null)
      }
    } catch {
      setActivePlaylist(null)
    } finally {
      setLoadingPlaylist(false)
    }
  }, [environment])

  const refreshClips = useCallback(async () => {
    setLoadingClips(true)
    try {
      setClips(await getClips(environment))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load clips')
    } finally {
      setLoadingClips(false)
    }
  }, [environment])

  const refreshScripts = useCallback(async () => {
    setLoadingScripts(true)
    try {
      setScripts(await getBehaviorScripts(false))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load scripts')
    } finally {
      setLoadingScripts(false)
    }
  }, [])

  useEffect(() => {
    void refreshPlaylist()
    void refreshClips()
    void refreshScripts()
  }, [refreshPlaylist, refreshClips, refreshScripts])

  const handlePrepare = async () => {
    if (!prepareStartTime || preparing) return
    setPreparing(true)
    try {
      const res = await prepareCinematic(
        environment,
        new Date(prepareStartTime).toISOString(),
        prepareDuration,
      )
      toast.success(`Playlist ${res.playlist_id} — ${res.clips_generated} clips generated`)
      void refreshPlaylist()
      void refreshClips()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to prepare cinematic')
    } finally {
      setPreparing(false)
    }
  }

  const handleCreateScript = async () => {
    if (!scriptName.trim() || !scriptTimeline.trim() || creatingScript) return
    let timeline: Record<string, unknown>[]
    try {
      timeline = JSON.parse(scriptTimeline)
      if (!Array.isArray(timeline)) throw new Error('Must be an array')
    } catch {
      toast.error('Action timeline must be valid JSON array')
      return
    }
    setCreatingScript(true)
    try {
      const envs = scriptEnvironments.size > 0 ? Array.from(scriptEnvironments) : undefined
      await createBehaviorScript(scriptName.trim(), scriptTriggerType, timeline, envs)
      toast.success('Script created')
      setScriptName('')
      setScriptTimeline('')
      setScriptEnvironments(new Set())
      void refreshScripts()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create script')
    } finally {
      setCreatingScript(false)
    }
  }

  const handleDeactivate = async (scriptId: string) => {
    if (deactivatingId) return
    setDeactivatingId(scriptId)
    try {
      await deactivateScript(scriptId)
      toast.success('Script deactivated')
      void refreshScripts()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate script')
    } finally {
      setDeactivatingId(null)
    }
  }

  const toggleScriptEnv = (env: string) => {
    setScriptEnvironments((prev) => {
      const next = new Set(prev)
      if (next.has(env)) next.delete(env)
      else next.add(env)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Cinematic Pipeline</h1>
          <p className="mt-1 text-sm text-white/50">
            Playlists, clips, behavior scripts — Runway Gen-3 powered
          </p>
        </div>

        {/* Environment Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/60">Environment:</label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
          >
            {ENVIRONMENTS.map((env) => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
        </div>

        {/* Active Playlist */}
        <Card title="Active Playlist" subtitle={loadingPlaylist ? 'Loading…' : environment}>
          {activePlaylist ? (
            <div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="text-xs uppercase text-white/50">Scheduled Start</div>
                  <div className="mt-1 text-sm text-white">
                    {new Date(activePlaylist.scheduled_start).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-white/50">Scheduled End</div>
                  <div className="mt-1 text-sm text-white">
                    {new Date(activePlaylist.scheduled_end).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-white/50">Status</div>
                  <div className="mt-1">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        color: PLAYLIST_STATUS_COLORS[activePlaylist.status] ?? '#9ca3af',
                        backgroundColor: `${PLAYLIST_STATUS_COLORS[activePlaylist.status] ?? '#9ca3af'}22`,
                      }}
                    >
                      {activePlaylist.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-white/50">Total Clips</div>
                  <div className="mt-1 text-sm text-gold">{activePlaylist.total_clips}</div>
                </div>
              </div>
              {activePlaylist.clips_preview && activePlaylist.clips_preview.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs uppercase text-white/50 mb-2">Clips Preview</div>
                  <div className="flex flex-wrap gap-2">
                    {activePlaylist.clips_preview.map((clip) => (
                      <div
                        key={clip.id}
                        className="rounded border border-surface-border bg-surface px-3 py-2 text-xs"
                      >
                        <span className="text-white/70">{clip.time_block ?? '—'}</span>
                        <span className="ml-2">
                          <StatusBadge status={clip.status} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-sm text-white/40">No active playlist</div>
          )}
        </Card>

        {/* Prepare Cinematic */}
        <Card title="Prepare Cinematic">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/50">Start Time</label>
              <input
                type="datetime-local"
                value={prepareStartTime}
                onChange={(e) => setPrepareStartTime(e.target.value)}
                className="bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Duration (hours)</label>
              <input
                type="number"
                min={1}
                max={24}
                value={prepareDuration}
                onChange={(e) => setPrepareDuration(Number(e.target.value) || 4)}
                className="w-20 bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handlePrepare}
              disabled={preparing || !prepareStartTime}
              className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50"
            >
              {preparing ? 'Preparing…' : 'Prepare'}
            </button>
          </div>
        </Card>

        {/* Clips Table */}
        <Card title="Clips">
          {loadingClips ? (
            <div className="py-8 text-center text-sm text-white/40">Loading…</div>
          ) : clips.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/40">No clips</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs uppercase text-white/50">
                    <th className="pb-2 pr-4">ID</th>
                    <th className="pb-2 pr-4">Time Block</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Duration</th>
                    <th className="pb-2">Video URL</th>
                  </tr>
                </thead>
                <tbody>
                  {clips.map((clip) => (
                    <tr key={clip.id} className="border-b border-surface-border/50">
                      <td className="py-2 pr-4 font-mono text-white">
                        {clip.id.slice(0, 8)}…
                      </td>
                      <td className="py-2 pr-4 text-white/70">{clip.time_block ?? '—'}</td>
                      <td className="py-2 pr-4">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            color: CLIP_STATUS_COLORS[clip.status] ?? '#9ca3af',
                            backgroundColor: `${CLIP_STATUS_COLORS[clip.status] ?? '#9ca3af'}22`,
                          }}
                        >
                          {clip.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-white/60">
                        {clip.duration_sec != null ? `${clip.duration_sec}s` : '—'}
                      </td>
                      <td className="py-2 text-white/50 max-w-[200px] truncate">
                        {clip.video_url ? (
                          <a
                            href={clip.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Behavior Scripts */}
        <Card title="Behavior Scripts">
          {loadingScripts ? (
            <div className="py-6 text-center text-sm text-white/40">Loading…</div>
          ) : scripts.length === 0 ? (
            <div className="py-6 text-center text-sm text-white/40">No scripts</div>
          ) : (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs uppercase text-white/50">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Trigger</th>
                    <th className="pb-2 pr-4">Environments</th>
                    <th className="pb-2 pr-4">Active</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scripts.map((s) => (
                    <tr key={s.id} className="border-b border-surface-border/50">
                      <td className="py-2 pr-4 text-white">{s.script_name}</td>
                      <td className="py-2 pr-4 text-white/70">{s.trigger_type}</td>
                      <td className="py-2 pr-4 text-white/60">
                        {s.applicable_environments?.join(', ') ?? 'all'}
                      </td>
                      <td className="py-2 pr-4">
                        <StatusBadge status={s.is_active ? 'active' : 'offline'} />
                      </td>
                      <td className="py-2">
                        {s.is_active && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(s.id)}
                            disabled={!!deactivatingId}
                            className="rounded-md border border-surface-border px-3 py-1 text-xs text-error hover:border-error/50 disabled:opacity-50"
                          >
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

          {/* Create Script Form */}
          <div className="rounded-lg border border-surface-border bg-surface p-4">
            <h4 className="mb-3 text-sm font-medium text-white">Create Script</h4>
            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Name</label>
                  <input
                    type="text"
                    value={scriptName}
                    onChange={(e) => setScriptName(e.target.value)}
                    placeholder="Script name"
                    className="w-48 bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Trigger Type</label>
                  <select
                    value={scriptTriggerType}
                    onChange={(e) => setScriptTriggerType(e.target.value)}
                    className="bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
                  >
                    {TRIGGER_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">
                  Action Timeline (JSON array)
                </label>
                <textarea
                  value={scriptTimeline}
                  onChange={(e) => setScriptTimeline(e.target.value)}
                  placeholder='[{"type": "wave", "duration": 3}]'
                  rows={4}
                  className="w-full bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Environments</label>
                <div className="flex gap-3">
                  {ENVIRONMENTS.map((env) => (
                    <label key={env} className="flex items-center gap-1.5 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={scriptEnvironments.has(env)}
                        onChange={() => toggleScriptEnv(env)}
                        className="rounded border-surface-border bg-surface text-gold focus:ring-gold"
                      />
                      {env}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateScript}
                disabled={creatingScript || !scriptName.trim() || !scriptTimeline.trim()}
                className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50"
              >
                {creatingScript ? 'Creating…' : 'Create Script'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
