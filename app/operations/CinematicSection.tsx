/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  deactivateScript,
  getActivePlaylist,
  getBehaviorScripts,
  getPlaylists,
  prepareCinematic,
} from '@/lib/api/cinematic'
import type { AvatarBehaviorScript, CinematicPlaylist } from '@/lib/types/cinematic'
import { PLAYLIST_STATUS_COLORS } from '@/lib/types/cinematic'

const ENVS = ['landing', 'cave'] as const

export function CinematicSection() {
  const [selectedEnv, setSelectedEnv] = useState<string>('landing')
  const [playlists, setPlaylists] = useState<CinematicPlaylist[]>([])
  const [activePlaylist, setActivePlaylist] = useState<CinematicPlaylist | null>(null)
  const [scripts, setScripts] = useState<AvatarBehaviorScript[]>([])
  const [preparing, setPreparing] = useState(false)
  const [deactivating, setDeactivating] = useState<string | null>(null)

  const [prepareStart, setPrepareStart] = useState('')
  const [prepareDuration, setPrepareDuration] = useState(6)

  const loadData = useCallback(async () => {
    try {
      const [playlistData, scriptData, activeData] = await Promise.all([
        getPlaylists(selectedEnv),
        getBehaviorScripts(),
        getActivePlaylist(selectedEnv),
      ])
      setPlaylists(playlistData)
      setScripts(scriptData)
      if ('id' in activeData) {
        setActivePlaylist(activeData as CinematicPlaylist)
      } else {
        setActivePlaylist(null)
      }
    } catch {
      // Backend may not be connected
    }
  }, [selectedEnv])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handlePrepare = async () => {
    if (!prepareStart) {
      toast.error('Set a start time')
      return
    }
    setPreparing(true)
    try {
      const result = await prepareCinematic(selectedEnv, prepareStart, prepareDuration)
      toast.success(`Prepared ${result.clips_generated} clips`)
      await loadData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to prepare')
    } finally {
      setPreparing(false)
    }
  }

  const handleDeactivate = async (scriptId: string) => {
    setDeactivating(scriptId)
    try {
      await deactivateScript(scriptId)
      toast.success('Script deactivated')
      await loadData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate')
    } finally {
      setDeactivating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Cinematic Behavioral Replication</h3>
          <div className="flex gap-1">
            {ENVS.map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setSelectedEnv(env)}
                className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${
                  selectedEnv === env
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                    : 'bg-[#1a1a24] text-white/60 hover:text-white/80'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        {activePlaylist ? (
          <div className="bg-[#1a1a24] rounded p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">Active / Upcoming Playlist</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                style={{
                  backgroundColor: `${PLAYLIST_STATUS_COLORS[activePlaylist.status] ?? '#6b7280'}20`,
                  color: PLAYLIST_STATUS_COLORS[activePlaylist.status] ?? '#6b7280',
                }}
              >
                {activePlaylist.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-white/50">Start:</span>{' '}
                <span className="text-white/80">{new Date(activePlaylist.scheduled_start).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-white/50">End:</span>{' '}
                <span className="text-white/80">{new Date(activePlaylist.scheduled_end).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-white/50">Clips:</span>{' '}
                <span className="text-white/80">{activePlaylist.total_clips}</span>
              </div>
            </div>

            {activePlaylist.clips_preview && activePlaylist.clips_preview.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="text-[10px] text-white/40 uppercase">Clip Preview</div>
                {activePlaylist.clips_preview.slice(0, 5).map((clip) => (
                  <div key={clip.id} className="flex items-center justify-between text-xs bg-[#111118] rounded px-2 py-1">
                    <span className="text-white/60 font-mono">{clip.time_block ?? '—'}</span>
                    <span className="text-white/50">{clip.duration_sec}s</span>
                    <span className={`text-[10px] ${clip.status === 'ready' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {clip.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#1a1a24] rounded p-4 mb-4 text-center text-xs text-white/50">
            No active playlist for {selectedEnv}
          </div>
        )}

        <div className="bg-[#1a1a24] rounded p-4">
          <div className="text-xs text-white/50 mb-3">Prepare Cinematic Period</div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-white/40 block mb-1">Start Time (ISO)</label>
              <input
                type="datetime-local"
                value={prepareStart}
                onChange={(e) => setPrepareStart(e.target.value)}
                className="w-full bg-[#111118] border border-[#2A2A35] rounded px-2 py-1.5 text-xs text-white/80"
              />
            </div>
            <div className="w-24">
              <label className="text-[10px] text-white/40 block mb-1">Duration (h)</label>
              <select
                value={prepareDuration}
                onChange={(e) => setPrepareDuration(Number(e.target.value))}
                className="w-full bg-[#111118] border border-[#2A2A35] rounded px-2 py-1.5 text-xs text-white/80"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((h) => (
                  <option key={h} value={h}>{h}h</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handlePrepare}
              disabled={preparing}
              className="px-4 py-1.5 rounded text-xs bg-[#D4AF37] text-black font-medium hover:bg-[#c4a030] disabled:opacity-50 transition-colors"
            >
              {preparing ? 'Preparing…' : 'Prepare'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-5">
        <h3 className="text-sm font-medium text-white mb-3">Playlists</h3>
        {playlists.length === 0 ? (
          <div className="text-xs text-white/50 text-center py-4">No playlists yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2A2A35]">
                  <th className="text-left text-white/50 py-2 px-2">Start</th>
                  <th className="text-left text-white/50 py-2 px-2">End</th>
                  <th className="text-left text-white/50 py-2 px-2">Clips</th>
                  <th className="text-left text-white/50 py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {playlists.map((p) => (
                  <tr key={p.id} className="border-b border-[#2A2A35]/50 hover:bg-white/5">
                    <td className="py-2 px-2 text-white/60 font-mono">
                      {new Date(p.scheduled_start).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-white/60 font-mono">
                      {new Date(p.scheduled_end).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-white/80">{p.total_clips}</td>
                    <td className="py-2 px-2">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                        style={{
                          backgroundColor: `${PLAYLIST_STATUS_COLORS[p.status] ?? '#6b7280'}20`,
                          color: PLAYLIST_STATUS_COLORS[p.status] ?? '#6b7280',
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-5">
        <h3 className="text-sm font-medium text-white mb-3">Avatar Behavior Scripts</h3>
        {scripts.length === 0 ? (
          <div className="text-xs text-white/50 text-center py-4">No behavior scripts defined</div>
        ) : (
          <div className="space-y-2">
            {scripts.map((script) => (
              <div key={script.id} className="bg-[#1a1a24] rounded px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/80 font-medium">{script.script_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 capitalize">
                      {script.trigger_type}
                    </span>
                    {script.applicable_environments?.map((env) => (
                      <span key={env} className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2A35] text-white/50 capitalize">
                        {env}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!!deactivating}
                    onClick={() => handleDeactivate(script.id)}
                    className="px-2 py-1 rounded text-[10px] bg-red-900/40 text-red-400 hover:bg-red-900/60 disabled:opacity-30 transition-colors"
                  >
                    {deactivating === script.id ? '…' : 'Deactivate'}
                  </button>
                </div>
                <div className="text-[10px] text-white/40">
                  {script.action_timeline.length} action{script.action_timeline.length !== 1 ? 's' : ''} — created {new Date(script.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
