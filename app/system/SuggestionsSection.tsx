/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import type { SystemSuggestionRow } from '@/lib/api/system'
import { useState } from 'react'

type SuggestionsSectionProps = {
  data: SystemSuggestionRow[]
  onApply: (id: string) => Promise<void> | void
}

export function SuggestionsSection({ data, onApply }: SuggestionsSectionProps) {
  const [applyingId, setApplyingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Reinforcement Suggestions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#2A2A35]">
          <thead className="bg-[#111118] text-white/80">
            <tr>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Agent</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Current</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Suggested</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Delta</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Reason</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Metric</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Created</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const createdLabel = row.created_at ? new Date(row.created_at).toLocaleString() : '—'
              return (
                <tr key={row.suggestion_id} className="odd:bg-[#0f0f16]">
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.agent_type}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.current_weight}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.suggested_weight}</td>
                  <td
                    className={`border border-[#2A2A35] px-3 py-2 font-medium ${
                      row.delta < 0 ? 'text-red-400' : row.delta > 0 ? 'text-green-400' : 'text-white'
                    }`}
                  >
                    {row.delta}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.reason ?? '—'}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.metric_value}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{createdLabel}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">
                    <button
                      type="button"
                      disabled={applyingId === row.suggestion_id}
                      onClick={async () => {
                        setApplyingId(row.suggestion_id)
                        try {
                          await onApply(row.suggestion_id)
                        } finally {
                          setApplyingId(null)
                        }
                      }}
                      className={`px-2 py-1 rounded text-white text-xs ${
                        applyingId === row.suggestion_id
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600'
                      }`}
                    >
                      {applyingId === row.suggestion_id ? 'Applying...' : 'Apply'}
                    </button>
                  </td>
                </tr>
              )
            })}
            {!data.length ? (
              <tr>
                <td
                  colSpan={8}
                  className="border border-[#2A2A35] px-3 py-6 text-center text-white/60"
                >
                  No active suggestions
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
