'use client'

import { useCallback, useEffect, useState } from 'react'

import { FashionPanel } from '@/components/fashion/FashionPanel'
import {
  approveFashionCandidate,
  fetchFashionInventory,
  fetchFashionModels,
  fetchFashionNeeds,
  searchFashion,
  type FashionCandidate,
  type FashionModel,
  type WardrobeInventoryItem,
  type WardrobeNeed,
} from '@/lib/api/fashion'
import { useAuth } from '@/lib/auth/useAuth'

export default function FashionPage() {
  const { getRoles } = useAuth()
  const [role, setRole] = useState<'admin' | 'user' | 'unknown'>('unknown')
  const [loadingRole, setLoadingRole] = useState(true)

  const [panelOpen, setPanelOpen] = useState(false)
  const [models, setModels] = useState<FashionModel[]>([])
  const [selectedModelId, setSelectedModelId] = useState('')
  const [needs, setNeeds] = useState<WardrobeNeed[]>([])
  const [inventory, setInventory] = useState<WardrobeInventoryItem[]>([])
  const [candidates, setCandidates] = useState<FashionCandidate[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void getRoles().then((roles) => {
      if (cancelled) return
      setRole(roles.includes('admin') ? 'admin' : 'user')
      setLoadingRole(false)
    })
    return () => {
      cancelled = true
    }
  }, [getRoles])

  const wakePanel = useCallback(async () => {
    const modelResponse = await fetchFashionModels()
    const loadedModels = modelResponse.models ?? []
    setModels(loadedModels)
    if (!loadedModels.length) {
      setSelectedModelId('')
      setNeeds([])
      setInventory([])
      return
    }

    const nextModelId =
      selectedModelId && loadedModels.some((model) => model.id === selectedModelId)
        ? selectedModelId
        : loadedModels[0].id
    setSelectedModelId(nextModelId)

    const [needsResponse, inventoryResponse] = await Promise.all([
      fetchFashionNeeds(nextModelId),
      fetchFashionInventory(nextModelId),
    ])
    setNeeds(needsResponse.needs ?? [])
    setInventory(inventoryResponse.items ?? [])
  }, [selectedModelId])

  useEffect(() => {
    if (!panelOpen || role !== 'admin') return
    void wakePanel().catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to wake Fashion Guru panel')
    })
  }, [panelOpen, role, wakePanel])

  useEffect(() => {
    if (!panelOpen || !selectedModelId || role !== 'admin') return
    void Promise.all([
      fetchFashionNeeds(selectedModelId),
      fetchFashionInventory(selectedModelId),
    ])
      .then(([needsResponse, inventoryResponse]) => {
        setNeeds(needsResponse.needs ?? [])
        setInventory(inventoryResponse.items ?? [])
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to refresh model wardrobe state')
      })
  }, [selectedModelId, panelOpen, role])

  if (loadingRole) {
    return <div className="p-6 text-sm text-white/70">Loading fashion panel...</div>
  }

  if (role !== 'admin') {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6 text-white/80">
          Unauthorized — admin access only
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      {error ? (
        <div className="px-6 pt-6">
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
            {error}
          </div>
        </div>
      ) : null}
      <FashionPanel
        open={panelOpen}
        onToggle={() => setPanelOpen((open) => !open)}
        models={models}
        selectedModelId={selectedModelId}
        onSelectModel={setSelectedModelId}
        needs={needs}
        inventory={inventory}
        candidates={candidates}
        onSearch={async ({ query, slots, colors }) => {
          if (!selectedModelId) return
          try {
            const response = await searchFashion({
              model_id: selectedModelId,
              query,
              slots,
              colors,
              sources: ['internal', 'fab', 'external'],
              count: 12,
            })
            setCandidates(response.candidates ?? [])
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Fashion search failed')
          }
        }}
        onApprove={async (candidate) => {
          try {
            const response = await approveFashionCandidate({
              model_id: selectedModelId,
              candidate_id: candidate.candidate_id,
              source_type: candidate.source_type,
              outcome: 'approved',
              slot: candidate.slot ?? undefined,
              title: candidate.title,
              occasion_tags: candidate.occasion_tags,
              color_tags: candidate.color_tags,
            })

            const [needsResponse, inventoryResponse] = await Promise.all([
              fetchFashionNeeds(selectedModelId),
              fetchFashionInventory(selectedModelId),
            ])
            setNeeds(needsResponse.needs ?? [])
            setInventory(inventoryResponse.items ?? [])
            return response
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Approval failed')
            return undefined as never
          }
        }}
      />
    </div>
  )
}
