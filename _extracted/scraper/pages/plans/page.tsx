// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Loader2,
  Shield,
  Zap,
} from 'lucide-react'
import { listPlans, getPlan } from '@/lib/api/scraper-plans'
import type { ExecutionPlan, PlanStatus } from '@/lib/types/scraper'

const PAGE_SIZE = 20

const STATUS_FILTERS: { value: PlanStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'EMITTED', label: 'Emitted' },
  { value: 'QUEUED', label: 'Queued' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ABORTED', label: 'Aborted' },
]

function statusColor(status: PlanStatus): string {
  switch (status) {
    case 'EMITTED': return 'text-[#D4AF37]'
    case 'QUEUED': return 'text-blue-400'
    case 'RUNNING': return 'text-blue-400'
    case 'COMPLETED': return 'text-emerald-400'
    case 'ABORTED': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

function statusDot(status: PlanStatus): string {
  switch (status) {
    case 'EMITTED': return 'bg-[#D4AF37]'
    case 'QUEUED': return 'bg-blue-400'
    case 'RUNNING': return 'bg-blue-400 animate-pulse'
    case 'COMPLETED': return 'bg-emerald-400'
    case 'ABORTED': return 'bg-red-400'
    default: return 'bg-gray-400'
  }
}

function riskBadge(risk: string): string {
  switch (risk) {
    case 'LOW': return 'bg-emerald-500/20 text-emerald-400'
    case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
    case 'HIGH': return 'bg-red-500/20 text-red-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

// ---------------------------------------------------------------------------
// Expandable detail
// ---------------------------------------------------------------------------

function PlanDetailRow({ planId }: { planId: string }) {
  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan-detail', planId],
    queryFn: () => getPlan(planId),
  })

  if (isLoading) {
    return (
      <tr>
        <td colSpan={7} className="px-4 py-6 text-center">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400 mx-auto" />
        </td>
      </tr>
    )
  }

  if (!plan) return null

  return (
    <tr>
      <td colSpan={7} className="px-4 py-4 bg-[#111118]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scope */}
          <div className="rounded-md border border-[#2A2A35] bg-[#0A0A0F] p-3">
            <p className="text-xs font-semibold text-white mb-2">Scope</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Category</span>
                <span className="text-white">{plan.scope.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Domains</span>
                <span className="text-white">{plan.scope.domains.join(', ') || '—'}</span>
              </div>
              {plan.scope.population_band && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Population Band</span>
                  <span className="text-white">{plan.scope.population_band}</span>
                </div>
              )}
            </div>
          </div>

          {/* Constraints */}
          <div className="rounded-md border border-[#2A2A35] bg-[#0A0A0F] p-3">
            <p className="text-xs font-semibold text-white mb-2">Constraints</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Max Pages</span>
                <span className="text-white">{plan.constraints.max_pages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Signals</span>
                <span className="text-white">{plan.constraints.max_signals.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Runtime</span>
                <span className="text-white">{plan.constraints.max_runtime_minutes}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Cost</span>
                <span className="text-white">${plan.constraints.max_cost_usd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Concurrency</span>
                <span className="text-white">{plan.constraints.concurrency_limit}</span>
              </div>
            </div>
          </div>

          {/* Schedule & Safety */}
          <div className="space-y-4">
            <div className="rounded-md border border-[#2A2A35] bg-[#0A0A0F] p-3">
              <p className="text-xs font-semibold text-white mb-2">Schedule</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Window</span>
                  <span className="text-white font-mono">{plan.schedule.time_window}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timezone</span>
                  <span className="text-white">{plan.schedule.timezone}</span>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-[#2A2A35] bg-[#0A0A0F] p-3">
              <p className="text-xs font-semibold text-white mb-2">Safety</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Level</span>
                  <span className={`font-medium ${riskBadge(plan.safety.risk_level).includes('emerald') ? 'text-emerald-400' : riskBadge(plan.safety.risk_level).includes('amber') ? 'text-amber-400' : 'text-red-400'}`}>
                    {plan.safety.risk_level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Human Review</span>
                  <span className="text-white">{plan.safety.requires_human_review ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kill Switch Group</span>
                  <span className="text-white font-mono">{plan.safety.kill_switch_group}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization summary */}
        {plan.optimization_summary && (
          <div className="mt-4 rounded-md border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-[#D4AF37]" />
              <p className="text-xs font-semibold text-[#D4AF37]">Optimization Summary</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="text-gray-400">Cost</span>
                <p className="text-white font-medium">${plan.optimization_summary.estimated_cost_usd.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-400">Pages</span>
                <p className="text-white font-medium">{plan.optimization_summary.estimated_pages.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-400">Signals</span>
                <p className="text-white font-medium">{plan.optimization_summary.estimated_signals.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-400">Alternatives</span>
                <p className="text-white font-medium">{plan.optimization_summary.alternative_plans_considered}</p>
              </div>
              <div>
                <span className="text-gray-400">Confidence</span>
                <p className="text-white font-medium">{(plan.optimization_summary.confidence_score * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-gray-400">
          <span>Intent: <span className="font-mono text-white/50">{plan.intent_id.slice(0, 12)}</span></span>
          <span>Template: <span className="font-mono text-white/50">{plan.template_id.slice(0, 12)}</span></span>
          <span>Version: {plan.version}</span>
          <span>Governance: <span className="font-mono text-white/50">{plan.governance_approval_id.slice(0, 12)}</span></span>
          <span>Policy: <span className="font-mono text-white/50">{plan.policy_snapshot_hash.slice(0, 12)}</span></span>
        </div>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Plans page
// ---------------------------------------------------------------------------

export default function PlansPage() {
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['scraper-plans', statusFilter, page],
    queryFn: () =>
      listPlans({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
  })

  const plans = data?.plans ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Execution Plans</h1>
        <span className="text-xs text-gray-400">{data?.total ?? 0} total</span>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Plan ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Created By</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No plans found
                  </td>
                </tr>
              ) : (
                plans.map((plan) => {
                  const expanded = expandedRow === plan.plan_id
                  return (
                    <>
                      <tr
                        key={plan.plan_id}
                        onClick={() => setExpandedRow(expanded ? null : plan.plan_id)}
                        className="border-b border-[#2A2A35] last:border-0 hover:bg-white/[0.02] cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          {expanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-white font-mono text-xs">{plan.plan_id.slice(0, 12)}</td>
                        <td className="px-4 py-3 text-gray-400">{plan.scope.category}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusColor(plan.status)}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDot(plan.status)}`} />
                            {plan.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${riskBadge(plan.safety.risk_level)}`}>
                            {plan.safety.risk_level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{plan.created_by.email}</td>
                      </tr>
                      {expanded && <PlanDetailRow key={`${plan.plan_id}-detail`} planId={plan.plan_id} />}
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
          disabled={plans.length < PAGE_SIZE}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
