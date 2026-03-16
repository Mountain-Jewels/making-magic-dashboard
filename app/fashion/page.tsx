/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import {
  getFashionModels,
  getWardrobeInventory,
  getWardrobeNeeds,
  searchWardrobeCandidates,
  approveWardrobeCandidate,
} from '@/lib/api/fashion'
import type { FashionModel, WardrobeItem, WardrobeCandidate } from '@/lib/api/fashion'
import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'

type Tab = 'inventory' | 'needs'

const inputClass =
  'w-full px-3 py-2 bg-surface-panel border border-surface-border rounded-md text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-brand-gold'
const buttonClass =
  'px-4 py-2 bg-brand-gold text-black font-medium text-sm rounded-md hover:bg-brand-gold/90 disabled:opacity-50'

export default function FashionPage() {
  const [models, setModels] = useState<FashionModel[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<Tab>('inventory')

  const [inventory, setInventory] = useState<WardrobeItem[]>([])
  const [loadingInventory, setLoadingInventory] = useState(false)

  const [needs, setNeeds] = useState<{ slot: string; deficit: number; notes?: string }[]>([])
  const [loadingNeeds, setLoadingNeeds] = useState(false)

  const [itemType, setItemType] = useState('')
  const [query, setQuery] = useState('')
  const [candidates, setCandidates] = useState<WardrobeCandidate[]>([])
  const [searching, setSearching] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const loadModels = useCallback(async () => {
    try {
      const list = await getFashionModels()
      setModels(list)
      if (list.length && !selectedModelId) {
        setSelectedModelId(list[0].id)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load models'
      toast.error(msg)
    }
  }, [selectedModelId])

  useEffect(() => {
    void loadModels()
  }, [loadModels])

  const loadInventory = useCallback(async () => {
    if (!selectedModelId) return
    setLoadingInventory(true)
    try {
      const items = await getWardrobeInventory(selectedModelId)
      setInventory(items)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load inventory'
      toast.error(msg)
    } finally {
      setLoadingInventory(false)
    }
  }, [selectedModelId])

  const loadNeeds = useCallback(async () => {
    if (!selectedModelId) return
    setLoadingNeeds(true)
    try {
      const res = await getWardrobeNeeds(selectedModelId)
      setNeeds(
        res.map((n) => ({
          slot: n.slot,
          deficit: n.deficit,
          notes: n.notes,
        }))
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load needs'
      toast.error(msg)
    } finally {
      setLoadingNeeds(false)
    }
  }, [selectedModelId])

  useEffect(() => {
    if (selectedModelId) {
      if (activeTab === 'inventory') void loadInventory()
      else void loadNeeds()
    }
  }, [selectedModelId, activeTab, loadInventory, loadNeeds])

  const handleSearch = useCallback(async () => {
    if (!selectedModelId) {
      toast.error('Select a model first')
      return
    }
    setSearching(true)
    try {
      const slots = itemType.trim() ? [itemType.trim()] : []
      const list = await searchWardrobeCandidates(selectedModelId, query.trim(), slots)
      setCandidates(list)
      toast.success(`Found ${list.length} candidates`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Search failed'
      toast.error(msg)
      setCandidates([])
    } finally {
      setSearching(false)
    }
  }, [selectedModelId, itemType, query])

  const handleApprove = useCallback(
    async (c: WardrobeCandidate) => {
      if (!selectedModelId) return
      setApprovingId(c.candidate_id)
      try {
        await approveWardrobeCandidate(
          selectedModelId,
          c.candidate_id,
          c.source_type ?? 'internal',
          { slot: c.slot, title: c.title }
        )
        toast.success('Candidate approved')
        void loadInventory()
        void loadNeeds()
        setCandidates((prev) => prev.filter((x) => x.candidate_id !== c.candidate_id))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Approve failed'
        toast.error(msg)
      } finally {
        setApprovingId(null)
      }
    },
    [selectedModelId, loadInventory, loadNeeds]
  )

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Fashion & Wardrobe</h1>
        <p className="mt-1 text-sm text-white/60">
          Manage avatar wardrobes, search candidates, approve outfits
        </p>
      </header>

      <Card>
        <label className="mb-2 block text-sm font-medium text-white/80">Model</label>
        <select
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
          className={inputClass}
        >
          <option value="">Select a model</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Card>

      <div className="flex gap-2 border-b border-surface-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'inventory' ? 'bg-brand-gold text-black' : 'bg-surface-panel text-white/80 hover:bg-surface-elevated'}`}
        >
          Inventory
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('needs')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'needs' ? 'bg-brand-gold text-black' : 'bg-surface-panel text-white/80 hover:bg-surface-elevated'}`}
        >
          Needs & Search
        </button>
      </div>

      {activeTab === 'inventory' && (
        <Card>
          <h2 className="mb-4 text-lg font-medium text-white">Inventory</h2>
          {loadingInventory ? (
            <p className="text-sm text-white/60">Loading…</p>
          ) : inventory.length === 0 ? (
            <p className="text-sm text-white/60">No items in wardrobe.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-white/60">
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.candidate_id} className="border-b border-surface-border/50">
                      <td className="py-2 pr-4 text-white">{item.slot ?? '-'}</td>
                      <td className="py-2 pr-4 text-white">{item.title ?? item.candidate_id}</td>
                      <td className="py-2">
                        <StatusBadge status={item.approved ? 'approved' : 'pending'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'needs' && (
        <>
          <Card>
            <h2 className="mb-4 text-lg font-medium text-white">Needs</h2>
            {loadingNeeds ? (
              <p className="text-sm text-white/60">Loading…</p>
            ) : needs.length === 0 ? (
              <p className="text-sm text-white/60">No needs computed.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {needs.map((n) => (
                  <span
                    key={n.slot}
                    className="inline-flex items-center rounded-md border border-surface-border bg-surface-elevated px-3 py-1 text-sm text-white"
                  >
                    {n.slot}: {n.deficit} needed
                  </span>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-medium text-white">Search</h2>
            <div className="mb-4 flex flex-wrap gap-4">
              <div className="min-w-[200px]">
                <label className="mb-1 block text-xs text-white/60">Item type</label>
                <input
                  type="text"
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  placeholder="e.g. top, dress"
                  className={inputClass}
                />
              </div>
              <div className="min-w-[200px] flex-1">
                <label className="mb-1 block text-xs text-white/60">Query</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search keywords"
                  className={inputClass}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className={buttonClass}
                >
                  {searching ? 'Searching…' : 'Search'}
                </button>
              </div>
            </div>

            {candidates.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {candidates.map((c) => (
                  <div
                    key={c.candidate_id}
                    className="rounded-lg border border-surface-border bg-surface-elevated p-4"
                  >
                    <p className="font-medium text-white">{c.title ?? c.candidate_id}</p>
                    <p className="text-xs text-white/60">Source: {c.source_type}</p>
                    <p className="text-xs text-white/60">Score: {c.score?.toFixed(2) ?? '-'}</p>
                    <button
                      type="button"
                      onClick={() => handleApprove(c)}
                      disabled={approvingId === c.candidate_id}
                      className={`mt-2 ${buttonClass}`}
                    >
                      {approvingId === c.candidate_id ? 'Approving…' : 'Approve'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
