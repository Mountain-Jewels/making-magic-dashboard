'use client'

import { useState } from 'react'

import type { FashionCandidate, FashionApproveResponse } from '@/lib/api/fashion'

interface CandidateListProps {
  candidates: FashionCandidate[]
  onApprove: (candidate: FashionCandidate) => Promise<FashionApproveResponse>
}

export function CandidateList({ candidates, onApprove }: CandidateListProps) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, string>>({})

  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
      <div className="text-sm text-white/80 font-medium mb-3">Candidates</div>
      <div className="space-y-2">
        {candidates.map((candidate) => (
          <div
            key={candidate.candidate_id}
            className="rounded-md bg-[#0D0D12] border border-[#23232C] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-white">{candidate.title}</div>
                <div className="text-xs text-white/60 mt-1">
                  {candidate.source_type} · score {candidate.score.toFixed(3)} ·{' '}
                  {candidate.style_transfer}
                </div>
                {candidate.style_transfer_risk ? (
                  <div className="text-xs text-amber-300 mt-1">
                    risk: {candidate.style_transfer_risk}
                  </div>
                ) : null}
              </div>
              <button
                className="rounded-md bg-white text-black text-xs px-3 py-1 font-medium disabled:opacity-50"
                disabled={pendingId === candidate.candidate_id}
                onClick={async () => {
                  setPendingId(candidate.candidate_id)
                  try {
                    const result = await onApprove(candidate)
                    const uploadMsg = result.manual_upload
                      ? ` Manual upload: ${result.manual_upload.destination_folder}`
                      : ''
                    setMessages((prev) => ({
                      ...prev,
                      [candidate.candidate_id]: `${result.message ?? 'Approved.'}${uploadMsg}`,
                    }))
                  } finally {
                    setPendingId(null)
                  }
                }}
              >
                {pendingId === candidate.candidate_id ? 'Approving...' : 'Approve'}
              </button>
            </div>
            {messages[candidate.candidate_id] ? (
              <div className="text-xs text-white/70 mt-2">{messages[candidate.candidate_id]}</div>
            ) : null}
          </div>
        ))}
        {candidates.length === 0 ? (
          <div className="text-xs text-white/60">No candidates yet. Run a search.</div>
        ) : null}
      </div>
    </div>
  )
}
