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
  getNodes,
  getNodeStatus,
  vmPowerAction,
  updateNodeSchedule,
  getOperationsLog,
} from '@/lib/api/vm-control'
import type {
  VmNode,
  VmOperationsLogEntry,
  VmPowerAction,
} from '@/lib/types/vm-control'
import { DAYS_OF_WEEK, GPU_LABELS } from '@/lib/types/vm-control'

const POWER_ACTIONS: { action: VmPowerAction; label: string; disabledStates: string[] }[] = [
  { action: 'start', label: 'Start', disabledStates: ['running', 'starting'] },
  { action: 'stop', label: 'Stop', disabledStates: ['stopped', 'stopping', 'deallocated'] },
  { action: 'deallocate', label: 'Deallocate', disabledStates: ['deallocated', 'deallocating'] },
  { action: 'restart', label: 'Restart', disabledStates: ['stopped', 'deallocated', 'restarting'] },
]

export default function VmsPage() {
  const [nodes, setNodes] = useState<VmNode[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [actionInFlight, setActionInFlight] = useState<string | null>(null)
  const [schedule, setSchedule] = useState<Record<string, [number, number]>>({})
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [opsLog, setOpsLog] = useState<VmOperationsLogEntry[]>([])
  const [loadingLog, setLoadingLog] = useState(false)

  const refreshNodes = useCallback(async () => {
    try {
      const data = await getNodes()
      setNodes(data)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load nodes')
    }
  }, [])

  useEffect(() => {
    void refreshNodes()
    const interval = setInterval(refreshNodes, 15_000)
    return () => clearInterval(interval)
  }, [refreshNodes])

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null

  useEffect(() => {
    if (!selectedNode) {
      setSchedule({})
      setOpsLog([])
      return
    }
    const sj = selectedNode.schedule_json ?? {}
    const initial: Record<string, [number, number]> = {}
    for (const day of DAYS_OF_WEEK) {
      const hours = sj[day] ?? [8, 22]
      initial[day] = [hours[0] ?? 8, hours[1] ?? 22]
    }
    setSchedule(initial)

    setLoadingLog(true)
    void getOperationsLog(selectedNode.id).then((log) => {
      setOpsLog(log)
      setLoadingLog(false)
    }).catch(() => setLoadingLog(false))
  }, [selectedNode])

  const handlePowerAction = async (nodeId: string, action: VmPowerAction) => {
    if (actionInFlight) return
    setActionInFlight(`${nodeId}-${action}`)
    try {
      const res = await vmPowerAction(nodeId, action)
      toast.success(`${action} sent to ${res.node_name}`)
      void refreshNodes()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action}`)
    } finally {
      setActionInFlight(null)
    }
  }

  const handleSaveSchedule = async () => {
    if (!selectedNode || savingSchedule) return
    setSavingSchedule(true)
    try {
      const scheduleJson: Record<string, number[]> = {}
      for (const [day, [on, off]] of Object.entries(schedule)) {
        scheduleJson[day] = [on, off]
      }
      await updateNodeSchedule(selectedNode.id, 'custom', scheduleJson)
      toast.success('Schedule updated')
      void refreshNodes()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save schedule')
    } finally {
      setSavingSchedule(false)
    }
  }

  const handleRefreshStatus = async (nodeId: string) => {
    try {
      await getNodeStatus(nodeId)
      toast.success('Status refreshed')
      void refreshNodes()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to refresh status')
    }
  }

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">VM Control Console</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage virtual machines — start, stop, schedule
          </p>
        </div>

        {/* Node Cards */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Nodes</h2>
            <span className="text-xs text-white/40">Auto-refresh 15s</span>
          </div>
          {nodes.length === 0 ? (
            <div className="py-12 text-center text-sm text-white/40">No nodes found</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nodes.map((node) => {
                const isSelected = node.id === selectedNodeId
                const powerState = node.azure_power_state ?? 'unknown'
                return (
                  <Card
                    key={node.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'ring-1 ring-gold' : 'hover:border-white/20'
                    }`}
                  >
                    <div onClick={() => setSelectedNodeId(isSelected ? null : node.id)}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{node.name}</span>
                        <StatusBadge status={node.status} />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-white/50">Power:</span>
                        <StatusBadge status={powerState} />
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-white/60">
                        <div>GPU: {node.gpu_type ? (GPU_LABELS[node.gpu_type] ?? node.gpu_type) : '—'}</div>
                        <div>IP: {node.ip_address ?? '—'}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {POWER_ACTIONS.map(({ action, label, disabledStates }) => (
                        <button
                          key={action}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            void handlePowerAction(node.id, action)
                          }}
                          disabled={
                            !!actionInFlight ||
                            disabledStates.includes(powerState.toLowerCase())
                          }
                          className="rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-black hover:bg-gold-hover disabled:opacity-50"
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          void handleRefreshStatus(node.id)
                        }}
                        className="rounded-md border border-surface-border px-3 py-1.5 text-xs text-white/60 hover:text-white"
                      >
                        Refresh
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* Selected Node Detail */}
        {selectedNode && (
          <>
            {/* Schedule Editor */}
            <Card title="Schedule Editor" subtitle={`${selectedNode.name} — 7-day on/off hours`}>
              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const [onHour, offHour] = schedule[day] ?? [8, 22]
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-24 text-sm capitalize text-white/70">{day}</span>
                      <label className="text-xs text-white/40">On:</label>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={onHour}
                        onChange={(e) =>
                          setSchedule((s) => ({
                            ...s,
                            [day]: [Number(e.target.value), s[day]?.[1] ?? 22],
                          }))
                        }
                        className="w-16 bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-2 py-1 text-sm"
                      />
                      <label className="text-xs text-white/40">Off:</label>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={offHour}
                        onChange={(e) =>
                          setSchedule((s) => ({
                            ...s,
                            [day]: [s[day]?.[0] ?? 8, Number(e.target.value)],
                          }))
                        }
                        className="w-16 bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-2 py-1 text-sm"
                      />
                    </div>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="mt-4 rounded-md bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-hover disabled:opacity-50"
              >
                {savingSchedule ? 'Saving…' : 'Save Schedule'}
              </button>
            </Card>

            {/* Operations Log */}
            <Card title="Operations Log" subtitle={selectedNode.name}>
              {loadingLog ? (
                <div className="py-6 text-center text-sm text-white/40">Loading…</div>
              ) : opsLog.length === 0 ? (
                <div className="py-6 text-center text-sm text-white/40">No operations recorded</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-border text-left text-xs uppercase text-white/50">
                        <th className="pb-2 pr-4">Timestamp</th>
                        <th className="pb-2 pr-4">Action</th>
                        <th className="pb-2 pr-4">Result</th>
                        <th className="pb-2">Triggered By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opsLog.map((entry) => (
                        <tr key={entry.id} className="border-b border-surface-border/50">
                          <td className="py-2 pr-4 text-white/60">
                            {new Date(entry.created_at).toLocaleString()}
                          </td>
                          <td className="py-2 pr-4 text-white">{entry.operation}</td>
                          <td className="py-2 pr-4 text-white/70">{entry.result ?? '—'}</td>
                          <td className="py-2 text-white/50">{entry.triggered_by}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
