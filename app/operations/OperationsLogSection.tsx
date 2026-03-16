/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect, useState } from 'react'
import { getOperationsLog } from '@/lib/api/vm-control'
import type { VmOperationsLogEntry } from '@/lib/types/vm-control'

interface Props {
  nodeId: string | null
}

const TRIGGER_COLORS: Record<string, string> = {
  manual: '#D4AF37',
  schedule: '#3b82f6',
  ai: '#a855f7',
}

export function OperationsLogSection({ nodeId }: Props) {
  const [logs, setLogs] = useState<VmOperationsLogEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!nodeId) {
      setLogs([])
      return
    }
    setLoading(true)
    getOperationsLog(nodeId, 30)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [nodeId])

  if (!nodeId) {
    return (
      <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6 text-center text-white/60 text-sm">
        Select a VM to view operations log
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-5">
      <h3 className="text-sm font-medium text-white mb-3">Operations Log</h3>
      {loading ? (
        <div className="text-sm text-white/50 py-4 text-center">Loading…</div>
      ) : logs.length === 0 ? (
        <div className="text-sm text-white/50 py-4 text-center">No operations recorded</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2A2A35]">
                <th className="text-left text-white/50 py-2 px-2">Time</th>
                <th className="text-left text-white/50 py-2 px-2">Operation</th>
                <th className="text-left text-white/50 py-2 px-2">Triggered By</th>
                <th className="text-left text-white/50 py-2 px-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[#2A2A35]/50 hover:bg-white/5">
                  <td className="py-2 px-2 text-white/60 font-mono whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-white/80 capitalize">{log.operation}</td>
                  <td className="py-2 px-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        backgroundColor: `${TRIGGER_COLORS[log.triggered_by] ?? '#6b7280'}20`,
                        color: TRIGGER_COLORS[log.triggered_by] ?? '#6b7280',
                      }}
                    >
                      {log.triggered_by}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-white/60">{log.result ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
