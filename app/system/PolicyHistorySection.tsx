/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import type { SystemHistoryRow } from '@/lib/api/system'
import { useState } from 'react'

type PolicyHistorySectionProps = {
  data: SystemHistoryRow[]
  onRollback: (id: string) => Promise<void> | void
}

export function PolicyHistorySection({ data, onRollback }: PolicyHistorySectionProps) {
  const [rollingBackId, setRollingBackId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Policy Application History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#2A2A35]">
          <thead className="bg-[#111118] text-white/80">
            <tr>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Agent</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Previous</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Applied</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Timestamp</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const appliedLabel = row.applied_at ? new Date(row.applied_at).toLocaleString() : '—'
              return (
                <tr key={row.application_id} className="odd:bg-[#0f0f16]">
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.agent_type}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.previous_weight}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.applied_weight}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{appliedLabel}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">
                    <button
                      type="button"
                      disabled={rollingBackId === row.application_id}
                      onClick={async () => {
                        setRollingBackId(row.application_id)
                        try {
                          await onRollback(row.application_id)
                        } finally {
                          setRollingBackId(null)
                        }
                      }}
                      className={`px-2 py-1 rounded text-white text-xs ${
                        rollingBackId === row.application_id
                          ? 'bg-amber-400 cursor-not-allowed'
                          : 'bg-amber-600'
                      }`}
                    >
                      {rollingBackId === row.application_id ? 'Rolling back...' : 'Rollback'}
                    </button>
                  </td>
                </tr>
              )
            })}
            {!data.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="border border-[#2A2A35] px-3 py-6 text-center text-white/60"
                >
                  No policy applications recorded
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
