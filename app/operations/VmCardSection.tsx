'use client'

import { useState } from 'react'
import { Power, PowerOff, RotateCcw, Square } from 'lucide-react'
import { toast } from 'sonner'

import { vmPowerAction } from '@/lib/api/vm-control'
import type { VmNode, VmPowerAction } from '@/lib/types/vm-control'
import { STATUS_COLORS, GPU_LABELS } from '@/lib/types/vm-control'

interface Props {
  nodes: VmNode[]
  onRefresh: () => void
  onSelectNode: (nodeId: string) => void
  selectedNodeId: string | null
}

export function VmCardSection({ nodes, onRefresh, onSelectNode, selectedNodeId }: Props) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleAction = async (nodeId: string, action: VmPowerAction) => {
    const key = `${nodeId}-${action}`
    if (loadingAction) return
    setLoadingAction(key)
    try {
      await vmPowerAction(nodeId, action)
      toast.success(`${action} initiated`)
      onRefresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed'
      toast.error(msg)
    } finally {
      setLoadingAction(null)
    }
  }

  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-8 text-center text-white/60">
        No VM nodes registered. Register nodes via the API to manage them here.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {nodes.map((node) => {
        const statusColor = STATUS_COLORS[node.status] ?? STATUS_COLORS.unknown
        const isSelected = selectedNodeId === node.id
        const isOnline = node.status === 'online'
        const isOffline = node.status === 'offline'
        const isBusy = ['starting', 'stopping', 'deallocating', 'restarting'].includes(node.status)

        return (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelectNode(node.id)}
            className={`rounded-lg border bg-[#111118] p-5 text-left transition-colors ${
              isSelected ? 'border-[#D4AF37]' : 'border-[#2A2A35] hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
                <span className="text-sm font-medium text-white">{node.name}</span>
              </div>
              <span className="text-xs text-white/50 uppercase">{node.status}</span>
            </div>

            <div className="space-y-1 mb-4">
              <div className="text-xs text-white/60">
                Role: <span className="text-white/80">{node.vm_role ?? '—'}</span>
              </div>
              <div className="text-xs text-white/60">
                GPU: <span className="text-white/80">{node.gpu_type ? GPU_LABELS[node.gpu_type] ?? node.gpu_type : '—'}</span>
              </div>
              <div className="text-xs text-white/60">
                IP: <span className="text-white/80 font-mono">{node.ip_address ?? '—'}</span>
              </div>
              <div className="text-xs text-white/60">
                Queue: <span className="text-white/80 font-mono">{node.queue_name ?? '—'}</span>
              </div>
              <div className="text-xs text-white/60">
                Schedule: <span className="text-white/80">{node.schedule_mode}</span>
              </div>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                disabled={isBusy || isOnline || !!loadingAction}
                onClick={() => handleAction(node.id, 'start')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs bg-green-900/40 text-green-400 hover:bg-green-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Start VM"
              >
                <Power className="w-3.5 h-3.5" />
                Start
              </button>
              <button
                type="button"
                disabled={isBusy || isOffline || !!loadingAction}
                onClick={() => handleAction(node.id, 'deallocate')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs bg-orange-900/40 text-orange-400 hover:bg-orange-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Deallocate VM"
              >
                <PowerOff className="w-3.5 h-3.5" />
                Deallocate
              </button>
              <button
                type="button"
                disabled={isBusy || isOffline || !!loadingAction}
                onClick={() => handleAction(node.id, 'restart')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs bg-blue-900/40 text-blue-400 hover:bg-blue-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Restart VM"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart
              </button>
              <button
                type="button"
                disabled={isBusy || isOffline || !!loadingAction}
                onClick={() => handleAction(node.id, 'stop')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs bg-red-900/40 text-red-400 hover:bg-red-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Stop VM"
              >
                <Square className="w-3.5 h-3.5" />
                Stop
              </button>
            </div>
          </button>
        )
      })}
    </div>
  )
}
