/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  getFashionModels,
  getInventory,
  getNeeds,
  searchWardrobe,
  approveCandidate,
  triggerFashionNightly,
} from '@/lib/api/fashion'
import type { FashionModel, InventoryItem, WardrobeNeed, SearchCandidate } from '@/lib/api/fashion'
import { Card } from '@/components/shared/Card'
import { TabSwitcher } from '@/components/shared/TabSwitcher'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

const INPUT =
  'w-full bg-surface border border-surface-border rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold'
const BTN_GOLD =
  'bg-gold text-black text-sm font-medium rounded-md px-4 py-2 hover:bg-gold-hover disabled:opacity-50 transition-colors'
const BTN_OUTLINE =
  'border border-surface-border text-white/70 text-sm font-medium rounded-md px-4 py-2 hover:text-white hover:border-white/30 transition-colors'

type FashionTab = 'inventory' | 'needs' | 'search' | 'nightly'

const TABS: { id: FashionTab; label: string }[] = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'needs', label: 'Wardrobe Needs' },
  { id: 'search', label: 'Search & Approve' },
  { id: 'nightly', label: 'Audit' },
]

/* ────────────────────── Inventory ────────────────────── */

function InventoryTab({ modelId }: { modelId: string }) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getInventory(modelId).then((r) => { setItems(r); setLoading(false) })
  }, [modelId])

  if (loading) return <p className="text-xs text-white/40">Loading inventory…</p>
  if (items.length === 0) return <EmptyState title="No wardrobe items" description="This model has no approved wardrobe items yet." />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.candidate_id} className="bg-surface border border-surface-border rounded-lg p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-white font-medium truncate">{item.title}</p>
              <p className="text-xs text-white/40 mt-0.5">{item.source_type} · {item.slot ?? 'unslotted'}</p>
            </div>
            <StatusBadge status={item.approved ? 'active' : 'pending'} />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {item.slot_tags.map((t) => (
              <span key={t} className="text-[10px] bg-gold/10 text-gold rounded px-1.5 py-0.5">{t}</span>
            ))}
            {item.occasion_tags.map((t) => (
              <span key={t} className="text-[10px] bg-blue-500/10 text-blue-400 rounded px-1.5 py-0.5">{t}</span>
            ))}
            {item.color_tags.map((t) => (
              <span key={t} className="text-[10px] bg-purple-500/10 text-purple-400 rounded px-1.5 py-0.5">{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ────────────────────── Needs ────────────────────── */

function NeedsTab({ modelId }: { modelId: string }) {
  const [needs, setNeeds] = useState<WardrobeNeed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getNeeds(modelId).then((r) => { setNeeds(r); setLoading(false) })
  }, [modelId])

  if (loading) return <p className="text-xs text-white/40">Computing wardrobe needs…</p>
  if (needs.length === 0) return <EmptyState title="Wardrobe complete" description="This model's wardrobe meets all targets." />

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/40 text-xs">
            <th className="pb-2 pr-4">Slot</th>
            <th className="pb-2 pr-4">Current</th>
            <th className="pb-2 pr-4">Target</th>
            <th className="pb-2 pr-4">Deficit</th>
            <th className="pb-2 pr-4">Priority</th>
            <th className="pb-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {needs.map((n) => (
            <tr key={n.slot} className="border-t border-surface-border/50">
              <td className="py-2 pr-4 text-white font-medium">{n.slot}</td>
              <td className="py-2 pr-4 text-white/70">{n.current_count}</td>
              <td className="py-2 pr-4 text-white/70">{n.target_count}</td>
              <td className="py-2 pr-4">
                <span className={n.deficit > 0 ? 'text-red-400' : 'text-green-400'}>
                  {n.deficit > 0 ? `-${n.deficit}` : '✓'}
                </span>
              </td>
              <td className="py-2 pr-4">
                <div className="w-16 h-1.5 bg-surface-border rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${Math.min(100, n.priority_score * 100)}%` }} />
                </div>
              </td>
              <td className="py-2 text-white/40 text-xs truncate max-w-[200px]">{n.notes ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ────────────────────── Search & Approve ────────────────────── */

function SearchTab({ modelId, modelName }: { modelId: string; modelName: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchCandidate[]>([])
  const [searching, setSearching] = useState(false)

  const doSearch = useCallback(async () => {
    setSearching(true)
    const r = await searchWardrobe(modelId, query)
    setResults(r)
    setSearching(false)
  }, [modelId, query])

  const handleApprove = async (c: SearchCandidate) => {
    try {
      await approveCandidate(modelId, c.candidate_id, c.source, c.slot ?? undefined, c.title)
      toast.success(`Approved "${c.title}" for ${modelName}`)
      setResults((prev) => prev.filter((r) => r.candidate_id !== c.candidate_id))
    } catch {
      toast.error('Failed to approve candidate')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          className={INPUT}
          placeholder="Search wardrobe candidates…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
        />
        <button onClick={doSearch} disabled={searching} className={BTN_GOLD}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {results.map((c) => (
            <div key={c.candidate_id} className="bg-surface border border-surface-border rounded-lg p-3 flex flex-col gap-2">
              <div>
                <p className="text-sm text-white font-medium truncate">{c.title}</p>
                <p className="text-xs text-white/40">{c.source} · score {c.score.toFixed(2)}</p>
              </div>
              <button onClick={() => handleApprove(c)} className={BTN_OUTLINE + ' text-xs self-start'}>
                Approve
              </button>
            </div>
          ))}
        </div>
      ) : !searching ? (
        <EmptyState title="No results" description="Search for wardrobe candidates by keyword." />
      ) : null}
    </div>
  )
}

/* ────────────────────── Nightly Audit ────────────────────── */

function NightlyTab() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{ status: string; models_processed?: number } | null>(null)

  const run = async () => {
    setRunning(true)
    setResult(null)
    try {
      const r = await triggerFashionNightly()
      setResult(r)
      toast.success('Fashion nightly audit complete')
    } catch {
      toast.error('Failed to run fashion audit')
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card title="Fashion Nightly Audit">
      <p className="text-xs text-white/40 mb-4">
        Runs the Fashion Guru service across all MetaHumans — computes wardrobe needs, identifies gaps, and prioritizes shopping.
      </p>
      <button onClick={run} disabled={running} className={BTN_GOLD}>
        {running ? 'Running…' : 'Run Fashion Audit'}
      </button>
      {result && (
        <div className="mt-4 p-3 bg-surface border border-surface-border rounded-lg">
          <p className="text-sm text-white">
            Status: <span className="text-gold">{result.status}</span>
          </p>
          {result.models_processed !== undefined && (
            <p className="text-xs text-white/50 mt-1">Models processed: {result.models_processed}</p>
          )}
        </div>
      )}
    </Card>
  )
}

/* ────────────────────── Main Page ────────────────────── */

export default function FashionPage() {
  const [models, setModels] = useState<FashionModel[]>([])
  const [selected, setSelected] = useState<FashionModel | null>(null)
  const [tab, setTab] = useState<FashionTab>('inventory')

  useEffect(() => {
    getFashionModels().then((list) => {
      setModels(list)
      if (list.length > 0) setSelected(list[0])
    })
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Fashion</h1>
        <p className="text-sm text-white/50 mt-1">
          Wardrobe management — inventory, needs analysis, search, and approval
        </p>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-6">
        <Card title="Models">
          <div className="flex flex-col gap-1">
            {models.length === 0 && (
              <p className="text-xs text-white/30 px-3 py-2">Loading models…</p>
            )}
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selected?.id === m.id
                    ? 'bg-gold/10 text-gold'
                    : 'text-white/60 hover:text-white hover:bg-surface/50'
                }`}
              >
                <span>{m.name}</span>
                {m.brand_archetype && (
                  <span className="block text-[10px] text-white/30">{m.brand_archetype}</span>
                )}
              </button>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {selected ? (
            <>
              <TabSwitcher tabs={TABS} active={tab} onChange={setTab} />
              {tab === 'inventory' && <Card title="Wardrobe Inventory"><InventoryTab modelId={selected.id} /></Card>}
              {tab === 'needs' && <Card title="Wardrobe Needs"><NeedsTab modelId={selected.id} /></Card>}
              {tab === 'search' && <Card title="Search & Approve"><SearchTab modelId={selected.id} modelName={selected.name} /></Card>}
              {tab === 'nightly' && <NightlyTab />}
            </>
          ) : (
            <EmptyState
              title="Select a model"
              description="Choose a MetaHuman to manage their wardrobe."
            />
          )}
        </div>
      </div>
    </div>
  )
}
