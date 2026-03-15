/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import { TabSwitcher } from '@/components/shared/TabSwitcher'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  fetchSystemOverview,
  fetchSystemTelemetry,
  fetchSystemPolicy,
  fetchSystemSuggestions,
  fetchSystemHistory,
} from '@/lib/api/system'
import type {
  SystemOverview,
  SystemTelemetryRow,
  SystemPolicyRow,
  SystemSuggestionRow,
  SystemHistoryRow,
} from '@/lib/api/system'
import { applyPolicy, rollbackPolicy } from '@/lib/api/producer'

type Tab = 'overview' | 'telemetry' | 'policy' | 'history'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'telemetry', label: 'Telemetry' },
  { id: 'policy', label: 'Policy' },
  { id: 'history', label: 'History' },
]

const btnCls =
  'bg-gold text-black font-medium rounded-md hover:bg-gold-hover disabled:opacity-50 px-3 py-1.5 text-xs'
const btnDangerCls =
  'bg-red-600/80 text-white font-medium rounded-md hover:bg-red-600 disabled:opacity-50 px-3 py-1.5 text-xs'

export default function SystemPage() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">System</h1>
        <p className="text-sm text-white/50 mt-1">Monitoring &amp; telemetry</p>
      </div>

      <TabSwitcher tabs={TABS} active={tab} onChange={setTab} />

      <div className="pt-2">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'telemetry' && <TelemetryTab />}
        {tab === 'policy' && <PolicyTab />}
        {tab === 'history' && <HistoryTab />}
      </div>
    </div>
  )
}

/* ─── Overview ────────────────────────────────────────────────────── */

function MetricCard({ label, value, format }: { label: string; value: number; format?: 'pct' | 'ms' | 'count' }) {
  let display: string
  if (format === 'pct') display = `${(value * 100).toFixed(1)}%`
  else if (format === 'ms') display = `${value.toLocaleString()} ms`
  else display = value.toLocaleString()

  return (
    <Card>
      <p className="text-xs text-white/50 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-white mt-1">{display}</p>
    </Card>
  )
}

function OverviewTab() {
  const [data, setData] = useState<SystemOverview | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setData(await fetchSystemOverview())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load overview')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  useEffect(() => {
    const interval = setInterval(refresh, 30_000)
    return () => clearInterval(interval)
  }, [refresh])

  if (loading) return <div className="text-center text-white/60 py-8">Loading…</div>
  if (!data) return <EmptyState title="No overview data" />

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <MetricCard label="Total Jobs" value={data.total_jobs} />
      <MetricCard label="Executions" value={data.total_executions} />
      <MetricCard label="Avg Latency" value={data.avg_latency_ms} format="ms" />
      <MetricCard label="Failure Rate" value={data.failure_rate} format="pct" />
    </div>
  )
}

/* ─── Telemetry ───────────────────────────────────────────────────── */

