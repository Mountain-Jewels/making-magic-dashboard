/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import {
  getCurrentLighting,
  computeLighting,
  generateDailyProfiles,
  getProfiles,
  createOverride,
  getOverrides,
  deleteOverride,
} from '@/lib/api/lighting'
import type {
  LightingState,
  LightingProfile,
  LightingOverride,
} from '@/lib/types/lighting'

const VM_ROLES = ['landing', 'cave', 'avatar'] as const

export default function LightingPage() {
  const [vmRole, setVmRole] = useState<string>('landing')
  const [currentLighting, setCurrentLighting] = useState<LightingState | null>(null)
  const [loadingCurrent, setLoadingCurrent] = useState(false)
  const [computing, setComputing] = useState(false)
  const [computeResult, setComputeResult] = useState<LightingState | null>(null)
  const [profiles, setProfiles] = useState<LightingProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [generatingProfiles, setGeneratingProfiles] = useState(false)
  const [overrides, setOverrides] = useState<LightingOverride[]>([])
  const [loadingOverrides, setLoadingOverrides] = useState(false)
  const [deletingOverrideId, setDeletingOverrideId] = useState<string | null>(null)

  const [overrideStartTime, setOverrideStartTime] = useState('')
  const [overrideEndTime, setOverrideEndTime] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [creatingOverride, setCreatingOverride] = useState(false)

  const refreshCurrent = useCallback(async () => {
    setLoadingCurrent(true)
    try {
      setCurrentLighting(await getCurrentLighting(vmRole))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load current lighting')
    } finally {
      setLoadingCurrent(false)
    }
  }, [vmRole])

  const refreshProfiles = useCallback(async () => {
    setLoadingProfiles(true)
    try {
      setProfiles(await getProfiles(vmRole))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load profiles')
    } finally {
      setLoadingProfiles(false)
    }
  }, [vmRole])

  const refreshOverrides = useCallback(async () => {
    setLoadingOverrides(true)
    try {
      setOverrides(await getOverrides(vmRole))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load overrides')
    } finally {
      setLoadingOverrides(false)
    }
  }, [vmRole])

  useEffect(() => {
    setComputeResult(null)
    void refreshCurrent()
    void refreshProfiles()
    void refreshOverrides()
  }, [refreshCurrent, refreshProfiles, refreshOverrides])

  const handleCompute = async () => {
    if (computing) return
    setComputing(true)
    try {
      const result = await computeLighting(vmRole)
      setComputeResult(result)
      toast.success('Lighting computed')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to compute lighting')
    } finally {
      setComputing(false)
    }
  }

  const handleGenerateProfiles = async () => {
    if (generatingProfiles) return
    setGeneratingProfiles(true)
    try {
      const result = await generateDailyProfiles(vmRole)
      toast.success(`Generated ${result.length} profile(s)`)
      void refreshProfiles()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate profiles')
    } finally {
      setGeneratingProfiles(false)
    }
  }

  const handleCreateOverride = async () => {
    if (!overrideStartTime || !overrideEndTime || creatingOverride) return
    setCreatingOverride(true)
    try {
      await createOverride(
        vmRole,
        overrideStartTime,
        overrideEndTime,
        overrideReason || undefined,
      )
      toast.success('Override created')
      setOverrideStartTime('')
      setOverrideEndTime('')
      setOverrideReason('')
      void refreshOverrides()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create override')
    } finally {
      setCreatingOverride(false)
    }
  }

  const handleDeleteOverride = async (id: string) => {
    if (deletingOverrideId) return
    setDeletingOverrideId(id)
    try {
      await deleteOverride(id)
      toast.success('Override deleted')
      void refreshOverrides()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete override')
    } finally {
      setDeletingOverrideId(null)
    }
  }

  const lightingDisplay = computeResult ?? currentLighting

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dynamic Lighting</h1>
          <p className="mt-1 text-sm text-white/50">
            Physical sun model, profiles, overrides
          </p>
        </div>

        {/* VM Role Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/60">VM Role:</label>
          <select
            value={vmRole}
            onChange={(e) => setVmRole(e.target.value)}
            className="bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
          >
            {VM_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Current Lighting */}
        <Card title="Current Lighting" subtitle={loadingCurrent ? 'Loading…' : vmRole}>
          {lightingDisplay ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-xs uppercase text-white/50">Sun Position</div>
                <div className="mt-1 text-sm text-white">
                  Az: {lightingDisplay.sun.azimuth.toFixed(1)}° / El: {lightingDisplay.sun.elevation.toFixed(1)}°
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-white/50">Intensity</div>
                <div className="mt-1 text-sm text-white">
                  {lightingDisplay.sun.intensity.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-white/50">Color Temp</div>
                <div className="mt-1 text-sm text-white">
                  {lightingDisplay.sun.color_temperature_k
                    ? `${lightingDisplay.sun.color_temperature_k}K`
                    : lightingDisplay.sun.color}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-white/50">Fog Density</div>
                <div className="mt-1 text-sm text-white">
                  {lightingDisplay.fog.density.toFixed(3)}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-sm text-white/40">No data</div>
          )}
          <button
            type="button"
            onClick={handleCompute}
            disabled={computing}
            className="mt-4 rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50"
          >
            {computing ? 'Computing…' : 'Compute Lighting'}
          </button>
        </Card>

        {/* Profiles */}
        <Card title="Daily Profiles">
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGenerateProfiles}
              disabled={generatingProfiles}
              className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50"
            >
              {generatingProfiles ? 'Generating…' : 'Generate Daily'}
            </button>
          </div>
          {loadingProfiles ? (
            <div className="py-6 text-center text-sm text-white/40">Loading…</div>
          ) : profiles.length === 0 ? (
            <div className="py-6 text-center text-sm text-white/40">No profiles yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs uppercase text-white/50">
                    <th className="pb-2 pr-4">Time Block</th>
                    <th className="pb-2 pr-4">Sun Angle</th>
                    <th className="pb-2 pr-4">Intensity</th>
                    <th className="pb-2 pr-4">Color</th>
                    <th className="pb-2">Fog</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-b border-surface-border/50">
                      <td className="py-2 pr-4 text-white">{p.time_block}</td>
                      <td className="py-2 pr-4 text-white/70">
                        Az: {p.sun_azimuth?.toFixed(1) ?? '—'}° / El: {p.sun_elevation?.toFixed(1) ?? '—'}°
                      </td>
                      <td className="py-2 pr-4 text-white/70">
                        {p.sun_intensity?.toFixed(2) ?? '—'}
                      </td>
                      <td className="py-2 pr-4">
                        {p.sun_color ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="h-3 w-3 rounded-full border border-white/20"
                              style={{ backgroundColor: p.sun_color }}
                            />
                            <span className="text-white/60">{p.sun_color}</span>
                          </span>
                        ) : (
                          <span className="text-white/40">—</span>
                        )}
                      </td>
                      <td className="py-2 text-white/70">
                        {p.fog_density?.toFixed(3) ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Overrides */}
        <Card title="Overrides">
          {loadingOverrides ? (
            <div className="py-6 text-center text-sm text-white/40">Loading…</div>
          ) : overrides.length === 0 ? (
            <div className="py-6 text-center text-sm text-white/40">No active overrides</div>
          ) : (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs uppercase text-white/50">
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Start</th>
                    <th className="pb-2 pr-4">End</th>
                    <th className="pb-2 pr-4">Reason</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overrides.map((o) => (
                    <tr key={o.id} className="border-b border-surface-border/50">
                      <td className="py-2 pr-4 text-white">{o.override_type}</td>
                      <td className="py-2 pr-4 text-white/60">
                        {new Date(o.start_time).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4 text-white/60">
                        {new Date(o.end_time).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4 text-white/50">{o.reason ?? '—'}</td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteOverride(o.id)}
                          disabled={!!deletingOverrideId}
                          className="rounded-md border border-surface-border px-3 py-1 text-xs text-error hover:border-error/50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Override Form */}
          <div className="rounded-lg border border-surface-border bg-surface p-4">
            <h4 className="mb-3 text-sm font-medium text-white">Add Override</h4>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="mb-1 block text-xs text-white/50">Start Time</label>
                <input
                  type="datetime-local"
                  value={overrideStartTime}
                  onChange={(e) => setOverrideStartTime(e.target.value)}
                  className="bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">End Time</label>
                <input
                  type="datetime-local"
                  value={overrideEndTime}
                  onChange={(e) => setOverrideEndTime(e.target.value)}
                  className="bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Reason (optional)</label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. photoshoot"
                  className="w-48 bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateOverride}
                disabled={creatingOverride || !overrideStartTime || !overrideEndTime}
                className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50"
              >
                {creatingOverride ? 'Creating…' : 'Add Override'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
