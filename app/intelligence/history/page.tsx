'use client'

import { useState } from 'react'
import { useIntelligenceStore } from '@/lib/stores/intelligence-store'

const RUN_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  queued: { label: 'Queued', color: 'bg-gray-700 text-gray-300' },
  running: { label: 'Running', color: 'bg-blue-900 text-blue-300' },
  completed: { label: 'Completed', color: 'bg-green-900 text-green-300' },
  failed: { label: 'Failed', color: 'bg-red-900 text-red-300' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-700 text-gray-400' },
  killed: { label: 'Killed', color: 'bg-red-900 text-red-400' },
}

const RAIL_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-900 text-green-300',
  tripped: 'bg-red-900 text-red-300',
  disabled: 'bg-gray-700 text-gray-400',
}

export default function HistoryPage() {
  const { runs, safetyRails, toggleSafetyRail } = useIntelligenceStore()
  const [tab, setTab] = useState<'history' | 'safety'>('history')
  const [expandedRun, setExpandedRun] = useState<string | null>(null)
  const [confirmKill, setConfirmKill] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">History + Safety</h1>
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-1.5 rounded text-sm font-medium ${tab === 'history' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
          >
            Run History ({runs.length})
          </button>
          <button
            onClick={() => setTab('safety')}
            className={`px-4 py-1.5 rounded text-sm font-medium ${tab === 'safety' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
          >
            Safety Controls ({safetyRails.length})
          </button>
        </div>
      </div>

      {tab === 'history' && (
        <div className="space-y-2">
          {runs.map((run) => {
            const display = RUN_STATUS_DISPLAY[run.status]
            const isExpanded = expandedRun === run.id
            return (
              <div key={run.id} className="bg-gray-900 border border-gray-800 rounded-lg">
                <button
                  onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                  className="w-full text-left p-4 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-white">{run.category_id.replace(/_/g, ' ')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${display.color}`}>{display.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {run.jurisdiction.state}{run.jurisdiction.county_fips ? ` / ${run.jurisdiction.county_fips}` : ''} · {run.lookback_days}d lookback
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-[#D4AF37]">{run.signals_detected.toLocaleString()} signals</p>
                    <p className="text-xs text-gray-500">{run.pages_scraped.toLocaleString()} pages</p>
                  </div>
                  <span className="text-gray-600">{isExpanded ? '▼' : '▶'}</span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Portals Found</p>
                        <p className="text-sm text-white">{run.portals_found}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Pages Scraped</p>
                        <p className="text-sm text-white">{run.pages_scraped.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Signals</p>
                        <p className="text-sm text-[#D4AF37]">{run.signals_detected.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Errors</p>
                        <p className={`text-sm ${run.errors > 0 ? 'text-red-400' : 'text-gray-400'}`}>{run.errors}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Started</p>
                        <p className="text-xs text-gray-300">{new Date(run.started_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Completed</p>
                        <p className="text-xs text-gray-300">{run.completed_at ? new Date(run.completed_at).toLocaleString() : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Duration</p>
                        <p className="text-xs text-gray-300">{run.duration_seconds ? `${Math.ceil(run.duration_seconds / 60)} min` : '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Intent Statement</p>
                      <p className="text-sm text-gray-300 italic bg-gray-800 rounded px-3 py-2">&ldquo;{run.intent_statement}&rdquo;</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Operator: {run.operator_id} · Cost: ${run.cost_usd.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'safety' && (
        <div className="space-y-6">
          {/* Kill Switches */}
          <div>
            <h2 className="text-sm font-bold text-gray-400 mb-3">Kill Switches</h2>
            <div className="space-y-2">
              {safetyRails.filter((r) => r.type === 'kill_switch').map((rail) => (
                <div key={rail.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
                  <span className="text-xl">{rail.status === 'tripped' ? '🔴' : '🟢'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{rail.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${RAIL_STATUS_COLORS[rail.status]}`}>{rail.status}</span>
                    </div>
                    {rail.scope === 'category' && <p className="text-xs text-gray-500">Category: {rail.category_id}</p>}
                    {rail.reason && <p className="text-xs text-gray-500 mt-1">Reason: {rail.reason}</p>}
                    {rail.tripped_at && <p className="text-xs text-gray-600">Tripped at {new Date(rail.tripped_at).toLocaleString()} by {rail.tripped_by}</p>}
                  </div>
                  <div>
                    {confirmKill === rail.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { toggleSafetyRail(rail.id); setConfirmKill(null) }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmKill(null)}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmKill(rail.id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          rail.status === 'tripped'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {rail.status === 'tripped' ? 'Revive' : 'Kill'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Circuit Breakers */}
          <div>
            <h2 className="text-sm font-bold text-gray-400 mb-3">Circuit Breakers</h2>
            <div className="grid grid-cols-2 gap-3">
              {safetyRails.filter((r) => r.type === 'circuit_breaker').map((rail) => (
                <div key={rail.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">{rail.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${RAIL_STATUS_COLORS[rail.status]}`}>{rail.status}</span>
                  </div>
                  {rail.category_id && <p className="text-xs text-gray-500">Category: {rail.category_id}</p>}
                  {rail.status === 'tripped' && (
                    <button
                      onClick={() => toggleSafetyRail(rail.id)}
                      className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium"
                    >
                      Reset Circuit
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-600">Kill actions create immutable audit entries. Safety endpoints connect to engine in Phase 7.</p>
        </div>
      )}
    </div>
  )
}