function TelemetryTab() {
  const [rows, setRows] = useState<SystemTelemetryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemTelemetry()
      .then(setRows)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load telemetry'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center text-white/60 py-8">Loading…</div>
  if (!rows.length) return <EmptyState title="No telemetry data" />

  return (
    <Card title="Agent Telemetry">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-white/50 border-b border-surface-border">
              <th className="pb-2 pr-4 font-medium">Agent</th>
              <th className="pb-2 pr-4 font-medium">Executions</th>
              <th className="pb-2 pr-4 font-medium">Failures</th>
              <th className="pb-2 pr-4 font-medium">Success Rate</th>
              <th className="pb-2 font-medium">Avg Latency</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.agent_type} className="border-b border-surface-border/50 text-white/80">
                <td className="py-2 pr-4">{r.agent_type}</td>
                <td className="py-2 pr-4">{r.executions}</td>
                <td className="py-2 pr-4">{r.failures}</td>
                <td className="py-2 pr-4">{(r.success_rate * 100).toFixed(1)}%</td>
                <td className="py-2">{r.avg_latency_ms.toLocaleString()} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ─── Policy ──────────────────────────────────────────────────────── */

function PolicyTab() {
  const [weights, setWeights] = useState<SystemPolicyRow[]>([])
  const [suggestions, setSuggestions] = useState<SystemSuggestionRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const [w, s] = await Promise.all([fetchSystemPolicy(), fetchSystemSuggestions()])
      setWeights(w)
      setSuggestions(s)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load policy data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const handleApply = useCallback(async (id: string) => {
    try {
      await applyPolicy(id)
      toast.success('Policy applied')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Apply failed')
    }
  }, [refresh])

  const handleRollback = useCallback(async (id: string) => {
    try {
      await rollbackPolicy(id)
      toast.success('Policy rolled back')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rollback failed')
    }
  }, [refresh])

  if (loading) return <div className="text-center text-white/60 py-8">Loading…</div>

  return (
    <div className="space-y-6">
      <Card title="Current Weights">
        {weights.length === 0 ? (
          <EmptyState title="No policy weights" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-white/50 border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">Agent</th>
                  <th className="pb-2 pr-4 font-medium">Weight</th>
                  <th className="pb-2 pr-4 font-medium">Deviation</th>
                  <th className="pb-2 pr-4 font-medium">Adjustments</th>
                  <th className="pb-2 font-medium">Drift</th>
                </tr>
              </thead>
              <tbody>
                {weights.map((w) => (
                  <tr key={w.agent_type} className="border-b border-surface-border/50 text-white/80">
                    <td className="py-2 pr-4">{w.agent_type}</td>
                    <td className="py-2 pr-4">{w.current_weight.toFixed(3)}</td>
                    <td className="py-2 pr-4">{w.deviation.toFixed(3)}</td>
                    <td className="py-2 pr-4">{w.adjustment_count}</td>
                    <td className="py-2">
                      <StatusBadge status={w.drift ? 'error' : 'ready'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Suggestions">
        {suggestions.length === 0 ? (
          <EmptyState title="No active suggestions" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-white/50 border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">Agent</th>
                  <th className="pb-2 pr-4 font-medium">Current</th>
                  <th className="pb-2 pr-4 font-medium">Suggested</th>
                  <th className="pb-2 pr-4 font-medium">Delta</th>
                  <th className="pb-2 pr-4 font-medium">Reason</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s) => (
                  <tr key={s.suggestion_id} className="border-b border-surface-border/50 text-white/80">
                    <td className="py-2 pr-4">{s.agent_type}</td>
                    <td className="py-2 pr-4">{s.current_weight.toFixed(3)}</td>
                    <td className="py-2 pr-4">{s.suggested_weight.toFixed(3)}</td>
                    <td className="py-2 pr-4">{s.delta > 0 ? '+' : ''}{s.delta.toFixed(3)}</td>
                    <td className="py-2 pr-4 text-xs max-w-[200px] truncate">{s.reason ?? '—'}</td>
                    <td className="py-2 flex gap-2">
                      <button className={btnCls} onClick={() => handleApply(s.suggestion_id)}>Apply</button>
                      <button className={btnDangerCls} onClick={() => handleRollback(s.suggestion_id)}>Rollback</button>
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

/* ─── History ─────────────────────────────────────────────────────── */

function HistoryTab() {
  const [rows, setRows] = useState<SystemHistoryRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setRows(await fetchSystemHistory())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const handleRollback = useCallback(async (id: string) => {
    try {
      await rollbackPolicy(id)
      toast.success('Rolled back')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rollback failed')
    }
  }, [refresh])

  if (loading) return <div className="text-center text-white/60 py-8">Loading…</div>
  if (!rows.length) return <EmptyState title="No policy history" />

  return (
    <Card title="Policy Application History">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-white/50 border-b border-surface-border">
              <th className="pb-2 pr-4 font-medium">Date</th>
              <th className="pb-2 pr-4 font-medium">Agent</th>
              <th className="pb-2 pr-4 font-medium">Previous</th>
              <th className="pb-2 pr-4 font-medium">Applied</th>
              <th className="pb-2 pr-4 font-medium">Suggestion</th>
              <th className="pb-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.application_id} className="border-b border-surface-border/50 text-white/80">
                <td className="py-2 pr-4 text-xs text-white/50">
                  {r.applied_at ? new Date(r.applied_at).toLocaleString() : '—'}
                </td>
                <td className="py-2 pr-4">{r.agent_type}</td>
                <td className="py-2 pr-4">{r.previous_weight.toFixed(3)}</td>
                <td className="py-2 pr-4">{r.applied_weight.toFixed(3)}</td>
                <td className="py-2 pr-4 font-mono text-xs">{r.suggestion_id?.slice(0, 8) ?? '—'}</td>
                <td className="py-2">
                  <button className={btnDangerCls} onClick={() => handleRollback(r.application_id)}>
                    Rollback
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
