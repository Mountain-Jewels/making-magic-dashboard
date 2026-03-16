// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  FileText,
  Loader2,
  XCircle,
} from 'lucide-react'
import { getRuns, getRunDetail } from '@/lib/api/scraper'
import { useRunProgress } from '@/lib/hooks/useRunProgress'
import type { RunSummary, RunDetail, RunStatus } from '@/lib/types/scraper'

const PAGE_SIZE = 20

const STATUS_FILTERS: { value: RunStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
]

function statusColor(status: string): string {
  switch (status) {
    case 'running': return 'text-blue-400'
    case 'completed': return 'text-emerald-400'
    case 'failed': return 'text-red-400'
    case 'cancelled': return 'text-gray-400'
    case 'submitted': return 'text-[#D4AF37]'
    case 'approved': return 'text-purple-400'
    case 'rejected': return 'text-red-400'
    default: return 'text-white'
  }
}

function statusDot(status: string): string {
  switch (status) {
    case 'running': return 'bg-blue-400'
    case 'completed': return 'bg-emerald-400'
    case 'failed': return 'bg-red-400'
    case 'cancelled': return 'bg-gray-400'
    case 'submitted': return 'bg-[#D4AF37]'
    case 'approved': return 'bg-purple-400'
    case 'rejected': return 'bg-red-400'
    default: return 'bg-gray-400'
  }
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '—'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

// ---------------------------------------------------------------------------
// Progress indicator for running rows
// ---------------------------------------------------------------------------

function RunProgressCell({ runId }: { runId: string }) {
  const { progress } = useRunProgress(runId)
  if (!progress) return <span className="text-gray-400">—</span>
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-[#111118]">
        <div
          className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
          style={{ width: `${progress.progress_pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{progress.progress_pct.toFixed(0)}%</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Expandable detail row
// ---------------------------------------------------------------------------

function ExpandedRow({ runId }: { runId: string }) {
  const { data: detail, isLoading } = useQuery({
    queryKey: ['run-detail', runId],
    queryFn: () => getRunDetail(runId),
  })

  if (isLoading) {
    return (
      <tr>
        <td colSpan={8} className="px-4 py-6 text-center">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400 mx-auto" />
        </td>
      </tr>
    )
  }

  if (!detail) return null

  return (
    <tr>
      <td colSpan={8} className="px-4 py-4 bg-[#111118]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-white mb-2">Intent</p>
            <div className="rounded-md border border-[#2A2A35] bg-[#0A0A0F] p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Category</span>
                <span className="text-white">{detail.intent.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Operator</span>
                <span className="text-white font-mono">{detail.intent.operator_id}</span>
              </div>
              <div>
                <span className="text-gray-400">Statement</span>
                <p className="text-white mt-1 leading-relaxed">{detail.intent.intent_statement}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white mb-2">
              Events ({detail.events.length})
            </p>
            <div className="rounded-md border border-[#2A2A35] bg-[#0A0A0F] p-3 max-h-48 overflow-y-auto space-y-1.5">
              {detail.events.length === 0 ? (
                <p className="text-xs text-gray-400">No events recorded</p>
              ) : (
                detail.events.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                      ev.type === 'error' ? 'bg-red-400'
                        : ev.type === 'warning' ? 'bg-amber-400'
                          : 'bg-blue-400'
                    }`} />
                    <span className="text-gray-400 shrink-0 font-mono w-[140px]">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-white">{ev.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// History page
// ---------------------------------------------------------------------------

export default function HistoryPage() {
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'all'>('all')
  const [page, setPage] = useState(0)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const { data: runs, isLoading } = useQuery({
    queryKey: ['scraper-runs', page],
    queryFn: () => getRuns({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
  })

  const filtered = (runs ?? []).filter(
    (r) => statusFilter === 'all' || r.status === statusFilter,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Run History</h1>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400">{runs?.length ?? 0} runs loaded</span>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(0) }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                : 'text-gray-400 border border-[#2A2A35] hover:text-white hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A35] bg-[#111118]">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 w-8" />
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Run ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Jurisdiction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Pages</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Signals</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Duration</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No runs found
                  </td>
                </tr>
              ) : (
                filtered.map((run) => {
                  const expanded = expandedRow === run.run_id
                  return (
                    <>
                      <tr
                        key={run.run_id}
                        onClick={() => setExpandedRow(expanded ? null : run.run_id)}
                        className="border-b border-[#2A2A35] last:border-0 hover:bg-white/[0.02] cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          {expanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-white font-mono text-xs">{run.run_id.slice(0, 12)}</td>
                        <td className="px-4 py-3 text-gray-400">{run.category}</td>
                        <td className="px-4 py-3 text-gray-400">{run.jurisdiction_label}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDot(run.status)}`} />
                            <span className={`text-xs font-medium ${statusColor(run.status)}`}>
                              {run.status.toUpperCase()}
                            </span>
                          </div>
                          {run.status === 'running' && (
                            <div className="mt-1">
                              <RunProgressCell runId={run.run_id} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-white">{run.pages_scraped.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-white">{run.signals_found.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-white">{formatDuration(run.duration_seconds)}</td>
                      </tr>
                      {expanded && <ExpandedRow key={`${run.run_id}-detail`} runId={run.run_id} />}
                    </>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="text-xs text-gray-400">Page {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={(runs?.length ?? 0) < PAGE_SIZE}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
