/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { User, Scissors, Palette, Shirt, Footprints, Gem, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { listMetahumans, seedMetahumans, syncMetahumans } from '@/lib/api/metahumans'
import type { MetaHuman } from '@/lib/api/metahumans'
import { getWardrobeInventory, getWardrobeNeeds, searchWardrobeCandidates, approveWardrobeCandidate } from '@/lib/api/fashion'
import type { WardrobeItem, WardrobeCandidate } from '@/lib/api/fashion'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { useAssetRegistryStore } from '@/lib/stores/asset-registry-store'
import { loadAvatar } from '@/lib/api/scene-control'
import { LightingAdvisor } from '@/components/studio/LightingAdvisor'
import { AvatarBrainPanel } from '@/components/studio/AvatarBrainPanel'
import { CustomPieceDesigner } from '@/components/studio/CustomPieceDesigner'
import { useAvatarBrainStore } from '@/lib/stores/avatar-brain-store'

interface StyleSection {
  id: string
  label: string
  icon: React.ElementType
  slot: string
}

const STYLE_SECTIONS: StyleSection[] = [
  { id: 'hair', label: 'Hair', icon: Scissors, slot: 'hair' },
  { id: 'makeup', label: 'Makeup', icon: Palette, slot: 'makeup' },
  { id: 'clothing', label: 'Clothing', icon: Shirt, slot: 'top' },
  { id: 'shoes', label: 'Shoes', icon: Footprints, slot: 'shoes' },
  { id: 'jewelry', label: 'Jewelry', icon: Gem, slot: 'jewelry' },
]

export function AvatarStudio() {
  const sceneStore = useSceneStateStore()
  const { getAvatarThumbnail, getWardrobeThumbnail } = useAssetRegistryStore()
  const { loadBrain, recordFashionChoice, setActiveAvatar } = useAvatarBrainStore()
  const [avatars, setAvatars] = useState<MetaHuman[]>([])
  const [selected, setSelected] = useState<MetaHuman | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string | null>('hair')

  const [inventory, setInventory] = useState<WardrobeItem[]>([])
  const [candidates, setCandidates] = useState<WardrobeCandidate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const loadAvatars = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listMetahumans()
      setAvatars(list)
      if (list.length > 0 && !selected) setSelected(list[0])
    } catch {
      toast.error('Failed to load avatars')
    } finally {
      setLoading(false)
    }
  }, [selected])

  useEffect(() => { loadAvatars() }, [loadAvatars])

  useEffect(() => {
    if (!selected) return
    getWardrobeInventory(selected.id)
      .then(setInventory)
      .catch(() => setInventory([]))
  }, [selected])

  async function handleSeed() {
    try {
      await seedMetahumans()
      toast.success('MetaHumans seeded')
      loadAvatars()
    } catch { toast.error('Seed failed') }
  }

  async function handleSync() {
    try {
      await syncMetahumans()
      toast.success('Synced from UE')
      loadAvatars()
    } catch { toast.error('Sync failed') }
  }

  async function handleSearch(slot: string) {
    if (!selected || !searchQuery.trim()) return
    setSearching(true)
    try {
      const results = await searchWardrobeCandidates(selected.id, slot, searchQuery)
      setCandidates(results)
    } catch { toast.error('Search failed') }
    finally { setSearching(false) }
  }

  async function handleApprove(candidateId: string) {
    if (!selected) return
    try {
      await approveWardrobeCandidate(selected.id, candidateId)
      sceneStore.addWardrobe(candidateId)
      recordFashionChoice(selected.id, candidateId, true)
      toast.success('Item approved and added')
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId))
      const inv = await getWardrobeInventory(selected.id)
      setInventory(inv)
    } catch { toast.error('Approve failed') }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header + actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div>
          <h2 className="text-sm font-semibold text-white">Avatar Studio</h2>
          <p className="text-[11px] text-white/30">Select and style MetaHuman avatars</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSeed} className="px-3 py-1.5 text-[11px] bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors">
            Seed Defaults
          </button>
          <button onClick={handleSync} className="px-3 py-1.5 text-[11px] border border-surface-border text-white/50 rounded hover:bg-white/5 transition-colors">
            Sync UE
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Avatar picker grid */}
        <div className="w-[200px] border-r border-surface-border overflow-y-auto p-2 shrink-0">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-1 mb-2">
            MetaHumans
          </p>
          {loading ? (
            <div className="flex items-center justify-center h-20 text-xs text-white/20">Loading...</div>
          ) : avatars.length === 0 ? (
            <div className="text-xs text-white/20 text-center py-4">No avatars found. Seed defaults to start.</div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {avatars.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelected(a)
                    sceneStore.setAvatar(a.name)
                    loadAvatar(a.name).catch(() => {})
                    setActiveAvatar(a.id)
                    loadBrain(a.id, a.name)
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                    selected?.id === a.id
                      ? 'border-gold bg-gold/5'
                      : 'border-surface-border hover:border-white/20 bg-surface'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-surface-panel flex items-center justify-center mb-1 overflow-hidden">
                    {getAvatarThumbnail(a) ? (
                      <img src={getAvatarThumbnail(a)!} alt={a.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-white/20" />
                    )}
                  </div>
                  <span className="text-[10px] text-white/60 truncate w-full text-center">
                    {a.name}
                  </span>
                  <span className="text-[8px] text-white/25">{a.gender}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Top-to-bottom styler */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {selected ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden">
                  {getAvatarThumbnail(selected) ? (
                    <img src={getAvatarThumbnail(selected)!} alt={selected.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-gold" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{selected.name}</p>
                  <p className="text-[10px] text-white/30">
                    {selected.gender} · {selected.brand_archetype || 'No archetype'} · {selected.skeleton_type}
                    {selected.lighting_profile?.skin_tone && (
                      <> · {selected.lighting_profile.skin_tone} skin</>
                    )}
                  </p>
                </div>
              </div>

              {STYLE_SECTIONS.map((sec) => {
                const open = expandedSection === sec.id
                const Icon = sec.icon
                const items = inventory.filter((i) => i.type === sec.slot)
                return (
                  <div key={sec.id} className="border border-surface-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(open ? null : sec.id)}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/3 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-white/40" />
                      <span className="text-xs font-medium text-white/70 flex-1 text-left">{sec.label}</span>
                      <span className="text-[10px] text-white/25">{items.length} items</span>
                      {open ? <ChevronDown className="h-3 w-3 text-white/25" /> : <ChevronRight className="h-3 w-3 text-white/25" />}
                    </button>
                    {open && (
                      <div className="px-3 pb-3 border-t border-surface-border pt-2">
                        {/* Current items */}
                        {items.length > 0 ? (
                          <div className="grid grid-cols-3 gap-1.5 mb-3">
                            {items.map((it, idx) => (
                              <div key={idx} className="p-2 bg-surface rounded border border-surface-border">
                                <div className="h-12 bg-surface-panel rounded flex items-center justify-center mb-1 overflow-hidden">
                                  {getWardrobeThumbnail(it) ? (
                                    <img src={getWardrobeThumbnail(it)!} alt={it.name || ''} className="h-full w-full object-cover rounded" />
                                  ) : (
                                    <Icon className="h-5 w-5 text-white/10" />
                                  )}
                                </div>
                                <p className="text-[9px] text-white/40 truncate">{it.name || `Item ${idx + 1}`}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-white/20 mb-2">No {sec.label.toLowerCase()} items yet</p>
                        )}

                        {/* AI search */}
                        <div className="flex items-center gap-1.5">
                          <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${sec.label.toLowerCase()}...`}
                            className="flex-1 h-7 px-2 bg-surface border border-surface-border rounded text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(sec.slot)}
                          />
                          <button
                            onClick={() => handleSearch(sec.slot)}
                            disabled={searching}
                            className="flex items-center gap-1 h-7 px-2 bg-gold/10 text-gold text-[10px] rounded hover:bg-gold/20 transition-colors disabled:opacity-40"
                          >
                            <Sparkles className="h-3 w-3" />
                            AI Find
                          </button>
                        </div>

                        {/* Search results */}
                        {candidates.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {candidates.map((c) => (
                              <div key={c.id} className="flex items-center justify-between p-2 bg-surface rounded border border-surface-border gap-2">
                                <div className="h-8 w-8 rounded bg-surface-panel shrink-0 overflow-hidden flex items-center justify-center">
                                  {c.thumbnail_url ? (
                                    <img src={c.thumbnail_url} alt={c.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <Icon className="h-4 w-4 text-white/10" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] text-white/60 truncate">{c.name}</p>
                                  <p className="text-[9px] text-white/25">{c.source} · score {((c.score || 0) * 100).toFixed(0)}%</p>
                                </div>
                                <button
                                  onClick={() => handleApprove(c.id)}
                                  className="px-2 py-1 bg-success/20 text-success text-[10px] rounded hover:bg-success/30"
                                >
                                  Add
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Per-avatar custom piece designer */}
              <div className="mt-3 p-3 bg-surface-panel rounded-lg border border-surface-border">
                <CustomPieceDesigner avatarId={selected.id} avatarName={selected.name} />
              </div>

              {/* Per-avatar lighting intelligence */}
              <div className="mt-3 bg-surface-panel rounded-lg border border-gold/10">
                <LightingAdvisor />
              </div>

              {/* Avatar Brain — per-avatar autonomous intelligence */}
              <div className="mt-3 bg-surface-panel rounded-lg border border-surface-border">
                <AvatarBrainPanel metahumanId={selected.id} metahumanName={selected.name} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-white/20">
              Select an avatar to begin styling
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
