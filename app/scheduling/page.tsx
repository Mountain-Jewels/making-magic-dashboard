/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  generateRecommendations,
  getRecommendations,
  approveRecommendation,
  rejectRecommendation,
  getPerformanceSummary,
} from '@/lib/api/scheduling'
import type {
  SchedulingRecommendation,
  PerformanceSummary,
} from '@/lib/types/scheduling'
import {
  CONFIDENCE_COLORS,
  CONFIDENCE_LABELS,
} from '@/lib/types/scheduling'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function SchedulingPage() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [recommendations, setRecommendations] = useState<SchedulingRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actingOnId, setActingOnId] = useState<string | null>(null)

  const refreshSummary = useCallback(async () => {
    try {
      setSummary(await getPerformanceSummary())
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load performance summary')
    }
  }, [])

  const refreshRecommendations = useCallback(async () => {
    setLoading(true)
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter
      setRecommendations(await getRecommendations(status))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    void refreshSummary()
    void refreshRecommendations()
  }, [refreshSummary, refreshRecommendations])

  const handleGenerate = async () => {
    if (generating) return
    setGenerating(true)
    try {
      const result = await generateRecommendations()
      toast.success(`Generated ${result.length} recommendation(s)`)
      void refreshRecommendations()
      void refreshSummary()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate recommendations')
    } finally {
      setGenerating(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (actingOnId) return
    setActingOnId(id)
    try {
      await approveRecommendation(id)
      toast.success('Recommendation approved')
      void refreshRecommendations()
      void refreshSummary()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setActingOnId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (actingOnId) return
    setActingOnId(id)
    try {
      await rejectRecommendation(id)
      toast.success('Recommendation rejected')
      void refreshRecommendations()
      void refreshSummary()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setActingOnId(null)
    }
  }

  const summaryCards: { label: string; value: string | number }[] = [
    { label: 'Data Weeks', value: summary?.data_weeks ?? '—' },
    { label: 'Confidence', value: summary ? (CONFIDENCE_LABELS[summary.confidence_level] ?? summary.confidence_level) : '—' },
    { label: 'Total Events', value: summary?.total_events_collected ?? '—' },
    { label: 'Pending', value: summary?.pending_recommendations ?? '—' },
  ]

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Adaptive Scheduling</h1>
          <p className="mt-1 text-sm text-white/50">
            AI-driven VM scheduling recommendations
          </p>
        </div>

        {/* Performance Summary */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-white">Performance Summary</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {summaryCards.map(({ label, value }) => (
              <Card key={label}>
                <div className="text-xs uppercase text-white/50">{label}</div>
                <div className="mt-1 text-2xl font-semibold text-gold">{value}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Generate + Filter */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50"
          >
            {generating ? 'Generating…' : 'Generate Recommendations'}
          </button>
          <div>
            <label className="mr-2 text-xs text-white/50">Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-surface border border-surface-border rounded-md text-white focus:ring-1 focus:ring-gold px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Recommendations Table */}
        <Card title="Recommendations">
          {loading ? (
            <div className="py-8 text-center text-sm text-white/40">Loading…</div>
          ) : recommendations.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/40">
              No recommendations found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs uppercase text-white/50">
                    <th className="pb-2 pr-4">VM Role</th>
                    <th className="pb-2 pr-4">Day</th>
                    <th className="pb-2 pr-4">Hours</th>
                    <th className="pb-2 pr-4">Confidence</th>
                    <th className="pb-2 pr-4">Est. Cost</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec) => (
                    <tr key={rec.id} className="border-b border-surface-border/50">
                      <td className="py-2.5 pr-4 text-white">{rec.vm_role}</td>
                      <td className="py-2.5 pr-4 capitalize text-white/70">{rec.day_of_week}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-white/60">
                        {rec.recommended_hours.join(', ')}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: CONFIDENCE_COLORS[rec.confidence_source] ?? '#9ca3af' }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: CONFIDENCE_COLORS[rec.confidence_source] ?? '#9ca3af' }}
                          />
                          {CONFIDENCE_LABELS[rec.confidence_source] ?? rec.confidence_source}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-white/50">
                        {rec.expected_weekly_cost != null
                          ? `$${rec.expected_weekly_cost.toFixed(2)}`
                          : '—'}
                      </td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="py-2.5">
                        {rec.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(rec.id)}
                              disabled={!!actingOnId}
                              className="rounded-md bg-gold px-3 py-1 text-xs font-medium text-black hover:bg-gold-hover disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(rec.id)}
                              disabled={!!actingOnId}
                              className="rounded-md border border-surface-border px-3 py-1 text-xs text-white hover:border-error/50 hover:text-error disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
