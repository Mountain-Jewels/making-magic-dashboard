/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TabSwitcher } from '@/components/shared/TabSwitcher'
import {
  getActivePlaylist,
  getPlaylists,
  prepareCinematic,
  getClips,
  getBehaviorScripts,
  createBehaviorScript,
  deactivateScript,
  createScheduleSlot,
  deleteScheduleSlot,
  updateSwitchoverConfig,
} from '@/lib/api/cinematic'
import { getEngagementLog } from '@/lib/api/lighting'
import type {
  CinematicPlaylist,
  CinematicClip,
  AvatarBehaviorScript,
  FeedMode,
} from '@/lib/types/cinematic'
import {
  CLIP_STATUS_COLORS,
  PLAYLIST_STATUS_COLORS,
  FEED_MODE_COLORS,
  FEED_MODE_LABELS,
} from '@/lib/types/cinematic'
import type { LightingEngagementRecord } from '@/lib/types/lighting-engine'
import { classifyTimeOfDay, TIME_OF_DAY_LABELS, TIME_OF_DAY_COLORS } from '@/lib/types/lighting-engine'
import { useSwitchoverStore } from '@/lib/stores/switchover-store'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'

const INPUT =
  'w-full bg-surface border border-surface-border rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold'
const BTN_GOLD =
  'rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50 transition-colors'
const BTN_OUTLINE =
  'rounded-md border border-surface-border px-4 py-2 text-sm text-white/70 hover:text-white hover:border-white/30 disabled:opacity-50 transition-colors'

const ENVIRONMENTS = ['landing', 'cave', 'avatar'] as const
const TRIGGER_TYPES = ['time', 'event', 'default'] as const

type PageTab = 'switchover' | 'playlists' | 'scripts' | 'learning'
const TABS: { id: PageTab; label: string }[] = [
  { id: 'switchover', label: 'Live ↔ Cinematic' },
  { id: 'playlists', label: 'Playlists & Clips' },
  { id: 'scripts', label: 'Behavior Scripts' },
  { id: 'learning', label: 'Engagement Learning' },
]

export default function CinematicPage() {
  const [tab, setTab] = useState<PageTab>('switchover')

  const {
    environment, feedMode, feedSince, activePlaylistId, schedule, snapshots, config,
    lightingState, loading, setEnvironment, refreshAll, captureSnapshot,
  } = useSwitchoverStore()

  useEffect(() => { refreshAll() }, [refreshAll])

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-[1200px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Cinematic Pipeline</h1>
            <p className="mt-1 text-sm text-white/50">
              Live streaming ↔ AI-generated cinematic — seamless switchover
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>
            <FeedModeIndicator mode={feedMode} since={feedSince} />
          </div>
        </div>

        {/* Live status bar */}
        <LiveStatusBar />

        <TabSwitcher tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'switchover' && <SwitchoverTab />}
        {tab === 'playlists' && <PlaylistsTab environment={environment} />}
        {tab === 'scripts' && <ScriptsTab />}
        {tab === 'learning' && <LearningTab environment={environment} />}
      </div>
    </div>
  )
}

/* ────────────────────── Feed Mode Indicator ────────────────────── */

