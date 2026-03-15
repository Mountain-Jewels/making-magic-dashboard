/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  getCurrentLighting,
  getDailyProfiles,
  getOverrides,
  createOverride,
  getEngagementLog,
} from '@/lib/api/lighting'
import type {
  LightingState,
  LightingProfileRecord,
  LightingOverrideRecord,
  LightingEngagementRecord,
} from '@/lib/types/lighting-engine'
import { classifyTimeOfDay, TIME_OF_DAY_LABELS, TIME_OF_DAY_COLORS } from '@/lib/types/lighting-engine'
import { Card } from '@/components/shared/Card'
import { TabSwitcher } from '@/components/shared/TabSwitcher'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

const INPUT =
  'w-full bg-surface border border-surface-border rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold'
const BTN_GOLD =
  'bg-gold text-black text-sm font-medium rounded-md px-4 py-2 hover:bg-gold-hover disabled:opacity-50 transition-colors'

const ENVIRONMENTS = ['landing', 'cave', 'avatar'] as const
type LightingTab = 'current' | 'profiles' | 'overrides' | 'engagement'

const TABS: { id: LightingTab; label: string }[] = [
  { id: 'current', label: 'Current State' },
  { id: 'profiles', label: 'Daily Profiles' },
  { id: 'overrides', label: 'Overrides' },
  { id: 'engagement', label: 'Engagement' },
]

/* ────────────────────── Current State ────────────────────── */

