'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/lib/auth/useAuth'
import { getNodes } from '@/lib/api/vm-control'
import type { VmNode } from '@/lib/types/vm-control'
import { VmCardSection } from './VmCardSection'
import { ScheduleGridSection } from './ScheduleGridSection'
import { SchedulingAISection } from './SchedulingAISection'
import { LightingPreviewSection } from './LightingPreviewSection'
import { CinematicSection } from './CinematicSection'
import { OperationsLogSection } from './OperationsLogSection'

export default function OperationsPage() {
  const { getRoles } = useAuth()
  const [role, setRole] = useState<'admin' | 'user' | 'unknown'>('unknown')
  const [loadingRole, setLoadingRole] = useState(true)
  const [nodes, setNodes] = useState<VmNode[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void getRoles().then((roles) => {
      setRole(roles.includes('admin') ? 'admin' : 'user')
      setLoadingRole(false)
    })
  }, [getRoles])

  const refreshAll = useCallback(async () => {
    try {
      const data = await getNodes()
      setNodes(data)
      setError(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load VM nodes'
      setError(msg)
      toast.error(msg)
    }
  }, [])

  useEffect(() => {
    if (role === 'admin') void refreshAll()
  }, [role, refreshAll])

  useEffect(() => {
    if (role !== 'admin') return
    const interval = setInterval(refreshAll, 30_000)
    return () => clearInterval(interval)
  }, [role, refreshAll])

  if (loadingRole) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60">Loading…</div>
      </div>
    )
  }

  if (role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60 text-sm">Unauthorized — admin role required</div>
      </div>
    )
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">VM Operations Console</h1>
        <p className="text-sm text-white/50 mt-1">
          Manage GPU virtual machines — power control, scheduling, and operations history
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <VmCardSection
        nodes={nodes}
        onRefresh={refreshAll}
        onSelectNode={setSelectedNodeId}
        selectedNodeId={selectedNodeId}
      />

      <ScheduleGridSection node={selectedNode} onRefresh={refreshAll} />

      <SchedulingAISection />

      <LightingPreviewSection />

      <CinematicSection />

      <OperationsLogSection nodeId={selectedNodeId} />
    </div>
  )
}
