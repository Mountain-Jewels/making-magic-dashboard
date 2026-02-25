/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/lib/auth/useAuth'
import {
  fetchSystemOverview,
  fetchSystemPolicy,
  fetchSystemTelemetry,
  fetchSystemSuggestions,
  fetchSystemHistory,
  type SystemOverview,
  type SystemPolicyRow,
  type SystemTelemetryRow,
  type SystemSuggestionRow,
  type SystemHistoryRow,
} from '@/lib/api/system'
import { TelemetrySection } from './TelemetrySection'
import { PolicySection } from './PolicySection'
import { SuggestionsSection } from './SuggestionsSection'
import { PolicyHistorySection } from './PolicyHistorySection'
import { applyPolicy, rollbackPolicy } from '@/lib/api/producer'

function OverviewCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper?: string
}) {
  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
      <div className="text-xs text-white/60 uppercase tracking-wide">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {helper ? <div className="mt-1 text-sm text-white/60">{helper}</div> : null}
    </div>
  )
}

export default function SystemPage() {
  const { getRoles } = useAuth()
  const [role, setRole] = useState<'admin' | 'user' | 'unknown'>('unknown')
  const [loadingRole, setLoadingRole] = useState(true)
  const [overview, setOverview] = useState<SystemOverview | null>(null)
  const [telemetry, setTelemetry] = useState<SystemTelemetryRow[]>([])
  const [policy, setPolicy] = useState<SystemPolicyRow[]>([])
  const [suggestions, setSuggestions] = useState<SystemSuggestionRow[]>([])
  const [history, setHistory] = useState<SystemHistoryRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadSystemData = useCallback(async () => {
    const [overviewData, telemetryData, policyData, suggestionData, historyData] = await Promise.all([
      fetchSystemOverview(),
      fetchSystemTelemetry(),
      fetchSystemPolicy(),
      fetchSystemSuggestions(),
      fetchSystemHistory(),
    ])

    return {
      overview: overviewData,
      telemetry: telemetryData ?? [],
      policy: policyData ?? [],
      suggestions: suggestionData ?? [],
      history: historyData ?? [],
    }
  }, [])

  const handleApply = useCallback(async (id: string) => {
    const confirmed = window.confirm('Apply this policy adjustment?')
    if (!confirmed) return

    try {
      await applyPolicy(id)
      const data = await loadSystemData()
      setOverview(data.overview)
      setTelemetry(data.telemetry)
      setPolicy(data.policy)
      setSuggestions(data.suggestions)
      setHistory(data.history)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply policy adjustment')
    }
  }, [loadSystemData])

  const handleRollback = useCallback(async (id: string) => {
    const confirmed = window.confirm('Rollback this policy application?')
    if (!confirmed) return

    try {
      await rollbackPolicy(id)
      const data = await loadSystemData()
      setOverview(data.overview)
      setTelemetry(data.telemetry)
      setPolicy(data.policy)
      setSuggestions(data.suggestions)
      setHistory(data.history)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rollback policy change')
    }
  }, [loadSystemData])

  useEffect(() => {
    let cancelled = false
    void getRoles().then((roles) => {
      if (cancelled) return
      setRole(roles.includes('admin') ? 'admin' : 'user')
      setLoadingRole(false)
    })
    return () => {
      cancelled = true
    }
  }, [getRoles])

  useEffect(() => {
    if (role !== 'admin') return

    let cancelled = false
    const load = async () => {
      try {
        const data = await loadSystemData()
        if (!cancelled) {
          setOverview(data.overview)
          setTelemetry(data.telemetry)
          setPolicy(data.policy)
          setSuggestions(data.suggestions)
          setHistory(data.history)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load system governance data'
          )
        }
      }
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [role])

  if (loadingRole) {
    return <div className="p-6 text-sm text-white/70">Loading system panel…</div>
  }

  if (role !== 'admin') {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6 text-white/80">
          Unauthorized — admin access only
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
          {error}
        </div>
      </div>
    )
  }

  if (!overview) {
    return <div className="p-6 text-sm text-white/70">Loading overview…</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">System Governance</h1>
        <p className="text-sm text-white/70 mt-1">Read-only overview for adaptive policy telemetry</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OverviewCard label="Total Jobs" value={overview.total_jobs.toString()} />
        <OverviewCard label="Total Executions" value={overview.total_executions.toString()} />
        <OverviewCard
          label="Failure Rate"
          value={`${(overview.failure_rate * 100).toFixed(2)}%`}
        />
        <OverviewCard label="Avg Latency" value={`${overview.avg_latency_ms.toFixed(2)} ms`} />
        <OverviewCard label="Drifted Agents" value={overview.drifted_agents.toString()} />
        <OverviewCard label="Active Suggestions" value={overview.active_suggestions.toString()} />
      </section>
      <TelemetrySection data={telemetry} />
      <PolicySection data={policy} />
      <SuggestionsSection data={suggestions} onApply={handleApply} />
      <PolicyHistorySection data={history} onRollback={handleRollback} />
    </div>
  )
}