function CurrentTab({ env }: { env: string }) {
  const [state, setState] = useState<LightingState | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const s = await getCurrentLighting(env)
      setState(s)
    } catch {
      setState(null)
    }
    setLoading(false)
  }, [env])

  useEffect(() => { refresh() }, [refresh])

  if (loading) return <p className="text-xs text-white/40">Loading…</p>
  if (!state) return <EmptyState title="Unavailable" description="Could not fetch lighting state." />

  const tod = classifyTimeOfDay(state.sun.elevation)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div className="bg-surface border border-surface-border rounded-lg p-4">
        <p className="text-xs text-white/40 mb-2">Time of Day</p>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full" style={{ background: TIME_OF_DAY_COLORS[tod] }} />
          <div>
            <p className="text-white font-medium">{TIME_OF_DAY_LABELS[tod]}</p>
            <p className="text-xs text-white/40">{new Date(state.time).toLocaleTimeString()}</p>
          </div>
        </div>
        {state.is_golden_hour && <StatusBadge status="Golden Hour" className="bg-gold/15 text-gold" />}
        {state.is_night && <StatusBadge status="Night Mode" />}
      </div>

      <div className="bg-surface border border-surface-border rounded-lg p-4">
        <p className="text-xs text-white/40 mb-2">Sun</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-white/50">Azimuth</span><span className="text-white">{state.sun.azimuth.toFixed(1)}°</span>
          <span className="text-white/50">Elevation</span><span className="text-white">{state.sun.elevation.toFixed(1)}°</span>
          <span className="text-white/50">Intensity</span><span className="text-white">{state.sun.intensity.toFixed(2)}</span>
          <span className="text-white/50">Color Temp</span><span className="text-white">{state.sun.color_temperature_k}K</span>
        </div>
        <div className="mt-2 h-3 w-full rounded" style={{ background: state.sun.color }} />
      </div>

      <div className="bg-surface border border-surface-border rounded-lg p-4">
        <p className="text-xs text-white/40 mb-2">Atmosphere</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-white/50">Fog Density</span><span className="text-white">{state.fog.density.toFixed(3)}</span>
          <span className="text-white/50">Fog Color</span>
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded" style={{ background: state.fog.color }} /><span className="text-white text-xs">{state.fog.color}</span></div>
          <span className="text-white/50">Ambient</span><span className="text-white">{state.ambient.intensity.toFixed(2)}</span>
        </div>
      </div>

      {state.cave && (
        <div className="bg-surface border border-surface-border rounded-lg p-4">
          <p className="text-xs text-white/40 mb-2">Cave</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-white/50">Interior Ambient</span><span className="text-white">{state.cave.interior_ambient.toFixed(2)}</span>
            <span className="text-white/50">Torch Color</span>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded" style={{ background: state.cave.torch_color }} /><span className="text-white text-xs">{state.cave.torch_color}</span></div>
            <span className="text-white/50">Crystal Color</span>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded" style={{ background: state.cave.crystal_color }} /><span className="text-white text-xs">{state.cave.crystal_color}</span></div>
          </div>
        </div>
      )}

      {state.metahuman && (
        <div className="bg-surface border border-surface-border rounded-lg p-4">
          <p className="text-xs text-white/40 mb-2">MetaHuman Lighting</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-white/50">Key/Fill Ratio</span><span className="text-white">{state.metahuman.key_fill_ratio.toFixed(2)}</span>
            <span className="text-white/50">Rim Intensity</span><span className="text-white">{state.metahuman.rim_intensity.toFixed(2)}</span>
            <span className="text-white/50">Shadow Softness</span><span className="text-white">{state.metahuman.shadow_softness.toFixed(2)}</span>
            <span className="text-white/50">Jewelry Specular</span><span className="text-white">{state.metahuman.jewelry_specular_boost.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="bg-surface border border-surface-border rounded-lg p-4">
        <p className="text-xs text-white/40 mb-2">Sky Gradient</p>
        <div
          className="h-12 w-full rounded"
          style={{
            background: `linear-gradient(to right, ${(state.sky.gradient || []).map((s) => `${s.color} ${s.position * 100}%`).join(', ')})`,
          }}
        />
      </div>
    </div>
  )
}

/* ────────────────────── Daily Profiles ────────────────────── */

function ProfilesTab({ env }: { env: string }) {
  const [profiles, setProfiles] = useState<LightingProfileRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getDailyProfiles(env).then(setProfiles).catch(() => setProfiles([])).finally(() => setLoading(false))
  }, [env])

  if (loading) return <p className="text-xs text-white/40">Loading profiles…</p>
  if (profiles.length === 0) return <EmptyState title="No profiles" description="No daily lighting profiles generated yet." />

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/40 text-xs">
            <th className="pb-2 pr-4">Time Block</th>
            <th className="pb-2 pr-4">Source</th>
            <th className="pb-2 pr-4">Sun Az/El</th>
            <th className="pb-2 pr-4">Intensity</th>
            <th className="pb-2 pr-4">Fog</th>
            <th className="pb-2">Color</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} className="border-t border-surface-border/50">
              <td className="py-2 pr-4 text-white font-medium">{p.time_block}</td>
              <td className="py-2 pr-4"><StatusBadge status={p.source} /></td>
              <td className="py-2 pr-4 text-white/70">{p.sun_azimuth.toFixed(0)}° / {p.sun_elevation.toFixed(0)}°</td>
              <td className="py-2 pr-4 text-white/70">{p.sun_intensity.toFixed(2)}</td>
              <td className="py-2 pr-4 text-white/70">{p.fog_density.toFixed(3)}</td>
              <td className="py-2"><div className="h-4 w-8 rounded" style={{ background: p.sun_color }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ────────────────────── Overrides ────────────────────── */

function OverridesTab({ env }: { env: string }) {
  const [overrides, setOverrides] = useState<LightingOverrideRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [creating, setCreating] = useState(false)

  const loadOverrides = useCallback(async () => {
    setLoading(true)
    try { setOverrides(await getOverrides(env)) } catch { setOverrides([]) }
    setLoading(false)
  }, [env])

  useEffect(() => { loadOverrides() }, [loadOverrides])

  const handleCreate = async () => {
    if (!start || !end) { toast.error('Start and end times required'); return }
    setCreating(true)
    try {
      await createOverride(env, 'manual', start, end, reason || undefined)
      toast.success('Override created')
      setReason('')
      setStart('')
      setEnd('')
      loadOverrides()
    } catch {
      toast.error('Failed to create override')
    }
    setCreating(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-surface-border rounded-lg p-4">
        <p className="text-xs text-white/40 mb-3">Create Manual Override</p>
        <div className="grid grid-cols-3 gap-3">
          <input type="datetime-local" className={INPUT} value={start} onChange={(e) => setStart(e.target.value)} />
          <input type="datetime-local" className={INPUT} value={end} onChange={(e) => setEnd(e.target.value)} />
          <input className={INPUT} placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <button onClick={handleCreate} disabled={creating} className={BTN_GOLD + ' mt-3'}>
          {creating ? 'Creating…' : 'Add Override'}
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-white/40">Loading…</p>
      ) : overrides.length === 0 ? (
        <EmptyState title="No overrides" description="No active lighting overrides." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs">
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Start</th>
                <th className="pb-2 pr-4">End</th>
                <th className="pb-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((o) => (
                <tr key={o.id} className="border-t border-surface-border/50">
                  <td className="py-2 pr-4"><StatusBadge status={o.override_type} /></td>
                  <td className="py-2 pr-4 text-white/70 text-xs">{new Date(o.start_time).toLocaleString()}</td>
                  <td className="py-2 pr-4 text-white/70 text-xs">{new Date(o.end_time).toLocaleString()}</td>
                  <td className="py-2 text-white/40 text-xs truncate max-w-[200px]">{o.reason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ────────────────────── Engagement ────────────────────── */

function EngagementTab({ env }: { env: string }) {
  const [records, setRecords] = useState<LightingEngagementRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getEngagementLog(env).then(setRecords).catch(() => setRecords([])).finally(() => setLoading(false))
  }, [env])

  if (loading) return <p className="text-xs text-white/40">Loading engagement data…</p>
  if (records.length === 0) return <EmptyState title="No engagement data" description="Engagement logging will populate as concierge sessions run." />

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/40 text-xs">
            <th className="pb-2 pr-4">Timestamp</th>
            <th className="pb-2 pr-4">Avg Session (s)</th>
            <th className="pb-2 pr-4">Conversion</th>
            <th className="pb-2 pr-4">Bounce</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t border-surface-border/50">
              <td className="py-2 pr-4 text-white/70 text-xs">{new Date(r.timestamp).toLocaleString()}</td>
              <td className="py-2 pr-4 text-white/70">{r.avg_session_duration_sec?.toFixed(0) ?? '—'}</td>
              <td className="py-2 pr-4 text-gold">{r.conversion_rate != null ? `${(r.conversion_rate * 100).toFixed(1)}%` : '—'}</td>
              <td className="py-2 pr-4 text-white/50">{r.bounce_rate != null ? `${(r.bounce_rate * 100).toFixed(1)}%` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ────────────────────── Main Page ────────────────────── */

export default function LightingPage() {
  const [env, setEnv] = useState<string>(ENVIRONMENTS[0])
  const [tab, setTab] = useState<LightingTab>('current')

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Lighting</h1>
        <p className="text-sm text-white/50 mt-1">
          Real-time lighting state, daily profiles, overrides, and engagement learning
        </p>
      </div>

      <div className="flex items-center gap-3">
        {ENVIRONMENTS.map((e) => (
          <button
            key={e}
            onClick={() => setEnv(e)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              env === e ? 'bg-gold/10 text-gold border border-gold/30' : 'text-white/50 hover:text-white border border-surface-border'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <TabSwitcher tabs={TABS} active={tab} onChange={setTab} />

      <Card title={`${env} — ${TABS.find((t) => t.id === tab)?.label}`}>
        {tab === 'current' && <CurrentTab env={env} />}
        {tab === 'profiles' && <ProfilesTab env={env} />}
        {tab === 'overrides' && <OverridesTab env={env} />}
        {tab === 'engagement' && <EngagementTab env={env} />}
      </Card>
    </div>
  )
}
