'use client'

import { useIntelligenceStore } from '@/lib/stores/intelligence-store'

const ENGINE_STATUS_COLORS: Record<string, string> = {
  healthy: 'bg-green-900 text-green-300',
  degraded: 'bg-yellow-900 text-yellow-300',
  down: 'bg-red-900 text-red-300',
}

const SENTINEL_STATUS_COLORS: Record<string, string> = {
  ok: 'text-green-400',
  warning: 'text-yellow-400',
  critical: 'text-red-400',
}

const SENTINEL_ICONS: Record<string, string> = {
  ok: '✅',
  warning: '⚠️',
  critical: '🚨',
}

const RUN_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  queued: { label: 'Queued', color: 'bg-gray-700 text-gray-300' },
  running: { label: 'Running', color: 'bg-blue-900 text-blue-300' },
  completed: { label: 'Completed', color: 'bg-green-900 text-green-300' },
  failed: { label: 'Failed', color: 'bg-red-900 text-red-300' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-700 text-gray-400' },
  killed: { label: 'Killed', color: 'bg-red-900 text-red-400' },
}

export default function ScraperDashboardPage() {
  const { health, sentinels, runs, sourceMatrix } = useIntelligenceStore()

  const recentRuns = runs.slice(0, 10)
  const allowedCategories = sourceMatrix.categories.filter((c) => c.status === 'allowed').length
  const disabledCategories = sourceMatrix.categories.filter((c) => c.status === 'disabled').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Scraper Dashboard</h1>
        <span className="text-xs text-gray-500">Read-only · Data refreshes from API in Phase 7</span>
      </div>

      {/* Engine Health */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs text-gray-400">Engine Status</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${ENGINE_STATUS_COLORS[health.engine_status]}`}>
              {health.engine_status}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{health.uptime_hours}h</p>
          <p className="text-xs text-gray-500">uptime</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-xs text-gray-400 mb-2">Active / Queued</h3>
          <p className="text-2xl font-bold text-white">{health.active_runs} / {health.queued_runs}</p>
          <p className="text-xs text-gray-500">runs</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-xs text-gray-400 mb-2">Signals (24h)</h3>
          <p className="text-2xl font-bold text-[#D4AF37]">{health.total_signals_24h.toLocaleString()}</p>
          <p className="text-xs text-gray-500">from {health.total_runs_24h} runs</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-xs text-gray-400 mb-2">Source Policy</h3>
          <p className="text-2xl font-bold text-white">v{sourceMatrix.version}</p>
          <p className="text-xs text-gray-500">{allowedCategories} allowed · {disabledCategories} disabled</p>
        </div>
      </div>

      {/* Sentinels */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 mb-3">Sentinels</h2>
        <div className="grid grid-cols-3 gap-3">
          {sentinels.map((s) => (
            <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-start gap-3">
              <span className="text-lg">{SENTINEL_ICONS[s.status]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">{s.name}</h4>
                  <span className={`text-xs ${SENTINEL_STATUS_COLORS[s.status]}`}>{s.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{s.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Runs */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 mb-3">Recent Runs</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Jurisdiction</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Portals</th>
                <th className="text-right px-4 py-3 font-medium">Pages</th>
                <th className="text-right px-4 py-3 font-medium">Signals</th>
                <th className="text-left px-4 py-3 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.map((run) => {
                const display = RUN_STATUS_DISPLAY[run.status]
                return (
                  <tr key={run.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm text-white">{run.category_id.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {run.jurisdiction.state}{run.jurisdiction.county_fips ? ` / ${run.jurisdiction.county_fips}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${display.color}`}>{display.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-right">{run.portals_found}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-right">{run.pages_scraped.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-[#D4AF37] text-right">{run.signals_detected.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(run.started_at).toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
