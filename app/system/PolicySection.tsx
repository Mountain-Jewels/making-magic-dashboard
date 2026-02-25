/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import type { SystemPolicyRow } from '@/lib/api/system'

type PolicySectionProps = {
  data: SystemPolicyRow[]
}

export function PolicySection({ data }: PolicySectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Policy Weights</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#2A2A35]">
          <thead className="bg-[#111118] text-white/80">
            <tr>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Agent</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Weight</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Deviation</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Adjustments</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Drift</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.agent_type} className="odd:bg-[#0f0f16]">
                <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.agent_type}</td>
                <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.current_weight.toFixed(3)}</td>
                <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.deviation.toFixed(3)}</td>
                <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.adjustment_count}</td>
                <td className="border border-[#2A2A35] px-3 py-2 text-white">
                  {row.drift ? <span className="text-red-500 font-bold">⚠</span> : '—'}
                </td>
              </tr>
            ))}
            {!data.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="border border-[#2A2A35] px-3 py-6 text-center text-white/60"
                >
                  No policy rows
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
