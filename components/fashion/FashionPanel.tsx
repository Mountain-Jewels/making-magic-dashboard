'use client'

import type { FashionCandidate, FashionModel, WardrobeInventoryItem, WardrobeNeed } from '@/lib/api/fashion'

import { CandidateList } from '@/components/fashion/CandidateList'
import { NeedsList } from '@/components/fashion/NeedsList'
import { SearchBar } from '@/components/fashion/SearchBar'

interface FashionPanelProps {
  open: boolean
  onToggle: () => void
  models: FashionModel[]
  selectedModelId: string
  onSelectModel: (modelId: string) => void
  needs: WardrobeNeed[]
  inventory: WardrobeInventoryItem[]
  candidates: FashionCandidate[]
  onSearch: (params: { query: string; slots: string[]; colors: string[] }) => Promise<void>
  onApprove: (candidate: FashionCandidate) => Promise<any>
}

export function FashionPanel({
  open,
  onToggle,
  models,
  selectedModelId,
  onSelectModel,
  needs,
  inventory,
  candidates,
  onSearch,
  onApprove,
}: FashionPanelProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Fashion Guru</h1>
          <p className="text-sm text-white/70">MVP wardrobe search, memory, and model needs</p>
        </div>
        <button
          onClick={onToggle}
          className="rounded-md border border-[#2A2A35] bg-[#111118] text-white text-sm px-3 py-2"
        >
          {open ? 'Collapse panel' : 'Open panel'}
        </button>
      </div>

      {!open ? (
        <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-6 text-sm text-white/70">
          Open panel to wake Fashion Guru and load models, needs, and inventory.
        </div>
      ) : null}

      {open ? (
        <>
          <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
            <div className="text-sm text-white/80 font-medium mb-2">Model</div>
            <select
              value={selectedModelId}
              onChange={(event) => onSelectModel(event.target.value)}
              className="w-full rounded-md bg-[#0D0D12] border border-[#2A2A35] px-3 py-2 text-sm text-white"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <SearchBar onSearch={onSearch} disabled={!selectedModelId} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <NeedsList needs={needs} />
            <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
              <div className="text-sm text-white/80 font-medium mb-3">Inventory</div>
              <div className="space-y-2">
                {inventory.map((item) => (
                  <div
                    key={item.candidate_id}
                    className="rounded-md bg-[#0D0D12] border border-[#23232C] p-3"
                  >
                    <div className="text-sm text-white">{item.title ?? item.candidate_id}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {item.source_type} · {item.slot ?? 'untyped'} · approved: {String(item.approved)}
                    </div>
                  </div>
                ))}
                {inventory.length === 0 ? (
                  <div className="text-xs text-white/60">No inventory records yet.</div>
                ) : null}
              </div>
            </div>
          </div>

          <CandidateList candidates={candidates} onApprove={onApprove} />
        </>
      ) : null}
    </div>
  )
}
