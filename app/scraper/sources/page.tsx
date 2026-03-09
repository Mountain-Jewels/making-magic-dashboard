// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Database,
  Loader2,
  Search,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
} from 'lucide-react'
import { getSourceMatrix } from '@/lib/api/scraper-governance'
import type { SourceCategory, ParameterConstraint, ParameterStatus } from '@/lib/types/scraper'

function statusBadge(status: ParameterStatus) {
  switch (status) {
    case 'allowed':
      return { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: ShieldCheck }
    case 'disabled':
      return { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: ShieldAlert }
    case 'forbidden':
      return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: ShieldX }
    default:
      return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Database }
  }
}

function ParameterBadge({ name, constraint }: { name: string; constraint: ParameterConstraint }) {
  const { color, icon: Icon } = statusBadge(constraint.status)
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${color}`}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className="font-medium">{name}</span>
      {constraint.reason && (
        <span className="text-white/40 ml-1">— {constraint.reason}</span>
      )}
    </div>
  )
}

function SourceCard({ source }: { source: SourceCategory }) {
  const params = Object.entries(source.parameters)
  const allowed = params.filter(([, c]) => c.status === 'allowed').length
  const disabled = params.filter(([, c]) => c.status === 'disabled').length
  const forbidden = params.filter(([, c]) => c.status === 'forbidden').length

  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[#D4AF37]" />
          <h3 className="text-sm font-semibold text-white">{source.category}</h3>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">v{source.version}</span>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="text-emerald-400">{allowed} allowed</span>
        <span className="text-amber-400">{disabled} disabled</span>
        <span className="text-red-400">{forbidden} forbidden</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {params.map(([name, constraint]) => (
          <ParameterBadge key={name} name={name} constraint={constraint} />
        ))}
      </div>

      {params.some(([, c]) => c.options && c.options.length > 0) && (
        <div className="mt-4 space-y-2">
          {params
            .filter(([, c]) => c.options && c.options.length > 0)
            .map(([name, c]) => (
              <div key={name}>
                <p className="text-[10px] text-gray-400 mb-1">
                  {name} options:
                </p>
                <div className="flex flex-wrap gap-1">
                  {c.options!.map((opt) => (
                    <span
                      key={opt}
                      className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60 font-mono"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {params.some(([, c]) => c.levels && c.levels.length > 0) && (
        <div className="mt-4 space-y-2">
          {params
            .filter(([, c]) => c.levels && c.levels.length > 0)
            .map(([name, c]) => (
              <div key={name}>
                <p className="text-[10px] text-gray-400 mb-1">
                  {name} levels:
                </p>
                <div className="flex flex-wrap gap-1">
                  {c.levels!.map((lvl) => (
                    <span
                      key={lvl}
                      className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60 font-mono"
                    >
                      {lvl}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default function SourcesPage() {
  const [filter, setFilter] = useState('')

  const { data: matrix, isLoading } = useQuery({
    queryKey: ['source-matrix'],
    queryFn: getSourceMatrix,
  })

  const sources = (matrix ?? []).filter((s) =>
    filter === '' || s.category.toLowerCase().includes(filter.toLowerCase()),
  )

  const totalAllowed = sources.reduce(
    (sum, s) => sum + Object.values(s.parameters).filter((c) => c.status === 'allowed').length, 0,
  )
  const totalDisabled = sources.reduce(
    (sum, s) => sum + Object.values(s.parameters).filter((c) => c.status === 'disabled').length, 0,
  )
  const totalForbidden = sources.reduce(
    (sum, s) => sum + Object.values(s.parameters).filter((c) => c.status === 'forbidden').length, 0,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Source Browser</h1>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-emerald-400">{totalAllowed} allowed</span>
          <span className="text-amber-400">{totalDisabled} disabled</span>
          <span className="text-red-400">{totalForbidden} forbidden</span>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter source categories…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-md border border-[#2A2A35] bg-[#1A1A24] pl-10 pr-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D4AF37]/50"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-12 text-center">
          <p className="text-sm text-gray-400">No sources found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sources.map((s) => (
            <SourceCard key={s.category} source={s} />
          ))}
        </div>
      )}
    </div>
  )
}
