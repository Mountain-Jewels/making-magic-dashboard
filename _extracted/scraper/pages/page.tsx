// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Power,
  ServerCrash,
  XCircle,
  Zap,
} from 'lucide-react'
import { getRuns, getHealth } from '@/lib/api/scraper'
import { getSafetyStatus, killAll, reviveSource } from '@/lib/api/scraper-safety'
import { listPlans } from '@/lib/api/scraper-plans'
import { useRunProgress, type RunProgress } from '@/lib/hooks/useRunProgress'
import type { RunSummary, SafetyStatus } from '@/lib/types/scraper'

// ---------------------------------------------------------------------------
// Inline interfaces
// ---------------------------------------------------------------------------

interface SystemOverview {
  activeRuns: number
  totalCompleted: number
  totalFailed: number
  uptime: number
  globalKill: boolean
  openCircuits: number
}

interface LiveRun {
  run: RunSummary
  progress: RunProgress | null
}

interface SourceHealth {
  id: string
  category: string
  state: 'active' | 'killed'
  circuitState: 'closed' | 'open' | 'half_open'
  failureCount: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function statusColor(status: string): string {
  switch (status) {
    case 'running': return 'text-blue-400'
    case 'completed': return 'text-emerald-400'
    case 'failed': return 'text-red-400'
    case 'cancelled': return 'text-gray-400'
    default: return 'text-white'
  }
}

// ---------------------------------------------------------------------------
// LiveRunCard
// ---------------------------------------------------------------------------

function LiveRunCard({ run }: { run: RunSummary }) {
  const { progress } = useRunProgress(run.status === 'running' ? run.run_id : null)
  const pct = progress?.progress_pct ?? 0

  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white truncate">{run.category}</span>
        <span className={`text-xs font-medium ${statusColor(run.status)}`}>
          {run.status.toUpperCase()}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3 truncate">{run.jurisdiction_label}</p>

      {run.status === 'running' && (
        <>
          <div className="w-full h-1.5 rounded-full bg-[#111118] mb-2">
            <div
              className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{progress?.current_source ?? '—'}</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
        </>
      )}

      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <div>
          <p className="text-xs text-gray-400">Pages</p>
          <p className="text-sm font-semibold text-white">{run.pages_scraped.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Signals</p>
          <p className="text-sm font-semibold text-white">{run.signals_found.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Errors</p>
          <p className={`text-sm font-semibold ${run.errors > 0 ? 'text-red-400' : 'text-white'}`}>
            {run.errors}
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export default function ScraperDashboardPage() {
  const qc = useQueryClient()
  const [trackRunId, setTrackRunId] = useState<string | null>(null)

  const healthQ = useQuery({ queryKey: ['scraper-health'], queryFn: getHealth, refetchInterval: 15000 })
  const runsQ = useQuery({ queryKey: ['scraper-runs'], queryFn: () => getRuns({ limit: 20 }), refetchInterval: 10000 })
  const safetyQ = useQuery({ queryKey: ['scraper-safety'], queryFn: getSafetyStatus, refetchInterval: 15000 })
  const plansQ = useQuery({ queryKey: ['scraper-plans-recent'], queryFn: () => listPlans({ limit: 5 }), refetchInterval: 30000 })

  const killMutation = useMutation({
    mutationFn: () => killAll('Dashboard emergency kill'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scraper-safety'] }),
  })

  const health = healthQ.data
  const runs = runsQ.data ?? []
  const safety = safetyQ.data
  const plans = plansQ.data

  const liveRuns = runs.filter((r) => r.status === 'running')
  const completedCount = runs.filter((r) => r.status === 'completed').length
  const failedCount = runs.filter((r) => r.status === 'failed').length
  const openCircuits = safety?.circuits.filter((c) => c.state === 'open').length ?? 0

  const overview: SystemOverview = {
    activeRuns: liveRuns.length,
    totalCompleted: completedCount,
    totalFailed: failedCount,
    uptime: health?.uptime_seconds ?? 0,
    globalKill: safety?.global_kill ?? false,
    openCircuits,
  }

  const sourceHealth: SourceHealth[] = (safety?.switches ?? []).map((sw) => {
    const circuit = safety?.circuits.find((c) => c.category === sw.category)
    return {
      id: sw.source_id,
      category: sw.category,
      state: sw.state,
      circuitState: circuit?.state ?? 'closed',
      failureCount: circuit?.failure_count ?? 0,
    }
  })

  const stats = [
    { label: 'Active Runs', value: overview.activeRuns, icon: Activity, color: 'text-blue-400' },
    { label: 'Completed', value: overview.totalCompleted, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Failed', value: overview.totalFailed, icon: XCircle, color: 'text-red-400' },
    { label: 'Uptime', value: formatUptime(overview.uptime), icon: Clock, color: 'text-[#D4AF37]' },
    { label: 'Open Circuits', value: overview.openCircuits, icon: ServerCrash, color: 'text-amber-400' },
    { label: 'Plans Emitted', value: plans?.total ?? 0, icon: Zap, color: 'text-purple-400' },
  ]

  const alerts: { level: 'error' | 'warning' | 'info'; message: string }[] = []
  if (overview.globalKill) alerts.push({ level: 'error', message: 'Global kill switch is ACTIVE — all scraping halted.' })
  if (openCircuits > 0) alerts.push({ level: 'warning', message: `${openCircuits} circuit breaker(s) open — sources degraded.` })
  if (failedCount > 3) alerts.push({ level: 'warning', message: `${failedCount} runs failed recently — investigate source health.` })

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                a.level === 'error'
                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                  : a.level === 'warning'
                    ? 'border-amber-400/30 bg-amber-400/10 text-amber-400'
                    : 'border-blue-400/30 bg-blue-400/10 text-blue-400'
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {a.message}
            </div>
          ))}
        </div>
      )}

      {/* Global Kill Switch */}
      <div className="flex items-center justify-between rounded-lg border border-[#2A2A35] bg-[#1A1A24] px-5 py-4">
        <div className="flex items-center gap-3">
          <Power className={`h-5 w-5 ${overview.globalKill ? 'text-red-400' : 'text-emerald-400'}`} />
          <div>
            <p className="text-sm font-medium text-white">Global Kill Switch</p>
            <p className="text-xs text-gray-400">
              {overview.globalKill ? 'All scraping is halted' : 'System is operational'}
            </p>
          </div>
        </div>
        <button
          onClick={() => killMutation.mutate()}
          disabled={killMutation.isPending || overview.globalKill}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            overview.globalKill
              ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
          }`}
        >
          {killMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {overview.globalKill ? 'KILLED' : 'Kill All'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-gray-400">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Live Runs */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Live Runs</h2>
        {liveRuns.length === 0 ? (
          <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-8 text-center">
            <p className="text-sm text-gray-400">No active runs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveRuns.map((run) => (
              <LiveRunCard key={run.run_id} run={run} />
            ))}
          </div>
        )}
      </div>

      {/* Source Health Table */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Source Health</h2>
        <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A35] bg-[#111118]">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Circuit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Failures</th>
              </tr>
            </thead>
            <tbody>
              {sourceHealth.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No source data available
                  </td>
                </tr>
              ) : (
                sourceHealth.map((sh) => (
                  <tr key={sh.id} className="border-b border-[#2A2A35] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white font-mono text-xs">{sh.id}</td>
                    <td className="px-4 py-3 text-gray-400">{sh.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        sh.state === 'active' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          sh.state === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                        }`} />
                        {sh.state.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${
                        sh.circuitState === 'closed' ? 'text-emerald-400'
                          : sh.circuitState === 'open' ? 'text-red-400'
                            : 'text-amber-400'
                      }`}>
                        {sh.circuitState.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">{sh.failureCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Monitor */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Cost Monitor</h2>
        <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-5">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-5 w-5 text-[#D4AF37]" />
            <p className="text-sm text-gray-400">Rolling 24-hour estimate based on recent run activity</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Active Run Cost</p>
              <p className="text-lg font-bold text-white">
                ${(liveRuns.length * 12.50).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">24h Spend</p>
              <p className="text-lg font-bold text-white">
                ${(completedCount * 8.75 + failedCount * 2.10).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Projected Monthly</p>
              <p className="text-lg font-bold text-white">
                ${((completedCount * 8.75 + failedCount * 2.10) * 30).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
