/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import type { SystemTelemetryRow } from '@/lib/api/system'

type TelemetrySectionProps = {
  data: SystemTelemetryRow[]
}

export function TelemetrySection({ data }: TelemetrySectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Agent Telemetry</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#2A2A35]">
          <thead className="bg-[#111118] text-white/80">
            <tr>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Agent</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Executions</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Failures</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Success %</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Avg Latency (ms)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const successRate = row.success_rate ?? 0
              const low = successRate < 0.9
              const critical = successRate < 0.8
              return (
                <tr key={row.agent_type} className="odd:bg-[#0f0f16]">
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.agent_type}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.executions}</td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.failures}</td>
                  <td
                    className={`border border-[#2A2A35] px-3 py-2 font-medium ${
                      critical ? 'text-red-400' : low ? 'text-yellow-400' : 'text-green-400'
                    }`}
                  >
                    {(successRate * 100).toFixed(1)}%
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">{row.avg_latency_ms.toFixed(2)}</td>
                </tr>
              )
            })}
            {!data.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="border border-[#2A2A35] px-3 py-6 text-center text-white/60"
                >
                  No telemetry data
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
