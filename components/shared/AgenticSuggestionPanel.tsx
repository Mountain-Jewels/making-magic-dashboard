/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'

interface AgenticSuggestion {
  id: string
  task_type: string
  status: string
  suggestion: {
    reasoning?: string
    enhanced_prompt?: string
    model?: string
    settings?: Record<string, unknown>
    alternatives?: Array<Record<string, unknown>>
    estimated_cost?: string
  } | null
  result: Record<string, unknown> | null
  error: string | null
}

interface AgenticSuggestionPanelProps {
  suggestion: AgenticSuggestion | null
  loading?: boolean
  onConfirm: (modifications?: Record<string, unknown>) => void
  onReject: () => void
  onModify?: (modifications: Record<string, unknown>) => void
  className?: string
}

export default function AgenticSuggestionPanel({
  suggestion,
  loading,
  onConfirm,
  onReject,
  className = '',
}: AgenticSuggestionPanelProps) {
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [modifiedPrompt, setModifiedPrompt] = useState('')

  if (loading) {
    return (
      <div className={`rounded-lg border border-yellow-600/30 bg-yellow-900/10 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-yellow-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
          <span className="text-sm font-medium">AI is analyzing your request...</span>
        </div>
      </div>
    )
  }

  if (!suggestion) return null

  const { status } = suggestion
  const s = suggestion.suggestion

  if (status === 'executing') {
    return (
      <div className={`rounded-lg border border-blue-600/30 bg-blue-900/10 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-blue-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          <span className="text-sm font-medium">Executing...</span>
        </div>
      </div>
    )
  }

  if (status === 'complete') {
    return (
      <div className={`rounded-lg border border-green-600/30 bg-green-900/10 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-green-400">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Complete</span>
        </div>
        {suggestion.result && (
          <pre className="mt-2 max-h-40 overflow-auto rounded bg-neutral-900 p-2 text-xs text-neutral-300">
            {JSON.stringify(suggestion.result, null, 2)}
          </pre>
        )}
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className={`rounded-lg border border-red-600/30 bg-red-900/10 p-4 ${className}`}>
        <p className="text-sm text-red-400">
          Failed: {suggestion.error || 'Unknown error'}
        </p>
        <button
          onClick={onReject}
          className="mt-2 rounded bg-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-600"
        >
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-yellow-600/30 bg-neutral-900/80 p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-yellow-500">
          AI Suggestion
        </span>
        {s?.estimated_cost && (
          <span className="text-xs text-neutral-500">
            Est. {s.estimated_cost}
          </span>
        )}
      </div>

      {s?.reasoning && (
        <p className="mb-3 text-sm text-neutral-300">{s.reasoning}</p>
      )}

      {s?.enhanced_prompt && (
        <div className="mb-3">
          <label className="mb-1 block text-xs text-neutral-500">Enhanced Prompt</label>
          {editingPrompt ? (
            <textarea
              className="w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-sm text-neutral-200"
              value={modifiedPrompt}
              onChange={(e) => setModifiedPrompt(e.target.value)}
              rows={3}
            />
          ) : (
            <p
              className="cursor-pointer rounded bg-neutral-800/50 p-2 text-sm text-neutral-200 hover:bg-neutral-800"
              onClick={() => {
                setModifiedPrompt(s.enhanced_prompt!)
                setEditingPrompt(true)
              }}
              title="Click to edit"
            >
              {s.enhanced_prompt}
            </p>
          )}
        </div>
      )}

      {s?.model && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs text-neutral-500">Model:</span>
          <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-yellow-400">
            {s.model}
          </span>
        </div>
      )}

      {s?.alternatives && s.alternatives.length > 0 && (
        <div className="mb-3">
          <span className="mb-1 block text-xs text-neutral-500">Alternatives</span>
          <div className="flex flex-wrap gap-1">
            {s.alternatives.map((alt, i) => (
              <span
                key={i}
                className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
              >
                {String(alt.description || alt.name || JSON.stringify(alt))}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => {
            const mods = editingPrompt && modifiedPrompt !== s?.enhanced_prompt
              ? { enhanced_prompt: modifiedPrompt }
              : undefined
            onConfirm(mods)
          }}
          className="rounded bg-yellow-600 px-4 py-1.5 text-sm font-medium text-black hover:bg-yellow-500"
        >
          Confirm & Execute
        </button>
        <button
          onClick={onReject}
          className="rounded bg-neutral-700 px-4 py-1.5 text-sm text-neutral-200 hover:bg-neutral-600"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