function FeedModeIndicator({ mode, since }: { mode: FeedMode; since: string | null }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border bg-surface">
      <span
        className="h-2.5 w-2.5 rounded-full animate-pulse"
        style={{ backgroundColor: FEED_MODE_COLORS[mode] }}
      />
      <span className="text-xs font-medium" style={{ color: FEED_MODE_COLORS[mode] }}>
        {FEED_MODE_LABELS[mode]}
      </span>
      {since && (
        <span className="text-[10px] text-white/25 ml-1">
          since {new Date(since).toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}

/* ────────────────────── Live Status Bar ────────────────────── */

function LiveStatusBar() {
  const { lightingState, environment } = useSwitchoverStore()

  if (!lightingState) return null

  const tod = classifyTimeOfDay(lightingState.sun.elevation)

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 rounded-lg border border-surface-border bg-surface">
      <div className="flex items-center gap-2">
        <div
          className="h-6 w-6 rounded-full border-2 border-surface-border"
          style={{ background: `linear-gradient(135deg, ${TIME_OF_DAY_COLORS[tod]}, ${lightingState.sun.color})` }}
        />
        <div>
          <p className="text-xs font-medium text-white/70">{TIME_OF_DAY_LABELS[tod]}</p>
          <p className="text-[9px] text-white/30">
            Sun: {lightingState.sun.elevation.toFixed(1)}° · {lightingState.sun.color_temperature_k}K · {environment}
          </p>
        </div>
      </div>
      <div className="h-6 w-px bg-surface-border" />
      <div className="text-[10px] text-white/30 space-x-3">
        <span>Intensity: {(lightingState.sun.intensity * 100).toFixed(0)}%</span>
        <span>Fog: {(lightingState.fog.density * 100).toFixed(0)}%</span>
        {lightingState.is_golden_hour && <span className="text-gold">Golden Hour</span>}
        {lightingState.is_night && <span className="text-blue-400">Night</span>}
      </div>
    </div>
  )
}

/* ────────────────────── Switchover Tab ────────────────────── */

function SwitchoverTab() {
  const {
    environment, config, schedule, snapshots, feedMode,
    refreshAll, captureSnapshot,
  } = useSwitchoverStore()
  const sceneState = useSceneStateStore()

  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [newMode, setNewMode] = useState<FeedMode>('cinematic')
  const [newLabel, setNewLabel] = useState('')
  const [pendingDeleteSlot, setPendingDeleteSlot] = useState<string | null>(null)
  const [liveStart, setLiveStart] = useState(config?.live_hours_start ?? '08:00')
  const [liveEnd, setLiveEnd] = useState(config?.live_hours_end ?? '22:00')
  const [autoSwitch, setAutoSwitch] = useState(config?.auto_switchover ?? true)
  const [preGenHours, setPreGenHours] = useState(String(config?.pre_generate_hours ?? 6))
  const [snapshotOnSwitch, setSnapshotOnSwitch] = useState(config?.snapshot_on_switchover ?? true)
  const [capturing, setCapturing] = useState(false)

  const handleCapture = async () => {
    setCapturing(true)
    const snap = await captureSnapshot(
      { avatar: sceneState.avatar, emotion: sceneState.emotion },
      [],
      { camera: sceneState.camera, lighting: sceneState.lighting }
    )
    setCapturing(false)
    if (snap) toast.success(`Snapshot captured: ${snap.id.slice(0, 8)}`)
    else toast.error('Snapshot capture failed')
  }

  const handleAddSlot = async () => {
    if (!newStart || !newEnd) { toast.error('Start and end time required'); return }
    try {
      await createScheduleSlot(environment, newStart, newEnd, newMode, undefined, newLabel || undefined)
      toast.success('Schedule slot added')
      setNewStart('')
      setNewEnd('')
      setNewLabel('')
      refreshAll()
    } catch { toast.error('Failed to add slot') }
  }

  const handleRemoveSlot = async (id: string) => {
    try {
      await deleteScheduleSlot(id)
      toast.success('Slot removed')
      refreshAll()
    } catch { toast.error('Failed to remove slot') }
  }

  const handleSaveConfig = async () => {
    try {
      await updateSwitchoverConfig({
        environment,
        live_hours_start: liveStart,
        live_hours_end: liveEnd,
        auto_switchover: autoSwitch,
        pre_generate_hours: Number(preGenHours) || 6,
        snapshot_on_switchover: snapshotOnSwitch,
      })
      toast.success('Switchover config saved')
      refreshAll()
    } catch { toast.error('Failed to save config') }
  }

  return (
    <div className="space-y-4">
      {/* Visual Timeline */}
      <Card title="24-Hour Timeline">
        <div className="relative h-12 rounded-lg overflow-hidden bg-surface border border-surface-border">
          {Array.from({ length: 24 }).map((_, h) => {
            const isLive = liveStart && liveEnd
              ? h >= parseInt(liveStart) && h < parseInt(liveEnd)
              : h >= 8 && h < 22
            return (
              <div
                key={h}
                className="absolute top-0 bottom-0 border-r border-surface-border/30"
                style={{
                  left: `${(h / 24) * 100}%`,
                  width: `${100 / 24}%`,
                  backgroundColor: isLive ? `${FEED_MODE_COLORS.live}15` : `${FEED_MODE_COLORS.cinematic}15`,
                }}
              >
                <span className="absolute bottom-0.5 left-0.5 text-[7px] text-white/20 font-mono">
                  {h.toString().padStart(2, '0')}
                </span>
              </div>
            )
          })}
          {schedule.map((slot) => {
            const start = new Date(slot.start_time)
            const end = new Date(slot.end_time)
            const startPct = ((start.getHours() + start.getMinutes() / 60) / 24) * 100
            const endPct = ((end.getHours() + end.getMinutes() / 60) / 24) * 100
            return (
              <div
                key={slot.id}
                className="absolute top-1 h-4 rounded-sm opacity-60"
                style={{
                  left: `${startPct}%`,
                  width: `${Math.max(1, endPct - startPct)}%`,
                  backgroundColor: FEED_MODE_COLORS[slot.mode],
                }}
                title={`${slot.label || slot.mode} ${slot.start_time} – ${slot.end_time}`}
              />
            )
          })}
          {/* Current time marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gold z-10"
            style={{ left: `${((new Date().getHours() + new Date().getMinutes() / 60) / 24) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-white/30">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: FEED_MODE_COLORS.live }} /> Live
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: FEED_MODE_COLORS.cinematic }} /> Cinematic
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-0.5 bg-gold" /> Now
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Switchover Config */}
        <Card title="Switchover Configuration">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/50 mb-1">Live Hours Start</label>
                <input type="time" className={INPUT} value={liveStart} onChange={(e) => setLiveStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Live Hours End</label>
                <input type="time" className={INPUT} value={liveEnd} onChange={(e) => setLiveEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Pre-generate (hours before cinematic starts)</label>
              <input type="number" className={INPUT} min={1} max={24} value={preGenHours} onChange={(e) => setPreGenHours(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={autoSwitch} onChange={() => setAutoSwitch(!autoSwitch)} className="rounded border-surface-border bg-surface text-gold focus:ring-gold" />
              Auto-switchover at scheduled times
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={snapshotOnSwitch} onChange={() => setSnapshotOnSwitch(!snapshotOnSwitch)} className="rounded border-surface-border bg-surface text-gold focus:ring-gold" />
              Capture snapshot on switchover
            </label>
            <button onClick={handleSaveConfig} className={BTN_GOLD}>Save Config</button>
          </div>
        </Card>

        {/* Scene Snapshot */}
        <Card title="Scene Snapshots">
          <p className="text-xs text-white/40 mb-3">
            Capture the current 3D state so cinematic clips replicate it exactly.
          </p>
          <button onClick={handleCapture} disabled={capturing} className={`w-full mb-3 ${BTN_GOLD}`}>
            {capturing ? 'Capturing...' : 'Capture Current State'}
          </button>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {snapshots.length === 0 ? (
              <p className="text-xs text-white/25 text-center py-3">No snapshots yet</p>
            ) : snapshots.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-surface border border-surface-border">
                <div>
                  <span className="text-[10px] font-mono text-white/50">{s.id.slice(0, 8)}</span>
                  <span className="text-[10px] text-white/25 ml-2">{s.vm_role}</span>
                </div>
                <span className="text-[9px] text-white/20">{new Date(s.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Schedule Slots */}
      <Card title="Schedule Slots">
        <div className="flex flex-wrap items-end gap-3 mb-4 p-3 rounded-lg bg-surface border border-surface-border">
          <div>
            <label className="block text-xs text-white/50 mb-1">Start</label>
            <input type="datetime-local" className={INPUT} value={newStart} onChange={(e) => setNewStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">End</label>
            <input type="datetime-local" className={INPUT} value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Mode</label>
            <select className={INPUT} value={newMode} onChange={(e) => setNewMode(e.target.value as FeedMode)}>
              <option value="live">Live</option>
              <option value="cinematic">Cinematic</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Label</label>
            <input className={INPUT} placeholder="e.g. Overnight" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          </div>
          <button onClick={handleAddSlot} className={BTN_GOLD}>Add Slot</button>
        </div>
        {schedule.length === 0 ? (
          <p className="text-xs text-white/25 text-center py-3">No schedule slots — using config defaults</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/40 border-b border-surface-border">
                  <th className="pb-2 font-medium">Label</th>
                  <th className="pb-2 font-medium">Start</th>
                  <th className="pb-2 font-medium">End</th>
                  <th className="pb-2 font-medium">Mode</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {schedule.map((s) => (
                  <tr key={s.id} className="border-b border-surface-border/50">
                    <td className="py-2 text-white/70">{s.label || '—'}</td>
                    <td className="py-2 text-white/50 font-mono text-xs">{new Date(s.start_time).toLocaleString()}</td>
                    <td className="py-2 text-white/50 font-mono text-xs">{new Date(s.end_time).toLocaleString()}</td>
                    <td className="py-2">
                      <span className="text-xs font-medium" style={{ color: FEED_MODE_COLORS[s.mode] }}>
                        {FEED_MODE_LABELS[s.mode]}
                      </span>
                    </td>
                    <td className="py-2">
                      <button onClick={() => setPendingDeleteSlot(s.id)} className="text-xs text-red-400/50 hover:text-red-400">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!pendingDeleteSlot}
        title="Remove Schedule Slot"
        message="Are you sure you want to remove this schedule slot? The timeline will update immediately."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (pendingDeleteSlot) handleRemoveSlot(pendingDeleteSlot)
          setPendingDeleteSlot(null)
        }}
        onCancel={() => setPendingDeleteSlot(null)}
      />
    </div>
  )
}

/* ────────────────────── Playlists & Clips Tab ────────────────────── */

function PlaylistsTab({ environment }: { environment: string }) {
  const [activePlaylist, setActivePlaylist] = useState<CinematicPlaylist | null>(null)
  const [clips, setClips] = useState<CinematicClip[]>([])
  const [loadingPlaylist, setLoadingPlaylist] = useState(false)
  const [loadingClips, setLoadingClips] = useState(false)
  const [prepareStartTime, setPrepareStartTime] = useState('')
  const [prepareDuration, setPrepareDuration] = useState(4)
  const [preparing, setPreparing] = useState(false)

  const refresh = useCallback(async () => {
    setLoadingPlaylist(true)
    setLoadingClips(true)
    try {
      const res = await getActivePlaylist(environment)
      if ('id' in res) setActivePlaylist(res as CinematicPlaylist)
      else setActivePlaylist(null)
    } catch { setActivePlaylist(null) }
    finally { setLoadingPlaylist(false) }
    try { setClips(await getClips(environment)) }
    catch { setClips([]) }
    finally { setLoadingClips(false) }
  }, [environment])

  useEffect(() => { refresh() }, [refresh])

  const handlePrepare = async () => {
    if (!prepareStartTime || preparing) return
    setPreparing(true)
    try {
      const res = await prepareCinematic(environment, new Date(prepareStartTime).toISOString(), prepareDuration)
      toast.success(`Playlist ${res.playlist_id.slice(0, 8)} — ${res.clips_generated} clips generated`)
      refresh()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setPreparing(false) }
  }

  return (
    <div className="space-y-4">
      {/* Active Playlist */}
      <Card title="Active Playlist" subtitle={loadingPlaylist ? 'Loading…' : environment}>
        {activePlaylist ? (
          <div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-xs uppercase text-white/50">Start</div>
                <div className="mt-1 text-sm text-white">{new Date(activePlaylist.scheduled_start).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-white/50">End</div>
                <div className="mt-1 text-sm text-white">{new Date(activePlaylist.scheduled_end).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-white/50">Status</div>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: PLAYLIST_STATUS_COLORS[activePlaylist.status] ?? '#9ca3af', backgroundColor: `${PLAYLIST_STATUS_COLORS[activePlaylist.status] ?? '#9ca3af'}22` }}>
                    {activePlaylist.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-white/50">Clips</div>
                <div className="mt-1 text-sm text-gold">{activePlaylist.total_clips}</div>
              </div>
            </div>
            {activePlaylist.clips_preview && activePlaylist.clips_preview.length > 0 && (
              <div className="mt-4">
                <div className="text-xs uppercase text-white/50 mb-2">Preview</div>
                <div className="flex flex-wrap gap-2">
                  {activePlaylist.clips_preview.map((clip) => (
                    <div key={clip.id} className="rounded border border-surface-border bg-surface px-3 py-2 text-xs">
                      <span className="text-white/70">{clip.time_block ?? '—'}</span>
                      <span className="ml-2"><StatusBadge status={clip.status} /></span>
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

      {/* Prepare */}
      <Card title="Prepare Cinematic Period">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/50">Start Time</label>
            <input type="datetime-local" className={INPUT} value={prepareStartTime} onChange={(e) => setPrepareStartTime(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Duration (hours)</label>
            <input type="number" min={1} max={24} className="w-20 bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm" value={prepareDuration} onChange={(e) => setPrepareDuration(Number(e.target.value) || 4)} />
          </div>
          <button onClick={handlePrepare} disabled={preparing || !prepareStartTime} className={BTN_GOLD}>
            {preparing ? 'Preparing…' : 'Prepare'}
          </button>
        </div>
      </Card>

      {/* Clips */}
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
                  <th className="pb-2 pr-4">API</th>
                  <th className="pb-2 pr-4">Duration</th>
                  <th className="pb-2">Video</th>
                </tr>
              </thead>
              <tbody>
                {clips.map((clip) => (
                  <tr key={clip.id} className="border-b border-surface-border/50">
                    <td className="py-2 pr-4 font-mono text-white">{clip.id.slice(0, 8)}…</td>
                    <td className="py-2 pr-4 text-white/70">{clip.time_block ?? '—'}</td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: CLIP_STATUS_COLORS[clip.status] ?? '#9ca3af', backgroundColor: `${CLIP_STATUS_COLORS[clip.status] ?? '#9ca3af'}22` }}>
                        {clip.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-white/50 capitalize">{clip.generation_api ?? '—'}</td>
                    <td className="py-2 pr-4 text-white/60">{clip.duration_sec != null ? `${clip.duration_sec}s` : '—'}</td>
                    <td className="py-2 text-white/50 max-w-[150px] truncate">
                      {clip.video_url ? (
                        <a href={clip.video_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">View</a>
                      ) : '—'}
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

/* ────────────────────── Behavior Scripts Tab ────────────────────── */

function ScriptsTab() {
  const [scripts, setScripts] = useState<AvatarBehaviorScript[]>([])
  const [loading, setLoading] = useState(true)
  const [scriptName, setScriptName] = useState('')
  const [scriptTriggerType, setScriptTriggerType] = useState<string>('time')
  const [scriptTimeline, setScriptTimeline] = useState('')
  const [scriptEnvs, setScriptEnvs] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try { setScripts(await getBehaviorScripts(false)) }
    catch { toast.error('Failed to load scripts') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleCreate = async () => {
    if (!scriptName.trim() || !scriptTimeline.trim() || creating) return
    let timeline: Record<string, unknown>[]
    try { timeline = JSON.parse(scriptTimeline); if (!Array.isArray(timeline)) throw 0 }
    catch { toast.error('Action timeline must be valid JSON array'); return }
    setCreating(true)
    try {
      await createBehaviorScript(scriptName.trim(), scriptTriggerType, timeline, scriptEnvs.size > 0 ? Array.from(scriptEnvs) : undefined)
      toast.success('Script created')
      setScriptName(''); setScriptTimeline(''); setScriptEnvs(new Set())
      refresh()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setCreating(false) }
  }

  const handleDeactivate = async (id: string) => {
    if (deactivatingId) return
    setDeactivatingId(id)
    try { await deactivateScript(id); toast.success('Deactivated'); refresh() }
    catch { toast.error('Failed') }
    finally { setDeactivatingId(null) }
  }

  return (
    <div className="space-y-4">
      <Card title="Behavior Scripts">
        {loading ? (
          <div className="py-6 text-center text-sm text-white/40">Loading…</div>
        ) : scripts.length === 0 ? (
          <div className="py-6 text-center text-sm text-white/40">No scripts</div>
        ) : (
          <div className="mb-4 overflow-x-auto">
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
                    <td className="py-2 pr-4 text-white/60">{s.applicable_environments?.join(', ') ?? 'all'}</td>
                    <td className="py-2 pr-4"><StatusBadge status={s.is_active ? 'active' : 'offline'} /></td>
                    <td className="py-2">
                      {s.is_active && (
                        <button onClick={() => handleDeactivate(s.id)} disabled={!!deactivatingId} className="rounded-md border border-surface-border px-3 py-1 text-xs text-error hover:border-error/50 disabled:opacity-50">
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

      <Card title="Create Script">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/50">Name</label>
              <input type="text" className="w-48 bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm" value={scriptName} onChange={(e) => setScriptName(e.target.value)} placeholder="Script name" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Trigger</label>
              <select className="bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm" value={scriptTriggerType} onChange={(e) => setScriptTriggerType(e.target.value)}>
                {TRIGGER_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Action Timeline (JSON array)</label>
            <textarea value={scriptTimeline} onChange={(e) => setScriptTimeline(e.target.value)} placeholder='[{"type": "wave", "duration": 3}]' rows={4} className="w-full bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Environments</label>
            <div className="flex gap-3">
              {ENVIRONMENTS.map((env) => (
                <label key={env} className="flex items-center gap-1.5 text-sm text-white/70">
                  <input type="checkbox" checked={scriptEnvs.has(env)} onChange={() => setScriptEnvs((p) => { const n = new Set(p); n.has(env) ? n.delete(env) : n.add(env); return n })} className="rounded border-surface-border bg-surface text-gold focus:ring-gold" />
                  {env}
                </label>
              ))}
            </div>
          </div>
          <button onClick={handleCreate} disabled={creating || !scriptName.trim() || !scriptTimeline.trim()} className={BTN_GOLD}>
            {creating ? 'Creating…' : 'Create Script'}
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ────────────────────── Engagement Learning Tab ────────────────────── */

function LearningTab({ environment }: { environment: string }) {
  const [logs, setLogs] = useState<LightingEngagementRecord[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try { setLogs(await getEngagementLog(environment)) }
    catch { setLogs([]) }
    finally { setLoading(false) }
  }, [environment])

  useEffect(() => { refresh() }, [refresh])

  const avgConversion = logs.length > 0
    ? logs.reduce((sum, l) => sum + (l.conversion_rate ?? 0), 0) / logs.length
    : 0
  const avgDuration = logs.length > 0
    ? logs.reduce((sum, l) => sum + (l.avg_session_duration_sec ?? 0), 0) / logs.length
    : 0
  const avgBounce = logs.length > 0
    ? logs.reduce((sum, l) => sum + (l.bounce_rate ?? 0), 0) / logs.length
    : 0

  return (
    <div className="space-y-4">
      <Card title="Engagement Intelligence">
        <p className="text-xs text-white/40 mb-4">
          The lighting engine learns from customer engagement — which time-of-day, lighting conditions, and scene configurations
          drive the best conversion rates. This data feeds back into both live and cinematic content.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-surface border border-surface-border text-center">
            <p className="text-[10px] text-white/30 uppercase">Avg Conversion</p>
            <p className="text-xl font-semibold text-gold mt-1">{(avgConversion * 100).toFixed(1)}%</p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-surface-border text-center">
            <p className="text-[10px] text-white/30 uppercase">Avg Session Duration</p>
            <p className="text-xl font-semibold text-white/70 mt-1">{avgDuration.toFixed(0)}s</p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-surface-border text-center">
            <p className="text-[10px] text-white/30 uppercase">Avg Bounce Rate</p>
            <p className="text-xl font-semibold text-white/50 mt-1">{(avgBounce * 100).toFixed(1)}%</p>
          </div>
        </div>
      </Card>

      <Card title="Engagement Log">
        {loading ? (
          <div className="py-8 text-center text-sm text-white/40">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-sm text-white/40">No engagement data yet — the system learns as customers interact</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs uppercase text-white/50">
                  <th className="pb-2 pr-4">Timestamp</th>
                  <th className="pb-2 pr-4">Env</th>
                  <th className="pb-2 pr-4">Session Dur</th>
                  <th className="pb-2 pr-4">Conversion</th>
                  <th className="pb-2">Bounce</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-surface-border/50 text-white/70">
                    <td className="py-2 pr-4 text-white/40 text-xs font-mono">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2 pr-4">{l.vm_role}</td>
                    <td className="py-2 pr-4 font-mono">{l.avg_session_duration_sec?.toFixed(0) ?? '—'}s</td>
                    <td className="py-2 pr-4 font-mono text-gold">{l.conversion_rate != null ? `${(l.conversion_rate * 100).toFixed(1)}%` : '—'}</td>
                    <td className="py-2 font-mono">{l.bounce_rate != null ? `${(l.bounce_rate * 100).toFixed(1)}%` : '—'}</td>
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
