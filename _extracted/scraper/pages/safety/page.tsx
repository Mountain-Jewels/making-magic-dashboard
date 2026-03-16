// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Loader2,
  Power,
  RefreshCw,
  Shield,
  ShieldAlert,
  XCircle,
  Zap,
} from 'lucide-react'
import {
  getSafetyStatus,
  killSource,
  killAll,
  reviveSource,
  resetCircuit,
} from '@/lib/api/scraper-safety'
import type { KillSwitchStatus, CircuitBreakerStatus } from '@/lib/types/scraper'

function switchStateColor(state: string): string {
  return state === 'active' ? 'text-emerald-400' : 'text-red-400'
}

function circuitColor(state: string): string {
  switch (state) {
    case 'closed': return 'text-emerald-400'
    case 'open': return 'text-red-400'
    case 'half_open': return 'text-amber-400'
    default: return 'text-gray-400'
  }
}

function circuitDot(state: string): string {
  switch (state) {
    case 'closed': return 'bg-emerald-400'
    case 'open': return 'bg-red-400'
    case 'half_open': return 'bg-amber-400'
    default: return 'bg-gray-400'
  }
}

export default function SafetyPage() {
  const qc = useQueryClient()
  const [killReason, setKillReason] = useState('')
  const [killTargetId, setKillTargetId] = useState<string | null>(null)

  const { data: safety, isLoading } = useQuery({
    queryKey: ['scraper-safety'],
    queryFn: getSafetyStatus,
    refetchInterval: 10000,
  })

  const killAllM = useMutation({
    mutationFn: (reason: string) => killAll(reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scraper-safety'] }),
  })

  const killSourceM = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => killSource(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scraper-safety'] })
      setKillTargetId(null)
      setKillReason('')
    },
  })

  const reviveM = useMutation({
    mutationFn: (id: string) => reviveSource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scraper-safety'] }),
  })

  const resetM = useMutation({
    mutationFn: (id: string) => resetCircuit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scraper-safety'] }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const globalKill = safety?.global_kill ?? false
  const switches = safety?.switches ?? []
  const circuits = safety?.circuits ?? []

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-lg font-bold text-white">Safety Controls</h1>

      {/* Global Kill Switch */}
      <div className={`rounded-lg border p-5 ${
        globalKill
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-emerald-400/30 bg-emerald-400/5'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Power className={`h-6 w-6 ${globalKill ? 'text-red-400' : 'text-emerald-400'}`} />
            <div>
              <p className="text-sm font-semibold text-white">Global Kill Switch</p>
              <p className={`text-xs ${globalKill ? 'text-red-400' : 'text-emerald-400'}`}>
                {globalKill ? 'ALL SCRAPING HALTED' : 'System Operational'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Reason…"
              value={killReason}
              onChange={(e) => setKillReason(e.target.value)}
              className="rounded-md border border-[#2A2A35] bg-[#111118] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D4AF37]/50 w-48"
            />
            <button
              onClick={() => killAllM.mutate(killReason || 'Emergency kill from safety panel')}
              disabled={killAllM.isPending || globalKill}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                globalKill
                  ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-500'
              }`}
            >
              {killAllM.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {globalKill ? 'KILLED' : 'Kill All'}
            </button>
          </div>
        </div>
      </div>

      {/* Per-Source Kill Switches */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="h-4 w-4 text-[#D4AF37]" />
          <h2 className="text-sm font-semibold text-white">Per-Source Kill Switches</h2>
        </div>
        <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A35] bg-[#111118]">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Source ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Killed At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Reason</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {switches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No source switches configured
                  </td>
                </tr>
              ) : (
                switches.map((sw) => (
                  <tr key={sw.source_id} className="border-b border-[#2A2A35] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white font-mono text-xs">{sw.source_id}</td>
                    <td className="px-4 py-3 text-gray-400">{sw.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${switchStateColor(sw.state)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sw.state === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {sw.state.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {sw.killed_at ? new Date(sw.killed_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">
                      {sw.reason ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {sw.state === 'active' ? (
                          <>
                            {killTargetId === sw.source_id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Reason…"
                                  value={killReason}
                                  onChange={(e) => setKillReason(e.target.value)}
                                  className="rounded border border-[#2A2A35] bg-[#111118] px-2 py-1 text-xs text-white placeholder:text-white/30 outline-none w-32"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    killSourceM.mutate({ id: sw.source_id, reason: killReason || 'Manual kill' })
                                  }}
                                  disabled={killSourceM.isPending}
                                  className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setKillTargetId(null); setKillReason('') }}
                                  className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); setKillTargetId(sw.source_id) }}
                                className="rounded bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                Kill
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); reviveM.mutate(sw.source_id) }}
                            disabled={reviveM.isPending}
                            className="rounded bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            {reviveM.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Revive'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Circuit Breakers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-[#D4AF37]" />
          <h2 className="text-sm font-semibold text-white">Circuit Breakers</h2>
        </div>
        <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A35] bg-[#111118]">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Circuit ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">State</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Failures</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Last Failure</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {circuits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No circuit breakers configured
                  </td>
                </tr>
              ) : (
                circuits.map((cb) => (
                  <tr key={cb.circuit_id} className="border-b border-[#2A2A35] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white font-mono text-xs">{cb.circuit_id}</td>
                    <td className="px-4 py-3 text-gray-400">{cb.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${circuitColor(cb.state)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${circuitDot(cb.state)}`} />
                        {cb.state.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">{cb.failure_count}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {cb.last_failure_at ? new Date(cb.last_failure_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {cb.state !== 'closed' && (
                        <button
                          onClick={() => resetM.mutate(cb.circuit_id)}
                          disabled={resetM.isPending}
                          className="flex items-center gap-1.5 ml-auto rounded bg-[#D4AF37]/10 px-2.5 py-1 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
                        >
                          {resetM.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          Reset
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
