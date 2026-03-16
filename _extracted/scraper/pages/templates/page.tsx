// © 2026 Mountain Jewels LLC. All rights reserved.

'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Copy,
  FileCheck,
  Loader2,
  Search,
} from 'lucide-react'
import { listTemplates } from '@/lib/api/scraper-templates'
import { DeriveModal } from '@/components/scraper/DeriveModal'
import { FinalizeModal } from '@/components/scraper/FinalizeModal'
import type { SearchTemplate, TemplateStatus } from '@/lib/types/scraper'

const STATUS_FILTERS: { value: TemplateStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'NOT_DEPLOYED', label: 'Not Deployed' },
  { value: 'DEPLOYED', label: 'Deployed' },
  { value: 'PREVIOUSLY_DEPLOYED', label: 'Previously Deployed' },
]

function statusBadge(status: TemplateStatus): string {
  switch (status) {
    case 'DEPLOYED': return 'bg-emerald-500/20 text-emerald-400'
    case 'NOT_DEPLOYED': return 'bg-gray-500/20 text-gray-400'
    case 'PREVIOUSLY_DEPLOYED': return 'bg-amber-500/20 text-amber-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

function TemplateCard({
  template,
  onDerive,
  onFinalize,
}: {
  template: SearchTemplate
  onDerive: () => void
  onFinalize: () => void
}) {
  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white truncate">{template.name}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusBadge(template.status)}`}>
          {template.status.replace(/_/g, ' ')}
        </span>
      </div>

      {template.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{template.description}</p>
      )}

      <div className="space-y-1.5 text-xs mb-4">
        <div className="flex justify-between">
          <span className="text-gray-400">Category</span>
          <span className="text-white">{template.scope.category.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Jurisdiction</span>
          <span className="text-white">
            {[template.scope.jurisdiction.state, template.scope.jurisdiction.county, template.scope.jurisdiction.city]
              .filter(Boolean)
              .join(' › ') || template.scope.jurisdiction.country}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Max Pages</span>
          <span className="text-white">{template.constraints.max_pages.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Max Cost</span>
          <span className="text-white">${template.constraints.max_cost_usd.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Time Window</span>
          <span className="text-white font-mono">{template.schedule.time_window}</span>
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-gray-400 mb-4">
        <span>Created by {template.created_by}</span>
        <span>{new Date(template.created_at).toLocaleDateString()}</span>
      </div>

      {template.derived_from_template_id && (
        <p className="text-[10px] text-gray-400 mb-3">
          Derived from <span className="font-mono text-white/50">{template.derived_from_template_id.slice(0, 12)}</span>
        </p>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-[#2A2A35]">
        <button
          onClick={onDerive}
          className="flex items-center gap-1.5 rounded-md bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-medium text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
        >
          <Copy className="h-3 w-3" />
          Derive
        </button>
        <button
          onClick={onFinalize}
          className="flex items-center gap-1.5 rounded-md bg-white/5 border border-[#2A2A35] px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
        >
          <FileCheck className="h-3 w-3" />
          Finalize
        </button>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [deriveOpen, setDeriveOpen] = useState(false)
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SearchTemplate | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['scraper-templates', statusFilter],
    queryFn: () =>
      listTemplates(
        statusFilter === 'ALL' ? { limit: 50 } : { status: statusFilter, limit: 50 },
      ),
  })

  const templates = (data?.templates ?? []).filter(
    (t) => search === '' || t.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-white">Search Templates</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-[#2A2A35] bg-[#1A1A24] pl-10 pr-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D4AF37]/50"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'text-gray-400 border border-[#2A2A35] hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-12 text-center">
          <p className="text-sm text-gray-400">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <TemplateCard
              key={t.template_id}
              template={t}
              onDerive={() => {
                setSelectedTemplate(t)
                setDeriveOpen(true)
              }}
              onFinalize={() => {
                setSelectedTemplate(t)
                setFinalizeOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {deriveOpen && selectedTemplate && (
        <DeriveModal
          template={selectedTemplate}
          onClose={() => { setDeriveOpen(false); setSelectedTemplate(null) }}
        />
      )}

      {finalizeOpen && selectedTemplate && (
        <FinalizeModal
          template={selectedTemplate}
          onClose={() => { setFinalizeOpen(false); setSelectedTemplate(null) }}
        />
      )}
    </div>
  )
}
