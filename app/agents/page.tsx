/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { listAgents, getAgent } from '@/lib/api/agents'
import type { AgentInfo } from '@/lib/api/agents'

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AgentInfo | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    listAgents()
      .then(setAgents)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load agents'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = useCallback(async (agentType: string) => {
    if (selected?.agent_type === agentType) {
      setSelected(null)
      return
    }
    setDetailLoading(true)
    try {
      const detail = await getAgent(agentType)
      setSelected(detail)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load agent detail')
    } finally {
      setDetailLoading(false)
    }
  }, [selected])

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">AI Agents</h1>
        <p className="text-sm text-white/50 mt-1">Specialist agent registry and capabilities</p>
      </div>

      {loading ? (
        <div className="text-center text-white/60 py-12">Loading agents…</div>
      ) : agents.length === 0 ? (
        <EmptyState title="No agents registered" description="The agent registry is empty." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const isSelected = selected?.agent_type === agent.agent_type
            return (
              <button
                key={agent.agent_type}
                onClick={() => handleSelect(agent.agent_type)}
                className={`text-left rounded-lg border p-4 transition-colors ${
                  isSelected
                    ? 'border-gold bg-gold/5'
                    : 'border-surface-border bg-surface-panel hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white">{agent.name}</h3>
                  <StatusBadge status={agent.status ?? 'ready'} />
                </div>
                <p className="text-xs text-white/50 mb-3">{agent.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities.slice(0, 4).map((cap) => (
                    <span
                      key={cap}
                      className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/60"
                    >
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 4 && (
                    <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/40">
                      +{agent.capabilities.length - 4}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {detailLoading && (
        <div className="text-center text-white/60 py-4">Loading detail…</div>
      )}

      {selected && !detailLoading && (
        <Card title={selected.name} subtitle={selected.agent_type}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-white/80">{selected.description}</p>
            </div>

            <div>
              <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Status</p>
              <StatusBadge status={selected.status ?? 'ready'} />
            </div>

            <div>
              <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-2">
                {selected.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="inline-flex items-center rounded-full bg-gold/10 border border-gold/20 px-2.5 py-0.5 text-xs font-medium text-gold"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
