// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { emitExecutionPlan } from '@/lib/api/scraper-plans'
import type { SearchTemplate, EmitExecutionPlanRequest, RiskLevel } from '@/lib/types/scraper'

interface Props {
  template: SearchTemplate
  onClose: () => void
}

export function FinalizeModal({ template, onClose }: Props) {
  const queryClient = useQueryClient()
  const [governanceApprovalId, setGovernanceApprovalId] = useState('')
  const [policySnapshotHash, setPolicySnapshotHash] = useState('')
  const [timeWindow, setTimeWindow] = useState(template.schedule.time_window || 'OFF_PEAK')
  const [timezone, setTimezone] = useState(template.schedule.timezone || 'America/New_York')
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW')
  const [killSwitchGroup, setKillSwitchGroup] = useState('default')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (data: EmitExecutionPlanRequest) => emitExecutionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraper-templates'] })
      queryClient.invalidateQueries({ queryKey: ['scraper-plans'] })
      onClose()
    },
    onError: (err: Error) => setError(err.message),
  })

  const handleSubmit = () => {
    if (!governanceApprovalId.trim()) { setError('Governance Approval ID is required'); return }
    if (!policySnapshotHash.trim()) { setError('Policy Snapshot Hash is required'); return }
    setError(null)

    const now = new Date()
    const later = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    mutation.mutate({
      template_id: template.template_id,
      governance_approval_id: governanceApprovalId.trim(),
      policy_snapshot_hash: policySnapshotHash.trim(),
      schedule: {
        earliest_start: now.toISOString(),
        latest_start: later.toISOString(),
        time_window: timeWindow,
        timezone,
      },
      safety: {
        risk_level: riskLevel,
        requires_human_review: true,
        kill_switch_group: killSwitchGroup,
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-xl border border-[#2A2A35] bg-[#1A1A24] shadow-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A35]">
          <h2 className="text-base font-semibold text-white">Finalize Execution Plan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-400">
              This will create an <strong>immutable</strong> Execution Plan and set the template status to <strong>DEPLOYED</strong>.
              This action cannot be undone.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Template</p>
            <p className="text-sm text-white font-medium">{template.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {template.scope.category.replace(/_/g, ' ')} &middot; {template.scope.jurisdiction.state || 'US'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Governance Approval ID</label>
              <input
                value={governanceApprovalId}
                onChange={(e) => setGovernanceApprovalId(e.target.value)}
                placeholder="gov-approval-..."
                className="w-full border border-[#2A2A35] bg-[#111118] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Policy Snapshot Hash</label>
              <input
                value={policySnapshotHash}
                onChange={(e) => setPolicySnapshotHash(e.target.value)}
                placeholder="sha256:..."
                className="w-full border border-[#2A2A35] bg-[#111118] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Time Window</label>
              <select value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)} className="w-full border border-[#2A2A35] bg-[#111118] rounded-lg px-3 py-2 text-sm text-white">
                <option value="OFF_PEAK">Off-Peak</option>
                <option value="ANY">Any</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Risk Level</label>
              <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as RiskLevel)} className="w-full border border-[#2A2A35] bg-[#111118] rounded-lg px-3 py-2 text-sm text-white">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kill Switch Group</label>
              <input value={killSwitchGroup} onChange={(e) => setKillSwitchGroup(e.target.value)} className="w-full border border-[#2A2A35] bg-[#111118] rounded-lg px-3 py-2 text-sm text-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Timezone</label>
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full border border-[#2A2A35] bg-[#111118] rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#2A2A35]">
          <button onClick={onClose} className="px-4 py-2 border border-[#2A2A35] rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5">Cancel</button>
          <button onClick={handleSubmit} disabled={mutation.isPending} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {mutation.isPending ? 'Emitting Plan...' : 'Finalize Execution Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}
