/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  approveRecommendation,
  generateRecommendations,
  getPerformanceSummary,
  getRecommendations,
  rejectRecommendation,
} from '@/lib/api/scheduling'
import type { PerformanceSummary, SchedulingRecommendation } from '@/lib/types/scheduling'
import {
  CONFIDENCE_COLORS,
  CONFIDENCE_LABELS,
  STATUS_BADGE_COLORS,
} from '@/lib/types/scheduling'

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function SchedulingAISection() {
  const [perf, setPerf] = useState<PerformanceSummary | null>(null)
  const [recs, setRecs] = useState<SchedulingRecommendation[]>([])
  const [generating, setGenerating] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<string>('')

  const loadData = useCallback(async () => {
    try {
      const [perfData, recsData] = await Promise.all([
        getPerformanceSummary(),
        getRecommendations('pending', filterRole || undefined),
      ])
      setPerf(perfData)
      setRecs(recsData)
    } catch {
      // Silently fail on initial load if backend not ready
    }
  }, [filterRole])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateRecommendations()
      toast.success('Recommendations generated')
      await loadData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate')
    } finally {
      setGenerating(false)
    }
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      await approveRecommendation(id)
      toast.success('Recommendation approved and applied')
      await loadData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(id)
    try {
      await rejectRecommendation(id)
      toast.success('Recommendation rejected')
      await loadData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const groupedByRole: Record<string, SchedulingRecommendation[]> = {}
  for (const rec of recs) {
    ;(groupedByRole[rec.vm_role] ??= []).push(rec)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Adaptive Scheduling AI</h3>
          <div className="flex items-center gap-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-xs bg-[#1a1a24] text-white/80 border border-[#2A2A35] rounded px-2 py-1"
            >
              <option value="">All Roles</option>
              <option value="landing">Landing</option>
              <option value="cave">Cave</option>
              <option value="avatar">Avatar</option>
            </select>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="px-3 py-1.5 rounded text-xs bg-[#D4AF37] text-black font-medium hover:bg-[#c4a030] disabled:opacity-50 transition-colors"
            >
              {generating ? 'Generating…' : 'Generate Recommendations'}
            </button>
          </div>
        </div>

        {perf && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="bg-[#1a1a24] rounded p-3">
              <div className="text-xs text-white/50">Data Collected</div>
              <div className="text-lg font-semibold text-white">{perf.data_weeks}w</div>
            </div>
            <div className="bg-[#1a1a24] rounded p-3">
              <div className="text-xs text-white/50">Confidence</div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CONFIDENCE_COLORS[perf.confidence_level] }}
                />
                <span className="text-sm text-white/80">
                  {CONFIDENCE_LABELS[perf.confidence_level] ?? perf.confidence_level}
                </span>
              </div>
            </div>
            <div className="bg-[#1a1a24] rounded p-3">
              <div className="text-xs text-white/50">Prior / Data Weight</div>
              <div className="text-sm text-white/80 mt-1">
                {Math.round(perf.prior_weight * 100)}% / {Math.round(perf.data_weight * 100)}%
              </div>
            </div>
            <div className="bg-[#1a1a24] rounded p-3">
              <div className="text-xs text-white/50">Pending Approvals</div>
              <div className="text-lg font-semibold text-white">{perf.pending_recommendations}</div>
            </div>
          </div>
        )}
      </div>

      {Object.entries(groupedByRole).map(([role, roleRecs]) => {
        const sorted = [...roleRecs].sort(
          (a, b) => DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week)
        )

        return (
          <div key={role} className="rounded-lg border border-[#2A2A35] bg-[#111118] p-5">
            <h4 className="text-sm font-medium text-white mb-3 capitalize">{role} VM — Recommendations</h4>

            <div className="overflow-x-auto mb-4">
              <table className="border-collapse w-full min-w-[700px]">
                <thead>
                  <tr>
                    <th className="text-xs text-white/50 text-left py-1 px-1 w-16" />
                    {HOURS.map((h) => (
                      <th key={h} className="text-[10px] text-white/40 py-1 px-0 text-center w-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((rec) => (
                    <tr key={rec.id}>
                      <td className="text-xs text-white/60 capitalize py-0.5 px-1">
                        {rec.day_of_week.slice(0, 3)}
                      </td>
                      {HOURS.map((h) => {
                        const active = rec.recommended_hours.includes(h)
                        return (
                          <td key={h} className="p-0">
                            <div
                              className={`w-5 h-5 mx-auto rounded-sm ${
                                active ? 'bg-[#D4AF37]' : 'bg-[#1a1a24]'
                              }`}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              {sorted.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between bg-[#1a1a24] rounded px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/80 capitalize w-12">
                      {rec.day_of_week.slice(0, 3)}
                    </span>
                    <span className="text-xs text-white/60">
                      {rec.recommended_hours.length}h
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${CONFIDENCE_COLORS[rec.confidence_source]}20`,
                        color: CONFIDENCE_COLORS[rec.confidence_source],
                      }}
                    >
                      {CONFIDENCE_LABELS[rec.confidence_source]}
                    </span>
                    {rec.expected_weekly_cost != null && (
                      <span className="text-xs text-white/50">
                        ${rec.expected_weekly_cost.toFixed(2)}/wk
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                      style={{
                        backgroundColor: `${STATUS_BADGE_COLORS[rec.status] ?? '#6b7280'}20`,
                        color: STATUS_BADGE_COLORS[rec.status] ?? '#6b7280',
                      }}
                    >
                      {rec.status}
                    </span>
                    {rec.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          disabled={!!actionLoading}
                          onClick={() => handleApprove(rec.id)}
                          className="px-2 py-1 rounded text-[10px] bg-green-900/40 text-green-400 hover:bg-green-900/60 disabled:opacity-30 transition-colors"
                        >
                          {actionLoading === rec.id ? '…' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={!!actionLoading}
                          onClick={() => handleReject(rec.id)}
                          className="px-2 py-1 rounded text-[10px] bg-red-900/40 text-red-400 hover:bg-red-900/60 disabled:opacity-30 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {recs.length === 0 && (
        <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6 text-center text-white/60 text-sm">
          No pending recommendations. Click &ldquo;Generate Recommendations&rdquo; to get AI scheduling advice.
        </div>
      )}
    </div>
  )
}
